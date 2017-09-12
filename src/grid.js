/**
 * Grid view
 * Items are considered as rectangles
 */
import Layout from './layout'
/**
 * @param {Object || Number} p.spacing horizontal and vertical distance between nodes
 * @param Point p.offset {x,y} coordinates where to place first node
 * @param Object p.node {width, height} of node (add to spacing when calculating next node position)
 */
export default class Grid extends Layout {
  constructor (p = {}) {
    super(p)
    this._name = 'Grid'
  }

  static get defaults () {
    return {
      width: 200,
      // height: unlimited by default,
      spacing: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      node: { width: 10, height: 10 },
      // columns: depends on available width and node size,
      // rows: unlimited by default,
    }
  }
  // TODO extend Config with this method
  set spacing (value) {
    this.p.spacing = _.isPlainObject(value) ? value : { x: value, y: value }
  }

  run () {
    if (_.isEmpty(this.nodes)) return
    const offset = this.p.offset
    const nodeSize = this.p.node
    const spacing = this.p.spacing
    const coords = this.coords

    // fill all available width with nodes
    const columns = this.p.columns || this.availableWidth
    let line = 0
    let column = 0

    _.each(this.nodes, (node, i) => {
      const x = offset.x + ((nodeSize.width + spacing.x) * column)
      column += 1
      const y = offset.y + ((nodeSize.height + spacing.y) * line)
      if (column >= columns || x + nodeSize.width + spacing.x > offset.x + this.p.width) {
        line += 1; column = 0
      }
      coords[i] = { x, y }
    })

    super.run()
  }

  get availableWidth () {
    return Math.floor((this.p.width - this.p.offset.x) / (this.p.node.width + this.p.spacing.x))
  }
}
