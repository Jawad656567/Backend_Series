import express, { urlencoded } from "express";
import Cors from "Cors";
const app=express();

app.use(Cors());
app.use(express.static("public"));
app.use(express.json());
app.use(urlencoded());




export default app;
