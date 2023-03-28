import mongoose from "mongoose";
import { ObjectScheme } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const menFashionProduct = new Schema(ObjectScheme);

export const MenFashionProducts = mongoose.model("men-fashion-products", menFashionProduct);
