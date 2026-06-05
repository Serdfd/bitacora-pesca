import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  app: {
    getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),
  },
  bitacora: {
    getAll:    ()                   => ipcRenderer.invoke('bitacora:getAll'),
    create:    (e: any)             => ipcRenderer.invoke('bitacora:create', e),
    update:    (id: number, e: any) => ipcRenderer.invoke('bitacora:update', id, e),
    delete:    (id: number)         => ipcRenderer.invoke('bitacora:delete', id),
  },
  regiones: {
    getAll:       ()                                   => ipcRenderer.invoke('regiones:getAll'),
    create:       (data: any)                          => ipcRenderer.invoke('regiones:create', data),
    updateEstado: (id: string, estado: string)         => ipcRenderer.invoke('regiones:updateEstado', id, estado),
    createSpot:   (spot: any)                          => ipcRenderer.invoke('regiones:createSpot', spot),
    update:       (id: string, data: any)              => ipcRenderer.invoke('regiones:update', id, data),
    delete:       (id: string)                         => ipcRenderer.invoke('regiones:delete', id),
    deleteSpot: (id: string) => ipcRenderer.invoke('regiones:deleteSpot', id),
  },
  especies: {
    getAll:      ()                            => ipcRenderer.invoke('especies:getAll'),
    create:      (e: any)                      => ipcRenderer.invoke('especies:create', e),
    update:      (id: string, e: any)          => ipcRenderer.invoke('especies:update', id, e),
    delete:      (id: string)                  => ipcRenderer.invoke('especies:delete', id),
    selectImage: ()                            => ipcRenderer.invoke('especies:selectImage'),
    saveImage:   (id: string, src: string)     => ipcRenderer.invoke('especies:saveImage', id, src),
  },
})