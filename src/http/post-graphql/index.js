let arc = require("@architect/functions");
let { ApolloServer, gql } = require("apollo-server-lambda");

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

const dbAuthors = [
  {
    id: "a1",
    name: "Author1",
  },
  {
    id: "a2",
    name: "Author2",
  },
  {
    id: "a3",
    name: "Author3",
  },
];

const dbPosts = [
  {
    id: "p1",
    title: "Post1",
    authorId: "a3",
  },
  {
    id: "p2",
    title: "Post2",
    authorId: "a1",
  },
  {
    id: "p3",
    title: "Post3",
    authorId: "a3",
  },
  {
    id: "p4",
    title: "Post4",
    authorId: "a2",
  },
];

let resolvers = {
  Query: {
    hello: () => "Hello Jag!",
    authors: () => {
      console.log(dbAuthors);
      return dbAuthors.map((author) => {
        const posts = dbPosts.filter((post) => post.authorId === author.id);
        return { ...author, posts };
      });
    },
    posts: () => {
      return dbPosts.map((post) => {
        const author = dbAuthors.find((author) => author.id === post.authorId);
        return { ...post, author };
      });
    },
  },
  Mutation: {
    addAuthor: (parent, args) => {
      const { name } = args;
      const newAuthor = { id: `a${dbAuthors.length + 1}`, name };
      dbAuthors.push(newAuthor);
      console.log(dbAuthors);
      return newAuthor;
    },
    addPost: (parent, args) => {
      const { title, authorId } = args;
      const newPost = { id: `a${dbPosts.length + 1}`, title, authorId };
      dbPosts.push(newPost);
      console.log(dbPosts);
      const author = dbAuthors.find((author) => author.id === authorId);
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
