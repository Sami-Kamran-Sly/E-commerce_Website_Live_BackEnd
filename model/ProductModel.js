import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Ensure slug is unique
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Ensure price is not negative
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, // Ensure quantity is not negative
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      type: Boolean,
      default: false, // Default value for shipping
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema); // Adjust model name if needed
