import { hashedPassword, comparePassword } from "../helper/hashPassword.js";

import { BadRequestError } from "../errors/index.js";
import asyncWrapper from "../middleware/async.js";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import orderModel from "../model/orderModel.js";
export const registerController = asyncWrapper(async (req, res) => {
  const { name, email, password, phone, address, answer } = req.body;
  //validations
  if (!name) {
    throw new BadRequestError("Name is Required");
  }
  if (!email) {
    throw new BadRequestError("Email is Required");
  }
  if (!password) {
    throw new BadRequestError("Password is Required");
  }
  if (!phone) {
    throw new BadRequestError("Phone number is Required");
  }
  if (!address) {
    throw new BadRequestError("Address is Required");
  }
  if (!answer) {
    throw new BadRequestError("Answer is Required");
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(200).send({
      success: false,
      message: "Already Register please login",
    });
  }

  const hashPassword = await hashedPassword(password);

  const user = await userModel.create({
    name,
    email,
    password: hashPassword,
    phone,
    address,
    answer,
  });
  res.status(201).send({
    success: true,
    message: "User Register Successfully",
    user,
  });
});
export const loginController = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(404).send({
      success: false,
      message: "Invalid email or password",
    });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .send({ success: false, message: "Email is not registerd" });
  }

  const match = await comparePassword(password, user.password);
  if (!match) {
    return res.status(200).send({
      success: false,
      message: "Invalid Password",
    });
  }

  const token = await jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.status(200).send({
    success: true,
    message: "login successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    },
    token,
  });
});

export const forgotPasswordController = asyncWrapper(async (req, res) => {
  const { email, answer, currentPassword, newPassword, confirmPassword } =
    req.body;

  if (!email) {
    throw new NotFoundError("Email is Required");
  }
  if (!newPassword) {
    throw new NotFoundError("New Password is Required");
  }
  if (!currentPassword) {
    throw new NotFoundError("Current password is required");
  }
  if (!answer) {
    throw new NotFoundError("Answer is Required");
  }
  if (newPassword !== confirmPassword) {
    throw new BadRequestError("New passwords do not match");
  }

  const user = await userModel.findOne({ email, answer });
  if (!user) {
    throw new BadRequestError("Wrong Email or Answer");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new BadRequestError("Current password is incorrect");
  }

  const hashed = await hashedPassword(newPassword);
  await userModel.findByIdAndUpdate(user._id, { password: hashed });

  res
    .status(200)
    .json({ success: true, message: "Password Reset Successfully" });
});

export const updateProfile = asyncWrapper(async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  const user = await userModel.findById(req.user._id);

  if (password && password.length < 6) {
    return res
      .status(400)
      .send({ error: "The password must be at least 6 characters long." });
  }

  const hashPassword = await hashedPassword(password);

  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: name || user.name,
      email: email || user.email,
      password: hashPassword || user.password,
      address: address || user.address,
      phone: phone || user.phone,
    },
    { new: true }
  );

  res.status(200).send({
    success: true,
    message: "  Updated the Profile Successfully  ",
    updatedUser,
  });
});

export const getOrder = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while getting  the Orders ",
      error,
    });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
export const OrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders Status",
      error,
    });
  }
};
