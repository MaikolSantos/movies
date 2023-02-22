import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { iMovieResult } from "./interfaces";

const checkMovieExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = request.params.id;

  const queryString = `
      SELECT 
        *
      FROM
        movies
      WHERE
        id = $1
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: iMovieResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return response.status(404).json({ message: "Movie not found" });
  }

  next();
};

const checkNameExistis = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const {
    body: { name },
  } = request;

  const queryString = `
    SELECT
     *
    FROM
      movies
    WHERE
      name = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };

  const queryResult: iMovieResult = await client.query(queryConfig);

  if (queryResult.rows[0]) {
    return response.status(409).json({ message: "Movie already exists" });
  }

  next();
};

export { checkMovieExists, checkNameExistis };
