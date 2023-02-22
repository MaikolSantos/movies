import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { iMovieRequiredKeys, iMovieResult } from "./interfaces";

const validateMovies = (payload: any) => {
  const payloadKeys = Object.keys(payload);
  const requiredKeys: iMovieRequiredKeys[] = ["name", "duration", "price"];
  const joinedKeys = requiredKeys.join(", ");

  const keysMissing: boolean = requiredKeys.every((key: string) =>
    payloadKeys.includes(key)
  );

  if (!keysMissing) throw new Error(`Require keys: ${joinedKeys}`);
  

  const keysRemain: boolean = payloadKeys.every((key: any) => {
    if (key === "description") {
      return true
    }
    
    return requiredKeys.includes(key); 
  });

  if (!keysRemain) throw new Error(`Require only the keys: ${joinedKeys}`);

  const okTypes: boolean =
    typeof payload.name === "string" &&
    typeof payload.duration === "number" &&
    typeof payload.price === "number";

  if (!okTypes) throw new Error("Some key with wrong type");

  return payload;
};

const validateUpdateKeys = (payload: any) => {
  const payloadKeys = Object.keys(payload);
  const requiredKeys: iMovieRequiredKeys[] = [
    "name",
    "description",
    "duration",
    "price",
  ];
  const joinedKeys = requiredKeys.join(", ");

  const verifyKeys = payloadKeys.every((key: any) => {
    return !requiredKeys.includes(key);
  });

  if (verifyKeys) throw new Error(`Only keys are allowed: ${joinedKeys}`);

  return payload;
};

const createMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const body = validateMovies(request.body);

    const queryString = format(
      `
        INSERT INTO "movies"
          (%I)
        VALUES
          (%L)
        RETURNING *
      `,
      Object.keys(body),
      Object.values(body)
    );

    const queryResult: iMovieResult = await client.query(queryString);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error.message.includes("unique")
        ? response.status(409).json({ message: "Movie already exists." })
        : response.status(400).json({ message: error.message });
    }

    console.log(error);

    return response.status(500).json({ message: error });
  }
};

const readMovies = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const page: number = Number(request.query.page) || 1;
    const perPage: number =
      Number(request.query.perPage) <= 0
        ? 5
        : Number(request.query.perPage) || 5;

    const sort = request.query.sort;
    const order =
      request.query.order === "asc" || request.query.order === "desc"
        ? request.query.order
        : "asc";

    const queryString = `
        SELECT 
          *
        FROM
          movies
        ${
          sort === "duration" || sort === "price"
            ? `ORDER BY ${sort} ${order}`
            : ""
        }
        OFFSET $1 LIMIT $2
      `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [perPage * (page - 1), perPage],
    };

    const queryResult: iMovieResult = await client.query(queryConfig);

    const testNextPageConfig: QueryConfig = {
      text: queryString,
      values: [perPage * page, perPage],
    };

    const testNextPageResult: iMovieResult = await client.query(
      testNextPageConfig
    );

    const baseURL = "http://localhost:3000";

    const prevPage =
      page - 1 <= 0 ? null : `${baseURL}?page=${page - 1}&perPage=${perPage}`;

    const nextPage = !testNextPageResult.rowCount
      ? null
      : `${baseURL}?page=${page + 1}&perPage=${perPage}`;

    const readData = {
      prevPage,
      nextPage,
      count: queryResult.rowCount,
      data: queryResult.rows,
    };

    return response.status(200).json(readData);
  } catch (error) {
    return response.status(500).json({ message: error });
  }
};

const updateMovies = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const body = validateUpdateKeys(request.body);
    const id = request.params.id;
    const keys = Object.keys(body);
    const values = Object.values(body);

    const queryString = `
        UPDATE
          movies
        SET (%I) = ROW(%L)
        WHERE
          id = $1
        RETURNING *;
      `;

    const queryFormat: string = format(queryString, keys, values);

    const queryConfig: QueryConfig = {
      text: queryFormat,
      values: [id],
    };

    const queryResult: iMovieResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    return response.status(500).json({ message: error });
  }
};

const deleteMovies = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id = request.params.id;

  const queryString = `
    DELETE FROM
      movies
    WHERE
      id = $1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};

export { createMovie, readMovies, updateMovies, deleteMovies };
