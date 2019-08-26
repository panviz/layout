import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'

export function prepareLinks (data) {
  const _data = _.cloneDeep(data)
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

export function nodeInitPosition (nodes, coords) {
  if (coords.length !== nodes.length) return
  _.each(nodes, (node, i) => {
    node.x = coords[i].x
    node.y = coords[i].y
  })
}

export function initializeLines (svg, layout) {
  const startLinksPosition = calcLinksStartPosition(layout)

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
}

export function updateLines (svg, layout) {
  const edgesCoords = layout.edgesCoords

  const line = svg.selectAll('line')
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

export function calcLinksStartPosition (layout) {
  const coords = []
  const items = d3Selection.selectAll('.node')
  const links = layout.links
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
