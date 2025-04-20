import express from 'express';
import cors from 'cors';
import { emailRouter } from './routes/email-route';
import { gistRouter } from './routes/gist-route';
import { config } from './config';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.dev
      ? '*'
      : (origin, callback) => {
          if (origin && config.server.allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        },
  }),
);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/email', emailRouter);
app.use('/gists', gistRouter);

export default app;
