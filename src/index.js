//2nd Approach
import  connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();
connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is Running on ${process.env.PORT}`);
    
  })
})
.catch((error)=>{
console.log("Mongodb Connection Error",error);

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