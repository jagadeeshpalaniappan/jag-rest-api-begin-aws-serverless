const db = require("@begin/data");
const faunadb = require("faunadb");
const q = faunadb.query;
const FAUNADB_ADMIN_SECRET = "fnADtzWlLxACCBddcFrAHX4G66v8Hmpy0U4gVzUy";
var fdbClient = new faunadb.Client({ secret: FAUNADB_ADMIN_SECRET });

const { convertKeyToId } = require("../../../utils/common");
const fdbUtils = require("../../../utils/fdb.utils");
const { getId } = fdbUtils;

exports.getItems = async ({ collection }) => {
  const users = await fdbClient.query(q.CreateCollection({ name: "users" }));
  console.log("getItems:", users);
  return users;
};

exports.getItemsPagination = async ({ collection, limit, before, after }) => {
  // populate: pageConfig
  const pageConfig = {};
  if (limit) pageConfig.size = Number(limit);
  if (before) pageConfig.before = [q.Ref(q.Collection("users"), before)];
  if (after) pageConfig.after = [q.Ref(q.Collection("users"), after)];
  console.log("getItemsPagination: pageConfig", pageConfig);

  // getAllDocQuery: pageObj
  const getAllDocQuery = q.Map(
    q.Paginate(q.Match(q.Index("all_users")), pageConfig), // getIndexRef and matchAllRef and getOnlyPagedDocRefs
    q.Lambda("item", q.Get(q.Var("item"))) // const lamdaFn = (docRefVar) => GetDoc(docRefVar);
  ); // getOnlyPagedDocRefs and pass eachObj to lamdaFn
  const pageObj = await fdbClient.query(getAllDocQuery);
  console.log("getItemsPagination: pageObj", pageObj);
  // return pageObj;

  // populate: resp
  const items = pageObj.data.map((item) => ({
    id: getId(item.ref),
    ...item.data,
  }));
  const beforeId = pageObj.before ? getId(pageObj.before[0]) : null;
  const afterId = pageObj.after ? getId(pageObj.after[0]) : null;
  return { data: items, before: beforeId, after: afterId };
};

/*
exports.getItemsPagination = async ({ collection, limit, before, after }) => {
  // populate: pageConfig
  const pageConfig = {};
  if (limit) pageConfig.size = Number(limit);
  if (before) pageConfig.before = [q.Ref(q.Collection("users"), before)];
  if (after) pageConfig.after = [q.Ref(q.Collection("users"), after)];
  // console.log("getItemsPagination: pageConfig", pageConfig);

  // getAllDocRefs: pageObj: Query:
  const getAllDocRefsPageQuery = q.Paginate(
    q.Match(q.Index("all_users")),
    pageConfig
  );
  const docRefsPage = await fdbClient.query(getAllDocRefsPageQuery);
  // console.log("getItemsPagination: docRefsPage", docRefsPage);

  // get: eachDocData -byRef:
  const getAllDocDataByRefQuery = docRefsPage.data.map((ref) => q.Get(ref)); // docRefsPageObj.data.map((docRef) => GetDoc(docRef));
  const dbItems = await fdbClient.query(getAllDocDataByRefQuery);
  // console.log("getItemsPagination: dbItems", dbItems);

  // populate: resp
  const items = dbItems.map((item) => ({ id: getId(item.ref), ...item.data }));
  const beforeId = docRefsPage.before ? getId(docRefsPage.before[0]) : null;
  const afterId = docRefsPage.after ? getId(docRefsPage.after[0]) : null;
  return { data: items, before: beforeId, after: afterId };
};
*/

exports.getItem = async ({ collection, id }) => {
  const getItemByIdQuery = q.Get(q.Ref(q.Collection("users"), id)); // getCollectionRef and getDocRefById and GetDoc
  const dbItem = await fdbClient.query(getItemByIdQuery);
  return { id: getId(dbItem.ref), ...dbItem.data };
};

exports.addItem = async ({ collection, item }) => {
  const createDocQuery = q.Create(q.Collection("users"), { data: item }); // getCollectionRef and CreateDoc(collectionRef, newDoc)
  const dbItem = await fdbClient.query(createDocQuery);
  return { id: getId(dbItem.ref), ...dbItem.data };
};

exports.updateItem = async ({ collection, id, item }) => {
  const updateDocQuery = q.Update(q.Ref(q.Collection("users"), id), {
    data: item,
  }); // getCollectionRef and getDocRefById and UpdateDoc(docRef, updatedDocItem)
  const dbItem = await fdbClient.query(updateDocQuery);
  return { id: getId(dbItem.ref), ...dbItem.data };
};

exports.deleteItem = async ({ collection, id }) => {
  const deleteDocQuery = q.Delete(q.Ref(q.Collection("users"), id)); // getCollectionRef and getDocRefById and DeleteDoc(docRef)
  const dbItem = await fdbClient.query(deleteDocQuery);
  return { id: getId(dbItem.ref), ...dbItem.data };
};

exports.deleteAllItem = async ({ collection }) => {
  const deleteAllDocQuery = q.Map(
    q.Paginate(q.Match(q.Index("all_users"))),
    q.Lambda("item", q.Delete(q.Var("item")))
  );
  const dbItem = await fdbClient.query(deleteAllDocQuery);
  return { id: getId(dbItem.ref), ...dbItem.data };
};

// DOC: https://egghead.io/playlists/the-complete-guide-to-faunadb-74bef44b
