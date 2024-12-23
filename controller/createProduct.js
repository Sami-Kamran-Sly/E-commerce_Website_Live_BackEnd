import slugify from "slugify";
import { NotFoundError } from "../errors/not-found.js";
import asyncWrapper from "../middleware/async.js";
import ProductModel from "../model/ProductModel.js";
import CategoryModels from "../model/CategoryModel.js";

import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";
dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const CreateProducts = asyncWrapper(async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    if (!name) throw new NotFoundError("Name is Required");
    if (!description) throw new NotFoundError("Description is Required");
    if (!price) throw new NotFoundError("Price is Required");
    if (!category) throw new NotFoundError("Category is Required");
    if (!quantity) throw new NotFoundError("Quantity is Required");
    if (!photo || photo.size > 1000000) {
      return res
        .status(400)
        .send({ error: "Photo is Required and should be less than 1MB" });
    }

    const product = new ProductModel({
      ...req.fields,
      slug: slugify(name),
    });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product Created Successfully",

      product,
    });
  } catch (error) {
    console.error("Error in CreateProducts:", error); // Log detailed error
    res.status(500).send({ error: error.message || "Internal Server Error" });
  }
});

export const getAllProducts = asyncWrapper(async (req, res) => {
  const products = await ProductModel.find({})
    .select("-photo")
    .populate("category")
    .limit(12)
    .sort({ createdAt: -1 });

  res.status(200).send({
    success: true,
    countTotal: products.length,
    message: "All Products",
    products,
  });
});

export const DeleteProduct = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const products = await ProductModel.findByIdAndDelete(id);

  res.status(200).send({
    success: true,
    message: " Deleting the product successfully  ",
    products,
  });
});

export const getProduct = asyncWrapper(async (req, res) => {
  const { slug } = req.params;

  const product = await ProductModel.findOne({ slug })
    .populate("category")
    .select("-photo");

  res.status(200).send({
    success: true,
    message: " Single the  Product Fetched  ",
    product,
  });
});

export const UpdateProduct = asyncWrapper(async (req, res) => {
  const { name, description, price, category, quantity, shipping } = req.fields;
  const { photo } = req.files; // It should be req.files, not req.fields

  // Validation
  switch (true) {
    case !name:
      return res.status(500).send({ error: "Name is Required" });
    case !description:
      return res.status(500).send({ error: "Description is Required" });
    case !price:
      return res.status(500).send({ error: "Price is Required" });
    case !category:
      return res.status(500).send({ error: "Category is Required" });
    case !quantity:
      return res.status(500).send({ error: "Quantity is Required" });
    case photo && photo.size > 1000000:
      return res
        .status(500)
        .send({ error: "Photo is Required and should be less than 1MB" });
  }

  // Log `req.files` to debug

  const product = await ProductModel.findByIdAndUpdate(
    req.params.id,
    { ...req.fields, slug: slugify(name) },
    { new: true }
  );

  // Check if photo exists before accessing its properties
  if (photo) {
    product.photo.data = fs.readFileSync(photo.path);
    product.photo.contentType = photo.type;
  }

  await product.save();

  res.status(201).send({
    success: true,
    message: "Product Updated Successfully",
    product,
  });
});

export const productPhotoContrller = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).select("photo");

    if (product) {
      res.set("Content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error IN Getting  Photo  ",
      error,
    });
  }
};

export const productFilter = asyncWrapper(async (req, res) => {
  const { checked, radio } = req.body;
  const args = {};
  if (checked.length > 0) args.category = checked;

  if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
  // const args={}  if(checked.length>0) arg.category = checked
  try {
    const products = await ProductModel.find(args);
    res.status(201).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error filtering products:", error); // Log the error properly
    res.status(400).send({
      success: false,
      message: "Error in filtering the products",
    });
  }
});

export const productCounter = asyncWrapper(async (req, res) => {
  const total = await ProductModel.estimatedDocumentCount(); // Simplified count

  res.status(200).send({
    success: true,
    total,
  });
});

export const productList = async (req, res) => {
  try {
    const perPage = 3;
    const page = req.params.page ? req.params.page : 1;
    const products = await ProductModel.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

export const ProductSearch = asyncWrapper(async (req, res) => {
  const { keyword } = req.params;

  if (!keyword) {
    return res
      .status(400)
      .json({ success: false, message: "Keyword is required." });
  }

  const result = await ProductModel.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } }, // Corrected to 'options'
      { description: { $regex: keyword, $options: "i" } },
    ],
  }).select("-photo");

  res.json(result);
});

export const relatedProduct = asyncWrapper(async (req, res) => {
  const { pid, cid } = req.params;

  const products = await ProductModel.find({
    category: cid,
    _id: { $ne: pid },
  })
    .select("-photo")
    .limit(4)
    .populate("category");
  res.status(200).send({
    success: true,
    products,
  });
});

export const productCategroyController = async (req, res) => {
  try {
    // Use findOne to get a single category based on the provided slug
    const category = await CategoryModels.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Use the category _id to find products
    const products = await ProductModel.find({
      category: category._id,
    }).populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting Category Product",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
