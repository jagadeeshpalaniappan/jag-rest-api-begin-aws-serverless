const faunadb = require("faunadb");
const q = faunadb.query;
const { GenerateAllStrKeywords } = require("./searchUtils");

// CREATE: Collection
async function createCollection({ client, name }) {
  const fql = q.CreateCollection({ name });
  const resp = await client.query(fql);
  console.log(resp);
  return resp;
}

// CREATE: INDEX (with no config)
async function createDefaultIndex({ client, name, collectionName }) {
  const fql = q.CreateIndex({
    name,
    source: q.Collection(collectionName),
  });
  const resp = await client.query(fql);
  console.log(resp);
  return resp;
}

async function createSortedIndex({ client, name, collectionName, sortField }) {
  const fql = q.CreateIndex({
    name,
    source: q.Collection(collectionName),
    values: [{ field: sortField }, { field: ["ref"] }],
  });
  const resp = await client.query(fql);
  console.log(resp);
  return resp;
}

async function createSearchableIndex({ client, name, collectionName }) {
  const fql = q.CreateIndex({
    name,
    source: {
      collection: q.Collection(collectionName),
      // bindings: generateKeywords
      fields: {
        searchKeywords: q.Query(
          q.Lambda("eachDoc", GenerateAllStrKeywords(q.Var("eachDoc")))
        ),
      },
    },
    terms: [{ binding: "searchKeywords" }], // searchTerms
  });
  const resp = await client.query(fql);
  console.log(resp);
  return resp;
}

async function createSearchableSortedIndex({
  client,
  name,
  collectionName,
  sortField,
}) {
  const fql = q.CreateIndex({
    name,
    source: {
      collection: q.Collection(collectionName),
      // bindings: generateKeywords
      fields: {
        searchKeywords: q.Query(
          q.Lambda("eachDoc", GenerateAllStrKeywords(q.Var("eachDoc")))
        ),
      },
    },
    terms: [{ binding: "searchKeywords" }], // searchTerms
    values: [{ field: sortField }, { field: ["ref"] }],
  });
  const resp = await client.query(fql);
  console.log(resp);
  return resp;
}

module.exports = {
  createCollection,
  createDefaultIndex,
  createSortedIndex,
  createSearchableIndex,
  createSearchableSortedIndex,
};
