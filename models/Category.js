const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
});
const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
