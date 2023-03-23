import { Router } from "express";
import { getOrderHistories } from "../services/amazon.service.js";

const amazonRouter = Router();

amazonRouter.get("/get-all-order-history", async (req, res) => {
  const response = await getOrderHistories();
  res.json(response);
});

export { amazonRouter };
