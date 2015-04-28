Class.create("ViewGraph", View, {
  
  type: "Grid",
  items: [],    //items to show
  links: [],    //links of items to show
  nodes: [],    // svg nodes for visible items
  edges: [],    // svg lines for visible links
  root: {},     // centered item
  settings:{
    Grid: {
      width: 300
    , height: 200
    , fontSize: 16
    , icon: {size: {width: 16, height: 16}, margin: {x: 10, y: 10}}
    , spacing: 15
    , columns: 5
    , urlWidth: 0
    , urlHeight: 0
    },
    SmallGrid: {
      width: 200
    , height: 133
    , fontSize: 13
    , icon: {size: {width: 16, height: 16}, margin: {x: 5, y: 5}}
    , spacing: 10
    , columns: 6
    , urlWidth: 0
    , urlHeight: 0
    },
    List: {
      width: 1280
    , height: 50
    , fontSize: 16
    , icon: {size: {width: 16, height: 16}, margin: {x: 10, y: 15}}
    , spacing: 0
    , columns: 1
    , urlWidth: 200
    , urlHeight: 50
    },
    Graph: {
      radius: 50
    , fontSize: 16
    , icon: {size: {width: 16, height: 16}}
    , urlWidth: 0
    , urlHeight: 0
    }
  },

  initialize : function($super, options){
    $super(options)
    var self = this;
    //this.linkman = new ViewGraphLinkMan(this)
    //this.itemman = new ViewGraphItemMan(this)
    var p = this.p;
    //this.contextMenu = $app.getItemByName("ItemContextMenu", {})
    //this.search = $app.getItemByName("ItemSearch", {})
    
    this.element = d3.select(this.elementName)
    this.vis = this.element.append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
    this.coords = []
    this.selected = []

    this.chargeBase = -200;
    this.chargeK = -10;
    this.force = d3.layout.force()
      .gravity(0.1)     //no gravity to center
      .charge(function(d){ return -200})
      //.charge(function(d){ return d.size * self.chargeK})
      .size([this.width, this.height])
      .linkDistance(function(d){ return 30})
      //.linkDistance(function(d){ return d.target.size + 75; })
      .on("tick", this._onTick.bind(this))
    this.drag = d3.behavior.drag()
      .on("dragstart", this._onDragstart.bind(this))
      .on("drag", this._onDragmove.bind(this))
      .on("dragend", this._onDragend.bind(this));
    this.element
      .on("click", this._onClickBase.bind(this))
      .on("dblclick", this._onDblClickBase.bind(this))
      .on("contextmenu", this._onRightClickBase.bind(this))

    this.vis.append("svg:defs")
      .append("svg:marker")
        .attr("id", 'type')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    //control.on('resize', this._onResize.bind(this));
    // Select context if view is loaded after app:context_changed event
    //if ($user){
      //this._onContextChanged($user.context)
      //this._onSelectionChanged($app.selection)
    //}

  },

  update : function($super, json){
    $super()
    if (json){
      this.force.stop()
      //remove all shown items
      this.items = []
      this._initItems(json)
    }
    this._drawItems()
  },

  change : function(type){
    this.type = type
    this.update()
  },

  _initItems : function(json){
    var self = this
    json.each(function(jsonItem){
      var item = new Item(jsonItem.title, jsonItem)
      //write meta info - use separate hash for it?
      item.url = jsonItem.url
      item.color = jsonItem.color

      //item.fixed = item.fixed != undefined ? item.fixed : true
      item.icon = "http://g.etfv.co/"+item.url
      self.items.push(item)
    })
    this.links = []
    this.items.each(function(item){
      if (!item.links().isEmpty()){
        item.links.split(', ').each(function(link){
          var target = self.items.find(function(node){return node.name == link})
          if (target) self.links.push({id: generateId(), source: item, target: target})
        })
      }
    })
  },

  // update graph accordingly to registries of items and links
  _drawItems : function($super){
    var self = this;

    //// Update the links…
    //this.edges = this.vis.selectAll("line.link")
      //.data(this.links, function(d){ return d.id; });

    //// Enter any new links.
    //this.edges.enter().insert("line", '.node')
      //.attr("class", "link")
      //.attr("id", function(d){ return d.id})
      ////.on("mouseover", this._onMouseOverEdge.bind(this))
      ////.on("mouseout", this._onMouseOutEdge.bind(this))
      //.attr("x1", function(d){ return d.source.x })
      //.attr("y1", function(d){ return d.source.y })
      //.attr("x2", function(d){ return d.target.x })
      //.attr("y2", function(d){ return d.target.y })
      //.style("stroke", "#9ecae1")
      //.attr("marker-end", "url(#type)")

    //// Remove old links.
    //this.edges.exit().remove();

    // Update the nodes
    this.nodes = this.vis.selectAll(".node")
      .data(this.items, function(d){ return d.id })

    //animate updated nodes move
    this.nodes.transition()
      .duration(1000)
      .attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; });

    // Add new nodes
    var newNodes = this.nodes.enter().append("g")
      .attr("class", 'node')
      .attr("id", function(d){ return d.id })
      .on("click", this._onClickNode.bind(this))
      .on("dblclick", this._onDblClickNode.bind(this))
      .on("mousedown", this._onMouseDown.bind(this))
      .on("mousemove", this._onMouseMove.bind(this))
      .on("contextmenu", this._onRightClickNode.bind(this))
      .on("mouseup", this._onMouseUp.bind(this))
      .on("mouseover", this._onMouseOver.bind(this))
      .on("mouseout", this._onMouseOut.bind(this))
      .call(this.drag)

    // Remove old nodes
    this.nodes.exit()
      .transition()
        .duration(1000)
        .style("fill-opacity", 1e-6)
      .remove()

    this.force
      .nodes(this.nodes)
      //.links(this.edges)

    if (this.type == "Graph"){
      this.force.start()
      this._drawGraph(newNodes)
    } else {
      this.force.stop()
      this._drawGrid(newNodes)
    }
  },

  _drawGrid : function(newNodes){
    var self = this
    var node = this.settings[this.type]
    this.items.each(function(item){
      item.width = node.width
      item.height = node.height
    })

    this._placeGrid(this.items, {x: 50, y: 50, columns: node.columns, spacing: node.spacing})
    
    //place nodes on new coords
    newNodes
      .attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; });

    //animate tile form change
    var tileForm = this.vis.selectAll("rect")
      .transition()
      .duration(500)
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", node.width )
      .attr("height", node.height)
    this.vis.selectAll(".tileIcon")
      .transition().duration(500)
      .attr("x", node.icon.margin.x)
      .attr("y", node.height - node.icon.margin.y - node.icon.size.height)
    this.vis.selectAll('.tileTextObject')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", node.width )
      .attr("height", node.height )
    this.vis.selectAll(".tileTitleBody")
      .html(function(d){ return "<div class='tileTitle "+self.type+"'>"+d.name+"</div>"})
      .attr("style", "width:"+node.width+"px;font-size:"+ node.fontSize+'px;')
    this.vis.selectAll(".tileDomainObject")
      .attr("width", node.urlWidth )
      .attr("height", node.urlHeight )
      .attr("x", this.width - node.urlWidth - 10)
    this.vis.selectAll(".tileDomainBody")
      .html(function(d){ return "<div class='tileUrl "+self.type+"'>"+d.url+"</div>"})
      .attr("style", "width:"+node.urlWidth+"px;font-size:"+ node.fontSize+'px;')

    //draw new tiles
    newNodes.append("rect")
      .attr("width", node.width )
      .attr("height", node.height)
      .style("fill", function(d){return d.color})
      .style("fill-opacity", 0.9)
    newNodes.append("image")
      .attr("class", "tileIcon")
      .attr("xlink:href", function(d){ return d.icon})
      .attr("width", node.icon.size.width)
      .attr("height", node.icon.size.height )
      .attr("x", node.icon.margin.x)
      .attr("y", node.height - node.icon.margin.y - node.icon.size.height)
    //tile title
    newNodes.append('foreignObject')
      .attr("class", "tileTextObject")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", node.width )
      .attr("height", node.height )
      .append("xhtml:body")
        .attr("class", "tileTitleBody")
        .html(function(d){ return "<div class='tileTitle "+self.type+"'>"+d.name+"</div>"})
        .attr("style", "width:"+node.width+"px;font-size:"+ node.fontSize+'px;')

    //item url
    newNodes.append('foreignObject')
      .attr("class", "tileDomainObject")
      .attr("width", node.urlWidth )
      .attr("height", node.urlHeight )
      .attr("x", this.width - node.urlWidth - 10)
      .append("xhtml:body")
        .attr("class", "tileDomainBody")
        .html(function(d){ return "<div class='tileUrl "+self.type+"'>"+d.url+"</div>"})
        .attr("style", "width:"+node.urlWidth+"px;font-size:"+ node.fontSize+'px;')

    //animate new nodes appear
    newNodes.transition()
      .duration(1000)
      .attr('opacity', 1)
  },

  _drawGraph : function(newNodes){
    var self = this
    var node = this.settings[this.type]
    this.items.each(function(item){
      item.width = node.radius
      item.height = node.radius
      item.radius = node.radius
    })
    
    //place nodes on new coords
    newNodes
      .attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"; });

    //animate tile form change
    var tileForm = this.vis.selectAll("rect")
      .transition()
      .duration(500)
      .attr("rx", node.radius)
      .attr("ry", node.radius)
      .attr("width", node.radius)
      .attr("height", node.radius)
    this.vis.selectAll(".tileIcon")
      .transition().duration(500)
      .attr("x", node.radius/2-node.icon.size.width/2)
      .attr("y", node.radius/2-node.icon.size.height/2)
    this.vis.selectAll('.tileTextObject')
      .attr("x", 0)
      .attr("y", node.radius)
      .attr("width", node.radius*3)
      .attr("height", node.fontSize)
    this.vis.selectAll(".tileTitleBody")
      .html(function(d){ return "<div class='tileTitle "+self.type+"'>"+d.name+"</div>"})
      .attr("style", "width:"+node.radius*3+"px;font-size:"+ node.fontSize+'px;')

    //draw new tiles
    newNodes.append("rect")
      .attr("rx", node.radius)
      .attr("ry", node.radius)
      .attr("width", node.radius)
      .attr("height", node.radius)
      .style("fill", function(d){return d.color})
      .style("fill-opacity", 0.9)
    newNodes.append("image")
      .attr("class", "tileIcon")
      .attr("xlink:href", function(d){ return d.icon})
      .attr("width", node.icon.size.radius)
      .attr("height", node.icon.size.height )
      .attr("x", node.radius/2-node.icon.size.width/2)
      .attr("y", node.radius/2-node.icon.size.height/2)
    //tile title
    newNodes.append('foreignObject')
      .attr("class", "tileTextObject")
      .attr("x", 0)
      .attr("y", node.radius)
      .attr("width", node.width*3 )
      .attr("height", node.fontSize )
      .append("xhtml:body")
        .attr("class", "tileTitleBody")
        .html(function(d){ return "<div class='tileTitle "+self.type+"'>"+d.name+"</div>"})
        .attr("style", "width:"+node.radius+"px;font-size:"+ node.fontSize+'px;')
  },

  _onContextChanged : function(e){
    this.itemman.select(e);
  },

  _onSelectionChanged : function(e){
    this.itemman.select(e)
  },

  // Update visual node on graph
  _onItem : function(e){
    var item = e.memo
    if (this.itemman.isShown(item)){
      //TODO remove only updated nodes
      // remove node because d3 will not update it on enter as already rendered
      this.nodes.remove();
      this.itemman.show(item)
    }
  },

  _onLinked : function(e){
    var item = e.memo.item
    var link = e.memo.link
    if (this.itemman.isShown(item)) this.linkman.show(item, link)
  },

  // Move nodes and lines on layout recalculation
  _onTick : function(e){
    var self = this
    //this.edges.attr("d", function(d) {
      //var dx = d.target.x - d.source.x,
          //dy = d.target.y - d.source.y,
          //dr = Math.sqrt(dx * dx + dy * dy);
      //return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    //})

    this.nodes.attr("transform", function(d){
      d.x = Math.max(d.radius, Math.min(self.width - d.radius, d.x))
      d.y = Math.max(d.radius, Math.min(self.height - d.radius, d.y))
      //d.px = Math.max(d.radius, Math.min(self.width - d.radius, d.px))
      //d.py = Math.max(d.radius, Math.min(self.height - d.radius, d.py))
      return "translate(" + d.x + "," + d.y + ")";
    });
  },

  _onClickNode : function(item){
    d3.event.stopPropagation()
    if (d3.event.ctrlKey) this.itemman.hide(item)
    if (d3.event.ctrlKey && d3.event.shiftKey) this.itemman.remove(item)
    if (item.action){
      item.action.execute()
      this.itemman.hide(this.contextMenu, true)
    }
  },

  _onDblClickNode : function(item){
    d3.event.stopPropagation()
    this.itemman.toggle(item)
  },

  _onRightClickNode : function(item){
    d3.event.stopPropagation()
    d3.event.preventDefault()
    this.itemman.hide(this.contextMenu, true)
    if (item.noContextMenu) return 
    this.contextMenu.show(item)
    this.itemman.show(this.contextMenu)
  },

  _onClickBase : function(){
    this.itemman.hide(this.contextMenu, true)
  },

  // Show search string
  _onDblClickBase : function(){
    var point = d3.event
    var coords = d3.mouse(this.element);
    this.search.show(point, {x: coords[0], y: coords[1]})
    this.itemman.show(this.search)
  },

  _onRightClickBase : function(){
    d3.event.preventDefault()
    var coords = d3.mouse(this.element)
    this.contextMenu.show(null, {x: coords[0], y: coords[1]})
    this.itemman.show(this.contextMenu)
  },

  _onMouseDown : function(item){
    if (item.action) return
    if (this.itemman.select(item)) document.fire('app:context_changed', item);
  },

  _onMouseMove : function(item){
  },

  _onMouseUp : function(item){
  },

  _onMouseOver : function(item){
    var self = this
    this.hover = item
    if (!item.fixed){
      item.tempFix = true
      item.fixed = true
    }
    // Open menu on hover and close all other previously opened menu items
    if (item.action){
      //this.contextMenu.items.each(function(item){self.itemman.collapse(item)})
      this.itemman.expand(item)
      return 
    }
    if (item.selected) return
    this.itemman.highlight(item)
  },

  _onMouseOut : function(item){
    delete this.hover
    if (item.tempFix){
      item.fixed = false
      delete item.tempFix
    }
    if (item.selected) return
    this.itemman.deHighlight(item)
  },

  _onDragstart : function(item){
    // auto positioning is off while dragging
    this.force.stop()
  },

  _onDragmove : function(item){
    //TODO do once for all subsequent move events
    var node = d3.select('#'+item.id)
    node.attr('pointer-events', 'none')
    item.px += d3.event.dx;
    item.py += d3.event.dy;
    if (d3.event.dx || d3.event.dy) item.change()
    item.x += d3.event.dx;
    item.y += d3.event.dy; 
    this._onTick(); // this is the key to make it work together with updating both px,py,x,y on item
  },

  _onDragend : function(item){
    if (this.hover && item != this.hover){
      var link = item.link(this.hover)
      //TODO dragged item should be put to drag start position if link created?
      //item.fixed = false
      this.update()
    }
    this.itemman.fix(item)
    this._onTick();
    this.force.resume();
    var node = d3.select('#' + item.id)
    node.attr('pointer-events', 'all')
  },

  //_onMouseOverEdge : function(edge){
  //},

  //_onMouseOutEdge : function(edge){
  //},

  _onResize : function(control, width, height){
    var p = this.p;
    p.width = width;
    p.height = height;
    this.force.size([width, height]);
    this.vis.attr("width", p.width)
            .attr("height", p.height);
    this.update();
  },

  _onClickPin : function(item){
    d3.event.stopPropagation()
    if (!$user.contexts.include(item.id)){
      this.itemman.pin(item)
    } else{
      this.itemman.unPin(item)
    }
  },

  _placeGrid : function(nodes, p){
    var self = this
    p = p || {}
    var offset = p.offset || {x:0, y:0}
    if (!p.spacing) p.spacing = 0
    var spacing = Object.isPlainObject(p.spacing) ? p.spacing : {x: p.spacing, y: p.spacing}
    offset.x = p.x || p.offset.x
    offset.y = p.y || p.offset.y
    var columns = p.columns
    var rows = p.rows

    var n = nodes.length;
    var line = 0
    var column = 0
    nodes.each(function(node){
      node.x = node.px = offset.x + (node.width + spacing.x) * column
      column += 1
      node.y = node.py = offset.y + (node.height + spacing.y) * line
      if (column >= columns || node.x + node.width + spacing.x > offset.x + self.width){
        line +=1; column = 0
      }
    })
  }
})
