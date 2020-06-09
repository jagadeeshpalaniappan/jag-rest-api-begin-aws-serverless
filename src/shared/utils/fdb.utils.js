const faunadb = require("faunadb");
const q = faunadb.query;

const getId = (ref) => {
  if (!ref) return null;
  const refObj = JSON.parse(JSON.stringify(ref));
  // console.log("getId: refObj", refObj);
  return refObj && refObj["@ref"] ? refObj["@ref"]["id"] : null;
};

module.exports = {
  getId,
};
