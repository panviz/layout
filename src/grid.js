/**
 * Grid view
 * Nodes are considered as rectangles
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
  }

  /**
  * Algorythm
  */
  run () {
    if (_.isEmpty(this.nodes)) return
    const coords = this.coords
    const cellWidth = this.p.cell.width || 0
    const cellHeight = this.p.cell.height

    const columns = this.p.name === 'List' ? 1 : this._calculateColumns()
    let column = 0
    let line = 0

    _.each(this.nodes, (node, i) => {
      if (column === columns) {
        column = 0
        line++
      }
      const x = column * cellWidth
      const y = line * cellHeight
      column++
      coords[i] = { x, y }
    })

    super.run()
  }

  _calculateColumns () {
    return Math.floor(this.p.width / this.p.cell.width)
  }
}
