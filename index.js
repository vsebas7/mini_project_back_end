import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import requestLogger from "./src/middleware/logger.js"
import errorHandler from "./src/middleware/error.handler.js";

dotenv.config();

const app = express();

app.use(bodyParser.json())
app.use(cors({ exposedHeaders : "Authorization" }))
app.use(requestLogger)

import AuthRouters from "./src/controllers/authentication/routers.js"
import BlogRouters from "./src/controllers/blogs/routers.js"

app.use("/api/auth", AuthRouters)
app.use("/api/blog", BlogRouters)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));