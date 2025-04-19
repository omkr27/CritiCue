const { axiosInstance } = require("../lib/axios");
const { movie } = require("../models");
const axios = require("axios");

require("dotenv").config();

//Get actors for a specific movie from TMDB
async function getActors(movieId) {
  try {
    // Fetch cast information from TMDB
    const response = await axiosInstance.get(`/movie/${movieId}/credits`);
    // Filter for only "Acting" department and get names
    const actors = response.data.cast
      .filter((actor) => actor.known_for_department === "Acting")
      .map((actor) => actor.name)
      .join(", ");

    return actors;
  } catch (error) {
    console.error("Error fetching actors:", error.message);
    return ""; // Return empty string on error
  }
}
async function searchMovie(query) {
  try {
    // Call TMDB search/movie endpoint
    const response = await axiosInstance.get("/search/movie", {
      params: { query }, // The query parameter passed from the request URL
    });

    console.log("response:", response);
    //Map over search results and add actors info to it
    const movies = await Promise.all(
      response.data.results.map(async (movie) => {
        //console.log("response.data.results:", response.data.results);
        const actors = await getActors(movie.id);
        return {
          title: movie.title,
          tmdbId: movie.id,
          genre: movie.genre_ids.join(", "),
          actors,
          releaseYear: new Date(movie.release_date).getFullYear(),
          rating: movie.vote_average,
          description: movie.overview,
        };
      })
    );
    return { movies };
  } catch (error) {
    // console.error("Error searching movies: ", error.message);
    // throw new Error(error.message);
    console.error(
      "TMDB API Error:",
      error.response?.data || error.message || error
    );
    throw new Error(
      error.response?.data?.status_message ||
        error.message ||
        "Unknown TMDB error"
    );
  }
}

//Check if a movie already exists in the local DB
async function movieExistsInDB(tmdbId) {
  try {
    const existingMovie = await movie.findOne({
      where: { tmdbId },
    });
    return existingMovie ? true : false;
  } catch (error) {
    console.error("error checking if movie exists:", error.message);
    throw new Error(error.message);
  }
}

//Fetch movie & cast from TMDB and save to local DB
async function fetchMovieAndCastDetails(tmdbId) {
  try {
    //get full movie details from TMDB
    const movieDetails = await axiosInstance.get(`/movie/${tmdbId}`);

    //get cast info for the same movie
    const castDetails = await axiosInstance.get(`/movie/${tmdbId}/credits`);

    //extract top 5 actor names from the cast
    const actors = castDetails.data.cast
      .filter((actor) => actor.known_for_department === "Acting")
      .slice(0, 5)
      .map((actor) => actor.name)
      .join(", ");

    //extract genre names
    const genre = movieDetails.data.genres
      .map((genre) => genre.name)
      .join(", ");

    //save movie to the database
    const savedMovie = await movie.create({
      title: movieDetails.data.title,
      tmdbId: movieDetails.data.id,
      genre,
      actors,
      releaseYear: new Date(movieDetails.data.release_date).getFullYear(),
      rating: movieDetails.data.vote_average,
      description: movieDetails.data.overview,
    });
    return savedMovie;
  } catch (error) {
    console.error("Error fetching movie details services: ", error.message);
    throw new Error(error.message);
  }
}

module.exports = { searchMovie, movieExistsInDB, fetchMovieAndCastDetails };
