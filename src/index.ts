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
    keywords: [Keyword]
  }

  # // STEP 5:
  # // Add keywords to Movie type
  # // - define Type Keywords, and add keywords to Movie Type
  # // - resolve keywords in Movie Type
  # // - Check in playground
  type Keyword {
    id: ID!
    name: String!
  }

  extend type Query {
    movies: [Movie!]

    # // STEP 4:
    # // Add movie Query to movieTypes
    # // - Query movie by Id
    # // - Check in playground
    movie(id: ID!): Movie
  }
  `;

  // STEP 6:
  // Add rating Mutation
  // - define setRating Mutation and it's input and payload
  // - Add resolver
  const ratingTypes = gql`
    type Mutation {
      setRating(setRatingInput: SetRatingInput!): SetRatingPayload
    }

    input SetRatingInput {
      movieId: ID!
      userId: ID!
      score: Int
    }

    type SetRatingPayload {
      message: String
    }
  `

  // Array of all type definitions that the server has
  // resolvers: Query contains all the possible queries you can ask of the server
  const server = new ApolloServer({
  typeDefs: [baseTypes, movieTypes, ratingTypes],
  context: {
    dbClient
  },
  resolvers: {
    /* 
    mutation {
      setRating(setRatingInput: {
        movieId:"1865",
        userId:"testUser",
        score:5
      }),
      {
        message
      }
    }
    */
    Mutation: {
      setRating: (obj, { setRatingInput }, context) => {
        const { movieId, userId, score } = setRatingInput;
        const ratingDocId = userId + ':' + movieId;
        // .set() is an upsert operation
        return context.dbClient
          .collection("ratings")
          .doc(ratingDocId)
          .set({ score })
          .then(() => ({ message: 'success!' }))
          .catch(err => ({ message: err.message }));
        // score is shorthand for score: score
      }
    },
    Movie: {
      // movie is the parent of keyword and guarantees the presence of ID
      keywords: async (movie, params, context) => {
        const movieId = movie.id;
        const result = await context.dbClient
          .collection('keywords')
          .doc(movieId)
          .get();
        return result.data().keywords;
      }
    },
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

// STEP 7:
// Add rating Query
// - define movieUserRating Query and it's input and payload
// - Add resolver

// STEP 8:
// Add dataLoader