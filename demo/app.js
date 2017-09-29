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

    this._renderSettingControls(d)
    this.layout.p = layoutSet
  }

  changeTemplate (template) {
    this.template = template
    this.render()
  }

  _renderSettingControls (settings) {
    if(d3Selection.select('#config').nodes().length)
      d3Selection.select('#config').remove()

    d3Selection.select('.switcher')
      .append('div')
      .attr('id', 'config')
      .append('h5')
      .html(settings.name)

    const config = settings.config
    const container = d3Selection.select('#config')
    container.on('change', this.changeConfig.bind(this))

    _.each(config, (value, key) => {
      if(_.isObject(value)){
        const control = container.append('div')
        this._renderLabelControl(control, key)
        _.each(value, (sub_value, sub_key) => {
          const sub_control = control.append('div')
          this._renderLabelControl(sub_control, sub_key)
          this._renderSettingControl (sub_control, `${key}.${sub_key}`, sub_value)
        })
      } else {
        const control = container.append('div')
        this._renderLabelControl(control, key)
        this._renderSettingControl (control, key, value)
      }
    })

  }

  changeConfig () {
    const key = event.target.dataset.key.split('.')
    const value = event.target.value
    if(key[1]) {
      this.layout.p[key[0]][key[1]] = value
    } else {
      this.layout.p[key[0]] = value
    }

    console.log('change config')
  }

  _renderSettingControl (control, key, value) {
    control.append('input')
      .attr('type', 'number')
      .attr('min', 0)
      .attr('value', value)
      .attr('data-key', key)
  }

  _renderLabelControl(control, key) {
    control.append('label')
      .html(key)
  }
}
new App() // eslint-disable-line
