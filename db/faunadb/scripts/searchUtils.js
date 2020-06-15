const faunadb = require("faunadb");
const q = faunadb.query;
const faunadbLib = require("faunadb-fql-lib");
const xq = faunadbLib.query;

// strategy: SplitIntoWords
function SplitIntoWords(string, delimiter = " ") {
  return q.If(
    q.Not(q.IsString(string)),
    q.Abort("SplitString only accept strings"),
    q.Map(
      q.FindStrRegex(q.LowerCase(string), q.Concat(["[^\\", delimiter, "]+"])),
      q.Lambda("res", q.Select(["data"], q.Var("res")))
    )
  );
}

function GenerateAllStrKeywords(user, searchKeys) {
  const keys =
    searchKeys && searchKeys.length
      ? searchKeys
      : xq.ObjectKeys(q.Select(["data"], user));

  const values = q.Map(
    keys,
    q.Lambda("key", q.Select(["data", q.Var("key")], user))
  );
  const valuesStrOnly = q.Filter(
    values,
    q.Lambda("v", q.Or(q.IsString(q.Var("v")), q.IsNumber(q.Var("v"))))
  );
  const keywordsArr = q.Map(
    valuesStrOnly,
    q.Lambda("value", SplitIntoWords(q.ToString(q.Var("value"))))
  );
  return q.Distinct(q.Union(keywordsArr));
}

module.exports = { GenerateAllStrKeywords, SplitIntoWords };
