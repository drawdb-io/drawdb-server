import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  PORT: process.env.PORT || 5000,
};
