let arc = require("@architect/functions");
const db = require("@architect/shared/modules/any/dao");

exports.handler = async function post(req) {
  const { collection, id } = req.pathParameters;
  let body = arc.http.helpers.bodyParser(req); // Base64 decodes + parses body
  body.created = body.created || Date.now();
  const data = await db.addItem({ collection, item: body });
  const oneCollection = collection.slice(0, collection.length - 1);
  const resBody = { [oneCollection]: data };
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
