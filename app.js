import express from "express";
import connectDB from "./db/connect.js";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/authRoute.js";
import categoryRoute from "./routes/CategoryRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", ProductRoute);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);

    let port = 8000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
