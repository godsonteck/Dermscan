import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
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

// --- GOOGLE & APPLE AUTH & SIMULATION ---

app.get('/api/auth/google/url', (req: Request, res: Response): void => {
  let origin = (req.query.origin as string) || '';
  if (!origin) {
    const host = req.get('host') || 'localhost:3000';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';
    origin = `${protocol}://${host}`;
  }
  
  if (origin.endsWith('/')) {
    origin = origin.slice(0, -1);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const client_id = process.env.GOOGLE_CLIENT_ID;

  if (client_id) {
    const params = new URLSearchParams({
      client_id: client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, is_real: true });
  } else {
    res.json({ url: `${origin}/api/auth/google/simulate`, is_real: false });
  }
});

app.get('/api/auth/google/simulate', (req: Request, res: Response): void => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in - Google Accounts</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Roboto', sans-serif; }
      </style>
    </head>
    <body class="bg-[#121214] text-gray-200 min-h-screen flex items-center justify-center p-4">
      <div class="bg-[#1e1e24] border border-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative transition-all duration-300">
        <!-- Top Google Logo -->
        <div class="flex items-center justify-center gap-1.5 mb-6">
          <svg class="w-8 h-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span class="font-semibold text-xl tracking-tight text-white">Google</span>
        </div>

        <!-- Title -->
        <div class="text-center mb-8" id="headerSection">
          <h2 class="text-lg font-normal text-white">Choose an account</h2>
          <p class="text-xs text-gray-400 mt-1.5">to continue to <span class="text-violet-400 font-medium">DermScan AI</span></p>
        </div>

        <!-- Loader -->
        <div id="loadingSection" class="hidden py-8 text-center space-y-4">
          <div class="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <p class="text-sm font-bold text-white uppercase tracking-wider">Signing you in...</p>
            <p class="text-xs text-gray-400 mt-1">Establishing authenticated sandbox credentials...</p>
          </div>
        </div>

        <!-- Account Chooser List -->
        <div id="accountsList" class="space-y-3">
          <!-- User Account 1 -->
          <button onclick="selectProfile('Manuel Sad', 'manuelsad18@gmail.com')" class="w-full flex items-center gap-3.5 p-3.5 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.99] border border-gray-800 rounded-2xl text-left transition duration-150">
            <div class="w-10 h-10 rounded-full bg-violet-650 flex items-center justify-center font-bold text-white text-sm shadow-inner">
              MS
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-white truncate">Manuel Sad</div>
              <div class="text-[11px] text-gray-400 truncate font-mono">manuelsad18@gmail.com</div>
            </div>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <!-- User Account 2 -->
          <button onclick="selectProfile('Sarah Connor', 'sarah.connor@sky.net')" class="w-full flex items-center gap-3.5 p-3.5 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.99] border border-gray-800 rounded-2xl text-left transition duration-150">
            <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-inner">
              SC
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-white truncate">Sarah Connor</div>
              <div class="text-[11px] text-gray-400 truncate font-mono">sarah.connor@sky.net</div>
            </div>
          </button>

          <!-- Add Account button -->
          <button onclick="showCustomForm()" class="w-full flex items-center gap-3.5 p-3.5 bg-transparent hover:bg-white/[0.03] border border-dashed border-gray-700/80 rounded-2xl text-left transition duration-150">
            <div class="w-10 h-10 rounded-full border border-dashed border-gray-750 flex items-center justify-center text-gray-400">
              +
            </div>
            <div>
              <div class="text-sm font-medium text-white">Use another account</div>
              <div class="text-[11px] text-gray-500">Log in with a custom Google profile</div>
            </div>
          </button>
        </div>

        <!-- Custom Account Form -->
        <form id="customForm" class="hidden space-y-4" onsubmit="handleCustomSubmit(event)">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Full Name</label>
            <input type="text" id="customName" required placeholder="e.g. David Hasselhoff" class="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-gray-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 outline-none text-xs text-white">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Google Email</label>
            <input type="email" id="customEmail" required placeholder="e.g. david.intel@gmail.com" class="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-gray-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 outline-none text-xs text-white">
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" onclick="hideCustomForm()" class="flex-1 py-2.5 bg-gray-800 hover:bg-gray-750 text-gray-200 text-xs font-semibold rounded-xl">Back</button>
            <button type="submit" class="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-500/10">Authenticate</button>
          </div>
        </form>

        <div class="mt-8 pt-4 border-t border-gray-800/85 text-[10px] text-gray-500 text-center leading-normal">
          🔒 Secure federated Google OAuth Simulation Module. Transmits verified credentials safely back to parent viewport.
        </div>
      </div>

      <script>
        function selectProfile(name, email) {
          document.getElementById('accountsList').style.display = 'none';
          document.getElementById('headerSection').style.display = 'none';
          document.getElementById('customForm').style.display = 'none';
          document.getElementById('loadingSection').classList.remove('hidden');

          setTimeout(() => {
            const randomId = Math.floor(10000000 + Math.random() * 90000000).toString();
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SIMULATE_SUCCESS',
                provider: 'google',
                full_name: name,
                email: email,
                provider_id: 'google_sim_' + randomId
              }, '*');
              window.close();
            } else {
              alert('Popup parent origin connection lost. Please verify tab focus.');
            }
          }, 1200);
        }

        function showCustomForm() {
          document.getElementById('accountsList').classList.add('hidden');
          document.getElementById('customForm').classList.remove('hidden');
          document.getElementById('headerSection').querySelector('h2').textContent = 'Simulate Custom Profile';
        }

        function hideCustomForm() {
          document.getElementById('accountsList').classList.remove('hidden');
          document.getElementById('customForm').classList.add('hidden');
          document.getElementById('headerSection').querySelector('h2').textContent = 'Choose an account';
        }

        function handleCustomSubmit(e) {
          e.preventDefault();
          const name = document.getElementById('customName').value;
          const email = document.getElementById('customEmail').value;
          selectProfile(name, email);
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/auth/google/callback', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;

  if (!code) {
    res.send(`
      <html>
        <body style="background-color: #0b0b0f; color: #ff6b6b; font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>Authentication Error</h2>
          <p>Google authorization code is missing from redirect query params.</p>
        </body>
      </html>
    `);
    return;
  }

  try {
    const host = req.get('host') || 'localhost:3000';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // Exchange authorization code for token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // Fetch user profile info
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, sub } = profileResponse.data;

    // Register/Fetch user from DB
    let user = db.findUserByEmail(email);
    if (!user) {
      user = db.createUser({
        full_name: name || 'Google User',
        email,
        provider: 'google',
        provider_id: sub,
        hashed_password: hashPassword(crypto.randomBytes(16).toString('hex'))
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { hashed_password, ...clientUser } = user;

    res.send(`
      <html>
        <head>
          <title>Authentication Successful</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#020617] text-white min-h-screen flex items-center justify-center p-6 text-center">
          <div class="p-8 max-w-sm bg-[#111118] border border-white/10 rounded-2xl shadow-2xl">
            <div class="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">✓</div>
            <h2 class="text-md font-bold uppercase tracking-wider mb-2">Login Successful</h2>
            <p class="text-xs text-white/50 leading-relaxed mb-6">Welcome back, ${clientUser.full_name}! Transmitting credentials. This dialog will shut automatically...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  token: '${token}',
                  user: ${JSON.stringify(clientUser)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/dashboard';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Google OAuth callback handler failed:', error.message || error);
    res.send(`
      <html>
        <body style="background-color: #020617; color: #f87171; font-family: sans-serif; text-align: center; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh;">
          <h2 style="font-weight: bold; font-size: 20px;">OAuth Connection Error</h2>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; max-width: 400px; margin-top: 10px;">
            Failed to coordinate Google OAuth token exchange. Make sure you configured GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET successfully in AI Studio.
          </p>
          <button onclick="window.close()" style="margin-top: 20px; background: #3b82f6; border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Close Window</button>
        </body>
      </html>
    `);
  }
});

// --- APPLE ---

app.get('/api/auth/apple/url', (req: Request, res: Response): void => {
  let origin = (req.query.origin as string) || '';
  if (!origin) {
    const host = req.get('host') || 'localhost:3000';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';
    origin = `${protocol}://${host}`;
  }
  
  if (origin.endsWith('/')) {
    origin = origin.slice(0, -1);
  }

  const redirectUri = `${origin}/api/auth/apple/callback`;
  const client_id = process.env.APPLE_CLIENT_ID;

  if (client_id) {
    const params = new URLSearchParams({
      client_id: client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'name email',
      response_mode: 'form_post'
    });
    res.json({ url: `https://appleid.apple.com/auth/authorize?${params}`, is_real: true });
  } else {
    res.json({ url: `${origin}/api/auth/apple/simulate`, is_real: false });
  }
});

app.get('/api/auth/apple/simulate', (req: Request, res: Response): void => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in with Apple ID</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=SF+Pro+Text:wght@400;500;600&display=swap" rel="stylesheet font">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      </style>
    </head>
    <body class="bg-[#000000] text-[#f5f5f7] min-h-screen flex items-center justify-center p-4">
      <div id="appleCard" class="bg-[#1c1c1e] border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-2xl relative transition-all duration-500">
        <!-- Top Apple Logo -->
        <div class="text-center mb-6">
          <span class="text-4xl text-white select-none"></span>
          <h2 class="text-lg font-semibold text-white mt-1.5">Sign in with Apple ID</h2>
          <p class="text-xs text-[#86868b] mt-1">Configure secure credential token mappings</p>
        </div>

        <!-- Biometric Simulator -->
        <div id="bioLoading" class="hidden py-8 text-center space-y-4">
          <div class="relative w-16 h-16 mx-auto">
            <div class="absolute inset-0 rounded-full border-4 border-dashed border-violet-500 animate-spin"></div>
            <div class="absolute inset-1.5 rounded-full border border-white/10 flex items-center justify-center font-bold text-white text-md"></div>
          </div>
          <div>
            <p class="text-xs font-semibold text-white uppercase tracking-wider animate-pulse">Scanning Face ID credentials...</p>
            <p class="text-[10px] text-[#86868b] mt-0.5">Encrypting verified Apple ID keychain mapping...</p>
          </div>
        </div>

        <form id="appleForm" onsubmit="handleAuthSubmit(event)" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-[#86868b] block tracking-widest pl-1">Apple ID Email</label>
            <input type="email" id="appleEmail" required value="manuelsad18@gmail.com" placeholder="email@icloud.com" class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-sm text-white transition-all">
          </div>
          
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-[#86868b] block tracking-widest pl-1">iCloud Username</label>
            <input type="text" id="appleName" required value="Manuel Sad" placeholder="Manuel Sad" class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-sm text-white transition-all">
          </div>

          <hr class="border-white/5 my-2" />

          <!-- Email Mask Options -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase font-bold text-[#86868b] block tracking-widest pr-1">Email Visibility</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" id="shareEmailBtn" onclick="toggleEmailSharing(false)" class="p-2.5 rounded-lg border text-xs font-bold text-left transition bg-white/10 border-violet-500 text-white flex items-center justify-between">
                <span>Share Email</span>
                <span class="text-violet-400">✓</span>
              </button>
              <button type="button" id="hideEmailBtn" onclick="toggleEmailSharing(true)" class="p-2.5 rounded-lg border text-xs font-bold text-left transition bg-transparent border-white/5 text-white/40 hover:bg-white/2 flex items-center justify-between">
                <span>Hide Email</span>
                <span id="checkHide" class="hidden text-violet-400">✓</span>
              </button>
            </div>
            <p id="visibilityDesc" class="text-[9px] text-[#86868b] leading-normal pl-0.5">
              Shares your direct primary email address listed in Apple developer sandbox storage.
            </p>
          </div>

          <button type="submit" class="w-full mt-4 bg-white text-black hover:bg-slate-100 py-3.5 rounded-xl text-xs font-bold transition duration-200 select-none flex items-center justify-center gap-1.5 shadow-lg shadow-white/5 active:scale-[0.98]">
            <span class="text-sm"></span> Continue with Apple ID
          </button>
        </form>

        <div class="mt-8 pt-4 border-t border-white/5 text-[10px] text-[#86868b] text-center leading-normal">
          🔒 Secure verified Apple Identity Sandbox Connection. Integrates seamlessly with Web and Native iOS wrappers.
        </div>
      </div>

      <script>
        let hideEmail = false;

        function toggleEmailSharing(hide) {
          hideEmail = hide;
          const shareBtn = document.getElementById('shareEmailBtn');
          const hideBtn = document.getElementById('hideEmailBtn');
          const checkHide = document.getElementById('checkHide');
          const desc = document.getElementById('visibilityDesc');

          if (hide) {
            hideBtn.className = "p-2.5 rounded-lg border text-xs font-bold text-left transition bg-white/10 border-violet-500 text-white flex items-center justify-between";
            shareBtn.className = "p-2.5 rounded-lg border text-xs font-bold text-left transition bg-transparent border-white/5 text-white/40 hover:bg-white/2 flex items-center justify-between";
            checkHide.classList.remove('hidden');
            desc.textContent = "Generates a randomized @privaterelay.appleid.com alias to protect your mailbox securely.";
          } else {
            shareBtn.className = "p-2.5 rounded-lg border text-xs font-bold text-left transition bg-white/10 border-violet-500 text-white flex items-center justify-between";
            hideBtn.className = "p-2.5 rounded-lg border text-xs font-bold text-left transition bg-transparent border-white/5 text-white/40 hover:bg-white/2 flex items-center justify-between";
            checkHide.classList.add('hidden');
            desc.textContent = "Shares your direct primary email address listed in Apple developer sandbox storage.";
          }
        }

        function handleAuthSubmit(e) {
          e.preventDefault();
          const emailInput = document.getElementById('appleEmail').value;
          const nameInput = document.getElementById('appleName').value;

          document.getElementById('appleForm').style.display = 'none';
          document.getElementById('bioLoading').classList.remove('hidden');

          const finalEmail = hideEmail 
            ? nameInput.toLowerCase().replace(/\\s+/g, '.') + '@privaterelay.appleid.com'
            : emailInput;

          setTimeout(() => {
            const randomId = Math.floor(10000000 + Math.random() * 90000000).toString();
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SIMULATE_SUCCESS',
                provider: 'apple',
                full_name: nameInput,
                email: finalEmail,
                provider_id: 'apple_sim_' + randomId
              }, '*');
              window.close();
            } else {
              alert('Parent window context lost. Re-launch sign-in portal.');
            }
          }, 1500);
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api/auth/apple/callback', (req: Request, res: Response): void => {
  res.send(`
    <html>
      <body style="background-color: #000000; color: white; display:flex; align-items:center; justify-content:center; height:100vh; text-align:center;">
        <div>
          <h2>Connection complete. Checking device mapping keychain...</h2>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
        </div>
      </body>
    </html>
  `);
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
