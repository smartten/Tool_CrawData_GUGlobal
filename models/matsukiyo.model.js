import mongoose from "mongoose";

const Schema = mongoose.Schema;
const productMatsukiyo = new Schema({
  img: {
    type: String,
  },
  productName: {
    type: String,
  },
  price: [
    {
      type: String,
    },
  ],
  priceInTax: [
    {
      type: String,
    },
  ],
  productDetail: [
    {
      type: String,
    },
  ],
});

export const ProductMatsukiyoModel = mongoose.model("matsukiyo-product" , productMatsukiyo);
