import mongoose from "mongoose";
import { ObjectSchemeMatsukiyo } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const productDailyNecessitiesMatsukiyo = new Schema(ObjectSchemeMatsukiyo);

export const ProductDailyNecessitiesMatsukiyoModel = mongoose.model("matsukiyo-product-daily-necessities" , productDailyNecessitiesMatsukiyo);
