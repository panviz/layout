/**
 * Force view
 * Nodes are considered as rectangles
 */
import Layout from './layout'
import * as d3Force from 'd3-force'

import * as d3Selection from 'd3-selection'
/**
 * @param {Object || Number} p.spacing horizontal and vertical distance between nodes
 * @param Point p.offset {x,y} coordinates where to place first node
 * @param Object p.node {width, height} of node (add to spacing when calculating next node position)
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

    d3Force.forceSimulation(this.nodes.items)
      .force('link', d3Force.forceLink(this.nodes.edges).distance(40))
      .force('charge', d3Force.forceManyBody().strength(-40))
      .force('collide', d3Force.forceCollide(15).strength(1))
      .force('center', d3Force.forceCenter(this.p.width / 2, this.p.height / 2))
      .alphaMin(0.5)
      //.on('end', this._end.bind(this))
      .on('tick', this._end.bind(this))
  }

  _end () {
    const coords = this.coords
    const linksCoords = this.linksCoords

    _.each(this.nodes.items, (node, i) => {
      const x = node.x
      const y = node.y
      coords[i] = { x, y }
    })

    _.each(this.nodes.edges, (edge, i) => {
      linksCoords[i] = { x1: edge.source.x + (this.p.node.width / 2),
        y1: edge.source.y + (this.p.node.height / 2),
        x2: edge.target.x + (this.p.node.width / 2),
        y2: edge.target.y + (this.p.node.height / 2) }
    })

    super.run()
  }

}
