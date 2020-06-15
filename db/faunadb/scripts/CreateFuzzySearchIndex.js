const faunadb = require("faunadb");
const q = faunadb.query;
const {
  CreateIndex,
  Collection,
  Exists,
  If,
  Index,
  Delete,
  Lambda,
  Var,
  Query,
  Length,
  Select,
  Subtract,
  Let,
  NGram,
  LowerCase,
  Filter,
  GT,
  Union,
  Distinct,
  Paginate,
  Match,
  Map,
  Get,
} = q;

function GenerateNgrams(Phrase) {
  return Distinct(
    Union(
      Let(
        {
          // Reduce this array if you want less ngrams per word.
          indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          indexesFiltered: Filter(
            Var("indexes"),
            // filter out the ones below 0
            Lambda("l", GT(Var("l"), 0))
          ),
          ngramsArray: q.Map(
            Var("indexesFiltered"),
            Lambda("l", NGram(LowerCase(Var("Phrase")), Var("l"), Var("l")))
          ),
        },
        Var("ngramsArray")
      )
    )
  );
}

function GenerateWordParts(inputWord) {
  return Distinct(
    Let(
      {
        indexes: q.Map(
          // Reduce this array if you want less ngrams per word.
          // Setting it to [ 0 ] would only create the word itself, Setting it to [0, 1] would result in the word itself
          // and all ngrams that are one character shorter, etc..
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          Lambda("eachIdx", Subtract(Length(inputWord), Var("eachIdx"))) // for 'smallerText' there might be negative vals generated, will cleanup in step2
        ),
        indexesFiltered: Filter(
          Var("indexes"),
          Lambda("eachIdx", GT(Var("eachIdx"), 0)) // cleanup: filter out negative indexes
        ),
        ngramsArray: q.Map(
          Var("indexesFiltered"),
          Lambda(
            "eachIdx",
            NGram(LowerCase(inputWord), Var("eachIdx"), Var("eachIdx"))
          )
        ),
      },
      Var("ngramsArray")
    )
  );
}

/* Finally, if we need the binding to be different depending on the collection
 * we can do that as well. In this case we are not using this example since this type of
 * index does not build instantly (other indexes that are < 128 entities build instantly,
 * but ranging over multiple collections like this is a special case)]
 * (this delay might make people think the app is broken when they launch it themselves)
 */

const INDEX_NAME = "users_fuzzySearch_by_wordparts_s_111";

const createUsersFuzzySearchByWrdpartsIndex = CreateIndex({
  name: INDEX_NAME,

  source: [
    {
      collection: Collection("users"),

      // BINDINGS: (computedFields)
      fields: {
        strLength: Query(
          Lambda("user", Length(Select(["data", "name"], Var("user")))) // name: leng
        ),
        wordparts: Query(
          Lambda(
            "user",
            Union(
              // We'll search both on the name as the 'username'.
              Union(GenerateWordParts(Select(["data", "name"], Var("user")))),
              Union(
                GenerateWordParts(Select(["data", "username"], Var("user")))
              )
            )
          )
        ),
      },
    },
  ],

  // SEARCH-TERMS:
  terms: [
    {
      binding: "wordparts",
    },
  ],

  // SORTED-VALUES: (order is important)
  // if we provided 'ref' first, then it will be sorted by 'ref' first, then 'strLength'
  // so first wanted to search by 'strLength', then 'ref'
  values: [
    // { binding: "wordparts" }, // we do not need to sort by 'wordparts' // 'wordparts' are only required to match 'search' criteria // DONT-DO-THIS
    { binding: "strLength" }, // we actually want to sort the 'strLength' -asc // so that we can get the shortest word that matches first
    { field: ["ref"] },
  ],

  // serialized is not necessary (unless we care about 'consistency' in search)
  // new or updated records should immediately available in search
  serialized: false,
});

async function createSearchIndexes(client) {
  console.log("createSearchIndexes: START");
  let resp;
  try {
    resp = await client.query(
      If(Exists(Index(INDEX_NAME)), true, createUsersFuzzySearchByWrdpartsIndex)
    );

    console.log(resp);
  } catch (err) {
    console.error(err);
  }

  console.log("createSearchIndexes: END");
  return resp;
}

async function deleteSearchIndexes(client) {
  console.log("deleteSearchIndexes: START");
  let resp;
  try {
    resp = await client.query(
      If(Exists(Index(INDEX_NAME)), true, Delete(Index(INDEX_NAME)))
    );
    console.log(resp);
  } catch (err) {
    console.error(err);
  }

  console.log("deleteSearchIndexes: END");
  return resp;
}

async function fuzzySearch(client, keyword) {
  console.log("fuzzySearchIndex: START", keyword);
  let resp;
  try {
    resp = await client.query(
      Let(
        {
          pages: Paginate(Match(Index(INDEX_NAME), LowerCase(keyword)), {
            size: 10,
          }),
          docRefs: Map(Var("pages"), Lambda(["strLen", "ref"], Var("ref"))),
        },
        Map(Var("docRefs"), Lambda("eachRef", Get(Var("eachRef"))))
      )
    );
    console.log("SEARCH-RESULTS");
    console.log(JSON.stringify(resp, null, 2));
  } catch (err) {
    console.error(err);
  }
  console.log("fuzzySearchIndex: END");
  return resp;
}

module.exports = { createSearchIndexes, deleteSearchIndexes, fuzzySearch };
