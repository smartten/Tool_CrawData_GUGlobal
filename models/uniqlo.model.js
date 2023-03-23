import mongoose from "mongoose";

const Schema = mongoose.Schema;
const productUniQlo = new Schema({
  img: {
    type: String,
  },
  description: {
    type: String,
  },
  detail: [
    {
      type: String,
    },
  ],
  name: [
    {
      type: String,
    },
  ],
  price: [
    {
      type: String,
    },
  ],
});

export const ProductUniQloModel = mongoose.model("uniqlo-product" , productUniQlo);
