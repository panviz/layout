PrototypeJS-for-NodeJS
======================

Benefit from prototypeJS OOP on server side

Include PrototypeJS
----------------
**lang** directory is just a copy of [PrototypeJS lang](https://github.com/sstephenson/prototype/tree/master/src/prototype/lang)
with few changes:

* prototype.oo.js added
* `Object.extend` now can recieve *falsy* values as **destination**
* `Object.clone` return falsy values as is
* `Array.select` method is now ruby like
* `Array.diff`
* `Array.compact` and `Array.without` uses `filter` instead of `select`
* `Enumerable.inspect` method is commented out because of nodeJS `inspect` confict
* `Hash.diff`
* `window` reference in `window.setTimeout` and `window.JSON` replaced with global scope variables
* TODO include periodical_executer if needed

Usage
----------------
See test.js
