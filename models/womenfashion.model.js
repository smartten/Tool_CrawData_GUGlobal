import mongoose from "mongoose";
import { ObjectScheme } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const womenFashionProduct = new Schema(ObjectScheme);

export const WomenFashionProducts = mongoose.model("women-fashion-products", womenFashionProduct);
