import express from 'express';
import ViteExpress from "vite-express";
import { DedicatedServer } from './dedicatedserver.js';
import geckos from '@geckos.io/server';

const io = geckos();
var Dedicated = new DedicatedServer(io);

var app = express();

ViteExpress.listen(app, 80, () => {
  console.log(`listening`);
})