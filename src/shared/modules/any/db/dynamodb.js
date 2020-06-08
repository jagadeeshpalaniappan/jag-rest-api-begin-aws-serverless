const db = require("@begin/data");
const { convertKeyToId } = require("../../../utils/common");

exports.getItems = async ({ collection }) => {
  const items = await db.get({ table: collection });
  return convertKeyToId(items);
};

exports.getItemsPagination = async ({ collection, limit, cursor }) => {
  const items = await db.get({ table: collection, limit, cursor });
  const data = convertKeyToId(items);
  return { data, cursor: items["cursor"] };
};

exports.getItem = async ({ collection, id }) => {
  const item = await db.get({ table: collection, key: id });
  return convertKeyToId([item])[0];
};

exports.addItem = async ({ collection, item }) => {
  const dbItem = await db.set({ table: collection, ...item });
  return convertKeyToId([dbItem])[0];
};

exports.updateItem = async ({ collection, id, item }) => {
  const curItem = await db.get({ table: collection, key: id });
  const newItem = { ...curItem, ...item };
  const dbItem = await db.set({ table: collection, key: id, ...newItem });
  return convertKeyToId([dbItem])[0];
};

exports.deleteItem = ({ collection, id }) => {
  return db.destroy({ table: collection, key: id });
};
