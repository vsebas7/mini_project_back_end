import { Router } from "express"
import verifyUser from "../../middleware/token.verify.js"

// @import the controller
import * as BlogControllers from "./index.js"

// @define routes
const router = Router()
router.get("/", BlogControllers.getBlogs) //done
router.post("/", verifyUser, BlogControllers.publishBlog) 
router.patch("/delete/:id_blog", verifyUser, BlogControllers.deleteBlogs) //done
router.post("/like_blog/:id_blog",verifyUser, BlogControllers.likeBlog) //done
router.get("/category_blog", BlogControllers.categoryBlogs) //done
router.get("/favorite_blog", BlogControllers.favoriteBlogs) //done
router.get("/favorite_blog/user", verifyUser, BlogControllers.userFavoriteBlogs) //done
router.get("/user", verifyUser, BlogControllers.userBlogs) //done

export default router
