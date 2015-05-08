var Associations = function(instance, collectionName, collectionModel, collectionKey, options) {
  this._internals = {};
  this._internals.model = collectionModel;
  this._internals.belongsTos = [];
  this._internals.belongsTos.push({ instance: instance, collection: collectionName, key: collectionKey });
};

Associations.prototype.build = function(obj) {
  return (this._internals.model.new(obj, {
            belongsTos: this._internals.belongsTos
          }));
};

Associations.prototype.create = function(obj) {
  var instance = this.build(obj);
  return instance.save();
};

module.exports = Associations;
