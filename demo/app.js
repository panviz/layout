import * as d3Selection from 'd3-selection'
import * as d3Csv from 'd3-dsv'
import * as d3Transition from 'd3-transition'
import * as d3Ease from 'd3-ease'

import Grid from '../src/grid'
import Force from '../src/force'
import Radial from '../src/radial'

import rawData from './data.csv'

import './template/node.scss'
import './template/row.scss'
import './template/tile.scss'
import './template/circle.scss'
import layoutSets from './layouts.json'

class App {
  constructor () {
    this.container = d3Selection.select('#container')
    this.data = d3Csv.csvParse(rawData)
    this.templates = ['row', 'tile', 'circle']

    const Layouts = [Grid, Radial, Force]

    this.layouts = _.map(Layouts, (L) => {
      const instance = new L()
      if (instance.constructor.name === 'Force') {
        const data = this.prepereDataForForceLayout()
        instance.update(data)
      } else {
        instance.update(this.data)
      }
      return instance
    })

    this.renderControls()
    this.changeTemplate('circle')
    this.changeLayout(layoutSets.list)

    $(window).on('resize', this.resize.bind(this))
  }

  resize () {
    this.layout.p.width = this.container.node().getBoundingClientRect().width
  }
  renderControls () {
    d3Selection.select('.layout').selectAll('button')
      .data(_.values(layoutSets))
      .enter()
      .append('button')
      .html(d => d.name)
      .on('click', this.changeLayout.bind(this))
    d3Selection.select('.template').selectAll('button')
      .data(this.templates)
      .enter()
      .append('button')
      .html(d => d)
      .on('click', this.changeTemplate.bind(this))
  }

  render () {
    this.nodes = this.container.selectAll('.node').data(this.data, d => d.id)
    this.nodes.enter()
      .append('div')
      .style('background', d => d.id)
      .html(d => d.id)
      .merge(this.nodes)
      .attr('class', 'node')
      .classed(this.template, true)
  }

  updatePosition () {
    const coords = this.layout.coords
    const nodes = $('.node')

    if (this.container.selectAll('svg').nodes().length && this.layout.constructor.name !== 'Force') {
      this.container.selectAll('svg').remove()
    }

    if (this.layout.constructor.name === 'Force') {
      let svg = this.container.select('svg')
      if (!svg.nodes().length) {
        svg = this._initialize()
      }
      this._updateLinePosition(svg)
    }
    _.each(nodes, (node, i) => {
      const coord = coords[i]
      $(node).css({ transform: `translate(${coord.x}px, ${coord.y}px)` })
    })
  }

  _initialize () {
    const startLinksPosition = this._calcStartLinksPosition()
    const svg = this.container.append('svg')
      .attr('width', this.container.node().getBoundingClientRect().width)
      .attr('height', document.documentElement.clientHeight)

    svg.selectAll('line')
      .data(startLinksPosition)
      .enter()
      .append('line')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('stroke-width', 1)
      .attr('stroke', 'black')

    return svg
  }

  _updateLinePosition (svg) {
    const linksCoords = this.layout.linksCoords
    const transition = d3Transition.transition

    svg.selectAll('line')
      .data(linksCoords)
      .transition()
      .ease(d3Ease.easeLinear)
      .duration(750)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
  }
  _calcStartLinksPosition () {
    const coords = []
    let items = d3Selection.selectAll('.node')
    const links = this.layout.nodes.edges
    _.each(links, (link, i) => {
      let source = items.nodes()[link.source.index].style.transform.slice(10, -1)
      let target = items.nodes()[link.target.index].style.transform.slice(10, -1)
      source = source.split(',')
      target = target.split(',')
      coords[i] = {
        x1: parseFloat(source[0]),
        y1: parseFloat(source[1]),
        x2: parseFloat(target[0]),
        y2: parseFloat(target[1]) }
    })
    return coords
  }

  changeLayout (d) {
    if (this.layout) this.layout.off('end')
    this.layout = this.layouts.find(l => l.constructor.name === d.type)
    this.layout.on('end', this.updatePosition.bind(this))
    const layoutSet = _.extend({
      width: this.container.node().getBoundingClientRect().width,
      height: document.documentElement.clientHeight,
    }, d.config)

    this.layout.p = layoutSet
  }

  changeTemplate (template) {
    this.template = template
    this.render()
  }

  prepereDataForForceLayout () {
    const _data = _.cloneDeep(this.data)
    const source = {}
    const links = []
    _.each(_data, (node, i) => {
      if (node.id === node.group) {
        source[node.group] = i
        delete _data[i]
      }
    })
    _.each(_data, (node, i) => {
      if (node) {
        const sourceIndex = source[node.group]
        const targetIndex = i
        links.push({ source: sourceIndex, target: targetIndex })
      }
    })

    return { items: this.data, edges: links }
  }
}
new App() // eslint-disable-line
