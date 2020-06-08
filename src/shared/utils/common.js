exports.validateFields = (item, required) => {
  for (let param of required) {
    if (!item[param]) throw ReferenceError(`missing param '${param}'`);
    if (item[param] && item[param].length < 4)
      throw RangeError(`'${param}' must be four or more characters`);
  }
};

exports.convertKeyToId = (items) => {
  return items.map(({ key, ...rest }) => ({
    id: key,
    ...rest,
  }));
};
