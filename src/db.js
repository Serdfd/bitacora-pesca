// ─── INDEXEDDB WRAPPER ───────────────────────────────────────────────────────

const DB_NAME    = 'almanaque_pesca';
const DB_VERSION = 1;
const STORE      = 'bitacora';
let _db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE)) {
        const s = d.createObjectStore(STORE, { keyPath:'id', autoIncrement:true });
        s.createIndex('fecha',  'fecha');
        s.createIndex('zona',   'zona');
        s.createIndex('especie','especie');
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function txOp(mode, fn) {
  const d = await initDB();
  return new Promise((res, rej) => {
    const tx  = d.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => res(req.result);
    req.onerror   = e  => rej(e.target.error);
  });
}

async function dbAdd(data)  { return txOp('readwrite', s => s.add(data)); }
async function dbPut(data)  { return txOp('readwrite', s => s.put(data)); }
async function dbDelete(id) { return txOp('readwrite', s => s.delete(id)); }
async function dbGet(id)    { return txOp('readonly',  s => s.get(id)); }
async function dbGetAll() {
  const d = await initDB();
  return new Promise((res, rej) => {
    const req = d.transaction(STORE,'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result.sort((a,b) => b.fecha.localeCompare(a.fecha)));
    req.onerror   = e  => rej(e.target.error);
  });
}