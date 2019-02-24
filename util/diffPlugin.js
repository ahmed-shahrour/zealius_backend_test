const _ = require('lodash');
const LogSchema = require('../models/log');
const getDiff = require('./diff');
// const diff = require('deep-diff').diff;

const plugin = function(schema) {
  schema.post('init', doc => {
    doc._original = doc.toObject({ transform: false });
  });
  schema.pre('save', function(next) {
    if (this.isNew) {
      next();
    } else {
      // console.log(this.toString());
      // console.log(diff(this._original, this));
      this._diff = getDiff(this, this._original);
      next();
    }
  });

  schema.methods.log = function(data) {
    data.diff = {
      before: this._original,
      after: this._diff,
    };
    return LogSchema.create(data);
  };
};
module.exports = plugin;
