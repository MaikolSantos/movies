import express, { Application, json } from "express";
import { startDatabase } from "./database";
import { createMovie, deleteMovies, readMovies, updateMovies } from "./logic";
import { checkMovieExists, checkNameExistis } from "./middlewares";

const app: Application = express();
app.use(json());

app.post("/movies", createMovie);
app.get("/movies", readMovies);
app.patch("/movies/:id", checkMovieExists, checkNameExistis, updateMovies);
app.delete("/movies/:id", checkMovieExists, deleteMovies);

const PORT: number = 3000;
app.listen(PORT, async () => {
  startDatabase();
  console.log(`The server is ruinning in http://localhost:${PORT}`);
});
