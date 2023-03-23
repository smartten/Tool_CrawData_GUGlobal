import mongoose from "mongoose";

const Schema = mongoose.Schema;
const categorySchema = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
});

export const CategoryModel = mongoose.model("category", categorySchema);
