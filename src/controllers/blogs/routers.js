import { Router } from "express"
import verifyJWTToken from "../../middleware/token.verify.js"

// @import the controller
import * as BlogControllers from "./index.js"

// @define routes
const router = Router()
router.get("/blog", BlogControllers.getBlogs)
router.get("/category_blog", BlogControllers.categoryBlogs)
router.post("/like_blog/:blog_id", verifyJWTToken, BlogControllers.likeBlogs)

export default router
