import express from 'express';
import cors from 'cors';
import { emailRouter } from './routes/email-route';
import { config } from './config';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (origin && config.server.allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/email', emailRouter);

export default app;
