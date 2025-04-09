const { searchMovie } = require("../services/tmdbService.js");
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
    console.error("Error from controller", error.message);
    return res.status(500).json({ error: error + "folder controller" });
  }
};

module.exports = { searchMovies };
