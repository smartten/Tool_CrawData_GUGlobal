import mongoose from "mongoose";

const Schema = mongoose.Schema;
const productSchema = new Schema({
  janCode: {
    type: String,
  },
  name: {
    type: String,
  },
  categories: [
    {
      type: String,
    },
  ],
  image: {
    type: String,
  },
  shortNameCompany: {
    type: String,
  },
  fullNameCompany: {
    type: String,
  },
  material: {
    // chất liệu
    type: String,
  },
  quantitative: {
    // định lượng
    type: String,
  },
  priceRakuten: {
    type: String,
  },
  priceYahoo: {
    type: String,
  },
  priceAmazone: {
    type: String,
  },
});

export const ProductModel = mongoose.model("product", productSchema);
