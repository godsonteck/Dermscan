import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve('./data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
export const UPLOAD_DIR = path.resolve('./uploads');

// Ensure database directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Initial DB schema
interface DatabaseSchema {
  users: any[];
  scans: any[];
}

const defaultSchema: DatabaseSchema = {
  users: [],
  scans: []
};

// Helper to loads the database
function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    saveDb(defaultSchema);
    return defaultSchema;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database file, resetting to empty', error);
    return defaultSchema;
  }
}

// Helper to save the database
function saveDb(data: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Native Node.js crypto functions for password hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// DB actions
export const db = {
  getUsers() {
    return loadDb().users;
  },

  findUserById(id: number) {
    const schema = loadDb();
    return schema.users.find(u => u.id === id);
  },

  findUserByEmail(email: string) {
    const schema = loadDb();
    return schema.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(userData: any) {
    const schema = loadDb();
    const id = schema.users.length > 0 ? Math.max(...schema.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id,
      ...userData,
      email: userData.email.toLowerCase(),
      created_at: new Date().toISOString()
    };
    schema.users.push(newUser);
    saveDb(schema);
    return newUser;
  },

  updateUserProfile(userId: number, updateData: any) {
    const schema = loadDb();
    const userIndex = schema.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    schema.users[userIndex] = {
      ...schema.users[userIndex],
      ...updateData
    };
    
    saveDb(schema);
    return schema.users[userIndex];
  },

  getScansForUser(userId: number) {
    const schema = loadDb();
    // Sort reverse order: newest first
    return schema.scans
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getScanById(id: number) {
    const schema = loadDb();
    return schema.scans.find(s => s.id === id);
  },

  createScan(scanData: any) {
    const schema = loadDb();
    const id = schema.scans.length > 0 ? Math.max(...schema.scans.map(s => s.id)) + 1 : 1;
    const newScan = {
      id,
      ...scanData,
      created_at: new Date().toISOString()
    };
    schema.scans.push(newScan);
    saveDb(schema);
    return newScan;
  },

  deleteScan(id: number, userId: number): boolean {
    const schema = loadDb();
    const scanIndex = schema.scans.findIndex(s => s.id === id && s.user_id === userId);
    if (scanIndex === -1) return false;

    const scan = schema.scans[scanIndex];
    // Delete visual asset from disk if it was saved locally
    if (scan.image_path) {
      try {
        const fullLocalPath = path.join(path.resolve('.'), scan.image_path);
        if (fs.existsSync(fullLocalPath)) {
          fs.unlinkSync(fullLocalPath);
        }
      } catch (err) {
        console.error('Failed to clean up image on scan deletion', err);
      }
    }

    schema.scans.splice(scanIndex, 1);
    saveDb(schema);
    return true;
  }
};
