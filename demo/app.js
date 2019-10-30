import _ from 'lodash'
import $ from 'jquery'
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
    // changeable variables of application
    this.state = {}
    // Components rendering UI
    this.gui = {}
    this.container = d3Selection.select('#container')
    this._fullData = d3Csv.csvParse(rawData)
    this.state.dataLimit = 63
    this.state.data = _.slice(this._fullData, 0, this.state.dataLimit)
    this.templates = ['row', 'tile', 'circle']
    this.state.template = 'circle'
    this._templatesCompatibility = {
      Grid: ['tile', 'circle'],
      Table: ['circle', 'tile'],
      List: ['row', 'circle', 'tile'],
      Radial: ['circle'],
      Force: ['circle'],
    }
    const Layouts = [Grid, Radial, Force]
    this.layouts = _.map(Layouts, (Layout) => {
      const instance = new Layout()
      let links
      if (instance.name === 'Force') links = FRHelper.prepareLinks(this.state.data)
      instance.update(this.state.data, links)
      return instance
    })

    this.gui.settings = new Settings()
    this.changeLayout(layoutSets.table)

    this.gui.settings.on('change', this.changeConfig.bind(this))
    $(window).on('resize', this._onResize.bind(this))
    this.render()
    this.state.layout.run()
  }

  render () {
    this._renderControls()
    d3Selection.select('header > .description').html(this.state.layoutConfig.description)

    const nodes = this.container.selectAll('.node').data(this.state.data, d => d.id)
    nodes.enter()
      .append('div')
      .style('background', d => d.id)
      .style('transform', 'translate(0px, 0px)')
      .attr('class', 'node')
      .classed(this.state.template, true)
      .append('div')
      .html(d => d.id)
    nodes
      .attr('class', 'node')
      .classed(this.state.template, true)
      .style('width', d => (
        this.state.template === 'tile' ? `${this.state.layout.p.cell.width}px` : null
      ))
      .style('height', d => (
        this.state.template === 'tile' ? `${this.state.layout.p.cell.height}px` : null
      ))

    nodes.exit().remove()
  }

  changeTemplate (template) {
    this.state.template = template
  }

  changeLayout (d) {
    let prevLayout

    if (this.state.layout) {
      this.state.layout.off('end')
      prevLayout = this.state.layout
    }

    this.state.layoutConfig = d
    this.state.layout = this.layouts.find(layout => layout.name === d.type)
    this.state.layout.on('end', this.updatePosition.bind(this))

    let layoutSet = _.extend({}, d.config, { name: d.name })
    if (d.name === 'Radial') layoutSet.startRadian = d.config.startDegree * Math.PI / 180

    this._renderController()

    // use previous coordinates to start Force layout for more predictable nodes position
    if (this.state.layout.name === 'Force') {
      let coords
      if (!prevLayout) coords = this._getInitialCoords()
      else coords = App.getNodesCoords()

      FRHelper.nodeInitPosition(this.state.layout.nodes, coords)
      layoutSet = _.extend(this.getContainerSize(), layoutSet)
    }
    this.state.layout.p = layoutSet
    this._ensureCompatibleTemplate()
    this.render()
  }

  _getInitialCoords () {
    const length = d3Selection.selectAll('.node').nodes().length
    const containerSize = this.getContainerSize()
    return _.map(_.range(length), () => ({
      x: containerSize.width * Math.random(),
      y: containerSize.height * Math.random(),
    }))
  }

  updatePosition () {
    const coords = this.state.layout.coords
    const nodes = $('.node')

    if (this.container.selectAll('svg').nodes().length && this.state.layout.name !== 'Force') {
      this.container.selectAll('svg').remove()
    }

    if (this.state.layout.name === 'Force') {
      const line = this.container.selectAll('line')
      if (line !== this.state.layout.links.length) {
        this.svg = d3Selection.select('svg')
        if (!this.svg.nodes().length) {
          this.svg = this.container.append('svg')
            .attr('width', this.getContainerSize().width)
            .attr('height', this.getContainerSize().height)
        }
        FRHelper.initializeLines(this.svg, this.state.layout)
      }
      FRHelper.updateLines(this.svg, this.state.layout)

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

  _renderControls () {
    const layoutButtons = d3Selection.select('.layout').selectAll('button')
      .data(_.values(layoutSets))
    layoutButtons
      .enter()
      .append('button')
      .html(d => d.name)
      .attr('class', d => d.name)
      .on('click', this.changeLayout.bind(this))
      .merge(layoutButtons)
      .classed('active', d => d.name === this.state.layoutConfig.name)

    const templateButtons = d3Selection.select('.template').selectAll('button')
      .data(this.templates)

    templateButtons
      .enter()
      .append('button')
      .html(d => d)
      .attr('class', d => d)
      .on('click', this._onTemplateChange.bind(this))
      .merge(templateButtons)
      .classed('active', d => d === this.state.template)
      .attr('disabled', d => (
        _.includes(this._templatesCompatibility[this.state.layoutConfig.name], d) ? null : true
      ))
  }

  _renderController () {
    const config = _.extend({ 'items length': this.state.dataLimit }, this.state.layoutConfig.config)
    const options = _.extend({ 'items length': { max: this._fullData.length } }, this.state.layoutConfig.options)
    if (_.get(config, 'center.x')) {
      const { width, height } = this.getContainerSize()
      _.extend(options, {
        'center.x': { max: width },
        'center.y': { max: height },
      })
    }
    this.gui.settings.updateControls(config, options)
  }

  changeData (limit) {
    this.state.dataLimit = limit
    this.state.data = _.slice(this._fullData, 0, this.state.dataLimit)

    _.each(this.layouts, (layout) => {
      let links
      if (layout.name === 'Force') links = FRHelper.prepareLinks(this.state.data)
      layout.update(this.state.data, links)
    })
    this.render()
    this.state.layout.run()
  }

  changeConfig (path, property, value) {
    if (property === 'items length') return this.changeData(value)
    if (property === 'startDegree') {
      property = 'startRadian'
      value *= (Math.PI / 180)
    }
    _.set(this.state.layoutConfig.config, `${path}${property}`, value)
    _.set(this.state.layout.p, `${path}${property}`, value)
    this.render()
  }

  getContainerSize () {
    return {
      width: this.container.node().getBoundingClientRect().width,
      height: document.documentElement.clientHeight - this.container.node().offsetTop,
    }
  }

  _ensureCompatibleTemplate () {
    const compatibleTemplates = this._templatesCompatibility[this.state.layout.name]
    if (!_.includes(compatibleTemplates, this.state.template)) {
      this.changeTemplate(compatibleTemplates[0])
    }
  }

  // Handlers

  _onResize () {
    const size = this.getContainerSize()
    this.state.layout.p.width = size.width
    this.state.layout.p.height = size.height
    this._renderController()
  }

  _onTemplateChange (value) {
    this.changeTemplate(value)
    this.render()
  }
}
new App() // eslint-disable-line
