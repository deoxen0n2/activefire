var Firebase = require('firebase');
var _ = require('underscore');

var Base = require('./lib/base');
var Associations = require('./lib/associations');
var Indexes = require('./lib/indexes');

var ActiveFire = {};

var configure = function(config) {
  ActiveFire.config = config;
  _.extend(ActiveFire, new Firebase(config.url));
};

var BaseFactory = function(obj, options) {
  var _options = options || {};
  _options.config = _options.config || ActiveFire.config || {};
  return (new Base(obj, _options));
};

var IndexesFactory = function(indexesName, options) {
  var _options = options || {};
  _options.config = _options.config || ActiveFire.config || {};
  return (new Indexes(indexesName, _options));
};

ActiveFire.configure = configure;
ActiveFire.Base = BaseFactory;
ActiveFire.Associations = Associations;
ActiveFire.Indexes = IndexesFactory;

module.exports = ActiveFire;
