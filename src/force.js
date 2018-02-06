/**
 * Force view
 * Nodes are considered as rectangles
 */
import * as d3Force from 'd3-force'
import * as d3Quadtree from 'd3-quadtree'
import Layout from './layout'

/**
 * @param Number p.distance link force distance
 */
export default class Force extends Layout {
  constructor (p = {}) {
    super(p)
    this.edges = []
    this.coords = []
    this.edgesCoords = []
  }

  set links (value) {
    this.edges = value
  }

  get links () {
    return this.edges
  }

  update (nodes, links) {
    super.update(nodes)
    this.links = links
  }
  /**
   * Algorythm
   */
  run () {
    if (_.isEmpty(this.nodes)) return

    this._simulation = d3Force.forceSimulation(this.nodes)
      .force('link', d3Force.forceLink(this.links).distance(this.p.distance))
      .force('charge', d3Force.forceManyBody().strength(-40))
      .force('forceX', d3Force.forceX(this.p.width / 2).strength(0.02))
      .force('forceY', d3Force.forceY(this.p.height / 2).strength(0.02))

      .force('collide', this.collide.bind(this))
      // makes nodes loitering around too much
      // .force('collide', d3Force.forceCollide(25).strength(4))
      // this force cannot hold nodes in the viewport
      // .force('center', d3Force.forceCenter(this.p.width / 2, this.p.height / 2))

      .alphaMin(0.3)
      .on('end', this._getCoords.bind(this))
  }

  _getCoords () {
    const coords = []
    const edgesCoords = []

    _.each(this.nodes, (node, i) => {
      const x = node.x
      const y = node.y
      coords[i] = { x, y }
    })

    _.each(this.links, (edge, i) => {
      edgesCoords[i] = {
        x1: edge.source.x,
        y1: edge.source.y,
        x2: edge.target.x,
        y2: edge.target.y,
      }
    })
    this.coords = coords
    this.edgesCoords = edgesCoords
    super.run()
  }

  collide (alpha) {
    const padding = 15 // separation between same-color circles
    const clusterPadding = 6 // separation between different-color circles
    const maxRadius = 12
    const quadtree = d3Quadtree.quadtree()
      .x(d => d.x)
      .y(d => d.y)
      .addAll(this.nodes)

    this.nodes.forEach((d) => {
      let r = d.r + maxRadius + Math.max(padding, clusterPadding)
      const nx1 = d.x - r
      const nx2 = d.x + r
      const ny1 = d.y - r
      const ny2 = d.y + r

      quadtree.visit((quad, x1, y1, x2, y2) => {
        if (quad.data && (quad.data !== d)) {
          let x = d.x - quad.data.x
          let y = d.y - quad.data.y
          let l = Math.sqrt(x * x + y * y)
          r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding)
          if (l < r) {
            l = (l - r) / l * alpha
            x *= l
            y *= l
            d.x -= x
            d.y -= y
            quad.data.x += x
            quad.data.y += y
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1
      })
    })
  }
}
