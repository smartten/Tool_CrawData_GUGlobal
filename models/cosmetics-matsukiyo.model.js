import mongoose from "mongoose";
import { ObjectSchemeMatsukiyo } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const productCosmeticsMatsukiyo = new Schema(ObjectSchemeMatsukiyo);

export const ProductCosmeticsMatsukiyoModel = mongoose.model("matsukiyo-product-cosmetics" , productCosmeticsMatsukiyo);
