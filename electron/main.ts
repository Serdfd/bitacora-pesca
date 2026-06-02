import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'
import { applySchema }       from './database/schema'
import { getRegiones, createRegion, updateRegionEstado, createSpot } from './database/queries/regiones'
import { getEspecies, createEspecie }                                 from './database/queries/especies'
import { getBitacora, createEntrada, updateEntrada, deleteEntrada }   from './database/queries/bitacora'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'fs'

// ── Base de datos ─────────────────────────────────────────────────────────────

const DB_PATH = path.join(app.getPath('userData'), 'bitacora.db')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
applySchema(db)

const IMGS_DIR = path.join(app.getPath('userData'), 'especies-imgs')
if (!fs.existsSync(IMGS_DIR)) fs.mkdirSync(IMGS_DIR, { recursive: true })

// ── Ventana principal ─────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── IPC: Bitácora ─────────────────────────────────────────────────────────────

ipcMain.handle('bitacora:getAll',    () => getBitacora(db))
ipcMain.handle('bitacora:create',    (_e, entrada) => createEntrada(db, entrada))
ipcMain.handle('bitacora:update',    (_e, id, datos) => updateEntrada(db, id, datos))
ipcMain.handle('bitacora:delete',    (_e, id) => deleteEntrada(db, id))

// ── IPC: Regiones / Zonas ─────────────────────────────────────────────────────

ipcMain.handle('regiones:getAll',      () => getRegiones(db))
ipcMain.handle('regiones:create',      (_e, data) => createRegion(db, data))
ipcMain.handle('regiones:updateEstado',(_e, id, estado) => updateRegionEstado(db, id, estado))
ipcMain.handle('regiones:createSpot',  (_e, spot) => createSpot(db, spot))

// ── IPC: Especies ─────────────────────────────────────────────────────────────

ipcMain.handle('especies:getAll',  () => getEspecies(db))
ipcMain.handle('especies:create',  (_e, especie) => createEspecie(db, especie))

ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'))

ipcMain.handle('especies:selectImage', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Seleccionar imagen de especie',
    properties: ['openFile'],
    filters: [{ name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('especies:saveImage', (_e, id: string, sourcePath: string) => {
  const ext = path.extname(sourcePath).toLowerCase() || '.jpg'
  const dest = path.join(IMGS_DIR, `${id}${ext}`)
  fs.copyFileSync(sourcePath, dest)
  return dest
})