/**
 * Creator Hub - SQLite (sql.js) persistence layer
 * Data is stored in browser localStorage via sql.js WASM.
 * No backend, no configuration required.
 */
import initSqlJs, { Database } from 'sql.js';

// ─── Admin Auth ────────────────────────────────────────────────────────────────
// Initial admin password hash of 'Qwert$1688'
const ADMIN_PASSWORD_HASH = '315b23f9de1e4dc18564caf5fbaf86ac1ec1cb5e901430c4fb71574880da1cd2';
const AUTH_KEY = 'creator_hub_admin_auth';
const DB_KEY = 'creator_hub_db_v2';

export function isAdmin(): boolean { return localStorage.getItem(AUTH_KEY) === '1'; }

export async function verifyPassword(password: string): Promise<boolean> {
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

export function logout(): void { localStorage.removeItem(AUTH_KEY); }

export function isFirstLogin(): boolean { return !localStorage.getItem(AUTH_KEY); }

// ─── Enums ─────────────────────────────────────────────────────────────────────
export type CooperationStatus = '待审核' | '开放合作' | '暂停接单' | '已签约';
export type Platform = '视频号' | '小红书' | '抖音';
export type ContentType = '图文' | '短视频' | '直播' | '长期代言';
export type ExclusiveType = '独家' | '非独家';
export type VerifiedType = '蓝V认证' | '普通账号';
export type ReferralSource = '自然流量' | '朋友推荐' | '运营邀请' | '其他';
export type ContentCategory =
  | '知识干货' | '小清新' | '接地气' | '娱乐搞笑'
  | '测评好物' | '生活方式' | '职场成长' | '科技数码'
  | '美食' | '旅行' | '健身' | '美妆' | '母婴' | '教育';
export type CampaignStatus = '待审核' | '待开始' | '进行中' | '待确认' | '已完成' | '已取消' | '退款中';
export type TransactionType = '广告主充值' | '预授权冻结' | '创作者分成' | '退款' | '提现' | '佣金收入';
export type TransactionStatus = 'pending' | 'completed' | 'refunded';
export type EarningStatus = 'frozen' | 'available' | 'withdrawn' | 'refunded';
export type BlacklistType = 'phone' | 'platform_id' | 'name';

// ─── Config ───────────────────────────────────────────────────────────────────
export const PLATFORM_COMMISSION_RATE = 0.01; // 1%
export const MIN_FOLLOWERS = 1000;
export const REFERRAL_SOURCE_OPTIONS: ReferralSource[] = ['自然流量', '朋友推荐', '运营邀请', '其他'];
export const CATEGORY_OPTIONS: ContentCategory[] = [
  '知识干货', '小清新', '接地气', '娱乐搞笑', '测评好物', '生活方式',
  '职场成长', '科技数码', '美食', '旅行', '健身', '美妆', '母婴', '教育',
];
export const PLATFORM_OPTIONS: Platform[] = ['视频号', '小红书', '抖音'];

// ─── Interfaces ────────────────────────────────────────────────────────────────
export interface Creator {
  id: number; name: string; phone: string; email?: string; company?: string;
  cooperation_status: CooperationStatus; categories: ContentCategory[];
  referral_source?: ReferralSource; submitted_at: string; admin_notes?: string;
}

export interface PlatformAccount {
  id: number; creator_id: number; platform: Platform; account_name: string;
  account_url: string; followers: number; avg_views: number; max_views: number;
  likes_avg: number; comments_avg: number; engagement_rate: number;
  is_verified: VerifiedType; rate_card?: string;
}

export interface CollaborationCase {
  id: number; creator_id: number; platform: Platform; brand_name: string;
  content_type: ContentType; is_exclusive: ExclusiveType;
  campaign_url?: string; results?: string; cooperation_date?: string;
}

export interface Advertiser {
  id: number; name: string; phone: string; email: string; company: string;
  balance: number; created_at: string;
}

export interface Campaign {
  id: number; advertiser_id: number; creator_id: number; platform: Platform;
  title: string; description: string; budget_total: number; budget_paid: number;
  budget_released: number; budget_confirmed: number; status: CampaignStatus;
  started_at?: string; confirmed_at?: string; completed_at?: string;
  created_at: string; creator_snapshot_name: string;
  creator_snapshot_platform: Platform; creator_snapshot_account: string;
}

export interface Transaction {
  id: number; campaign_id: number; advertiser_id: number; creator_id: number;
  type: TransactionType; amount: number; balance_after: number;
  status: TransactionStatus; remark: string; created_at: string;
}

export interface BlacklistEntry {
  id: number; type: BlacklistType; value: string; reason: string;
  operator: string; created_at: string;
}

export interface CreatorEarning {
  id: number; creator_id: number; campaign_id: number;
  gross_amount: number; commission_rate: number; commission_amount: number;
  net_amount: number; status: EarningStatus;
  released_at?: string; created_at: string;
}

export interface Withdrawal {
  id: number; creator_id: number; amount: number;
  status: 'pending' | 'approved' | 'rejected';
  note: string; created_at: string; processed_at?: string;
}

// ─── SQLite Setup ─────────────────────────────────────────────────────────────
let db: Database | null = null;
let initPromise: Promise<void> | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;
  if (!initPromise) initPromise = initDb();
  await initPromise;
  return db!;
}

async function initDb(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js/dist/${file}`,
  });
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const data = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
      db = new SQL.Database(data);
    } catch { db = new SQL.Database(); }
  } else { db = new SQL.Database(); }

  db.run(`CREATE TABLE IF NOT EXISTS creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
    email TEXT DEFAULT '', company TEXT DEFAULT '', cooperation_status TEXT DEFAULT '待审核',
    categories TEXT DEFAULT '[]', referral_source TEXT DEFAULT '', submitted_at TEXT NOT NULL,
    admin_notes TEXT DEFAULT '')`);

  db.run(`CREATE TABLE IF NOT EXISTS platform_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL, platform TEXT NOT NULL,
    account_name TEXT NOT NULL, account_url TEXT NOT NULL, followers INTEGER DEFAULT 0,
    avg_views INTEGER DEFAULT 0, max_views INTEGER DEFAULT 0, likes_avg REAL DEFAULT 0,
    comments_avg REAL DEFAULT 0, engagement_rate REAL DEFAULT 0,
    is_verified TEXT DEFAULT '普通账号', rate_card TEXT DEFAULT '',
    FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE)`);

  db.run(`CREATE TABLE IF NOT EXISTS collaboration_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL, platform TEXT NOT NULL,
    brand_name TEXT NOT NULL, content_type TEXT DEFAULT '图文', is_exclusive TEXT DEFAULT '非独家',
    campaign_url TEXT DEFAULT '', results TEXT DEFAULT '', cooperation_date TEXT DEFAULT '',
    FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE)`);

  db.run(`CREATE TABLE IF NOT EXISTS advertisers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE,
    email TEXT DEFAULT '', company TEXT DEFAULT '', balance INTEGER DEFAULT 0, created_at TEXT NOT NULL)`);

  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT, advertiser_id INTEGER NOT NULL, creator_id INTEGER NOT NULL,
    platform TEXT NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '',
    budget_total INTEGER DEFAULT 0, budget_paid INTEGER DEFAULT 0, budget_released INTEGER DEFAULT 0,
    budget_confirmed INTEGER DEFAULT 0, status TEXT DEFAULT '待审核',
    started_at TEXT DEFAULT '', confirmed_at TEXT DEFAULT '', completed_at TEXT DEFAULT '',
    created_at TEXT NOT NULL, creator_snapshot_name TEXT DEFAULT '',
    creator_snapshot_platform TEXT DEFAULT '', creator_snapshot_account TEXT DEFAULT '',
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
    FOREIGN KEY (creator_id) REFERENCES creators(id))`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER DEFAULT 0,
    advertiser_id INTEGER DEFAULT 0, creator_id INTEGER DEFAULT 0,
    type TEXT NOT NULL, amount INTEGER NOT NULL, balance_after INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', remark TEXT DEFAULT '', created_at TEXT NOT NULL)`);

  db.run(`CREATE TABLE IF NOT EXISTS blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, value TEXT NOT NULL,
    reason TEXT DEFAULT '', operator TEXT DEFAULT 'system', created_at TEXT NOT NULL)`);

  db.run(`CREATE TABLE IF NOT EXISTS creator_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL, campaign_id INTEGER NOT NULL,
    gross_amount INTEGER NOT NULL, commission_rate REAL DEFAULT 0.01,
    commission_amount INTEGER NOT NULL, net_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'frozen', released_at TEXT DEFAULT '', created_at TEXT NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES creators(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id))`);

  db.run(`CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL,
    amount INTEGER NOT NULL, status TEXT DEFAULT 'pending',
    note TEXT DEFAULT '', created_at TEXT NOT NULL, processed_at TEXT DEFAULT '',
    FOREIGN KEY (creator_id) REFERENCES creators(id))`);

  db.run('PRAGMA foreign_keys = ON');
  saveDb();
}

function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem(DB_KEY, base64);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────
function rowToCreator(obj: Record<string, unknown>): Creator {
  return {
    id: obj.id as number, name: obj.name as string, phone: obj.phone as string,
    email: (obj.email as string) || undefined, company: (obj.company as string) || undefined,
    cooperation_status: (obj.cooperation_status as CooperationStatus) || '待审核',
    categories: JSON.parse((obj.categories as string) || '[]'),
    referral_source: (obj.referral_source as ReferralSource) || undefined,
    submitted_at: obj.submitted_at as string, admin_notes: (obj.admin_notes as string) || undefined,
  };
}

function rowToAccount(obj: Record<string, unknown>): PlatformAccount {
  return {
    id: obj.id as number, creator_id: obj.creator_id as number,
    platform: obj.platform as Platform, account_name: obj.account_name as string,
    account_url: obj.account_url as string, followers: obj.followers as number,
    avg_views: obj.avg_views as number, max_views: obj.max_views as number,
    likes_avg: obj.likes_avg as number, comments_avg: obj.comments_avg as number,
    engagement_rate: obj.engagement_rate as number,
    is_verified: obj.is_verified as VerifiedType,
    rate_card: (obj.rate_card as string) || undefined,
  };
}

function rowToCampaign(obj: Record<string, unknown>): Campaign {
  return {
    id: obj.id as number, advertiser_id: obj.advertiser_id as number,
    creator_id: obj.creator_id as number, platform: obj.platform as Platform,
    title: obj.title as string, description: (obj.description as string) || '',
    budget_total: obj.budget_total as number, budget_paid: obj.budget_paid as number,
    budget_released: obj.budget_released as number, budget_confirmed: obj.budget_confirmed as number,
    status: (obj.status as CampaignStatus) || '待审核',
    started_at: (obj.started_at as string) || undefined,
    confirmed_at: (obj.confirmed_at as string) || undefined,
    completed_at: (obj.completed_at as string) || undefined,
    created_at: obj.created_at as string,
    creator_snapshot_name: (obj.creator_snapshot_name as string) || '',
    creator_snapshot_platform: (obj.creator_snapshot_platform as Platform) || '视频号',
    creator_snapshot_account: (obj.creator_snapshot_account as string) || '',
  };
}

function rowToTransaction(obj: Record<string, unknown>): Transaction {
  return {
    id: obj.id as number, campaign_id: obj.campaign_id as number,
    advertiser_id: obj.advertiser_id as number, creator_id: obj.creator_id as number,
    type: obj.type as TransactionType, amount: obj.amount as number,
    balance_after: obj.balance_after as number,
    status: (obj.status as TransactionStatus) || 'pending',
    remark: (obj.remark as string) || '', created_at: obj.created_at as string,
  };
}

// ─── Creators ─────────────────────────────────────────────────────────────────
export async function listCreators(): Promise<Creator[]> {
  const database = await getDb();
  const results = database.exec('SELECT * FROM creators ORDER BY submitted_at DESC');
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToCreator(obj);
  });
}

export async function getCreatorById(id: number): Promise<Creator | null> {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM creators WHERE id = ?');
  stmt.bind([id]);
  if (!stmt.step()) { stmt.free(); return null; }
  const row = stmt.getAsObject(); stmt.free();
  return rowToCreator(row);
}

export async function createCreator(fields: Omit<Creator, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO creators (name, phone, email, company, cooperation_status, categories, referral_source, submitted_at, admin_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.name, fields.phone, fields.email ?? '', fields.company ?? '',
     fields.cooperation_status, JSON.stringify(fields.categories), fields.referral_source ?? '',
     fields.submitted_at, fields.admin_notes ?? '']
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function updateCreator(id: number, fields: Partial<Creator>): Promise<void> {
  const database = await getDb();
  const sets: string[] = []; const values: unknown[] = [];
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

// ─── Platform Accounts ─────────────────────────────────────────────────────────
export async function listAccountsByCreator(creatorId: number): Promise<PlatformAccount[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM platform_accounts WHERE creator_id = ${creatorId} ORDER BY id`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToAccount(obj);
  });
}

export async function createAccount(fields: Omit<PlatformAccount, 'id' | 'engagement_rate'>): Promise<number> {
  const database = await getDb();
  const engagement = fields.avg_views > 0
    ? Math.round(((fields.likes_avg + fields.comments_avg) / fields.avg_views) * 10000) / 100 : 0;
  database.run(
    `INSERT INTO platform_accounts (creator_id, platform, account_name, account_url, followers, avg_views, max_views, likes_avg, comments_avg, engagement_rate, is_verified, rate_card)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.creator_id, fields.platform, fields.account_name, fields.account_url,
     fields.followers, fields.avg_views, fields.max_views, fields.likes_avg, fields.comments_avg,
     engagement, fields.is_verified, fields.rate_card ?? '']
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

// ─── Collaboration Cases ───────────────────────────────────────────────────────
export async function listCasesByCreator(creatorId: number): Promise<CollaborationCase[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM collaboration_cases WHERE creator_id = ${creatorId} ORDER BY id`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number, creator_id: obj.creator_id as number, platform: obj.platform as Platform,
      brand_name: obj.brand_name as string, content_type: (obj.content_type as ContentType) || '图文',
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
    [fields.creator_id, fields.platform, fields.brand_name, fields.content_type, fields.is_exclusive,
     fields.campaign_url ?? '', fields.results ?? '', fields.cooperation_date ?? '']
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

// ─── Query Helpers ─────────────────────────────────────────────────────────────
export async function getAllAccounts(): Promise<PlatformAccount[]> {
  const database = await getDb();
  const results = database.exec('SELECT * FROM platform_accounts ORDER BY creator_id');
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToAccount(obj);
  });
}

export async function checkPhoneDuplicate(phone: string): Promise<boolean> {
  const database = await getDb();
  const results = database.exec(`SELECT id FROM creators WHERE phone = '${phone.replace(/'/g, "''")}'`);
  return results.length > 0 && results[0].values.length > 0;
}

// ─── Blacklist ─────────────────────────────────────────────────────────────────
export async function addToBlacklist(type: BlacklistType, value: string, reason: string, operator = 'system'): Promise<void> {
  const database = await getDb();
  database.run(
    `INSERT OR IGNORE INTO blacklist (type, value, reason, operator, created_at) VALUES (?, ?, ?, ?, ?)`,
    [type, value, reason, operator, new Date().toISOString()]
  );
  saveDb();
}

export async function isBlacklisted(type: BlacklistType, value: string): Promise<boolean> {
  const database = await getDb();
  const results = database.exec(`SELECT id FROM blacklist WHERE type = '${type}' AND value = '${value.replace(/'/g, "''")}'`);
  return results.length > 0 && results[0].values.length > 0;
}

export async function removeFromBlacklist(id: number): Promise<void> {
  const database = await getDb();
  database.run(`DELETE FROM blacklist WHERE id = ?`, [id]);
  saveDb();
}

export async function listBlacklist(): Promise<BlacklistEntry[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM blacklist ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number, type: obj.type as BlacklistType, value: obj.value as string,
      reason: obj.reason as string, operator: obj.operator as string, created_at: obj.created_at as string,
    };
  });
}

// ─── Auto-Approval ─────────────────────────────────────────────────────────────
export async function autoApproveCreator(creatorId: number): Promise<{ approved: boolean; reason?: string }> {
  const creator = await getCreatorById(creatorId);
  if (!creator) return { approved: false, reason: '创作者不存在' };

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(creator.phone)) {
    await updateCreator(creatorId, { cooperation_status: '暂停接单', admin_notes: '手机号格式错误' });
    return { approved: false, reason: '手机号格式错误' };
  }

  if (await isBlacklisted('phone', creator.phone)) {
    await updateCreator(creatorId, { cooperation_status: '暂停接单', admin_notes: '手机号在黑名单' });
    return { approved: false, reason: '手机号在黑名单' };
  }

  const accounts = await listAccountsByCreator(creatorId);
  if (!accounts.length) {
    await updateCreator(creatorId, { cooperation_status: '暂停接单', admin_notes: '无平台账号' });
    return { approved: false, reason: '无平台账号' };
  }

  for (const acc of accounts) {
    if (acc.followers < MIN_FOLLOWERS) {
      await updateCreator(creatorId, { cooperation_status: '暂停接单', admin_notes: `平台 ${acc.platform} 粉丝数${acc.followers}低于${MIN_FOLLOWERS}` });
      await addToBlacklist('platform_id', acc.account_url, `粉丝数不达标:${acc.followers}`, 'system');
      return { approved: false, reason: `平台 ${acc.platform} 粉丝数不达标（${acc.followers} < ${MIN_FOLLOWERS}）` };
    }
    if (await isBlacklisted('platform_id', acc.account_url)) {
      await updateCreator(creatorId, { cooperation_status: '暂停接单', admin_notes: `平台账号 ${acc.platform} 在黑名单` });
      return { approved: false, reason: `平台账号 ${acc.platform} 在黑名单` };
    }
  }

  await updateCreator(creatorId, { cooperation_status: '开放合作' });
  return { approved: true };
}

// ─── Advertiser Auth ──────────────────────────────────────────────────────────
const ADVERTISER_AUTH_KEY = 'creato_adv_auth';
const ADVERTISER_PHONE_KEY = 'creato_adv_phone';

export function isAdvertiserLoggedIn(): boolean { return !!localStorage.getItem(ADVERTISER_AUTH_KEY); }
export function getLoggedInAdvertiserPhone(): string | null { return localStorage.getItem(ADVERTISER_PHONE_KEY); }
export function advertiserLogin(phone: string): void {
  localStorage.setItem(ADVERTISER_AUTH_KEY, '1');
  localStorage.setItem(ADVERTISER_PHONE_KEY, phone);
}
export function advertiserLogout(): void {
  localStorage.removeItem(ADVERTISER_AUTH_KEY);
  localStorage.removeItem(ADVERTISER_PHONE_KEY);
}

// ─── Creator Auth ─────────────────────────────────────────────────────────────
const CREATOR_AUTH_KEY = 'creato_creator_auth';
const CREATOR_ID_KEY = 'creato_creator_id';

export function isCreatorLoggedIn(): boolean { return !!localStorage.getItem(CREATOR_AUTH_KEY); }
export function getLoggedInCreatorId(): number | null {
  const v = localStorage.getItem(CREATOR_ID_KEY);
  return v ? Number(v) : null;
}
export function creatorLogin(creatorId: number): void {
  localStorage.setItem(CREATOR_AUTH_KEY, '1');
  localStorage.setItem(CREATOR_ID_KEY, String(creatorId));
}
export function creatorLogout(): void {
  localStorage.removeItem(CREATOR_AUTH_KEY);
  localStorage.removeItem(CREATOR_ID_KEY);
}

// ─── Advertisers ──────────────────────────────────────────────────────────────
export async function createAdvertiser(fields: Omit<Advertiser, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO advertisers (name, phone, email, company, balance, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [fields.name, fields.phone, fields.email ?? '', fields.company ?? '', fields.balance, fields.created_at]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function getAdvertiserById(id: number): Promise<Advertiser | null> {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM advertisers WHERE id = ?');
  stmt.bind([id]);
  if (!stmt.step()) { stmt.free(); return null; }
  const row = stmt.getAsObject(); stmt.free();
  return {
    id: row.id as number, name: row.name as string, phone: row.phone as string,
    email: (row.email as string) || '', company: (row.company as string) || '',
    balance: row.balance as number, created_at: row.created_at as string,
  };
}

export async function getAdvertiserByPhone(phone: string): Promise<Advertiser | null> {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM advertisers WHERE phone = ?');
  stmt.bind([phone]);
  if (!stmt.step()) { stmt.free(); return null; }
  const row = stmt.getAsObject(); stmt.free();
  return {
    id: row.id as number, name: row.name as string, phone: row.phone as string,
    email: (row.email as string) || '', company: (row.company as string) || '',
    balance: row.balance as number, created_at: row.created_at as string,
  };
}

export async function updateAdvertiserBalance(id: number, newBalance: number): Promise<void> {
  const database = await getDb();
  database.run('UPDATE advertisers SET balance = ? WHERE id = ?', [newBalance, id]);
  saveDb();
}

export async function listAdvertisers(): Promise<Advertiser[]> {
  const database = await getDb();
  const results = database.exec('SELECT * FROM advertisers ORDER BY created_at DESC');
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number, name: obj.name as string, phone: obj.phone as string,
      email: (obj.email as string) || '', company: (obj.company as string) || '',
      balance: obj.balance as number, created_at: obj.created_at as string,
    };
  });
}

// ─── Campaigns ─────────────────────────────────────────────────────────────────
export async function createCampaign(fields: Omit<Campaign, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO campaigns (advertiser_id, creator_id, platform, title, description, budget_total, budget_paid, budget_released, budget_confirmed, status, created_at, creator_snapshot_name, creator_snapshot_platform, creator_snapshot_account)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.advertiser_id, fields.creator_id, fields.platform, fields.title, fields.description,
     fields.budget_total, fields.budget_paid, fields.budget_released, fields.budget_confirmed,
     fields.status, fields.created_at, fields.creator_snapshot_name, fields.creator_snapshot_platform,
     fields.creator_snapshot_account]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function getCampaignById(id: number): Promise<Campaign | null> {
  const database = await getDb();
  const stmt = database.prepare('SELECT * FROM campaigns WHERE id = ?');
  stmt.bind([id]);
  if (!stmt.step()) { stmt.free(); return null; }
  const row = stmt.getAsObject(); stmt.free();
  return rowToCampaign(row);
}

export async function listCampaignsByAdvertiser(advertiserId: number): Promise<Campaign[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM campaigns WHERE advertiser_id = ${advertiserId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToCampaign(obj);
  });
}

export async function listCampaignsByCreator(creatorId: number): Promise<Campaign[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM campaigns WHERE creator_id = ${creatorId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToCampaign(obj);
  });
}

export async function listAllCampaigns(): Promise<Campaign[]> {
  const database = await getDb();
  const results = database.exec('SELECT * FROM campaigns ORDER BY created_at DESC');
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToCampaign(obj);
  });
}

export async function updateCampaign(id: number, fields: Partial<Campaign>): Promise<void> {
  const database = await getDb();
  const sets: string[] = []; const values: unknown[] = [];
  const fieldMap: Record<string, string> = {
    status: 'status', budget_paid: 'budget_paid', budget_released: 'budget_released',
    budget_confirmed: 'budget_confirmed', started_at: 'started_at',
    confirmed_at: 'confirmed_at', completed_at: 'completed_at',
  };
  for (const [k, v] of Object.entries(fields)) {
    if (fieldMap[k] && v !== undefined) { sets.push(`${fieldMap[k]} = ?`); values.push(v); }
  }
  if (!sets.length) return;
  values.push(id);
  database.run(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDb();
}

// ─── Transactions ──────────────────────────────────────────────────────────────
export async function createTransaction(fields: Omit<Transaction, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO transactions (campaign_id, advertiser_id, creator_id, type, amount, balance_after, status, remark, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.campaign_id ?? 0, fields.advertiser_id ?? 0, fields.creator_id ?? 0,
     fields.type, fields.amount, fields.balance_after, fields.status, fields.remark, fields.created_at]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function listTransactionsByAdvertiser(advertiserId: number): Promise<Transaction[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM transactions WHERE advertiser_id = ${advertiserId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToTransaction(obj);
  });
}

export async function listTransactionsByCreator(creatorId: number): Promise<Transaction[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM transactions WHERE creator_id = ${creatorId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToTransaction(obj);
  });
}

export async function listTransactionsByCampaign(campaignId: number): Promise<Transaction[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM transactions WHERE campaign_id = ${campaignId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return rowToTransaction(obj);
  });
}

// ─── Creator Earnings ─────────────────────────────────────────────────────────
export async function createEarning(fields: Omit<CreatorEarning, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO creator_earnings (creator_id, campaign_id, gross_amount, commission_rate, commission_amount, net_amount, status, released_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.creator_id, fields.campaign_id, fields.gross_amount, fields.commission_rate,
     fields.commission_amount, fields.net_amount, fields.status, fields.released_at ?? '', fields.created_at]
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function listEarningsByCreator(creatorId: number): Promise<CreatorEarning[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM creator_earnings WHERE creator_id = ${creatorId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number, creator_id: obj.creator_id as number, campaign_id: obj.campaign_id as number,
      gross_amount: obj.gross_amount as number, commission_rate: obj.commission_rate as number,
      commission_amount: obj.commission_amount as number, net_amount: obj.net_amount as number,
      status: (obj.status as EarningStatus) || 'frozen',
      released_at: (obj.released_at as string) || undefined,
      created_at: obj.created_at as string,
    };
  });
}

export async function updateEarningStatus(id: number, status: EarningStatus): Promise<void> {
  const database = await getDb();
  const released = status === 'available' ? new Date().toISOString() : '';
  database.run('UPDATE creator_earnings SET status = ?, released_at = ? WHERE id = ?', [status, released, id]);
  saveDb();
}

// ─── Withdrawals ───────────────────────────────────────────────────────────────
export async function createWithdrawal(fields: Omit<Withdrawal, 'id'>): Promise<number> {
  const database = await getDb();
  database.run(
    `INSERT INTO withdrawals (creator_id, amount, status, note, created_at, processed_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [fields.creator_id, fields.amount, fields.status, fields.note, fields.created_at, fields.processed_at ?? '']
  );
  const result = database.exec('SELECT last_insert_rowid() as id');
  saveDb();
  return result[0].values[0][0] as number;
}

export async function listWithdrawalsByCreator(creatorId: number): Promise<Withdrawal[]> {
  const database = await getDb();
  const results = database.exec(`SELECT * FROM withdrawals WHERE creator_id = ${creatorId} ORDER BY created_at DESC`);
  if (!results.length) return [];
  return results[0].values.map(row => {
    const obj: Record<string, unknown> = {};
    results[0].columns.forEach((col, i) => { obj[col] = row[i]; });
    return {
      id: obj.id as number, creator_id: obj.creator_id as number, amount: obj.amount as number,
      status: (obj.status as 'pending' | 'approved' | 'rejected') || 'pending',
      note: (obj.note as string) || '', created_at: obj.created_at as string,
      processed_at: (obj.processed_at as string) || undefined,
    };
  });
}

export async function updateWithdrawal(id: number, fields: Partial<Withdrawal>): Promise<void> {
  const database = await getDb();
  const sets: string[] = []; const values: unknown[] = [];
  if (fields.status !== undefined) { sets.push('status = ?'); values.push(fields.status); }
  if (fields.processed_at !== undefined) { sets.push('processed_at = ?'); values.push(fields.processed_at); }
  if (!sets.length) return;
  values.push(id);
  database.run(`UPDATE withdrawals SET ${sets.join(', ')} WHERE id = ?`, values);
  saveDb();
}

// ─── Cashflow Engine ───────────────────────────────────────────────────────────

/** Advertiser tops up balance */
export async function advertiserTopUp(advertiserId: number, amountCents: number): Promise<void> {
  const advertiser = await getAdvertiserById(advertiserId);
  if (!advertiser) throw new Error('广告主不存在');
  const newBalance = advertiser.balance + amountCents;
  await updateAdvertiserBalance(advertiserId, newBalance);
  await createTransaction({
    advertiser_id: advertiserId, type: '广告主充值', amount: amountCents,
    balance_after: newBalance, status: 'completed', remark: '余额充值',
    created_at: new Date().toISOString(),
  });
}

/** Create campaign: freeze full budget, create earning record */
export async function createCampaignWithPayment(
  advertiserId: number, creatorId: number, platform: Platform,
  title: string, description: string, budgetCents: number,
  creatorName: string, creatorPlatform: Platform, creatorAccount: string
): Promise<number> {
  const advertiser = await getAdvertiserById(advertiserId);
  if (!advertiser) throw new Error('广告主不存在');
  if (advertiser.balance < budgetCents) throw new Error('余额不足');

  const frozenBalance = advertiser.balance - budgetCents;
  await updateAdvertiserBalance(advertiserId, frozenBalance);

  const campaignId = await createCampaign({
    advertiser_id: advertiserId, creator_id: creatorId, platform, title, description,
    budget_total: budgetCents, budget_paid: budgetCents, budget_released: 0,
    budget_confirmed: 0, status: '待审核',
    created_at: new Date().toISOString(),
    creator_snapshot_name: creatorName,
    creator_snapshot_platform: creatorPlatform,
    creator_snapshot_account: creatorAccount,
  });

  await createTransaction({
    campaign_id: campaignId, advertiser_id: advertiserId, creator_id: creatorId,
    type: '预授权冻结', amount: budgetCents, balance_after: frozenBalance,
    status: 'completed', remark: `投放项目创建: ${title}`, created_at: new Date().toISOString(),
  });

  const grossToCreator = Math.round(budgetCents * (1 - PLATFORM_COMMISSION_RATE));
  await createEarning({
    creator_id: creatorId, campaign_id: campaignId,
    gross_amount: grossToCreator, commission_rate: PLATFORM_COMMISSION_RATE,
    commission_amount: budgetCents - grossToCreator, net_amount: 0,
    status: 'frozen', created_at: new Date().toISOString(),
  });

  return campaignId;
}

/** Creator starts working: release first 50% */
export async function creatorStartWork(campaignId: number): Promise<void> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error('项目不存在');

  const grossToCreator = Math.round(campaign.budget_total * (1 - PLATFORM_COMMISSION_RATE));
  const firstRelease = Math.round(grossToCreator * 0.5);

  await updateCampaign(campaignId, {
    status: '进行中', budget_released: firstRelease,
    started_at: new Date().toISOString(),
  });

  await createEarning({
    creator_id: campaign.creator_id, campaign_id: campaignId,
    gross_amount: grossToCreator, commission_rate: PLATFORM_COMMISSION_RATE,
    commission_amount: campaign.budget_total - grossToCreator,
    net_amount: firstRelease, status: 'available',
    released_at: new Date().toISOString(), created_at: new Date().toISOString(),
  });

  await createTransaction({
    campaign_id: campaignId, creator_id: campaign.creator_id,
    type: '创作者分成', amount: firstRelease, balance_after: 0,
    status: 'completed', remark: '第一阶段放款（50%）', created_at: new Date().toISOString(),
  });
}

/** Advertiser confirms: release remaining 50% */
export async function advertiserConfirm(campaignId: number): Promise<void> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error('项目不存在');

  const grossToCreator = Math.round(campaign.budget_total * (1 - PLATFORM_COMMISSION_RATE));
  const secondRelease = grossToCreator - campaign.budget_released;

  await updateCampaign(campaignId, {
    status: '已完成', budget_confirmed: campaign.budget_total,
    confirmed_at: new Date().toISOString(), completed_at: new Date().toISOString(),
  });

  await createEarning({
    creator_id: campaign.creator_id, campaign_id: campaignId,
    gross_amount: grossToCreator, commission_rate: PLATFORM_COMMISSION_RATE,
    commission_amount: campaign.budget_total - grossToCreator,
    net_amount: secondRelease, status: 'available',
    released_at: new Date().toISOString(), created_at: new Date().toISOString(),
  });

  await createTransaction({
    campaign_id: campaignId, creator_id: campaign.creator_id,
    type: '创作者分成', amount: secondRelease, balance_after: 0,
    status: 'completed', remark: '第二阶段放款（尾款50%）', created_at: new Date().toISOString(),
  });
}

/** 7-day refund: return remaining frozen budget */
export async function advertiserRefund(campaignId: number): Promise<void> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error('项目不存在');
  if (['已取消', '退款中'].includes(campaign.status)) return;

  const released = campaign.budget_released;
  const remaining = campaign.budget_total - released;
  if (remaining <= 0) return;

  const advertiser = await getAdvertiserById(campaign.advertiser_id);
  if (!advertiser) throw new Error('广告主不存在');

  await updateCampaign(campaignId, { status: '已取消', completed_at: new Date().toISOString() });

  const newBalance = advertiser.balance + remaining;
  await updateAdvertiserBalance(campaign.advertiser_id, newBalance);

  await createTransaction({
    campaign_id: campaignId, advertiser_id: campaign.advertiser_id,
    type: '退款', amount: remaining, balance_after: newBalance,
    status: 'completed', remark: '7天无理由退款，扣除已放款部分', created_at: new Date().toISOString(),
  });
}

// ─── Creator Income Summary ────────────────────────────────────────────────────
export async function getCreatorIncomeSummary(creatorId: number): Promise<{
  totalEarned: number; availableBalance: number; frozenBalance: number; withdrawnBalance: number;
}> {
  const earnings = await listEarningsByCreator(creatorId);
  let totalEarned = 0, availableBalance = 0, frozenBalance = 0, withdrawnBalance = 0;
  for (const e of earnings) {
    totalEarned += e.net_amount;
    if (e.status === 'available') availableBalance += e.net_amount;
    else if (e.status === 'frozen') frozenBalance += e.net_amount;
    else if (e.status === 'withdrawn') withdrawnBalance += e.net_amount;
  }
  return { totalEarned, availableBalance, frozenBalance, withdrawnBalance };
}

// ─── Utility ───────────────────────────────────────────────────────────────────
export function centsToYuan(cents: number): string { return (cents / 100).toFixed(2); }
export function yuanToCents(yuan: number): number { return Math.round(yuan * 100); }
