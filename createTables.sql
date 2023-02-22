CREATE TABLE movies (
	id SERIAL PRIMARY KEY,
	name VARCHAR (50) UNIQUE NOT NULL,
	description TEXT,
	duration INTEGER NOT NULL,
	price INTEGER NOT NULL 
);

SELECT * FROM movies

INSERT INTO "movies"
  (name, description, duration, price)
VALUES
  ('teste', 'teste', 1, 50)
RETURNING *

UPDATE
  movies
SET (%I) = ROW(%L)
WHERE
  id = $1
RETURNING *;

DELETE FROM
  movies
WHERE
  id = $1
