const _ = require('lodash');

const getDiff = (curr, prev) => {
  function changes(object, base) {
    return _.transform(object, (result, value, key) => {
      if (!_.isEqual(value, base[key]))
        result[key] =
          _.isObject(value) && _.isObject(base[key])
            ? changes(value, base[key])
            : value;
    });
  }

  return changes(curr, prev);
};

module.exports = getDiff;
