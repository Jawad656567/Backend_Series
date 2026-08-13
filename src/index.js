//2nd Approach
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config(
 { path: './.env',}
);


console.log(
    "Cloudinary API Key:",
    process.env.CLOUDINARY_API_KEY ? "Loaded" : "NOT FOUND"
);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on ${process.env.PORT}`);
    })

    app.get("/", (req, res) => {
      res.send("Server is Running");
    });

  })
  .catch((error) => {
    console.log("Mongodb Connection Error", error);

  })

































/*
//First Approach
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

(async () => {
  try {
    console.log(process.env.MONGO_URI); // Test

    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error:", error);
  }
})();

*/