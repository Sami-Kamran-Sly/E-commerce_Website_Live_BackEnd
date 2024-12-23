import { BadRequestError } from "../errors/index.js";
import { NotFoundError } from "../errors/not-found.js";
import asyncWrapper from "../middleware/async.js";
import CategoryModel from "../model/CategoryModel.js";
import slugify from "slugify";

export const CreateCategory = asyncWrapper(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError("Name is required");
  }

  const existingCategory = await CategoryModel.findOne({ name });

  if (existingCategory) {
    return res.status(409).send({
      success: false,
      message: "Category Already Exists",
    });
  }

  const category = await CategoryModel.create({ name, slug: slugify(name) });

  res.status(201).send({
    success: true,
    message: "New category created",
    category,
  });
});

export const UpdateCategory = asyncWrapper(async (req, res) => {
  const { name } = req.body;

  const { id } = req.params;

  if (!name) {
    throw new BadRequestError("Name is required");
  }

  const category = await CategoryModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
    //  specify that the method should return the updated document instead of the original document.
  );

  res.status(200).send({
    success: true,
    message: "Category Updated Successfully ",
    category,
  });
});

export const DeleteCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.findByIdAndDelete(id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  res.status(200).send({
    success: true,
    message: "Category Deleted Successfully",
    category,
  });
});

export const getAllCategory = asyncWrapper(async (req, res) => {
  const category = await CategoryModel.find({});

  res.status(200).send({ success: true, message: "All Categories", category });
});

export const getCategory = asyncWrapper(async (req, res) => {
  const { slug } = req.params;

  const category = await CategoryModel.findOne({ slug });

  if (!category) {

    throw new NotFoundError("Category not found ");

  }

  res.status(200).send({
    success: true,
    message: "Single Category Found",
    category,

    
  });
});
