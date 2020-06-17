const db = require("@begin/data");
const faunadb = require("faunadb");
const q = faunadb.query;
const FAUNADB_SERVER_SECRET = process.env.FAUNADB_SERVER_SECRET;
var fdbClient = new faunadb.Client({ secret: FAUNADB_SERVER_SECRET });

const { convertKeyToId } = require("../../../utils/common");
const {
  getId,
  getAnyCollectionConfig,
  getCursors,
} = require("../../../utils/fdb.utils");

// exports.getItems = async ({ collection }) => {
//   const users = await fdbClient.query(q.CreateCollection({ name: "users" }));
//   console.log("getItems:", users);
//   return users;
// };

const getFilterPageQueries = (filters) => {
  return filters.map((filter) => {
    const idxName = `users_idx_filterby@${filter.key}`;
    const PageQuery = q.Match(q.Index(idxName), filter.value);
    return PageQuery;
  });
};

const getItemsAdvFql = ({ anyCollection, input }) => {
  const { collection, index, pageConfig } = getAnyCollectionConfig({
    anyCollection,
    input,
  });
  const { filterMap } = input;
  console.log("##############");
  console.log({ collection, index, pageConfig });
  const searchTerms = ["fuzzySearch", "role", "sex", "isActive"];
  const searchVal = searchTerms.map(
    (terms) => (filterMap && filterMap[terms]) || "*"
  );
  let PageQuery = q.Paginate(q.Match(q.Index(index), searchVal), pageConfig);
  let PageResultsMapFn = q.Lambda(["ref"], q.Get(q.Var("ref")));
  if (input.sort) {
    PageResultsMapFn = q.Lambda(["x", "ref"], q.Get(q.Var("ref")));
  }
  const fql = q.Map(PageQuery, PageResultsMapFn);
  return fql;
};

const getItemsFql = ({ anyCollection, input }) => {
  const { collection, index, pageConfig } = getAnyCollectionConfig({
    anyCollection,
    input,
  });

  console.log("##############");
  console.log({ collection, index, pageConfig });

  // MATCH-QUERY:
  let MatchQueries = [];
  let MatchQuery = q.Match(q.Index(index));
  // MATCH-QUERY: searchKeyword
  if (input.search) {
    const searchKeyword = input.search.toLowerCase();
    MatchQuery = q.Match(q.Index(index), searchKeyword);
  }
  MatchQueries.push(MatchQuery);
  // MATCH-QUERY: filter
  if (input.filters && input.filters.length > 0) {
    const FilterPageQueries = getFilterPageQueries(input.filters);
    MatchQueries = [...MatchQueries, ...FilterPageQueries];
  }

  console.log("##MatchQueries##");
  console.log(MatchQueries);

  let PageQuery = q.Paginate(q.Intersection(MatchQueries), pageConfig);
  let PageResultsMapFn = q.Lambda(["ref"], q.Get(q.Var("ref")));
  if (input.sort) {
    PageResultsMapFn = q.Lambda(["x", "ref"], q.Get(q.Var("ref")));
  }
  const fql = q.Map(PageQuery, PageResultsMapFn);
  return fql;
};

exports.getItems = async ({ anyCollection, input }) => {
  const fql = getItemsAdvFql({ anyCollection, input });
  const pageObj = await fdbClient.query(fql);
  console.log("getItems: pageObj", pageObj);

  // populate: resp
  const items = pageObj.data.map((item) => ({
    id: getId(item.ref),
    ...item.data,
  }));

  const { before, after } = getCursors(pageObj);
  console.log({ before, after });

  return { data: items, before, after };
};

/*
exports.getItems = async ({ collection, limit, before, after }) => {
  // populate: pageConfig
  const pageConfig = {};
  if (limit) pageConfig.size = Number(limit);
  if (before) pageConfig.before = [q.Ref(q.Collection("users"), before)];
  if (after) pageConfig.after = [q.Ref(q.Collection("users"), after)];
  // console.log("getItems: pageConfig", pageConfig);

  // getAllDocRefs: pageObj: Query:
  const getAllDocRefsPageQuery = q.Paginate(
    q.Match(q.Index("all_users")),
    pageConfig
  );
  const docRefsPage = await fdbClient.query(getAllDocRefsPageQuery);
  // console.log("getItems: docRefsPage", docRefsPage);

  // get: eachDocData -byRef:
  const getAllDocDataByRefQuery = docRefsPage.data.map((ref) => q.Get(ref)); // docRefsPageObj.data.map((docRef) => GetDoc(docRef));
  const dbItems = await fdbClient.query(getAllDocDataByRefQuery);
  // console.log("getItems: dbItems", dbItems);

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
