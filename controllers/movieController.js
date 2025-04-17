const {
  searchMovie,
  movieExistsInDB,
  fetchMovieAndCastDetails,
} = require("../services/tmdbService");
const {
  movie,
  watchlist,
  wishlist,
  review,
  curatedListItem,
} = require("../models");
const { Op, where } = require("sequelize");

//controller function to handle search movies using TMDB API
const searchMovies = async (req, res) => {
  const { query } = req.query; // Extract 'query' from URL

  // If no query provided, return error
  if (!query) {
    return res.status(400).json({ error: "query parameter is required" });
  }

  try {
    // Call service to search movies
    const data = await searchMovie(query);

    // Return the result in JSON format
    return res.status(200).json(data);
  } catch (error) {
    console.error("Full error from controller:", error);
    //console.error("Error from controller", error.message);
    return res
      .status(500)
      .json({ error: error.message || "Unknown error in controller" });
  }
};

// Controller function  to add a movie to the watchlist
const addMovieToWatchList = async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(404).json({ error: "Movie ID is required" });
    }

    let saveMovie;
    const movieExists = await movieExistsInDB(+movieId);

    if (!movieExists) {
      saveMovie = await fetchMovieAndCastDetails(movieId);
    } else {
      saveMovie = await movie.findOne({ where: { tmdbId: movieId } });
    }

    const movieExistsInWatchlist = await watchlist.findOne({
      where: { movieId: saveMovie.id },
    });

    if (movieExistsInWatchlist) {
      return res
        .status(400)
        .json({ error: "Movie already exists in watchlist" });
    }

    await watchlist.create({ movieId: saveMovie.id });
    return res
      .status(200)
      .json({ message: "Movie added to the watchlist successfully. " });
  } catch (error) {
    console.error("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const addMoviesToWishlist = async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(404).json({ error: "Movie ID is required" });
    }

    // Check if the movie exists in DB
    let saveMovie;
    const movieExists = await movieExistsInDB(+movieId);

    if (!movieExists) {
      // Fetch movie details and save to DB
      saveMovie = await fetchMovieAndCastDetails(movieId);
    } else {
      saveMovie = await movie.findOne({ where: { tmdbId: movieId } });
    }

    //check if movie exists in watch list table
    const movieExistsInWatchlist = await wishlist.findOne({
      where: { movieId: saveMovie.id },
    });

    if (movieExistsInWatchlist) {
      return res
        .status(400)
        .json({ error: "Movie already exists in watchlist" });
    }

    // Add movie to watchlist
    await wishlist.create({ movieId: saveMovie.id });
    return res
      .status(200)
      .json({ message: "Movie added to wishlist successfully." });
  } catch (error) {
    console.log("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const addMoviesToCuratedList = async (req, res) => {
  try {
    const { movieId, curatedListId } = req.body;

    if (!movieId || !curatedListId) {
      return res
        .status(404)
        .json({ error: "Movie ID and curated List ID are required" });
    }

    let saveMovie;
    const movieExists = await movieExistsInDB(+movieId);
    console.log("movie", movieExists);

    if (!movieExists) {
      saveMovie = await fetchMovieAndCastDetails(movieId);
    } else {
      saveMovie = await movie.findOne({ where: { tmdbId: movieId } });
    }

    const movieExistsInCuratedList = await curatedListItem.findOne({
      where: { movieId: saveMovie.id, curatedListId },
    });

    if (movieExistsInCuratedList) {
      return res
        .status(400)
        .json({ error: "Movie already exits in curated list" });
    }
    await curatedListItem.create({ movieId: saveMovie.id, curatedListId });
    return res
      .status(200)
      .json({ message: "Movie added to the curated list successfully." });
  } catch (error) {
    console.log("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  searchMovies,
  addMovieToWatchList,
  addMoviesToWishlist,
  addMoviesToCuratedList,
};
