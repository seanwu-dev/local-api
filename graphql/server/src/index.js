import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import schema from './schema/index.js';
import resolvers from './resolvers/index.js';
import { readDB } from 'server/src/dbController.js';

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    db: {
      messages: readDB('messages'),
      users: readDB('users'),
    },
  },
});

const app = express();
await server.start();

/*app.use(express.urlencoded({ extended: true }));
app.use(express.json());*/

/*app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);*/

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: {
    origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
    credentials: true,
  },
});

/*app.get('/', (req, res) => {
  res.send('ok');
});

const routes = [...messageRoute, ...userRoute];
routes.forEach(({ method, route, handler }) => {
  app[method](route, handler);
});*/

await app.listen({ port: 8000 });
console.log('Server listening on 8000...');
