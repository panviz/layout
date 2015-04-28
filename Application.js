Class.create("Application", {
  
  initialize : function($super, options){
    $view = new ViewGraph({
      width: 1280,
      height: 720,
      elementName: "#desktop"
    })
    $util = new Util()
  },

  load : function(tag){
    d3.csv("data/test.csv", function(data){
    //d3.json("http://da5f284b45e1.timedesk.org/UserLink/DmitraSearchUserTags/timedesk?tags=Video+game", function(json){
    //d3.json("http://da5f284b45e1.timedesk.org/UserLink/DmitraGetTilesByTags/?tags="+tag, function(json){
      data.each(function(item){
        item.id = item.Id
        item.title = item.Title
        item.url = item.Url
        item.color = Colors[item.BgColorClassName]
        item.createdAt = item.DateCreation.substr(6,13)
      })
      $view.update(data)
    })
  }
})
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
