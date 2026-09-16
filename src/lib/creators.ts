/**
 * Creator Hub - SQLite (sql.js) persistence layer
 * Data is stored in browser localStorage via sql.js WASM.
 * No backend, no configuration required.
 */
import initSqlJs, { Database } from 'sql.js';

// ─── Admin Auth ────────────────────────────────────────────────────────────────
// Initial admin password hash of 'Qwert$1688'
// Generated with: sha256('Qwert$1688')
const ADMIN_PASSWORD_HASH = '315b23f9de1e4dc18564caf5fbaf86ac1ec1cb5e901430c4fb71574880da1cd2';
const AUTH_KEY = 'creator_hub_admin_auth';
const DB_KEY = 'creator_hub_db_v2';

export function isAdmin(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1';
}

export async function verifyPassword(password: string): Promise<boolean> {
  // SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === ADMIN_PASSWORD_HASH;
}

export function login(password: string): Promise<boolean> {
  return verifyPassword(password).then(ok => {
    if (ok) localStorage.setItem(AUTH_KEY, '1');
    return ok;
  });
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isFirstLogin(): boolean {
  // No separate password set needed — initial password is the default
  return !localStorage.getItem(AUTH_KEY);
}

export type CooperationStatus = '开放合作' | '暂停接单' | '已签约';
export type Platform = '视频号' | '小红书' | '抖音';
export type ContentType = '图文' | '短视频' | '直播' | '长期代言';
export type ExclusiveType = '独家' | '非独家';
export type VerifiedType = '蓝V认证' | '普通账号';
export type ReferralSource = '自然流量' | '朋友推荐' | '运营邀请' | '其他';
export type ContentCategory =
  | '知识干货' | '小清新' | '接地气' | '娱乐搞笑'
  | '测评好物' | '生活方式' | '职场成长' | '科技数码'
  | '美食' | '旅行' | '健身' | '美妆' | '母婴' | '教育';

export interface Creator {
  id: number;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  cooperation_status: CooperationStatus;
  categories: ContentCategory[];
  referral_source?: ReferralSource;
  submitted_at: string;
  admin_notes?: string;
}

export interface PlatformAccount {
  id: number;
  creator_id: number;
  platform: Platform;
  account_name: string;
  account_url: string;
  followers: number;
  avg_views: number;
  max_views: number;
  likes_avg: number;
  comments_avg: number;
  engagement_rate: number;
  is_verified: VerifiedType;
  rate_card?: string;
}

export interface CollaborationCase {
  id: number;
  creator_id: number;
  platform: Platform;
  brand_name: string;
  content_type: ContentType;
  is_exclusive: ExclusiveType;
  campaign_url?: string;
  results?: string;
  cooperation_date?: string;
}

// ─── SQLite Setup ─────────────────────────────────────────────────────────────


let db: Database | null = null;
let initPromise: Promise<void> | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
  return db!;
}

async function initDb(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js/dist/${file}`,
  });

  // Try to restore from localStorage
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const data = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
      db = new SQL.Database(data);
    } catch {
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS creators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      company TEXT DEFAULT '',
      cooperation_status TEXT DEFAULT '开放合作',
      categories TEXT DEFAULT '[]',
      referral_source TEXT DEFAULT '',
      submitted_at TEXT NOT NULL,
      admin_notes TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS platform_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_url TEXT NOT NULL,
      followers INTEGER DEFAULT 0,
      avg_views INTEGER DEFAULT 0,
      max_views INTEGER DEFAULT 0,
      likes_avg REAL DEFAULT 0,
      comments_avg REAL DEFAULT 0,
      engagement_rate REAL DEFAULT 0,
      is_verified TEXT DEFAULT '普通账号',
      rate_card TEXT DEFAULT '',
      FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS collaboration_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      content_type TEXT DEFAULT '图文',
      is_exclusive TEXT DEFAULT '非独家',
      campaign_url TEXT DEFAULT '',
      results TEXT DEFAULT '',
      cooperation_date TEXT DEFAULT '',
      FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
    )
  `);

  // Enable FK enforcement
  db.run('PRAGMA foreign_keys = ON');
  saveDb();
}

function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem(DB_KEY, base64);
}

// ─── Creators ────────────────────────────────────────────────────────────────

export async function listCreators(): Promise<Creator[]> {
  const database = await getDb();
  const results = database.exec('SELECT * FROM creators ORDER BY submitted_at DESC');
  if (!results.length) return [];
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number,
      name: obj.name as string,
      phone: obj.phone as string,
      email: obj.email as string || undefined,
      company: obj.company as string || undefined,
      cooperation_status: (obj.cooperation_status as CooperationStatus) || '开放合作',
      categories: JSON.parse((obj.categories as string) || '[]'),
      referral_source: (obj.referral_source as ReferralSource) || undefined,
      submitted_at: obj.submitted_at as string,
      admin_notes: obj.admin_notes as string || undefined,
    };
  });
}

export async function getCreatorById(id: number): Promise<Creator | null> {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM creators WHERE id = ?');
  stmt.bind([id]);
  if (!stmt.step()) { stmt.free(); return null; }
  const row = stmt.getAsObject();
  stmt.free();
  return {
    id: row.id as number,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) || undefined,
    company: (row.company as string) || undefined,
    cooperation_status: (row.cooperation_status as CooperationStatus) || '开放合作',
    categories: JSON.parse((row.categories as string) || '[]'),
    referral_source: (row.referral_source as ReferralSource) || undefined,
    submitted_at: row.submitted_at as string,
    admin_notes: (row.admin_notes as string) || undefined,
  };
}

export async function createCreator(fields: Omit<Creator, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO creators (name, phone, email, company, cooperation_status, categories, referral_source, submitted_at, admin_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.name,
      fields.phone,
      fields.email ?? '',
      fields.company ?? '',
      fields.cooperation_status,
      JSON.stringify(fields.categories),
      fields.referral_source ?? '',
      fields.submitted_at,
      fields.admin_notes ?? '',
    ]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function updateCreator(id: number, fields: Partial<Creator>): Promise<void> {
  const database = await getDb();
  const sets: string[] = [];
  const values: unknown[] = [];
  if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
  if (fields.phone !== undefined) { sets.push('phone = ?'); values.push(fields.phone); }
  if (fields.email !== undefined) { sets.push('email = ?'); values.push(fields.email); }
  if (fields.company !== undefined) { sets.push('company = ?'); values.push(fields.company); }
  if (fields.cooperation_status !== undefined) { sets.push('cooperation_status = ?'); values.push(fields.cooperation_status); }
  if (fields.categories !== undefined) { sets.push('categories = ?'); values.push(JSON.stringify(fields.categories)); }
  if (fields.admin_notes !== undefined) { sets.push('admin_notes = ?'); values.push(fields.admin_notes); }
  if (!sets.length) return;
  values.push(id);
  database.run(`UPDATE creators SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDb();
}

// ─── Platform Accounts ───────────────────────────────────────────────────────

export async function listAccountsByCreator(creatorId: number): Promise<PlatformAccount[]> {
  const database = await getDb();
  const results = database.exec(
    `SELECT * FROM platform_accounts WHERE creator_id = ${creatorId} ORDER BY id`
  );
  if (!results.length) return [];
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number,
      creator_id: obj.creator_id as number,
      platform: obj.platform as Platform,
      account_name: obj.account_name as string,
      account_url: obj.account_url as string,
      followers: obj.followers as number,
      avg_views: obj.avg_views as number,
      max_views: obj.max_views as number,
      likes_avg: obj.likes_avg as number,
      comments_avg: obj.comments_avg as number,
      engagement_rate: obj.engagement_rate as number,
      is_verified: obj.is_verified as VerifiedType,
      rate_card: (obj.rate_card as string) || undefined,
    };
  });
}

export async function createAccount(fields: Omit<PlatformAccount, 'id' | 'engagement_rate'>): Promise<number> {
  const database = await getDb();
  const engagement = fields.avg_views > 0
    ? Math.round(((fields.likes_avg + fields.comments_avg) / fields.avg_views) * 10000) / 100
    : 0;
  database.run(
    `INSERT INTO platform_accounts (creator_id, platform, account_name, account_url, followers, avg_views, max_views, likes_avg, comments_avg, engagement_rate, is_verified, rate_card)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.creator_id, fields.platform, fields.account_name, fields.account_url,
      fields.followers, fields.avg_views, fields.max_views,
      fields.likes_avg, fields.comments_avg, engagement,
      fields.is_verified, fields.rate_card ?? '',
    ]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function deleteAccount(id: number): Promise<void> {
  const database = await getDb();
  database.run('DELETE FROM platform_accounts WHERE id = ?', [id]);
  saveDb();
}

// ─── Collaboration Cases ────────────────────────────────────────────────────

export async function listCasesByCreator(creatorId: number): Promise<CollaborationCase[]> {
  const database = await getDb();
  const results = database.exec(
    `SELECT * FROM collaboration_cases WHERE creator_id = ${creatorId} ORDER BY id`
  );
  if (!results.length) return [];
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number,
      creator_id: obj.creator_id as number,
      platform: obj.platform as Platform,
      brand_name: obj.brand_name as string,
      content_type: (obj.content_type as ContentType) || '图文',
      is_exclusive: (obj.is_exclusive as ExclusiveType) || '非独家',
      campaign_url: (obj.campaign_url as string) || undefined,
      results: (obj.results as string) || undefined,
      cooperation_date: (obj.cooperation_date as string) || undefined,
    };
  });
}

export async function createCase(fields: Omit<CollaborationCase, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO collaboration_cases (creator_id, platform, brand_name, content_type, is_exclusive, campaign_url, results, cooperation_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.creator_id, fields.platform, fields.brand_name,
      fields.content_type, fields.is_exclusive,
      fields.campaign_url ?? '', fields.results ?? '', fields.cooperation_date ?? '',
    ]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function deleteCase(id: number): Promise<void> {
  const database = await getDb();
  database.run('DELETE FROM collaboration_cases WHERE id = ?', [id]);
  saveDb();
}

// ─── Query Helpers ──────────────────────────────────────────────────────────

export async function getAllAccounts(): Promise<PlatformAccount[]> {
  const database = await getDb();
  const results = database.exec('SELECT * FROM platform_accounts ORDER BY creator_id');
  if (!results.length) return [];
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number,
      creator_id: obj.creator_id as number,
      platform: obj.platform as Platform,
      account_name: obj.account_name as string,
      account_url: obj.account_url as string,
      followers: obj.followers as number,
      avg_views: obj.avg_views as number,
      max_views: obj.max_views as number,
      likes_avg: obj.likes_avg as number,
      comments_avg: obj.comments_avg as number,
      engagement_rate: obj.engagement_rate as number,
      is_verified: obj.is_verified as VerifiedType,
      rate_card: (obj.rate_card as string) || undefined,
    };
  });
}

export async function checkPhoneDuplicate(phone: string): Promise<boolean> {
  const database = await getDb();
  const results = database.exec(`SELECT id FROM creators WHERE phone = '${phone.replace(/'/g, "''")}'`);
  return results.length > 0 && results[0].values.length > 0;
}
