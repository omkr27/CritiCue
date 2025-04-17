const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
require("dotenv").config();
const {
  searchMovies,
  addMovieToWatchList,
  addMoviesToWishlist,
  addMoviesToCuratedList,
} = require("./controllers/movieController");
const {
  createCuratedList,
  updateCuratedList,
} = require("./controllers/curatedListController");
const app = express();

console.log("API KEY:", process.env.API_KEY);

app.use(express.json());
app.use(cors());

//routes
app.get("/api/movies/search", searchMovies);

//post endpoint to create curated list
app.post("/api/curated-lists", createCuratedList);

app.put("/api/curated-lists/:curatedListId", updateCuratedList);

app.post("/api/movies/watchlist", addMovieToWatchList);

app.post("/api/movies/wishlist", addMoviesToWishlist);

app.post("/api/movies/curated-list", addMoviesToCuratedList);

//connect to database
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
