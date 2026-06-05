import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'
import { applySchema }       from './database/schema'
import { getRegiones, createRegion, updateRegion, deleteRegion, updateRegionEstado, createSpot, deleteSpot } from './database/queries/regiones'
import { getEspecies, createEspecie, updateEspecie, deleteEspecie, saveImagenEspecie } from './database/queries/especies'
import { getBitacora, createEntrada, updateEntrada, deleteEntrada }  from './database/queries/bitacora'

const DB_PATH = path.join(app.getPath('userData'), 'bitacora.db')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
applySchema(db)

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
      webSecurity: false,
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

// ── IPC: Regiones ─────────────────────────────────────────────────────────────
ipcMain.handle('regiones:getAll',       () => getRegiones(db))
ipcMain.handle('regiones:create',       (_e, data) => createRegion(db, data))
ipcMain.handle('regiones:updateEstado', (_e, id, estado) => updateRegionEstado(db, id, estado))
ipcMain.handle('regiones:createSpot',   (_e, spot) => createSpot(db, spot))
ipcMain.handle('regiones:update',  (_e, id, data) => updateRegion(db, id, data))
ipcMain.handle('regiones:delete',  (_e, id) => deleteRegion(db, id))
ipcMain.handle('regiones:deleteSpot', (_e, id) => deleteSpot(db, id))

// ── IPC: Especies ─────────────────────────────────────────────────────────────
ipcMain.handle('especies:getAll',   () => getEspecies(db))
ipcMain.handle('especies:create',   (_e, especie) => createEspecie(db, especie))
ipcMain.handle('especies:update',   (_e, id, datos) => updateEspecie(db, id, datos))
ipcMain.handle('especies:delete',   (_e, id) => deleteEspecie(db, id))

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
  const ext = path.extname(sourcePath).toLowerCase().replace('.', '') || 'jpeg'
  const mime = ext === 'jpg' ? 'jpeg' : ext
  const buffer = fs.readFileSync(sourcePath)
  const base64 = `data:image/${mime};base64,${buffer.toString('base64')}`
  saveImagenEspecie(db, id, base64)
  return base64
})