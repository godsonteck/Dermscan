import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, verifyPassword, UPLOAD_DIR } from './server/db.js';
import { analyzeSkinWithGemini } from './server/ai.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.SECRET_KEY || 'dermscan-secret-educational-key-2026';

// Request JSON parser with elevated limit for image transfer
app.use(express.json({ limit: '15mb' }));

// Utility to verify/decode JWT tokens.
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    full_name: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token missing' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired tokenSession' });
      return;
    }
    req.user = decoded;
    next();
  });
}

// ==========================================
// API ROUTES
// ==========================================

// --- AUTHENTICATION ---

app.post('/api/auth/register', (req: Request, res: Response): void => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    res.status(400).json({ error: 'All fields (full_name, email, password) are required' });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'Account with this email already exists' });
    return;
  }

  const hashedPassword = hashPassword(password);
  const newUser = db.createUser({
    full_name,
    email,
    hashed_password: hashedPassword
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, full_name: newUser.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Exclude hashed password on response
  const { hashed_password, ...clientUser } = newUser;

  res.status(211).json({
    access_token: token,
    token_type: 'bearer',
    user: clientUser
  });
});

app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.hashed_password)) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { hashed_password, ...clientUser } = user;

  res.json({
    access_token: token,
    token_type: 'bearer',
    user: clientUser
  });
});

app.post('/api/auth/federated', (req: Request, res: Response): void => {
  const { email, full_name, provider, provider_id } = req.body;

  if (!email || !full_name || !provider || !provider_id) {
    res.status(400).json({ error: 'Missing federated credentials' });
    return;
  }

  let user = db.findUserByEmail(email);
  if (!user) {
    // Create new user for the Google/Apple identity
    user = db.createUser({
      full_name,
      email,
      provider,
      provider_id,
      hashed_password: hashPassword(crypto.randomBytes(16).toString('hex'))
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { hashed_password, ...clientUser } = user;

  res.json({
    access_token: token,
    token_type: 'bearer',
    user: clientUser
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  const { hashed_password, ...clientUser } = user;
  res.json(clientUser);
});

// --- USER PROFILE ---

app.get('/api/users/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  const scans = db.getScansForUser(user.id);
  const totalScans = scans.length;
  const lastScanDate = totalScans > 0 ? scans[0].created_at : null;

  // Compute most common condition
  let mostCommonCondition: string | null = null;
  if (totalScans > 0) {
    const counts: { [key: string]: number } = {};
    scans.forEach(s => {
      counts[s.condition] = (counts[s.condition] || 0) + 1;
    });
    mostCommonCondition = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  const { hashed_password, ...clientUser } = user;
  res.json({
    user: clientUser,
    total_scans: totalScans,
    last_scan_date: lastScanDate,
    most_common_condition: mostCommonCondition
  });
});

app.put('/api/users/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const { full_name, skin_type, skin_sensitivity, skin_concerns, age_group, fitzpatrick_type } = req.body;
  if (!full_name) {
    res.status(400).json({ error: 'Full name cannot be blank' });
    return;
  }

  const updated = db.updateUserProfile(req.user!.id, {
    full_name,
    skin_type,
    skin_sensitivity,
    skin_concerns,
    age_group,
    fitzpatrick_type
  });
  if (!updated) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  const { hashed_password, ...clientUser } = updated;
  res.json(clientUser);
});

// --- SCANS ENDPOINTS ---

app.get('/api/scans', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const scans = db.getScansForUser(req.user!.id);
  
  // Return slim response versions (ScanListResponse) to speed up UI loading
  const slimScans = scans.map(({ id, condition, confidence, severity, image_path, body_part, skin_type, symptoms, created_at }) => ({
    id,
    condition,
    confidence,
    severity,
    image_path,
    body_part,
    skin_type,
    symptoms,
    created_at
  }));

  res.json(slimScans);
});

app.get('/api/scans/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const scanId = parseInt(req.params.id);
  if (isNaN(scanId)) {
    res.status(400).json({ error: 'Invalid scan ID path parameter' });
    return;
  }

  const scan = db.getScanById(scanId);
  if (!scan) {
    res.status(404).json({ error: 'Scan not found' });
    return;
  }

  if (scan.user_id !== req.user!.id) {
    res.status(403).json({ error: 'Access denied: this scan belongs to another user credentials' });
    return;
  }

  res.json(scan);
});

app.delete('/api/scans/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const scanId = parseInt(req.params.id);
  if (isNaN(scanId)) {
    res.status(400).json({ error: 'Invalid scan ID path parameter' });
    return;
  }

  const success = db.deleteScan(scanId, req.user!.id);
  if (!success) {
    res.status(404).json({ error: 'Scan not found or unauthorized' });
    return;
  }

  res.status(204).end();
});

app.post('/api/scans/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { image, body_part, duration, skin_type, symptoms } = req.body;

  // Simple validations
  if (!body_part) {
    res.status(400).json({ error: 'Body part is required to proceed' });
    return;
  }

  try {
    let imagePath: string | null = null;
    let imageBase64: string | undefined = undefined;
    let imageMimeType: string | undefined = undefined;

    // Handle incoming image data (Base64 wrapper with optional dataURI prefix)
    if (image && typeof image === 'string') {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        imageMimeType = match[1];
        imageBase64 = match[2];
      } else {
        imageBase64 = image;
        imageMimeType = "image/jpeg"; // Default fallback
      }

      // Save file cleanly inside the local uploads folder for permanent UI previewing
      const ext = imageMimeType.split('/')[1] || 'jpg';
      const fileName = `scan_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      
      const buffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(filePath, buffer);
      
      imagePath = `/uploads/${fileName}`;
    }

    // Call the hybrid AI pipeline via Gemini model api
    const analysis = await analyzeSkinWithGemini({
      imageBase64,
      imageMimeType,
      bodyPart: body_part,
      duration: duration || "Not specified",
      skinType: skin_type || "Not specified",
      symptoms: symptoms || []
    });

    // Save scan to database
    const newScan = db.createScan({
      user_id: req.user!.id,
      image_path: imagePath,
      body_part,
      duration,
      skin_type,
      symptoms: symptoms || [],
      ...analysis
    });

    res.status(211).json(newScan);
  } catch (error: any) {
    console.error('Scan analysis process failed with error:', error);
    res.status(500).json({ error: 'AI analysis failed: ' + (error.message || 'Server encountered an issue.') });
  }
});

// Configure serving uploaded images as static resources
app.use('/uploads', express.static(path.resolve('./uploads')));

// ==========================================
// VITE OR STATIC PROD SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development middleware serving with Vite HMR disabled as per restrictions
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DermScan AI] Full-stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
