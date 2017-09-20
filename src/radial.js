/**
 * Radial view
 * Items are considered as rectangles
 */
import Layout from './layout'
/**
 *
 * @param Point p.center {x,y} coordinates center of circle
 * @param Object p.node {width, height} of node (add to spacing when calculating next node position)
 * @param Number p.spacing arc distance between nodes center
 * @param Number p.radius circle radius
 * @param Number p.startRadian initial angle in radians
 *
 */
export default class Radial extends Layout {
  constructor (p = {}) {
    super(p)
    this._name = 'Grid'
  }

  set spacing (value) {
    this.p.spacing = value
  }

  run () {
    if (_.isEmpty(this.nodes)) return
    const coords = this.coords
    const center = this.p.center
    const nodeSize = this.p.node
    const spacing = this.p.spacing
    const radius = this.p.radius
    let startRadian = this.p.startRadian
    const alpha = spacing / radius

    _.each(this.nodes, (node, i) => {
      let x = center.x + (radius * Math.cos(startRadian))
      let y = center.y + (radius * Math.sin(startRadian))
      startRadian += alpha
      x -= nodeSize.width / 2
      y -= nodeSize.height / 2

      coords[i] = { x, y }
    })

    super.run()
  }
}
