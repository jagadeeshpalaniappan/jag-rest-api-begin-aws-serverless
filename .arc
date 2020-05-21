@app
begin-app

@http
get /graphql
post /graphql

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
