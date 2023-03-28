import mongoose from "mongoose";
import { ObjectScheme } from "../helper/objectSchema.js";

const Schema = mongoose.Schema;
const kidsFashionProduct = new Schema(ObjectScheme);

export const KidsFashionProducts = mongoose.model("kids-fashion-products", kidsFashionProduct);
