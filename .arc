@app
begin-app

@http
get /api/v1/any/:collection
get /api/v1/any/:collection/:id
post /api/v1/any/:collection
put /api/v1/any/:collection/:id
delete /api/v1/any/:collection/:id


@tables
data
  scopeID *String
  dataID **String
  ttl TTL
