import express from 'express';
import ViteExpress from "vite-express";

var app = express();

ViteExpress.listen(app, 80, () => {
  console.log(`listening`);
})