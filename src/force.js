/**
 * Force view
 * Nodes are considered as rectangles
 */
import * as d3Force from 'd3-force'
import Layout from './layout'

/**
 * @param Number p.distance link force distance
 */
export default class Force extends Layout {
  constructor (p = {}) {
    super(p)
    this.linksCoords = []
  }
  /**
   * Algorythm
   */
  run () {
    if (_.isEmpty(this.nodes)) return
    this._initPosition()

    d3Force.forceSimulation(this.nodes.items)
      .force('link', d3Force.forceLink(this.nodes.edges).distance(this.p.distance))
      .force('charge', d3Force.forceManyBody().strength(-3))
      .force('collide', d3Force.forceCollide(25).strength(4))
      .force('center', d3Force.forceCenter(this.p.width / 2, this.p.height / 2))
      .force('forceX', d3Force.forceX(this.p.width / 2).strength(0.03))
      .force('forceY', d3Force.forceY(this.p.height / 2).strength(0.03))
      .alphaMin(0.6)
      .on('end', this._getCoords.bind(this))
  }

  _getCoords () {
    const coords = this.coords
    const linksCoords = this.linksCoords

    _.each(this.nodes.items, (node, i) => {
      const x = node.x
      const y = node.y
      coords[i] = { x, y }
    })

    _.each(this.nodes.edges, (edge, i) => {
      linksCoords[i] = {
        x1: edge.source.x + (this.p.node.width / 2),
        y1: edge.source.y + (this.p.node.height / 2),
        x2: edge.target.x + (this.p.node.width / 2),
        y2: edge.target.y + (this.p.node.height / 2),
      }
    })

    super.run()
  }

  _initPosition () {
    const x = this.p.width / 2
    const y = this.p.height / 2
    _.each(this.nodes.items, (node, i) => {
      node.x = x
      node.y = y
    })
  }
}
