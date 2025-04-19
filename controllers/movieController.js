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
    // Movie ID is required
    if (!movieId) {
      return res.status(404).json({ error: "Movie ID is required" });
    }

    let saveMovie;
    // Check if movie already exists in the DB
    const movieExists = await movieExistsInDB(+movieId);

    if (!movieExists) {
      // Fetch from TMDB and save if not present
      saveMovie = await fetchMovieAndCastDetails(movieId);
    } else {
      // Retrieve movie from DB
      saveMovie = await movie.findOne({ where: { tmdbId: movieId } });
    }
    // Check if movie already in watchlist
    const movieExistsInWatchlist = await watchlist.findOne({
      where: { movieId: saveMovie.id },
    });

    if (movieExistsInWatchlist) {
      return res
        .status(400)
        .json({ error: "Movie already exists in watchlist" });
    }
    // Add movie to watchlist
    await watchlist.create({ movieId: saveMovie.id });
    return res
      .status(200)
      .json({ message: "Movie added to the watchlist successfully. " });
  } catch (error) {
    console.error("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};
// Controller to add a movie to the wishlist
const addMoviesToWishlist = async (req, res) => {
  try {
    // Movie ID is required
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(404).json({ error: "Movie ID is required" });
    }

    let saveMovie;
    // Check if movie already exists in DB
    const movieExists = await movieExistsInDB(+movieId);

    if (!movieExists) {
      // Fetch movie details and save to DB
      saveMovie = await fetchMovieAndCastDetails(movieId);
    } else {
      // Get movie from DB
      saveMovie = await movie.findOne({ where: { tmdbId: movieId } });
    }

    // Check if already in wishlist
    const movieExistsInWatchlist = await wishlist.findOne({
      where: { movieId: saveMovie.id },
    });

    if (movieExistsInWatchlist) {
      return res
        .status(400)
        .json({ error: "Movie already exists in watchlist" });
    }

    // Add to wishlist
    await wishlist.create({ movieId: saveMovie.id });
    return res
      .status(200)
      .json({ message: "Movie added to wishlist successfully." });
  } catch (error) {
    console.log("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};
// Controller to add a movie to a curated list
const addMoviesToCuratedList = async (req, res) => {
  try {
    const { movieId, curatedListId } = req.body;
    // Both movieId and curatedListId are required
    if (!movieId || !curatedListId) {
      return res
        .status(404)
        .json({ error: "Movie ID and curated List ID are required" });
    }

    let saveMovie;
    // Check if movie exists in DB
    const movieExists = await movieExistsInDB(+movieId);
    console.log("movie", movieExists);

    if (!movieExists) {
      // Fetch and save if not exists
      saveMovie = await fetchMovieAndCastDetails(movieId);
    } else {
      saveMovie = await movie.findOne({ where: { tmdbId: movieId } });
    }
    // Check if movie is already in the curated list
    const movieExistsInCuratedList = await curatedListItem.findOne({
      where: { movieId: saveMovie.id, curatedListId },
    });

    if (movieExistsInCuratedList) {
      return res
        .status(400)
        .json({ error: "Movie already exits in curated list" });
    }
    // Add movie to curated list
    await curatedListItem.create({ movieId: saveMovie.id, curatedListId });
    return res
      .status(200)
      .json({ message: "Movie added to the curated list successfully." });
  } catch (error) {
    console.log("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const { movieId } = req.params;

    if (rating < 0 || rating > 10) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 10." });
    }
    if (reviewText.length > 500) {
      return res
        .status(400)
        .json({ message: "Review text must be under 500 characters." });
    }

    const existingMovie = await movie.findByPk(movieId);

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const newReview = await review.create({ rating, reviewText, movieId });
    return res
      .status(200)
      .json({ message: "Review added successfully.", review });
  } catch (error) {
    console.log("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const searchByGenreAndActor = async (req, res) => {
  try {
    const { genre, actor } = req.query;

    if (!genre && !actor) {
      return res.status(400).json({
        message: "Please provide atleast one search parameter: genre or actor.",
      });
    }
    const whereConditions = {
      ...(genre && { genre: { [Op.iLike]: `%${genre}%` } }),
      ...(actor && { actors: { [Op.iLike]: `%${actor}%` } }),
    };

    const movies = await movie.findAll({
      where: whereConditions,
      limit: 10,
    });

    return res.status(200).json({ movies });
  } catch (error) {
    console.log("movie controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const sortMovies = async (req, res) => {
  try {
    const { list, sortBy, order = "ASC" } = req.query;

    if (!["rating", "releaseYear"].includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sortBy parameter. User 'rating' or 'releaseYear'.",
      });
    }

    if (!["ASC", "DESC"].includes(order.toUpperCase())) {
      return res
        .status(400)
        .json({ message: "Invalid order parameter. Use 'ASC' or 'DESC'." });
    }

    let selectedListModel;

    if (list === "watchlist") {
      selectedListModel = watchlist;
    } else if (list === "wishlist") {
      selectedListModel = wishlist;
    } else if (list === "curatedlist") {
      selectedListModel = curatedListItem;
    } else {
      return res.status(400).json({
        message:
          "Invalid list parameter. Use 'watchlist', 'wishlist', or 'curatedlist'.",
      });
    }
    const movies = await selectedListModel.findAll({
      where: {},
      include: [
        {
          model: movie,
          attributes: [
            "id",
            "title",
            "tmdbId",
            "genre",
            "actors",
            "releaseYear",
            "rating",
          ],
        },
      ],
      order: [[movie, sortBy, order]],
    });

    const resultMovies = movies.map((entry) => ({
      title: entry.movie.title,
      tmdbId: entry.movie.tmdbId,
      genre: entry.movie.genre,
      actors: entry.movie.actors,
      releaseYear: entry.movie.releaseYear,
      rating: entry.movie.rating,
    }));
    res.status(200).json({ movies: resultMovies });
  } catch (error) {
    console.log("Error:controller " + error.message);
    res.status(500).json({ error: error.message });
  }
};

const getTopFiveMovies = async (req, res) => {
  try {
    const movies = await movie.findAll({
      limit: 5,
      rating: [["rating", "DESC"]],
      include: [
        {
          model: review,
          attributes: ["rating", "reviewText"],
        },
      ],
    });
    const resultMovies = movies.map((movie) => {
      const reviewText = movie.reviews[0]
        ? movie.reviews[0].reviewText
        : "No review available";
      const wordCount = reviewText
        ? reviewText.split(" ").filter(Boolean).length
        : 0;

      return {
        title: movie.title,
        rating: movie.rating,
        review: {
          text: reviewText,
          wordCount: wordCount,
        },
      };
    });
    return res.json({ movies: resultMovies });
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
  addReview,
  searchByGenreAndActor,
  sortMovies,
  getTopFiveMovies,
};
