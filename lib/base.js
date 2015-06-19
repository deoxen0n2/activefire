var Firebase = require('firebase');
var _ = require('underscore');
var Q = require('q');

var Util = require('./util');
var Associations = require('./associations');

var BaseInstance = function(collection, obj, options) {
  if (obj) {
    _.extend(this, obj);
  }

  this._internals = {};
  this._internals.collection = collection;
  this._internals.omitList = [];

  if (options) {
    if (options.hasManys) _.each(options.hasManys, _assignHasMany, this);
    if (options.belongsTos) _assignBelongsTos(this);
  }

  function _assignHasMany(options, collectionName) {
    var collectionModel = options.model;
    var collectionKey = options.key;
    this[collectionName] = new Associations(this, collectionName, collectionModel, collectionKey);
    this._internals.omitList.push(collectionName);
  }

  function _assignBelongsTos(instance) {
    instance._internals.belongsTos = options.belongsTos;
    instance._internals.belongsTos.forEach(function(belongsTo) {
      instance[belongsTo.key] = belongsTo.instance.id;
    });
  }
};

BaseInstance.prototype.save = function() {
  var data = _.omit(this, '_internals');
  data = _.omit(data, _isFunction);
  data = _.omit(data, this._internals.omitList);
  data.created_at = data.updated_at = Firebase.ServerValue.TIMESTAMP;

  var self = this, instance;

  return Q.Promise(function(resolve, reject) {
    if (data.id) {
      var id = data.id;
      data = _.omit(data, 'id');

      instance = self._internals
                   .collection
                   .child(id);

      instance.set(data, function(err) {
        if (err) {
          reject(err);
        } else {
          self.id = id;
          self._internals.self = instance;

          if (self._internals.belongsTos) {
            _addReference()
              .then(function() {
                resolve(self);
              }, reject);
          } else {
            resolve(self);
          }
        }
      });
    } else {
      instance =
        self._internals
          .collection
          .push(data, function(err) {
            if (err) {
              reject(err);
            } else {
              self.id = instance.key();
              self._internals.self = instance;

              if (self._internals.belongsTos) {
                _addReference()
                  .then(function() {
                    resolve(self);
                  }, reject);
              } else {
                resolve(self);
              }
            }
          });
    }
  });

  function _isFunction(value) {
    return _.isFunction(value);
  }

  function _addReference() {
    return Q.all(self._internals.belongsTos.map(_addRef));

    function _addRef(belongsTo) {
      var instance = belongsTo.instance;
      var collectionName = belongsTo.collection;
      return instance.addRef(collectionName, self.id);
    }
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

BaseInstance.prototype.destroy = function() {
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

BaseInstance.prototype.addRef = function(collectionName, idOrObject) {
  var id;
  var collectionPrefix = '_ids';
  var self = this;

  if (typeof idOrObject === 'object') id = idOrObject.id;
  else id = idOrObject;

  return Q.Promise(function(resolve, reject) {
    self._internals
      .self
      .child(collectionName + collectionPrefix)
      .child(id)
      .set(true, function(err) {
        if (err) reject(err);
        else resolve(self.reload());
      });
  });
};

BaseInstance.prototype.reload = function() {
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

  if (options) {
    this.options = {
      hasManys: options.hasMany
    };
  }
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

Base.prototype.on = function(eventType, callback, cancelCallback) {
  var self = this;

  self.firebaseRef
    .on('value', function(snap) {
      var baseCollection = _.mapObject(snap.val(), _toBaseInstance);
      callback(_.values(baseCollection));
    }, function(err) {
      cancelCallback(err);
    });

  function _toBaseInstance(obj, id) {
    return toBaseInstance(self, obj, id);
  }
};

Base.prototype.find = function(id) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    var ref = self.firebaseRef.child(id);
    ref.once('value', function(snap) {
      var instance = toBaseInstance(self, snap.val(), snap.key());
      instance._internals.self = ref;
      resolve(instance);
    }, function(err) {
      reject(err);
    });
  });
};

Base.prototype.findBy = function(attrName, attrValue) {
  var self = this;

  return Q.Promise(function(resolve, reject) {
    var ref = self.firebaseRef.orderByChild(attrName).equalTo(attrValue);
    ref.once('child_added', function(snap) {
      var instance = toBaseInstance(self, snap.val(), snap.key());
      instance._internals.self = snap.ref();
      resolve(instance);
    }, function(err) {
      reject(err);
    });
  });
};

Base.prototype.new = function(obj, options) {
  options = options || {};
  _.extend(options, this.options);
  return (new BaseInstance(this.firebaseRef, obj, options));
};

Base.prototype.create = function(obj) {
  var instance = this.new(obj);
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
