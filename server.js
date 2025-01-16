import express from 'express';
import ViteExpress from "vite-express";
import { DedicatedServer } from './dedicatedserver.js';
import geckos from '@geckos.io/server';
import initJolt from 'jolt-physics';
import * as THREE from 'three';
import { Ent } from './ent.js';
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {GLTFLoader} from 'node-three-gltf';
              console.log(`aaaaaa`);
const io = geckos();
var Dedicated = new DedicatedServer(io, initJolt, THREE, Ent, GLTFLoader);

var app = express();

ViteExpress.listen(app, 80, () => {
  console.log(`listening`);
})