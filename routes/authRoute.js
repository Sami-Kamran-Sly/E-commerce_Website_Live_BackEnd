import express from "express";

const router = express.Router();

import {
  getAllOrder,
  getOrder,
  OrderStatus,
  updateProfile,
  registerController,
  loginController,
  forgotPasswordController,
} from "../controller/authController.js";
import { isAdmin, requireSignIn } from "../middleware/auth.js";

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.post("/forgot-password", forgotPasswordController);
// Protected Route
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

router.put("/profile", requireSignIn, updateProfile);

router.get("/orders", requireSignIn, getOrder);

router.get("/all-orders", requireSignIn, isAdmin, getAllOrder);

router.put("/order-status/:orderId", requireSignIn, isAdmin, OrderStatus);

export default router;
