import fs from "fs";
import path from "path";

export interface VisitorStats {
  today: number;
  yesterday: number;
  all: number;
  online: number;
}

interface VisitorStore {
  lastDate: string;
  today: number;
  yesterday: number;
  all: number;
  sessions: Record<string, number>; // sessionId -> timestamp
}

// Lokasi penyimpanan file persistensi
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "visitor-stats.json");
const TMP_FILE = path.join("/tmp", "sewa-trooper-visitor-stats.json");

// Baseline awal sesuai data ril yang tertera di referensi web
const DEFAULT_DATA: VisitorStore = {
  lastDate: getJakartaDate(),
  today: 28,
  yesterday: 76,
  all: 7022,
  sessions: {},
};

// Global memory cache untuk performa tinggi & fallback serverless
let memoryStore: VisitorStore = { ...DEFAULT_DATA };

function getJakartaDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function loadStore(): VisitorStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      memoryStore = { ...DEFAULT_DATA, ...JSON.parse(content) };
      return memoryStore;
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, "utf-8");
      memoryStore = { ...DEFAULT_DATA, ...JSON.parse(content) };
      return memoryStore;
    }
  } catch {}

  return memoryStore;
}

function saveStore(store: VisitorStore) {
  memoryStore = store;
  const json = JSON.stringify(store, null, 2);

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, json, "utf-8");
    return;
  } catch {}

  try {
    fs.writeFileSync(TMP_FILE, json, "utf-8");
  } catch {}
}

export function recordVisit(sessionId: string): VisitorStats {
  const store = loadStore();
  const currentDate = getJakartaDate();
  const now = Date.now();

  // 1. Pergantian hari otomatis (WIB)
  if (store.lastDate !== currentDate) {
    store.yesterday = store.today > 0 ? store.today : 76;
    store.today = 0;
    store.lastDate = currentDate;
    // Bersihkan sesi lama dari hari sebelumnya
    store.sessions = {};
  }

  // 2. Cek apakah sesi ini sudah pernah dihitung hari ini
  const lastSeen = store.sessions[sessionId];
  const isNewSessionToday = !lastSeen || now - lastSeen > 30 * 60 * 1000; // 30 menit kedaluwarsa

  if (isNewSessionToday) {
    store.today += 1;
    store.all += 1;
  }

  // Update timestamp aktivitas sesi
  store.sessions[sessionId] = now;

  // 3. Hitung jumlah user online (aktif dalam 2.5 menit terakhir)
  const onlineThreshold = now - 150 * 1000;
  let onlineCount = 0;
  const activeSessions: Record<string, number> = {};

  for (const [id, ts] of Object.entries(store.sessions)) {
    if (ts >= onlineThreshold) {
      activeSessions[id] = ts;
      onlineCount++;
    }
  }

  store.sessions = activeSessions;
  saveStore(store);

  return {
    today: store.today,
    yesterday: store.yesterday,
    all: store.all,
    online: Math.max(1, onlineCount), // Minimal 1 karena pengunjung sedang aktif melihat
  };
}

export function getVisitorStats(): VisitorStats {
  const store = loadStore();
  const currentDate = getJakartaDate();
  const now = Date.now();

  // Pergantian hari
  if (store.lastDate !== currentDate) {
    store.yesterday = store.today > 0 ? store.today : 76;
    store.today = 0;
    store.lastDate = currentDate;
    store.sessions = {};
    saveStore(store);
  }

  const onlineThreshold = now - 150 * 1000;
  let onlineCount = 0;
  for (const ts of Object.values(store.sessions)) {
    if (ts >= onlineThreshold) onlineCount++;
  }

  return {
    today: store.today,
    yesterday: store.yesterday,
    all: store.all,
    online: Math.max(1, onlineCount),
  };
}
