import { config } from "dotenv";

config({path: '../.env'});

const appConfig = {
  xata: {
    branch: process.env.XATA_BRANCH,
    apiKey: process.env.XATA_API_KEY,
    databaseUrl: process.env.XATA_DATABASE_URL,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY || 'NEED_SECRET_KEY',
  }
};

export default appConfig;
