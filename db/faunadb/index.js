require("dotenv").config();
const faunadb = require("faunadb");
const q = faunadb.query;
const { logger } = faunadb.clientLogger;

const {
  createCollection,
  createDefaultIndex,
  createSortedIndex,
  createFilterableIndex,
  createSearchableIndex,
  createSearchableSortedIndex,
  createAdvSearchBySort,
  createJagIndex,
} = require("./scripts/schema");
// console.log(`###${process.env.FAUNADB_SERVER_SECRET}###`);
var client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
  // observer: logger(console.log),
});

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
    filterIndex: {
      sex: "users_idx_filterby@sex",
      role: "users_idx_filterby@role",
      isActive: "users_idx_filterby@isActive",
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
    // await createFilterableIndex({
    //   client,
    //   collectionName: "users",
    //   name: "users_idx_filterby@sex",
    //   filterField: ["data", "sex"],
    // });
    // await createFilterableIndex({
    //   client,
    //   collectionName: "users",
    //   name: "users_idx_filterby@role",
    //   filterField: ["data", "role"],
    // });
    // await createFilterableIndex({
    //   client,
    //   collectionName: "users",
    //   name: "users_idx_filterby@isActive",
    //   filterField: ["data", "isActive"],
    // });
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
    /* 
    await createSearchableSortedIndex({
      client,
      collectionName: "users",
      name: "users_idx_searchable_sortby@username",
      sortField: ["data", "username"],
    });
     */
    const searchConfig = {
      enableFuzzySearch: true,
      fuzzySearchFields: [],
      exactSearchFields: ["role", "sex", "isActive"], // filters
    };
    await createAdvSearchBySort({
      client,
      collectionName: "users",
      name: "users_idx_advsearch_sortby@created",
      sortField: ["ts"],
      searchConfig,
    });

    // -------------------jtry-----------------------
    // await createJagIndex({
    //   client,
    //   collectionName: "users",
    //   name: "jag1_sortby@username",
    //   sortField: ["data", "username"],
    // });
  } catch (e) {
    console.log("##ERROR##");
    console.log(e);
  }
}

main();
