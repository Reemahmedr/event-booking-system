import express from "express";
import categoryController from "../controller/categoryController.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from "../utils/userRoles.js";
import verifyToken from "../middleware/verifyToken.js";
import categorySchema from "../schema/category.schema.js";
import validate from "../middleware/validatation.js";
const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post(
  "/",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  validate(categorySchema.category),
  categoryController.addCategory,
);
router.get("/:id", categoryController.singleCategory);
router.delete(
  "/:id",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  categoryController.deleteCategory,
);
router.patch(
  "/:id",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  validate(categorySchema.updateCategory),
  categoryController.updateCategory,
);

export default router;
