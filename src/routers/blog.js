import { Router } from "express";

// @create router
const router = Router();

// @import controller
import * as BlogsController from "../controllers/blog.js";

// @routes
router.get("/api/blogs", BlogsController.getAllBlogs);
router.get("/api/cat_blogs", BlogsController.getAllCategory);
router.get("/api/fav_blogs", BlogsController.getFavBlogs);
router.get("/api/user_blogs",tokenValidator, BlogsController.getUserPublishedBlogs);
router.get("/api/user_fav_blogs",tokenValidator, BlogsController.getUserFavBlogs);
router.get("/api/blogs_pic", BlogsController.getBlogPic);
router.post("/api/blogs",tokenValidator,BlogsController.publishBlog);
router.post("/api/like_blog",tokenValidator,BlogsController.likeBlog);
router.delete("/api/blogs/:id",tokenValidator, BlogsController.deleteBlog);


// @export router
export default router;