import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  server: {
    port: process.env.PORT || 5000,
    allowedOrigins: process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : [],
  },
  mail: {
    service: process.env.MAIL_SERVICE || 'gmail',
    username: process.env.MAIL_USERNAME || '',
    password: process.env.MAIL_PASSWORD || '',
  },
};
