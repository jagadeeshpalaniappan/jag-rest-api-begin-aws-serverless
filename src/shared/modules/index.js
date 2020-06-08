let { gql } = require("apollo-server-lambda");

// common:
const commonTypeDefs = require("./common/typeDefs");
const commonResolvers = require("./common/resolvers");

// user:
const userTypeDefs = require("./user/typeDefs");
const userResolvers = require("./user/resolvers");

// post:
const postTypeDefs = require("./post/typeDefs");
const postResolvers = require("./post/resolvers");

// todo:
const todoTypeDefs = require("./todo/typeDefs");
const todoResolvers = require("./todo/resolvers");

const baseTypeDefs = gql`
  type Query {
    hello: String
  }
  type Mutation {
    _: Int
  }
`;
const typeDefs = [
  baseTypeDefs,
  commonTypeDefs,
  userTypeDefs,
  postTypeDefs,
  todoTypeDefs,
];

const resolvers = {
  Query: {
    hello: () => "Hello Jag!",
    ...commonResolvers.Query,
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...todoResolvers.Query,
  },
  Mutation: {
    ...commonResolvers.Mutation,
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...todoResolvers.Mutation,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  Todo: todoResolvers.Todo,
};

module.exports = { typeDefs, resolvers };
