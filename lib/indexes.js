var Firebase = require('firebase');
var _ = require('underscore');
var Q = require('q');

var Util = require('./util');

var Indexes = function(indexesName, options) {
  this.config = options.config;
  this.firebaseRef =
    new Firebase(this.config.url + Util.removeLeadingSlash(indexesName));
};

Indexes.prototype.create = function(index) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    _.each(index, _createIndex);

    function _createIndex(value, key) {
      self.firebaseRef
        .child(key)
        .set(value, function(err) {
          if (err) reject(err);
          else resolve(index);
        });
    }
  });
};

Indexes.prototype.find = function(key) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self.firebaseRef
      .child(key)
      .once('value', function(snap) {
        resolve(snap.val());
      }, function(err) {
        reject(err);
      });
  });
};

Indexes.prototype.clear = function() {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self.firebaseRef
      .remove(function(err) {
        if (err) reject(err);
        else resolve();
      });
  });
};

module.exports = Indexes;
