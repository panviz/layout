var changeView = function(view){
  Grafiy.view = view
  Grafiy.update(Grafiy.items)
}
var request = function(tag){
  //d3.json("/test/data.json", function(json){
  //d3.json("http://da5f284b45e1.timedesk.org/UserLink/DmitraSearchUserTags/timedesk?tags=Video+game", function(json){
  d3.json("http://da5f284b45e1.timedesk.org/UserLink/DmitraGetTilesByTags/?tags="+tag, function(json){
    json.each(function(item){
      item.id = item.Id
      item.title = item.Title
      item.url = item.Url
      item.color = Colors[item.BgColorClassName]
      item.createdAt = item.DateCreation.substr(6,13)
    })
    Grafiy.update(json)
  })
}
Grafiy = function(){
  Grafiy.initialize = function(){
    Grafiy.width = 1280
    Grafiy.height = 720
    Grafiy.views = $w("Grid, Grid_small, Graph, List") 
    Grafiy.view = "Grid"
    Grafiy.vis = d3.select("#desktop").append("svg")
    .attr("width", Grafiy.width)
    .attr("height", Grafiy.height)
    Grafiy.coords = []
    Grafiy.selected = []
    Grafiy.links = []
    Grafiy.items = []
    Grafiy.chargeBase = -200;
    chargeK = -10;
    Grafiy.force = d3.layout.force()
      .charge(function(d){ return -200})
      .linkDistance(function(d){ return 150; })
      .size([Grafiy.width, Grafiy.height])
      .on("tick", Grafiy.tick)
  }
  Grafiy.drag = d3.behavior.drag()
    //.on("dragstart", _onDragstart)
    //.on("drag", _onDragmove)
    //.on("dragend", _onDragend);
  d3.select('#desktop')
    .on("click", _onClickBase)
  Grafiy.initialize()
}
Grafiy.update = function(json){
  Grafiy.force.stop()
  Grafiy.items = []
  Grafiy.initItems(json)

  placeGrid(Grafiy.items, {x: 50, y: 50, columns: 5, spacing: 15})
  Grafiy.drawItems(Grafiy.vis, Grafiy.items);

  if (Grafiy.view == "Grid_small"){
    placeGrid(Grafiy.items, {x: 50, y: 50, columns: 5, spacing: 5})
    Grafiy.drawItems(Grafiy.vis, Grafiy.items);
  }
}

Grafiy.initItems = function(items){
  items.each(function(item){
    item.name = item.title
    //item.fixed = item.fixed != undefined ? item.fixed : true
    //item.icon = '/0/'+(item.icon || item.name.replace(/\s/g ,'_'))+'.png'
    item.aspectRatio = 4/3
    item.width = 200
    item.height = item.width / item.aspectRatio
    item.radius = item.radius || 25
    item.iconSize = item.iconSize || {width: item.radius*2, height: item.radius*2}
    item.stroke = "#3182bd"
    item.fx = Grafiy.coords[item.id] ? Grafiy.coords[item.id].x : Math.random()*Grafiy.width
    item.fy = Grafiy.coords[item.id] ? Grafiy.coords[item.id].y : Math.random()*Grafiy.height
    Grafiy.items.push(item)
  })
  Grafiy.links = []
  Grafiy.items.each(function(item){
    if (item.links){
      item.links.split(', ').each(function(link){
        var target = Grafiy.items.find(function(node){return node.name == link})
        if (target) Grafiy.links.push({id: generateId(), source: item, target: target})
      })
    }
  })
}

Grafiy.drawItems = function(form, items){

  // Update the nodes…
  node = form.selectAll(".node")
    .data(items, function(d){ return d.id; })
  node.transition()
    .duration(1000)
    .attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; });

  // Enter any new nodes.
  g = node.enter().append("g")
    .attr("class", "node")
    .attr("id", function(d){ return 'item' + d.id })
    .on("click", _onClickNode)
    //.call(Grafiy.force.drag)
    .attr("width", function(d){ return d.width })
    .attr("height", function(d){ return d.height })

  // Exit any old nodes.
  node.exit()
    .transition()
      .duration(1000)
      .style("opacity", 1e-6)
    .remove()

  //transformation of tile form
  g.attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; });
  var tileForm = form.selectAll("rect")
    .transition()
    .duration(500)
    .attr("rx", function(d){ return Grafiy.view == "Graph" ? d.width/2 : 5})
    .attr("ry", function(d){ return Grafiy.view == "Graph" ? d.width/2 : 5})
    .attr("width", function(d){ return d.width })
    .attr("height", function(d){ return Grafiy.view == "Graph" ? d.width : d.height})

  g.append("rect")
    .attr("rx", function(d){ return Grafiy.view == "Graph" ? d.width/2 : 5})
    .attr("ry", function(d){ return Grafiy.view == "Graph" ? d.width/2 : 5})
    .attr("width", function(d){ return d.width })
    .attr("height", function(d){ return Grafiy.view == "Graph" ? d.width : d.height})
    //.style("stroke", function(d){ return d.stroke})
    .style("fill", function(d){return d.color})
    .style("fill-opacity", 0.9)
  g.append("image")
    .attr("xlink:href", function(d){ return d.icon})
    .attr("width", function(d){ return d.iconSize.width })
    .attr("height", function(d){ return d.iconSize.height })
  g.append('foreignObject')
    .attr("width", function(d){ return d.width })
    .attr("height", function(d){ return d.height })
    .append("xhtml:body")
    .html(function(d){ return '<div style="width: '+(d.width-16)+'px;">'+d.title+'</div>'})
    .attr("style", function(d){ return "font-size:"+ d.radius/2})

  g.transition()
    .duration(1000)
    .attr('opacity', 1)

}
Grafiy.tick = function(e){

  link.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  })

  node.attr("transform", function(d){
    d.x = Math.max(d.radius, Math.min(Grafiy.width - d.radius, d.x))
    d.y = Math.max(d.radius, Math.min(Grafiy.height - d.radius, d.y))
    //d.px = Math.max(d.radius, Math.min(Grafiy.width - d.radius, d.px))
    //d.py = Math.max(d.radius, Math.min(Grafiy.height - d.radius, d.py))
    return "translate(" + d.x + "," + d.y + ")";
  });
}

// Color leaf nodes orange, and packages white or blue.
Grafiy.color = function(d){
  return d._children ? "#3182bd" : d.children ?  "#f33" : "#33f";
}

Grafiy.arrowDefinition = function(){
  Grafiy.defs = Grafiy.vis.append("svg:defs")
  var arrowSizes = [16, 25, 30, 40]
  Grafiy.defs.append("svg:marker")
    .attr("id", 'type16')
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .attr("fill", "#707070")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
  Grafiy.defs.append("svg:marker")
    .attr("id", 'type25')
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 35)
    .attr("refY", -3)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .attr("fill", "#707070")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
}
function placeGrid(nodes, p){
  p = p || {}
  var offset = p.offset || {x:0, y:0}
  if (!p.spacing) p.spacing = 20
  var spacing = Object.isPlainObject(p.spacing) ? p.spacing : {x: p.spacing, y: p.spacing}
  offset.x = p.x || p.offset.x
  offset.y = p.y || p.offset.y
  var width = 1280 || p.width
  var columns = p.columns
  var rows = p.rows

  var n = nodes.length;
  var line = 0
  var column = 0
  nodes.each(function(node){
    node.x = node.px = offset.x + (node.width + spacing.x) * column
    column += 1
    node.y = node.py = offset.y + (node.height + spacing.y) * line
    if (column >= columns || node.x + node.width + spacing.x > offset.x + width){
      line +=1; column = 0
    }
  })
}
function _onClickNode(item){
  d3.event.stopPropagation()
  //TODO if item not selectable return
  item.selected = !item.selected
  Grafiy.selected = Grafiy.items.filter(function(item){return item.selected})
  d3.select('#item'+item.id+' circle')
    .style("stroke", item.selected ? "#f00" : "#3182bd")
    .style("stroke-width", item.selected ? 2 : 1)
}
var _onClickBase = function(){
  Grafiy.selected.each(function(item){
    item.selected = false
    d3.select('#item'+item.id+' circle')
      .style("stroke", item.selected ? "#f00" : "#3182bd")
      .style("stroke-width", item.selected ? 2 : 1)
    deHighlight(item)
  })
  Grafiy.selected = []
}
var _onDragstart = function(item){
  // auto positioning is off while dragging
  Grafiy.force.stop()
  var dragGroup
  if (Grafiy.selected.include(item)){
    dragGroup = Grafiy.selected
  } else {dragGroup = [item]}
  dragGroup.each(function(selected){
    selected.fx = selected.x
    selected.fy = selected.y
  })
}
var _onDragmove = function(item){
  //TODO do once for all subsequent move events
  var node = d3.select('#item'+item.id)
  node.attr('pointer-events', 'none')
  var dx = d3.event.dx;
  var dy = d3.event.dy;
  var dragGroup
  if (Grafiy.selected.include(item)){
    dragGroup = Grafiy.selected
  } else {dragGroup = [item]}
  dragGroup.each(function(selected){
    selected.x += dx
    selected.px += dx
    selected.py += dy
    selected.y += dy
  })
  Grafiy.tick(); // this is the key to make it work together with updating both px,py,x,y on item
}
var _onDragend = function(item){
  if (Grafiy.hover && item != Grafiy.hover && Grafiy.hover.droppable && !item.links.include(Grafiy.hover.name)){
    var dragGroup
    if (Grafiy.selected.include(item)){
      dragGroup = Grafiy.selected
    } else {dragGroup = [item]}
    dragGroup.each(function(selected){
      Grafiy.links.push({id: generateId(), source:selected, target:Grafiy.hover})
      selected.links.push(Grafiy.hover.name)
      Grafiy.hover.links.push(selected.name)
      resetPosition(selected)
    })
  }
  var dragGroup
  if (Grafiy.selected.include(item)){
    dragGroup = Grafiy.selected
  } else {dragGroup = [item]}
  dragGroup.each(function(selected){
    if (selected.movable == false) resetPosition(selected)
  })
  Grafiy.update();
  var node = d3.select('#item' + item.id)
  node.attr('pointer-events', 'all')
}
var _onMouseClickEdge = function(edge){
  d3.event.stopPropagation()
  edge.selected = !edge.selected
  Grafiy.edgesSelected = Grafiy.links.filter(function(link){return link.selected})
  d3.select('#'+link.id)
    .style("stroke", link.selected ? "#f00" : "rgba(0,0,0,0)")

}
//var _onMouseOverEdge = function(edge){
  //d3.select(this)
    //.style("stroke", "#555")
//}
//var _onMouseOutEdge = function(edge){
  //d3.select(this)
    //.style("stroke", "rgba(0,0,0,0)")
//}
var resetPosition = function(item){
  item.x = item.fx
  item.y = item.fy
  item.px = item.fx
  item.py = item.fy
}
var _onMouseOver = function(item){
  var self = this
  Grafiy.hover = item
  if (!item.fixed){
    item.tempFix = true
    item.fixed = true
  }
  if (item.selected) return
  highlight(item)
}
var _onMouseOut = function(item){
    delete Grafiy.hover
    if (item.tempFix){
      item.fixed = false
      delete item.tempFix
    }
    if (item.selected) return
    deHighlight(item)
}
var highlight = function(item){
  d3.select('#item'+item.id+' circle').style('stroke-width', 2)
  d3.select('#item'+item.id+' text').style('font-weight', 'bold')
}
var deHighlight = function(item){
  d3.select('#item'+item.id+' circle').style('stroke-width', 1)
  d3.select('#item'+item.id+' text').style('font-weight', 'normal')
}

Colors = {
"bg-color-blue" : "#2d89ef",
"bg-color-blueLight" : "#eff4ff",
"bg-color-blueDark" : "#2b5797",
"bg-color-green" : "#00a300",
"bg-color-greenLight" : "#99b433",
"bg-color-greenDark" : "#1e7145",
"bg-color-red" : "#b91d47",
"bg-color-yellow" : "#ffc40d",
"bg-color-orange" : "#e3a21a",
"bg-color-orangeDark" : "#da532c",
"bg-color-pink" : "#9f00a7",
"bg-color-pinkDark" : "#7e3878",
"bg-color-purple" : "#603cba",
"bg-color-darken" : "#333333",
"bg-color-lighten" : "#d5e7ec", 
"bg-color-white" : "#ffffff",
"bg-color-grayDark" : "#525252"
}
