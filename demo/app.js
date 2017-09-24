import * as d3Selection from 'd3-selection'
import * as d3Csv from 'd3-dsv'

import Grid from '../src/grid'
import Force from '../src/force'
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
    const Layouts = [Grid, Force]

    this.layouts = _.map(Layouts, (L) => {
      const instance = new L()
      if (instance.constructor.name === 'Force') {
        const data = this.prepereDataForForceLayout(this.data)
        instance.update(data)
      } else {
        instance.update(this.data)
      }
      return instance
    })

    this.renderControls()
    this.changeTemplate('row')
    this.changeLayout(layoutSets.list)
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

    this.layout.p = layoutSet
  }

  changeTemplate (template) {
    this.template = template
    this.render()
  }

  prepereDataForForceLayout (data) {
    let _data = _.cloneDeep(data)
    const source = {}
    const target = []
    const links = []
    _.each(_data, (node, i) => {
      if(node.id === node.group){
        source[node.group] = i
        delete _data[i]
      }
    })

    _.each(_data, (node, i) => {
        if(node){
          const sourceIndex = source[node.group]
          const targetIndex = i
          links.push({source: sourceIndex, target: targetIndex})
        }
    })

/*    return { items: [
      { id: 'Pink', group: 'Pink' },
      { id: 'LightPink', group: 'Pink' },
      { id: 'HotPink', group: 'Pink' },
      { id: 'Purple', group: 'Purple' },
      { id: 'Magenta', group: 'Purple' },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 3, target: 4 },
    ] }*/


    return { items: data, edges: links}
  }
}
new App() // eslint-disable-line
