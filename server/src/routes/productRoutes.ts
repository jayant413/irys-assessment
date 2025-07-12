import { Router } from "express";
import { ProductController } from "../controllers/productController";

const router = Router();
const productController = new ProductController();

// Product CRUD routes
router.get("/", productController.getProducts.bind(productController));
router.get(
  "/categories",
  productController.getCategories.bind(productController)
);
router.get("/:id", productController.getProductById.bind(productController));
router.post("/", productController.createProduct.bind(productController));
router.put("/:id", productController.updateProduct.bind(productController));
router.delete("/:id", productController.deleteProduct.bind(productController));

// Product status management
router.patch(
  "/:id/toggle-status",
  productController.toggleProductStatus.bind(productController)
);

// Bulk operations
router.post(
  "/bulk-upload",
  productController.bulkUpload.bind(productController)
);

export default router;
