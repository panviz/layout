import * as d3Selection from 'd3-selection'
import * as d3Csv from 'd3-dsv'

import Grid from '../src/grid'
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
    this.fullData = d3Csv.csvParse(rawData)
    this.data = this.fullData
    this.templates = ['row', 'tile', 'circle']
    const Layouts = [Grid, Radial]

    this.layouts = _.map(Layouts, (L) => {
      const instance = new L()
      instance.update(this.data)
      return instance
    })

    this.renderControls()
    this.initSlider()
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
      .html(d => d.name)
      .on('click', this.changeLayout.bind(this))
    d3Selection.select('.template').selectAll('button')
      .data(this.templates)
      .enter()
      .append('button')
      .html(d => d)
      .on('click', this.changeTemplate.bind(this))
  }

  initSlider () {
    const maxLength = this.fullData.length
    d3Selection.select('.slider')
      .append('h5')
      .html(`limit data array length ${maxLength}`)

    d3Selection.select('.slider')
      .append('input')
      .attr('id', 'limit')
      .attr('type', 'range')
      .attr('min', 1)
      .attr('max', maxLength)
      .attr('step', 1)
      .attr('value', maxLength)
      .on('change', this.changeData.bind(this))
  }

  changeData () {
    const limit = d3Selection.select('#limit').nodes()[0].value
    this.data = _.slice(this.fullData, 0, limit)
    _.each(this.layouts, (layout) => {
      layout.update(this.data)
    })
    this.render()
    setTimeout(() => {
      this.updatePosition()
    })
    d3Selection.select('.slider h5')
      .html(`limit data array length ${limit}`)
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

    this.nodes.exit()
      .remove()
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
    const layoutSet = _.extend({
      width: this.container.node().getBoundingClientRect().width,
    }, d.config)

    this.layout.p = layoutSet
  }

  changeTemplate (template) {
    this.template = template
    this.render()
  }
}
new App() // eslint-disable-line
