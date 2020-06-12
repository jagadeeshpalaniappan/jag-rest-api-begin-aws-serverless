require("dotenv").config();
const faunadb = require("faunadb");
const q = faunadb.query;
const {
  createSearchIndexes,
  fuzzySearch,
} = require("./CreateFuzzySearchIndex");

const FAUNADB_ADMIN_SECRET = process.env.FAUNADB_ADMIN_SECRET;
var client = new faunadb.Client({ secret: FAUNADB_ADMIN_SECRET });

// console.log({ FAUNADB_ADMIN_SECRET });

function main() {
  try {
    // createSearchIndexes(client);
    fuzzySearch(client, "one");
  } catch (err) {
    console.error(err);
  }
}
main();
