@app
begin-app

@http
get /gql/api/v1/graphql
post /gql/api/v1/graphql

get /rest/api/v1/:collection
get /rest/api/v1/:collection/:id
post /rest/api/v1/:collection


@tables
data
  scopeID *String
  dataID **String
  ttl TTL
