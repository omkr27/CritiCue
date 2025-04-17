const axios = require("axios");
require("dotenv").config();

const axiosInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  // params: {
  //   api_key: process.env.API_KEY,
  // },

  headers: {
    Authorization: `Bearer ${process.env.API_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  },
});

module.exports = { axiosInstance };
