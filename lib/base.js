var Firebase = require('firebase');
var _ = require('underscore');
var Q = require('q');

var Util = require('./util');

var BaseInstance = function(collection, obj) {
  if (obj) {
    _.extend(this, obj);
  }
  this._internals = {};
  this._internals.collection = collection;
};

BaseInstance.prototype.save = function() {
  var data = _.omit(this, '_internals');
  data = _.omit(data, _isFunction);
  data.created_at = data.updated_at = Firebase.ServerValue.TIMESTAMP;

  var self = this;

  return Q.Promise(function(resolve, reject) {
    var instance =
      self._internals
        .collection
        .push(data, function(err) {
          if (err) {
            reject(err);
          } else {
            self.id = instance.key();
            self._internals.self = instance;
            resolve(self);
          }
        });
  });

  function _isFunction(value) {
    return _.isFunction(value);
  }
};

// TODO: Should handle case where update failed.
// Should rollback or leave it dirty?
// Or use `on('value') and update itself.
// Will come back later.
BaseInstance.prototype.update = function(data) {
  var self = this;
  data.updated_at = Firebase.ServerValue.TIMESTAMP;
  // Dirty state.
  _.extend(self, data);

  return Q.Promise(function(resolve, reject) {
    self._internals
      .self
      .update(data, function(err) {
        if (err) {
          reject(err);
        } else {
          self.reload()
            .then(function() {
              resolve(self);
            }, function(err) {
              reject(err);
            });
        }
      });
  });
};

BaseInstance.prototype.destroy = function(onComplete) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self._internals
      .self
      .remove(function(err) {
        if (err) reject(err);
        else resolve(self);
      });
  });
};

BaseInstance.prototype.reload = function(onComplete) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self._internals
      .self
      .once('value', function(snap) {
        _.extend(self, snap.val());
        resolve(self);
      }, function(err) {
        reject(err);
      });
  });
};

var Base = function(resourcePath, options) {
  this.config = options.config;
  this.firebaseRef =
    new Firebase(this.config.url + Util.removeLeadingSlash(resourcePath));
};

var toBaseInstance = function(base, obj, id) {
  var instance = base.new(obj);
  instance.id = id;
  return instance;
};

Base.prototype.all = function() {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self.firebaseRef
      .once('value', function(snap) {
        var baseCollection = _.mapObject(snap.val(), _toBaseInstance);
        resolve(_.values(baseCollection));
      }, function(err) {
        reject(err);
      });

    function _toBaseInstance(obj, id) {
      return toBaseInstance(self, obj, id);
    }
  });
};

Base.prototype.find = function(id) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self.firebaseRef
      .child(id)
      .once('value', function(snap) {
        resolve(toBaseInstance(self, snap.val(), snap.key()));
      }, function(err) {
        reject(err);
      });
  });
};

Base.prototype.new = function(obj) {
  return (new BaseInstance(this.firebaseRef, obj));
};

Base.prototype.create = function(obj) {
  var instance = new BaseInstance(this.firebaseRef, obj);
  return instance.save();
};

Base.prototype.clear = function() {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    self.firebaseRef
      .remove(function(err) {
        if (err) reject(err);
        else resolve();
      });
  });
};

module.exports = Base;
