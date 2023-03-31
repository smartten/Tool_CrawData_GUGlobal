import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { jancodeRouter } from "./routes/jancode.route.js";
import { sendResponse } from './helper/helpers.js';
import { fetchProductByList } from './services/matsukiyo.co.jp.js';
import { download } from "./routes/download.route.js";
import { amazonRouter } from "./routes/amazon.route.js";
import { fetchProductUniQlo } from "./services/uniqlo.js";
import { fetchProduct } from "./services/localbrand.service.js";
import webdriver from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import http from 'http';
import url from 'url';


const app = express();
dotenv.config();

const proxy = http.createServer((req, res) => {
  const targetUrl = 'http://www.test-proxy.com'; // The URL you want to proxy
  const target = url.parse(targetUrl);

  const options = {
    host: target.host,
    port: target.port || 80,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
});

proxy.listen(3000, () => {
  console.log('Proxy server listening on port 3000');
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xwr7j.mongodb.net/jancode?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

connectDB();


app.post('/crawl-by-category', (req, res, next) => {
  const { url } = req.body;
  console.log(req.body);
  sendResponse(res)(fetchProductByList(url));
});

app.post('/crawl-local-brand', async (req, res, next) => {
  const { url } = req.body;
  console.log(req.body);
  sendResponse(res)(fetchProduct(url));
});


app.use("/download-excel", download)
app.use("/jancode", jancodeRouter);
app.use("/amazon", amazonRouter);

var server = app.listen(process.env.PORT || 3003, () => {
  console.log("Server is listening on port 3003");
});
server.timeout = 30000