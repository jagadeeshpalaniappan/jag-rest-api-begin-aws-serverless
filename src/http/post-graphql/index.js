let arc = require("@architect/functions");
let { ApolloServer, gql } = require("apollo-server-lambda");

const db = require("../../db");

let typeDefs = gql`
  type Author {
    id: ID!
    name: String
    posts: [Post]
  }

  type Post {
    id: ID!
    title: String
    author: Author
  }

  type Query {
    authors: [Author]
    posts: [Post]
    author(id: ID!): Author
    hello: String
  }
  type Mutation {
    addAuthor(name: String!): Author
    addPost(title: String!, authorId: ID!): Post
  }
`;

let resolvers = {
  Query: {
    hello: () => "Hello Jag!",
    authors: () => {
      return db.authors.map((author) => {
        const posts = db.posts.filter((post) => post.authorId === author.id);
        return { ...author, posts };
      });
    },
    posts: () => {
      return db.posts.map((post) => {
        const author = db.authors.find((author) => author.id === post.authorId);
        return { ...post, author };
      });
    },
  },
  Mutation: {
    addAuthor: (parent, args) => {
      const { name } = args;
      const newAuthor = { id: `a${db.authors.length + 1}`, name };
      db.authors.push(newAuthor);
      return newAuthor;
    },
    addPost: (parent, args) => {
      const { title, authorId } = args;
      const newPost = { id: `a${db.posts.length + 1}`, title, authorId };
      db.posts.push(newPost);
      const author = db.authors.find((author) => author.id === authorId);
      return { ...newPost, author };
    },
  },
};

let server = new ApolloServer({ typeDefs, resolvers });
let handler = server.createHandler();

exports.handler = function (event, context, callback) {
  let body = arc.http.helpers.bodyParser(event);
  // Body is now parsed, re-encode to JSON for Apollo
  event.body = JSON.stringify(body);
  handler(event, context, callback);
};
