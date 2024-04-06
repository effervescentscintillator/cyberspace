import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import ViteExpress from "vite-express";

var app = express();

const port = process.env.NODE_ENV === 'production' ? '80':'5173';
ViteExpress.listen(app, 80, () => {
  console.log(`Example app listening on port ` + port);
})