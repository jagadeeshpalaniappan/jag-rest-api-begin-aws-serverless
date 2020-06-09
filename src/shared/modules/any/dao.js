// const db = require("./db/dynamodb");
const db = require("./db/faunadb");

exports.getItems = async ({ collection }) => {
  return db.getItems({ collection });
};

exports.getItemsPagination = async (...args) => {
  return db.getItemsPagination(...args);
};

exports.getItem = async ({ collection, id }) => {
  return db.getItem({ collection, id });
};

exports.addItem = async ({ collection, item }) => {
  return db.addItem({ collection, item });
};

exports.updateItem = async ({ collection, id, item }) => {
  return db.updateItem({ collection, id, item });
};

exports.deleteItem = ({ collection, id }) => {
  return db.deleteItem({ collection, id });
};
exports.deleteAllItem = ({ collection }) => {
  return db.deleteAllItem({ collection });
};
