const db = require("@architect/shared/modules/any/dao");
/* 
const getMapToArr = (str, skipValues) => {
  const itemsMap = str && str.length > 0 ? JSON.parse(str) : null;
  let items = [];
  if (itemsMap) {
    const keys = Object.keys(itemsMap);
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      const value = itemsMap[key];
      if (!(skipValues && skipValues.has(value))) {
        items.push({ key, value });
      }
    }
  }
  return items && items.length > 0 ? items : null;
};
 */
exports.handler = async function items(req) {
  const { collection } = req.pathParameters;
  const { search, sort, pageSize, pageCursor, pageBefore, pageAfter, filters } =
    req.queryStringParameters || {};
  console.log(`GET: /v1/${collection}`);
  console.log({ search, sort, pageSize, pageCursor, pageBefore, pageAfter });
  console.log({ filters });
  // const filtersArr = getMapToArr(filters, new Set(["all"]));
  const filtersArr = filters ? JSON.parse(filters) : [];

  // let data = await db.getItems({ collection });
  const page = {
    limit: pageSize,
    // cursor: pageCursor,  // TODO
    before: pageBefore,
    after: pageAfter,
  };

  const filterMap = filtersArr.reduce((res, item) => {
    res[item.key] = item.value;
    return res;
  }, {});
  filterMap.fuzzySearch = search;

  const input = { search, sort, page, filterMap };
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
