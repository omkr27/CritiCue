const { curatedList } = require("../models");

// Helper function to generate a URL-friendly slug from the list name
function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-"); // replaces spaces with dashes and converts to lowercase
}
// Controller to create a new curated list
const createCuratedList = async (req, res) => {
  const { name, description } = req.body;
  // Generate a slug from the name
  const slug = generateSlug(name);

  try {
    // Create the curated list in the database
    const newCuratedList = await curatedList.create({
      name,
      description,
      slug,
    });
    return res.status(201).json({
      message: "Curated list created successfully",
      curatedList: newCuratedList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creating curated list.",
    });
  }
};

// Controller to update an existing curated list
const updateCuratedList = async (req, res) => {
  const { curatedListId } = req.params;
  const { name, description } = req.body;

  try {
    // Find the curated list by its ID
    const existingCuratedList = await curatedList.findByPk(curatedListId);
    // If the list doesn't exist, return a 404 error
    if (!existingCuratedList) {
      return res.status(404).json({
        message: "Curated list not found.",
      });
    }
    // Generate a new slug if the name was updated
    const slug = generateSlug(name);
    // Update the curated list in the database
    await existingCuratedList.update({
      name,
      description,
      slug,
    });

    return res.status(200).json({
      message: "Curated list updated successfully.",
      curatedList,
    });
  } catch (error) {
    console.error(error);
    // Send error response if something goes wrong
    return res.status(500).json({
      message: "Error updating curated list.",
    });
  }
};

module.exports = {
  createCuratedList,
  updateCuratedList,
};
