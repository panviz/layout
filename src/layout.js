/**
 * Base object for layouts
 */
import EventEmitter from 'eventemitter3'
import Config from './config'

export default class Layout extends EventEmitter {
  constructor (p) {
    super()
    this.nodes = []
    // array of nodes coordinates (correspondence by index)
    this.coords = []
    this.enabled = false
    this.p = p
  }

  set p (obj = {}) {
    const p = _.clone(obj)
    _.defaultsDeep(p, this.constructor.defaults)
    this._p = new Config(p, this.run.bind(this))
    if (this.enabled) this.run()
  }

  get p () { return this._p }
  /**
   *
   */
  // TODO or calculate inside with d3?
  update (enter, update, exit) {
    this.enabled = true
    this.nodes = enter
  }
  /**
   * override in concrete class
   * Multi-stage layouts may emit 'tick' event for intermediate view updates
   */
  run (nodes) {
    if (_.isEmpty(this.coords)) return
    this.emit('end')
    console.log('run')
  }
  /**
   * @param id
   */
  fix (id) {
  }
  /**
   * @param id
   */
  move (id, delta) {
    const coord = this.coords[id]
    coord.px = coord.x
    coord.py = coord.y
    coord.x += delta.x
    coord.y += delta.y
  }
}
