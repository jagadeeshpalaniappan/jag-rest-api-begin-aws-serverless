let db = require("@architect/shared/db-crud");

exports.handler = async function items(req) {
  const { collection, id } = req.pathParameters;
  let data = await db.getItem({ collection, id });

  // return oneItem: convert collectionName into singular
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
