import EventEmitter from 'eventemitter3'
import dat from 'dat.gui'
import './style/datGui.scss'

export default class Settings extends EventEmitter {
  constructor () {
    super()
    this.gui = new dat.GUI({ autoPlace: false })
    this._folders = []
    this.controllers = []
    const container = document.querySelector('header')
    container.appendChild(this.gui.domElement)
  }

  updateControls (p, options) {
    this.deleteControllers()
    this.deleteFolders(this.gui.__folders)
    this._parseConfig(p, options)
  }

  _parseConfig (p, options) {
    const keys = Object.keys(p)
    _.each(keys, (key) => {
      if (_.isObject(p[key])) {
        let folder
        if (this._folders.length > 0) {
          folder = this.setFolder(key, _.last(this._folders))
        } else {
          folder = this.setFolder(key)
        }
        this._folders.push(folder)
        this._parseConfig(p[key], options)
      } else if (this._folders.length > 0) {
        this.setController(p, key, _.last(this._folders), options)
      } else {
        this.setController(p, key, undefined, options)
      }
    })
    this._folders.pop()
  }

  setController (obj, property, folder, options = {}) {
    const gui = folder || this.gui
    const folderPath = _.reduce(this._folders, (result, value, key) => (
      result ? `${result}.${value.name}` : value.name
    ), '')
    const path = folderPath ? `${folderPath}.${property}` : property
    const opt = _.get(options, path) || {}
    const controller = gui.add(obj, property, opt.min || 0, opt.max, opt.step || 1)
    controller.path = folderPath
    controller.onChange(this._onChange.bind(this, controller))
    this.controllers.push(controller)
  }

  setFolder (name, folder = null) {
    let newFolder
    if (folder) {
      newFolder = folder.addFolder(name)
    } else {
      newFolder = this.gui.addFolder(name)
    }
    newFolder.open()
    return newFolder
  }

  deleteControllers () {
    _.each(this.controllers, (controller) => {
      controller.remove()
    })
    _.remove(this.controllers)
  }

  deleteFolders (folders) {
    _.each(folders, (folder) => {
      if (Object.keys(folder.__folders).length > 0) {
        this.deleteFolders(folder.__folders)
        folder.parent.removeFolder(folder)
      } else {
        folder.parent.removeFolder(folder)
      }
    })
  }

  _onChange (controller, value) {
    this.emit('change', controller.path, controller.property, value)
  }
}
