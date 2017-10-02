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
    const spacing = this.p.spacing
    const radius = this.p.radius
    let startRadian = this.p.startRadian
    const alpha = spacing / radius

    _.each(this.nodes, (node, i) => {
      const x = center.x + (radius * Math.cos(startRadian))
      const y = center.y + (radius * Math.sin(startRadian))
      startRadian += alpha


      coords[i] = { x, y }
    })

    super.run()
  }
}
