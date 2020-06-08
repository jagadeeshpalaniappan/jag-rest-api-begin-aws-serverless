const db = require("@architect/shared/modules/any/dao");

exports.handler = async function items(req) {
  const { collection } = req.pathParameters;
  const { limit, cursor } = req.queryStringParameters || {};
  console.log(`GET: /v1/${collection}`);
  console.log({ limit, cursor });

  // let data = await db.getItems({ collection });
  let data = await db.getItemsPagination({ collection, limit, cursor });

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf8",
      "cache-control":
        "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
    },
    body: JSON.stringify({ data: { [collection]: data } }),
  };
};
