import mongoose from "mongoose";

const Schema = mongoose.Schema;
const productGuGlobal = new Schema({
  img: {
    type: String,
  },
  description: {
    type: String,
  },
  stateFlags: [
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
  productDetail : [
    {
      type : Object
    }
  ]
});

export const ProductGuGlobalModel = mongoose.model("gu-global-product" , productGuGlobal);
