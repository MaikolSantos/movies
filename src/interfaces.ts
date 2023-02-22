import { QueryResult } from "pg";

interface iMovieRequest {
  name: string;
  description: string;
  duration: number;
  price: number;
}

type iMovieRequiredKeys = "name" | "description" | "duration" | "price";

interface iMovie extends iMovieRequest {
  id: number;
}

type iMovieResult = QueryResult<iMovie>;

export { iMovie, iMovieRequiredKeys, iMovieRequest, iMovieResult };
