import { config } from "dotenv";

config({path: '../.env'});

const appConfig = {
  xata: {
    branch: process.env.XATA_BRANCH,
    apiKey: process.env.XATA_API_KEY,
    databaseUrl: process.env.XATA_DATABASE_URL,
  }
};

export default appConfig;
