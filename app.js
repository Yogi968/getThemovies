const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () => {
      console.log("server started at http://localhost:3009/");
    });
  } catch (e) {
    console.log(`DB error :${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//api 1 get all the movies from the movie table
app.get("/movies/", async (request, response) => {
  const getAllTheMoviesQuery = `SELECT movie_name FROM movie;`;
  const dbResponse = await db.all(getAllTheMoviesQuery);
  response.send(dbResponse);
});

//api 2 Creates a new movie in the movie table.
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetailsQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
                                VALUES(${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieDetailsQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//api 3 get the particular movie details
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(dbResponse);
});

//api 4 Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateTheMovieDetailsQuery = `UPDATE movie 
    SET  director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
    WHERE movie_id=${movieId};`;
  await db.run(updateTheMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//api Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetailsQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieDetailsQuery);
  response.send("Movie Removed");
});

//api 6 Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getAllTheDirectorDetails = `SELECT * FROM director;`;
  const dbResponse = await db.all(getAllTheDirectorDetails);
  response.send(dbResponse);
});

//api 7 Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMovieNamesDirectedBySpecificDirector = `
    SELECT movie.movie_name FROM movie INNER JOIN director ON movie.director_id==director.director_id
    WHERE movie.director_id=${directorId};`;
  const dbResponse = await db.all(getAllMovieNamesDirectedBySpecificDirector);
  response.send(dbResponse);
});

module.exports = app;
