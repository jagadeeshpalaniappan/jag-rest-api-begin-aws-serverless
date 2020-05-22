let db = require("@architect/shared/db-crud");

exports.handler = async function items(req) {
  console.log();
  const { collection } = req.pathParameters;
  let data = await db.getItems({ collection });
  // Return oldest todo first
  const sortedData = data.sort((a, b) => a.created - b.created);
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf8",
      "cache-control":
        "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
    },
    body: JSON.stringify({ data: { [collection]: sortedData } }),
  };
};
