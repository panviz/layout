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

  static get defaults () {
    return {
      offset: { x: 0, y: 0 },
    }
  }

  /**
  * Algorythm
  */
  run () {
    if (_.isEmpty(this.nodes)) return
    let columns
    let lines

    if (!this.p.width) {
      if ((!this.p.height && !this.p.columns) || this.p.columns === 0) {
        this._getDefaultCoords()
      } else if (this.p.columns) {
        lines = this.p.columns
        this._getCoords(lines)
      } else {
        lines = this._calculateLines()
        this._getCoords(lines, 'column')
      }
    } else if (!this.p.height) {
      if ((!this.p.width && !this.p.columns) || this.p.columns === 0) {
        this._getDefaultCoords()
      } else if (this.p.columns) {
        columns = this.p.columns
        this._getCoords(columns, 'column')
      } else {
        columns = this.p.columns || this._calculateColumns()
        this._getCoords(columns)
      }
    } else {
      columns = this.p.name === 'List' ? 1 : this._calculateColumns()
      this._getCoords(columns)
    }
    super.run()
  }

  _getCoords (count, draw = 'row') {
    const coords = this.coords
    const cellWidth = this.p.cell.width || this.p.cell.height || 0
    const cellHeight = this.p.cell.height || this.p.cell.width || 0
    const offset = this.p.offset
    let i = 0
    let j = 0

    if (draw === 'column') {
      _.each(this.nodes, (node, index) => {
        if (i === count) {
          i = 0
          j++
        }
        const x = (i * cellWidth) + offset.x
        const y = (j * cellHeight) + offset.y
        i++
        coords[index] = { x, y }
      })
    } else {
      _.each(this.nodes, (node, index) => {
        if (j === count) {
          j = 0
          i++
        }
        const x = (i * cellWidth) + offset.x
        const y = (j * cellHeight) + offset.y
        j++
        coords[index] = { x, y }
      })
    }
  }

  _getDefaultCoords () {
    _.each(this.nodes, (node, i) => {
      const x = this.p.offset.x || 0
      const y = this.p.offset.y || 0
      this.coords[i] = { x, y }
    })
  }
  _calculateColumns () {
    return Math.floor((this.p.width - this.p.offset.x) / this.p.cell.width)
  }

  _calculateLines () {
    console.log(Math.floor((this.p.height - this.p.offset.y) / this.p.cell.height))
    return Math.floor((this.p.height - this.p.offset.y) / this.p.cell.height)
  }
}
