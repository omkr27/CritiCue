const { searchMovie } = require("../services/tmdbService");
const { Movie } = require("../models");
const { Op } = require("sequelize");

const searchMovies = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "query parameter is required" });
  }

  try {
    const data = await searchMovie(query);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Full error from controller:", error);
    //console.error("Error from controller", error.message);
    return res
      .status(500)
      .json({ error: error.message || "Unknown error in controller" });
  }
};

module.exports = { searchMovies };
