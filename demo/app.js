import * as d3Selection from 'd3-selection'
import * as d3Csv from 'd3-dsv'
import * as d3Transition from 'd3-transition' // eslint-disable-line
import * as d3Ease from 'd3-ease'

import Grid from '../src/grid'
import Force from '../src/force'
import Radial from '../src/radial'

import rawData from './data.csv'

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
      if (instance.name === 'Force') {
        const links = this.prepereLinksForForceLayout()
        instance.update(this.data)
        instance.links = links
      } else {
        instance.update(this.data)
      }
      return instance
    })

    this.renderControls()
    this.initSlider()
    this.containerWidth = this.container.node().getBoundingClientRect().width
    this.containerHeight = document.documentElement.clientHeight - this.container.node().offsetTop

    this.changeTemplate('circle')
    this.changeLayout(layoutSets.grid)

    $(window).on('resize', this.onResize.bind(this))
  }

  prepereLinksForForceLayout () {
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
        if (sourceIndex !== undefined) {
          links.push({ source: sourceIndex, target: i })
        }
      }
    })

    return links
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

    d3Selection.selectAll('.layout button')
      .classed('active', false)
    d3Selection.select(`.${d.name}`)
      .classed('active', true)

    let layoutSet = _.extend({}, d.config)

    this._renderSettingControls(d)

    if (this.layout.name === 'Force') {
      if (!prevLayout || prevLayout.name !== 'Force') {
        const coords = this._getCenterCoords()
        this.nodeInitPosition(coords)
      } else {
        const coords = App.getNodePosition()
        this.nodeInitPosition(coords)
      }
      layoutSet = _.extend({
        width: this.containerWidth,
        height: this.containerHeight,
      }, layoutSet)
    }
    this.layout.p = layoutSet
  }

  _getCenterCoords () {
    const length = d3Selection.selectAll('.node').nodes().length
    return _.fill(Array(length), { x: this.containerWidth / 2, y: this.containerHeight / 2 })
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
        this._initializeLine()
      }
      this._updateLinePosition()

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

  _renderSettingControls (settings) {
    if (d3Selection.select('#config').nodes().length) {
      d3Selection.select('#config').remove()
    }

    const container = d3Selection.select('.switcher')
      .append('div')
      .attr('id', 'config')
      .append('h5')
      .html(settings.name)
    if (settings.name === 'Grid') {
      container.append('p').html('width option priority by height')
    }
    if (settings.name === 'Table') {
      container.append('p').html('columns option priority rows')
    }

    const config = settings.config
    container.on('input', this.changeConfig.bind(this))

    _.each(config, (value, key) => {
      if (_.isObject(value)) {
        this.controlContainer = container.append('div')
        this._renderLabelControl(key)
        const pControlContainer = this.controlContainer
        _.each(value, (subValue, subKey) => {
          this.controlContainer = pControlContainer.append('div')
          this._renderLabelControl(subKey)
          this._renderSettingControl(`${key}.${subKey}`, subValue)
        })
      } else {
        if (this.layout.name === 'Grid') {
          if ((!config.width || !config.height) && (config.columns === 1 || config.rows === 1)) {
            if (key === 'columns' || key === 'rows') return
          }
        }

        this.controlContainer = container.append('div')
        this._renderLabelControl(key)
        this._renderSettingControl(key, value, config)
      }
    })
  }

  nodeInitPosition (coords) {
    if (coords.length !== this.layout.nodes.length) return
    _.each(this.layout.nodes, (node, i) => {
      node.x = coords[i].x
      node.y = coords[i].y
    })
  }

  static getNodePosition () {
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

  onResize () {
    this.layout.p.width = this.container.node().getBoundingClientRect().width
  }

  changeData () {
    const limit = d3Selection.select('#limit').nodes()[0].value
    this.data = _.slice(this.fullData, 0, limit)

    _.each(this.layouts, (layout) => {
      if (layout.name === 'Force') {
        const links = this.prepereLinksForForceLayout()
        layout.update(this.data)
        layout.links = links
      } else {
        layout.update(this.data)
      }
    })
    this.render()
    this.layout.run()

    d3Selection.select('.slider h5')
      .html(`limit data array length ${limit}`)
  }

  _initializeLine () {
    const startLinksPosition = this._calcStartLinksPosition()
    this.svg = d3Selection.select('svg')
    if (!this.svg.nodes().length) {
      this.svg = this.container.append('svg')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
    }

    this.svg.selectAll('line')
      .data(startLinksPosition)
      .enter()
      .append('line')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
  }

  _updateLinePosition () {
    const edgesCoords = this.layout.edgesCoords

    const line = this.svg.selectAll('line')
      .data(edgesCoords)

    line.transition()
      .ease(d3Ease.easeLinear)
      .duration(750)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)

    line.enter()
      .append('line')
      .transition()
      .ease(d3Ease.easeLinear)
      .duration(750)
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)

    line.exit()
      .remove()
  }

  _calcStartLinksPosition () {
    const coords = []
    const items = d3Selection.selectAll('.node')
    const links = this.layout.links
    _.each(links, (link, i) => {
      let source = items.nodes()[link.source.index].style.transform.slice(10, -1)
      let target = items.nodes()[link.target.index].style.transform.slice(10, -1)
      source = source.split(',')
      target = target.split(',')
      coords[i] = {
        x1: parseFloat(source[0]),
        y1: parseFloat(source[1]),
        x2: parseFloat(target[0]),
        y2: parseFloat(target[1]),
      }
    })
    return coords
  }

  changeConfig () {
    const key = event.target.dataset.key.split('.') // eslint-disable-line
    let value = +event.target.value // eslint-disable-line

    switch (key[0]) {
    case 'startRadian':
      value *= (Math.PI / 180)
      break
    default:
    }

    if (key[1]) {
      this.layout.p[key[0]][key[1]] = value
    } else {
      this.layout.p[key[0]] = value
    }
  }

  _renderSettingControl (key, value, config = {}) {
    const type = App._getControlType(key)
    const input = this.controlContainer.append('input')
      .attr('type', type)
      .attr('data-key', key)
      .attr('value', value)
      .attr('step', 1)
      .attr('min', 0)

    switch (key) {
    case 'startRadian':
      input.attr('max', 360)
      break
    case 'center.x':
      input.attr('max', this.containerWidth)
      break
    case 'center.y':
      input.attr('max', this.containerHeight)
      break
    case 'columns':
    case 'rows':
      if ((!config.width || !config.height) && (config.columns > 1 || config.rows > 1)) {
        input.attr('min', 2)
      }
      break
    default:
    }
  }

  static _getControlType (key) {
    switch (key) {
    case 'startRadian':
    case 'center.x':
    case 'center.y':
      return 'range'
    default:
      return 'number'
    }
  }

  _renderLabelControl (key) {
    let label
    switch (key) {
    case 'startRadian':
      label = 'start degree'
      break
    default:
      label = key
    }

    this.controlContainer.append('label')
      .html(label)
  }
}
new App() // eslint-disable-line
