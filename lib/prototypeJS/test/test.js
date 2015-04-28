#!/usr/bin/env node
 
require('../prototype.js');
require('./classes/Main.js')
require('./classes/Child.js')

var p = new Main();
var c = new Child();
c.act()
 
