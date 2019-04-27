import { ApolloServer, gql } from "apollo-server";
import { useMockDB } from 'workshop-graphql-data-uploader';

useMockDB().then(async dbClient => {
  const allMovies = await dbClient.collection('movies').get();
  console.log('Movies total: ', allMovies.docs.length);

  // STEP 1:
  // Create baseTypes
  // Create empty resolver
  // Create ApolloServer

  // Every GraphQL needs `type Query`
  const baseTypes = gql`
    type Query
  `;

  // STEP 2:
  // Create movieTypes { id, title }
  // - Query movies, and resolve movies
  // - Type Movie { id, title }
  // - movies Query resolver
  // - define ApolloServer `movieService` context 
  // - add type definitions for all properties
  const movieTypes = gql`
  type Movie {
    id: ID!
    title: String!
  }

  # // STEP 4:
  # // Add movie Query to movieTypes
  # // - Query movie by Id
  # // - Check in playground
  extend type Query {
    movies: [Movie!]
    movie(id: ID!): Movie
  }
  `;

  // Array of all type definitions that the server has
  // resolvers: Query contains all the possible queries you can ask of the server
  const server = new ApolloServer({
  typeDefs: [baseTypes, movieTypes],
  context: {
    dbClient
  },
  resolvers: {
    Query: {
      movies: async (obj, params, context) => {
        const result = await context.dbClient.collection('movies').get();
        return result.docs.map(x => x.data());
      },
      movie: async (obj, params, context: {dbClient: firebase.firestore.Firestore }) => {
        const result = await context.dbClient.collection('movies').doc(params.id).get();
        return result.data();
      }
    }
  }
  });

  // STEP 3:
  // Run app and check GraphiQL playground
  /*
    Make queries using
    {
      movies {
        id
        title
      }
    }
  */

  server.listen();
});

// STEP 5:
// Add keywords to Movie type
// - define Type Keywords, and add keywords to Movie Type
// - resolve keywords in Movie Type
// - Check in playground

// STEP 6:
// Add rating Mutation
// - define setRating Mutation and it's input and payload
// - Add resolver

// STEP 7:
// Add rating Query
// - define movieUserRating Query and it's input and payload
// - Add resolver

// STEP 8:
// Add dataLoader