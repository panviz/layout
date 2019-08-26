import * as d3Selection from 'd3-selection'
import * as d3Csv from 'd3-dsv'
import * as d3Transition from 'd3-transition' // eslint-disable-line

import Grid from '../src/grid'
import Force from '../src/force'
import Radial from '../src/radial'

import rawData from './data.csv'
import Settings from './settings'

import * as FRHelper from './modules/force'

import './template/node.scss'
import './template/row.scss'
import './template/tile.scss'
import './template/circle.scss'
import './style/switcher.scss'
import './style/app.scss'

import layoutSets from './layouts.json'

class App {
  constructor () {
    this.container = d3Selection.select('#container')
    this.fullData = d3Csv.csvParse(rawData)
    this.data = _.slice(this.fullData, 0, 63)
    this.templates = ['row', 'tile', 'circle']
    const Layouts = [Grid, Radial, Force]
    this.layouts = _.map(Layouts, (Layout) => {
      const instance = new Layout()
      let links
      if (instance.name === 'Force') links = FRHelper.prepareLinks(this.data)
      instance.update(this.data, links)
      return instance
    })

    this.renderControls()
    this.initSlider()
    this.containerWidth = this.container.node().getBoundingClientRect().width
    this.containerHeight = document.documentElement.clientHeight - this.container.node().offsetTop
    this.setting = new Settings({ width: this.containerWidth, height: this.containerHeight })

    this.changeTemplate('circle')
    this.changeLayout(layoutSets.table)

    this.setting.on('change', this.changeConfig.bind(this))
    $(window).on('resize', this._onResize.bind(this))
  }

  renderControls () {
    d3Selection.select('.layout').selectAll('button')
      .data(_.values(layoutSets))
      .enter()
      .append('button')
      .html(d => d.name)
      .attr('class', d => d.name)
      .on('click', this.changeLayout.bind(this))

    d3Selection.select('.template').selectAll('button')
      .data(this.templates)
      .enter()
      .append('button')
      .html(d => d)
      .attr('class', d => d)
      .on('click', this.changeTemplate.bind(this))
  }

  initSlider () {
    const maxLength = this.fullData.length
    const value = this.data.length
    d3Selection.select('.slider')
      .append('h5')
      .html(`limit data array length ${value}`)

    d3Selection.select('.slider')
      .append('input')
      .attr('id', 'limit')
      .attr('type', 'range')
      .attr('min', 1)
      .attr('max', maxLength)
      .attr('step', 1)
      .attr('value', value)
      .on('input', this.changeData.bind(this))
  }

  changeTemplate (template) {
    d3Selection.selectAll('.template button')
      .classed('active', false)
    d3Selection.select(`.${template}`)
      .classed('active', true)

    this.template = template
    this.render()
  }

  changeLayout (d) {
    let prevLayout

    if (this.layout) {
      this.layout.off('end')
      prevLayout = this.layout
    }

    this.layout = this.layouts.find(layout => layout.constructor.name === d.type)
    this.layout.on('end', this.updatePosition.bind(this))

    d3Selection.selectAll('.layout button').classed('active', false)
    d3Selection.select(`.${d.name}`).classed('active', true)

    let layoutSet = _.extend({}, d.config, { name: d.name })

    this.setting.updateControllers(d.config)

    // use previous coordinates to start Force layout for more predictable nodes position
    if (this.layout.name === 'Force') {
      let coords
      if (!prevLayout) coords = this._getInitialCoords()
      else coords = App.getNodesCoords()

      FRHelper.nodeInitPosition(this.layout.nodes, coords)
      layoutSet = _.extend({
        width: this.containerWidth,
        height: this.containerHeight,
      }, layoutSet)
    }
    this.layout.p = layoutSet
  }

  _getInitialCoords () {
    const length = d3Selection.selectAll('.node').nodes().length
    return _.map(_.range(length), () => ({
      x: this.containerWidth * Math.random(),
      y: this.containerHeight * Math.random(),
    }))
  }

  updatePosition () {
    const coords = this.layout.coords
    const nodes = $('.node')

    if (this.container.selectAll('svg').nodes().length && this.layout.name !== 'Force') {
      this.container.selectAll('svg').remove()
    }

    if (this.layout.name === 'Force') {
      const line = this.container.selectAll('line')
      if (line !== this.layout.links.length) {

        this.svg = d3Selection.select('svg')
        if (!this.svg.nodes().length) {
          this.svg = this.container.append('svg')
            .attr('width', this.containerWidth)
            .attr('height', this.containerHeight)
        }
        FRHelper.initializeLines(this.svg, this.layout)
      }
      FRHelper.updateLines(this.svg, this.layout)

      const nodeRect = d3Selection.select('.node').node().getBoundingClientRect()
      const nodeWidth = nodeRect.width
      const nodeHeight = nodeRect.height

      _.each(nodes, (node, i) => {
        const coord = coords[i]
        $(node).css({ transform: `translate(${coord.x - (nodeWidth / 2)}px, ${coord.y - (nodeHeight / 2)}px)` })
      })
    } else {
      _.each(nodes, (node, i) => {
        const coord = coords[i]
        $(node).css({ transform: `translate(${coord.x}px, ${coord.y}px)` })
      })
    }
  }

  static getNodesCoords () {
    const coords = []
    const nodes = d3Selection.selectAll('.node')
    _.each(nodes.nodes(), (node, i) => {
      const position = node.style.transform.slice(10, -1).split(',')
      coords[i] = { x: parseFloat(position[0]), y: parseFloat(position[1]) }
    })
    return coords
  }

  render () {
    const nodes = this.container.selectAll('.node').data(this.data, d => d.id)

    nodes.attr('class', 'node').classed(this.template, true)

    nodes.enter()
      .append('div')
      .style('background', d => d.id)
      .style('transform', 'translate(0px, 0px)')
      .attr('class', 'node')
      .classed(this.template, true)
      .append('div')
      .html(d => d.id)

    nodes.exit().remove()
  }

  changeData () {
    const limit = d3Selection.select('#limit').nodes()[0].value
    this.data = _.slice(this.fullData, 0, limit)

    _.each(this.layouts, (layout) => {
      let links
      if (layout.name === 'Force') links = FRHelper.prepareLinks(this.data)
      layout.update(this.data, links)
    })
    this.render()
    this.layout.run()

    d3Selection.select('.slider h5')
      .html(`limit data array length ${limit}`)
  }

  changeConfig (property, path, value) {
    if (property === 'startRadian') {
      value *= (Math.PI / 180)
    }
    _.set(this.layout.p, `${path}${property}`, value)
  }

  _onResize () {
    this.layout.p.width = this.container.node().getBoundingClientRect().width
  }
}
new App() // eslint-disable-line
