import mongoose from "mongoose";
import { ObjectSchemeMatsukiyo } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const productFoodMatsukiyo = new Schema(ObjectSchemeMatsukiyo);

export const ProductFoodMatsukiyoModel = mongoose.model("matsukiyo-product-food" , productFoodMatsukiyo);
