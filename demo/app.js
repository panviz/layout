import * as d3Selection from 'd3-selection'
import * as d3Csv from 'd3-dsv'

import Grid from '../src/grid'
import Radial from '../src/radial'
import rawData from './data.csv'

import './template/node.scss'
import './template/row.scss'
import './template/tile.scss'
import './template/circle.scss'
import './style/switcher.scss'


import layoutSets from './layouts.json'

class App {
  constructor () {
    this.container = d3Selection.select('#container')
    this.data = d3Csv.csvParse(rawData)
    this.templates = ['row', 'tile', 'circle']
    const Layouts = [Grid, Radial]

    this.layouts = _.map(Layouts, (L) => {
      const instance = new L()
      instance.update(this.data)
      return instance
    })

    this.renderControls()
    this.changeTemplate('row')
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
      .html(d => `Layout ${d.name}`)
      .attr('class', d => d.name)
      .on('click', this.changeLayout.bind(this))
    d3Selection.select('.template').selectAll('button')
      .data(this.templates)
      .enter()
      .append('button')
      .html(d => `Template ${d}`)
      .attr('class', d => d)
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
    _.each(nodes, (node, i) => {
      const coord = coords[i]
      $(node).css({ transform: `translate(${coord.x}px, ${coord.y}px)` })
    })
  }

  changeLayout (d) {
    if (this.layout) this.layout.off('end')
    this.layout = this.layouts.find(l => l.constructor.name === d.type)
    this.layout.on('end', this.updatePosition.bind(this))
    d3Selection.selectAll('.layout button')
      .classed('active', false)
    d3Selection.select(`.${d.name}`)
      .classed('active', true)
    const layoutSet = _.extend({
      width: this.container.node().getBoundingClientRect().width,
    }, d.config)

    this.layout.p = layoutSet
  }

  changeTemplate (template) {
    d3Selection.selectAll('.template button')
      .classed('active', false)
    d3Selection.select(`.${template}`)
      .classed('active', true)
    this.template = template
    this.render()
  }
}
new App() // eslint-disable-line
