const faunadb = require("faunadb");
const q = faunadb.query;
const { GenerateAllStrKeywords, GetArrWithWildcard } = require("./searchUtils");

const getBindingFields = (searchConfig) => {
  const {
    enableFuzzySearch,
    fuzzySearchFields,
    exactSearchFields,
  } = searchConfig;
  const fields = {};

  // FUZZY-SEARCH: TODO: pass 'fuzzySearchFields' to 'GenerateAllStrKeywords'
  if (enableFuzzySearch) {
    fields.searchKeywords = q.Query(
      q.Lambda("eachDoc", GenerateAllStrKeywords(q.Var("eachDoc")))
    );
  }

  // EXACT-SEARCH:
  for (let i = 0, len = exactSearchFields.length; i < len; i++) {
    const searchField = exactSearchFields[i];
    fields[searchField] = q.Query(
      q.Lambda(
        "eachDoc",
        GetArrWithWildcard(q.Select(["data", searchField], q.Var("eachDoc")))
      )
    );
  }
  return fields;
};

const getSearchTerms = (searchConfig) => {
  const {
    enableFuzzySearch,
    fuzzySearchFields,
    exactSearchFields,
  } = searchConfig;

  const searchTerms = [];
  if (enableFuzzySearch) {
    searchTerms.push({ binding: "searchKeywords" });
  }
  const exactSearchTerms = exactSearchFields.map((searchField) => ({
    binding: searchField,
  }));
  const all = [...searchTerms, ...exactSearchTerms];
  return all;
};

const getSortValues = (sortField) => {
  return sortField ? [{ field: sortField }, { field: ["ref"] }] : null;
};

async function createAdvSearchBySort({
  client,
  name,
  collectionName,
  sortField,
  searchConfig,
}) {
  const bindingFields = getBindingFields(searchConfig);
  const searchTerms = getSearchTerms(searchConfig);
  const sortValues = getSortValues(sortField);
  const fql = q.CreateIndex({
    name,
    source: {
      collection: q.Collection(collectionName),
      fields: bindingFields, //bindings: computedVals
    },
    terms: searchTerms,
    values: sortValues,
  });

  console.log(fql);
  const resp = await client.query(fql);
  console.log(resp);
  return resp;
}

module.exports = { createAdvSearchBySort };
