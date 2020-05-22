const db = require("@begin/data");

exports.getItems = ({ collection }) => {
  return db.get({ table: collection });
};

exports.getItem = ({ collection, id }) => {
  return db.get({ table: collection, key: id });
};

exports.addItem = ({ collection, item }) => {
  return db.set({ table: collection, ...item });
};

exports.updateItem = ({ collection, id, item }) => {
  return db.set({ table: collection, key: id, ...item });
};

exports.deleteItem = ({ collection, id }) => {
  return db.destroy({ table: collection, key: id });
};
