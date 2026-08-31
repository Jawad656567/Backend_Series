import express, { urlencoded } from "express";
import Cors from "cors";
import cookieParser from "cookie-parser";
const app=express();

app.use(Cors());
app.use(express.static("public"));
app.use(express.json());
app.use(urlencoded());
app.use(cookieParser());

import UserRouter from "./routes/user.route.js";
//router declaration
app.use("/api/v1/user",UserRouter);

export default app;
