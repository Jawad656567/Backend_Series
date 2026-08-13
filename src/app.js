import express, { urlencoded } from "express";
import Cors from "Cors";
const app=express();

app.use(Cors());
app.use(express.static("public"));
app.use(express.json());
app.use(urlencoded());

import UserRouter from "./routes/user.route.js";
//router declaration
app.use("/api/v1/user",UserRouter);

export default app;
