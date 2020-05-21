let arc = require("@architect/functions");
let { ApolloServer, gql } = require("apollo-server-lambda"); // TODO: we just need 'graphql-playground' here // not apollo

let typeDefs = gql`
  type Query {
    test: String
  }
`;

let server = new ApolloServer({ typeDefs, resolvers: {} });
exports.handler = server.createHandler();
