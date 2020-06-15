const db = require("@architect/shared/modules/any/dao");

exports.handler = async function items(req) {
  const { collection } = req.pathParameters;
  const { search, sort, pageSize, pageCursor, pageBefore, pageAfter } =
    req.queryStringParameters || {};
  console.log(`GET: /v1/${collection}`);
  console.log({ search, sort, pageSize, pageCursor, pageBefore, pageAfter });

  // let data = await db.getItems({ collection });
  const page = {
    limit: pageSize,
    // cursor: pageCursor,  // TODO
    before: pageBefore,
    after: pageAfter,
  };
  // const input = { search: "Hello", sort: "username", page };
  const input = { search, sort, page };
  let data = await db.getItems({ anyCollection: collection, input });

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf8",
      "cache-control":
        "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
    },
    body: JSON.stringify({ [collection]: data }),
  };
};
