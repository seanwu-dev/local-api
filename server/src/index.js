import express from 'express';
import cors from 'cors';
import messageRoute from './routes/messages.js';
import userRoute from './routes/users.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.get('/', (req, res) => {
  res.send('ok');
});

const routes = [...messageRoute, ...userRoute];
routes.forEach(({ method, route, handler }) => {
  app[method](route, handler);
});

app.listen(8000, () => {
  console.log('Server listening on 8000...');
});
