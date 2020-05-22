const db = require("@begin/data");

exports.handler = async function items(req) {
  const { collection, id } = req.pathParameters;
  let data = await db.get({ table: collection, key: id });
  const oneCollection = collection.slice(0, collection.length - 1);
  const resBody = { data: { [oneCollection]: data } };
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf8",
      "cache-control":
        "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
    },
    body: JSON.stringify(resBody),
  };
};
