import app from './app';
import { config } from './config';

app.listen(config.server.port, () => {
  console.log(`Server is running on http://localhost:${config.server.port}`);
});
