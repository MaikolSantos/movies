import { Client } from "pg";

const client = new Client({
  user: "maikol",
  password: "1234",
  host: "localhost",
  database: "movies",
  port: 5432,
});

const startDatabase = async (): Promise<void> => {
  client.connect();
  console.log("Connected to movies DB");
};

export { client, startDatabase };
