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
  }
  /**
   * Algorythm
   */
  run () {
    if (_.isEmpty(this.nodes)) return

    let simulation = d3Force.forceSimulation(this.nodes.items)
      .force('link', d3Force.forceLink(this.nodes.edges).distance(60))
      .force("charge", d3Force.forceManyBody().strength(-10))
      .force("center", d3Force.forceCenter(700, 500))
      .on('end', this._end.bind(this))
  }

  _end() {
    console.log(this.nodes)
    const coords = this.coords
    _.each(this.nodes.items, (node, i) => {
      const x = node.x
      const y = node.y
      coords[i] = { x, y }
    })

    super.run()
  }

}
