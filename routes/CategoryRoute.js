import express from "express";
import { isAdmin, requireSignIn } from "../middleware/auth.js";

const router = express.Router();

import {
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  getAllCategory,
  getCategory,
} from "../controller/CategoryController.js";

// Public routes
router.route("/create-category").post(requireSignIn, isAdmin, CreateCategory);

router
  .route("/update-category/:id")
  .put(requireSignIn, isAdmin, UpdateCategory);

router.route("/getAll-category").get(getAllCategory);

// Admin-protected routes
router.route("/getsingle-cetegory/:slug").get(getCategory);

router
  .route("/delete-category/:id")
  .delete(requireSignIn, isAdmin, DeleteCategory);

export default router;
