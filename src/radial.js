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
    const coords = this.coords
    const center = this.p.center
    let spacing = this.p.spacing
    let radius = this.p.radius
    let startRadian = this.p.startRadian
    let alpha = 0

    if (!radius) {
      if (!spacing) this._getDefaultPosition()
      alpha = (360 / this.nodes.length) * (Math.PI / 180)
      radius = spacing / alpha
    } else if (!spacing) {
      if (!radius) this._getDefaultPosition()
      alpha = (360 / this.nodes.length) * (Math.PI / 180)
      spacing = alpha * radius
    } else {
      alpha = spacing / radius
    }

    _.each(this.nodes, (node, i) => {
      const x = center.x + (radius * Math.cos(startRadian))
      const y = center.y + (radius * Math.sin(startRadian))
      startRadian += alpha
      coords[i] = { x, y }
    })

    super.run()
  }

  _getDefaultPosition () {
    _.each(this.nodes, (node, i) => {
      const x = this.p.center.x
      const y = this.p.center.y
      this.coords[i] = { x, y }
    })
    super.run()
  }
}
