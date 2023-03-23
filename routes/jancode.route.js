import { Router } from "express";
import {
  getCategories,
  getProducts,
  getUpdateTimes,
} from "../services/jancode.service.js";

const jancodeRouter = Router();

jancodeRouter.post("/get-all-update-time", async (req, res) => {
  const response = await getUpdateTimes();
  res.json(response);
});

jancodeRouter.post("/get-all-category", async (req, res) => {
  const response = await getCategories();
  res.json(response);
});

jancodeRouter.post("/get-all-product", async (req, res) => {
  const { url } = req.body;
  const response = await getProducts({ url });
  res.json(response);
});

export { jancodeRouter };
