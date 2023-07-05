import { Router } from "express"
import verifyJWTToken from "../../middleware/token.verify.js"

// @import the controller
import * as BlogControllers from "./index.js"

// @define routes
const router = Router()
router.get("/blog", BlogControllers.getBlogs)
router.post("/blog", verifyJWTToken, BlogControllers.publishBlog)
router.patch("/blog/:id", verifyJWTToken, BlogControllers.deleteBlogs)
router.post("/like_blog/:blog_id", verifyJWTToken, BlogControllers.likeBlogs)
router.get("/category_blog", BlogControllers.categoryBlogs)
router.get("/favorite_blog", BlogControllers.favoriteBlogs)
router.get("/favorite_blog/:user_id", verifyJWTToken, BlogControllers.userFavoriteBlogs)
router.get("/blogs/:user_id", verifyJWTToken, BlogControllers.userFavoriteBlogs)


export default router
