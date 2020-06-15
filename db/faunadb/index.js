require("dotenv").config();
const faunadb = require("faunadb");
const q = faunadb.query;
const {
  createCollection,
  createDefaultIndex,
  createSortedIndex,
  createSearchableIndex,
  createSearchableSortedIndex,
} = require("./scripts/schema");
// console.log(`###${process.env.FAUNADB_SERVER_SECRET}###`);
var client = new faunadb.Client({ secret: process.env.FAUNADB_SERVER_SECRET });

const anyConfig = {
  users: {
    collection: "users",
    defaultIndex: "users_idx",
    defaultSearchIndex: "users_idx_searchable",
    sortIndex: {
      name: "users_idx_sortby@name",
      username: "users_idx_sortby@username",
      created: "users_idx_sortby@created", // TODO:
    },
    searchAndSortIndex: {
      name: "users_idx_searchable_sortby@name",
      username: "users_idx_searchable_sortby@username",
      created: "users_idx_searchable_sortby@created", // TODO:
    },
  },
};

async function main() {
  try {
    // await createCollection({ client, name: "users" });
    /* 
    await createDefaultIndex({
      client,
      name: "users_idx",
      collectionName: "users",
    });
     */
    /* 
    await createSortedIndex({
      client,
      collectionName: "users",
      name: "users_idx_sortby@name",
      sortField: ["data", "name"],
    });
    */
    /* 
    await createSortedIndex({
      client,
      collectionName: "users",
      name: "users_idx_sortby@username",
      sortField: ["data", "username"],
    });
    */
    /* 
    await createSearchableIndex({
      client,
      collectionName: "users",
      name: "users_idx_searchable",
    });
     */
    /* 
    await createSearchableSortedIndex({
      client,
      collectionName: "users",
      name: "users_idx_searchable_sortby@name",
      sortField: ["data", "name"],
    });
     */
    await createSearchableSortedIndex({
      client,
      collectionName: "users",
      name: "users_idx_searchable_sortby@username",
      sortField: ["data", "username"],
    });
  } catch (e) {
    console.log("##ERROR##");
    console.log(e);
  }
}

main();
