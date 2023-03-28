import mongoose from "mongoose";
import { ObjectScheme } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const babyFashionProduct = new Schema(ObjectScheme);

export const BabyFashionProducts = mongoose.model("baby-fashion-products", babyFashionProduct);
