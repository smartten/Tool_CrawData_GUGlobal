import mongoose from "mongoose";
import { ObjectSchemeMatsukiyo } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const productRugsMatsukiyo = new Schema(ObjectSchemeMatsukiyo);

export const ProductRugsMatsukiyoModel = mongoose.model("matsukiyo-product-rugs" , productRugsMatsukiyo);
