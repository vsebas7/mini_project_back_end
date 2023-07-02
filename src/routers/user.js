import { Router } from "express";
import userValidator from "../helpers/schema.js";

// @create router
const router = Router();

// @controllers
import * as UserController from "../controllers/user.js";
// @define routes
router.post("/api/auth/", userValidator, UserController.registerUser);
router.patch("/api/verification/:token", UserController.verifyUser);

// @export router
export default router;