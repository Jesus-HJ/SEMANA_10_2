import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductStats,
  listProducts,
  updateProduct
} from "../controllers/productController.js";

const router = Router();

router.get("/", listProducts);
router.get("/stats", getProductStats);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
