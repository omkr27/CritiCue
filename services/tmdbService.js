const { axiosInstance } = require("../lib/axios");
const { Movie } = require("../models");
const axios = require("axios");
const axiosRetry = require("axios-retry").default; // axios-retry package for retry logic
require("dotenv").config();

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

async function getActors(movieId) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
      {
        params: {
          api_key: process.env.API_KEY,
        },
      }
    );

    const actors = response.data.cast
      .filter((actor) => actor.known_for_department === "Acting")
      .map((actor) => actor.name)
      .join(", ");

    return actors;
  } catch (error) {
    console.error("Error fetching actors:", error.message);
    return "";
  }
}
async function searchMovie(query) {
  try {
    const response = await axios.get(process.env.TMDB_URL, {
      params: {
        query,
        api_key: process.env.API_KEY,
      },
    });

    console.log("response:", response);

    const movies = await Promise.all(
      response.data.results.map(async (movie) => {
        console.log("response.data.results:", response.data.results);
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

module.exports = { searchMovie };
