Class.create("Record", {
  /**
   * Load or Save record on creation
   * @param String [id]
   * @param Store [store]
   */
  initialize : function(id){
    this.toStore = $w('id name createdAt')
    this.loaded = false;
    // Let initialization chain finish before update
    if (id){
      this.id = id
      //setTimeout(this.get.bind(this), 10)
    } else {
      this.id = $util.generateId()
      this.changed = true
      //setTimeout(this.save.bind(this), 10)
    }
  },
  /**
   */
  get : function($super, options){
    var self = this
    options = options || {}
    var url = "http://da5f284b45e1.timedesk.org/UserLink/DmitraGetTilesByTags/" + this.id
    var connection = new Connection(url)
    connection.onComplete = function(trasport){
      self.update(transport.data, transport.diff)
    }
    connection.sendAsync()
    //$super(null, idOrName, options)
  },

  put : function($super, options){
    options = options || {}
    //$super(null, idOrName, this._content, options)
  },
  /**
   * On remote record change, Proxy will call this method
   * Augment it in concrete Record class
   * @param Json [diff]
   */
  update : function(data, diff){
    var self = this
    var update = data || diff
    this.toStore.each(function(attr){
      if (update[attr] != undefined){
        if (diff && Object.isArray(update[attr])){
          self[attr] = self[attr].diffMerge(update[attr])
        } else {
          self[attr] = update[attr]
        }
        delete update[attr]
      }
    })
    this.loaded = true;
  },

  save : function(){
    var self = this
    var content = this._content || {}
    this.toStore.each(function(p){
      if (self[p] != undefined) content[p] = self[p]
    })
    this.put()
  },

  remove : function(){
    this._content = null
    this.put({delete: true})
  }
})
