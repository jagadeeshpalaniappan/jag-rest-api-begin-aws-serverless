const faunadb = require("faunadb");
const q = faunadb.query;

const validateFields = (item, required) => {
  for (let param of required) {
    if (!item[param]) throw ReferenceError(`missing param '${param}'`);
    if (item[param] && item[param].length < 4)
      throw RangeError(`'${param}' must be four or more characters`);
  }
};

const convertKeyToId = (items) => {
  return items.map(({ key, ...rest }) => ({
    id: key,
    ...rest,
  }));
};

const atob = (str) => Buffer.from(str).toString("base64");
const btoa = (b64) => Buffer.from(b64, "base64").toString();

module.exports = {
  atob,
  btoa,
  convertKeyToId,
  validateFields,
};
