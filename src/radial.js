/**
 * Radial view
 * Items are considered as rectangles
 */
import Layout from './layout'
/**
 *
 * @param Point p.center {x,y} coordinates center of circle
 * @param Number p.spacing arc distance between nodes start point
 * @param Number p.radius circle radius
 * @param Number p.startRadian initial angle in radians
 *
 */
export default class Radial extends Layout {
  constructor (p = {}) {
    super(p)
  }

  run () {
    if (_.isEmpty(this.nodes)) return
    const spacing = this.p.spacing
    let radius = this.p.radius
    let alpha = 0

    if (!radius) {
      if (!spacing) {
        this._getDefaultCoords()
      } else {
        alpha = (360 / this.nodes.length) * (Math.PI / 180)
        radius = spacing / alpha
        this._getCoords(alpha, radius)
      }
    } else if (!spacing) {
      if (!radius) {
        this._getDefaultPosition()
      } else {
        alpha = (360 / this.nodes.length) * (Math.PI / 180)
        this._getCoords(alpha, radius)
      }
    } else {
      alpha = spacing / radius
      this._getCoords(alpha, radius)
    }

    super.run()
  }

  _getCoords (alpha, radius) {
    const coords = this.coords
    const center = this.p.center
    let startRadian = this.p.startRadian
    _.each(this.nodes, (node, i) => {
      const x = center.x + (radius * Math.cos(startRadian))
      const y = center.y + (radius * Math.sin(startRadian))
      startRadian += alpha
      coords[i] = { x, y }
    })
  }

  _getDefaultCoords () {
    _.each(this.nodes, (node, i) => {
      const x = this.p.center.x
      const y = this.p.center.y
      this.coords[i] = { x, y }
    })
  }
}
