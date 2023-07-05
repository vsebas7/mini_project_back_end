import Blog from "../../models/blog.js"
import { PublishBlogSchema } from "./validation.js";

export const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog?.findAll();
        res.status(200).json({ blogs })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

export const publishBlog = async (req, res) => {
    try {
        const { title, content, country, category, url, keywords, picture } = req.body;
        
        await PublishBlogSchema.validate(req.body);

        const blogs = await Blog?.create({
            title,
            content,
            country,
            category_id : category,
            url,
            keywords,
            blog_pic : picture,
        })

        res.status(200).json({ 
            message : "Blog published",
            blogs 
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const deleteBlogs = async (req, res) => {
    try {
        const { id_blog } = req.body;

        const blogs = await Blog?.destroy({
            where : {blog_id : id_blog}
        });

        res.status(200).json({ blogs })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

export const likeBlog = async (req, res) => {
    try {
        const { id_user, id_blog } = req.body;
        const like_check = await Blog?.findAll({
            where: {
                user_id: id_user,
                blog_id: id_blog
            }
        });

        if(like_check.length > 0){
            res.status(500).json({
                message : "Blog already liked"
            })
        }
        
        const blogs = await Blog?.create({
            user_id : id_user,
            blog_id : id_blog
        })

        res.status(200).json({
            message : "Like Added",
            blogs
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

export const categoryBlogs = async (req, res) =>{
    try {
        const category = await Category?.findAll();

        res.status(200).json({ category })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

export const favoriteBlogs = async (req, res) =>{
    try {
        const favorite = await likes?.findAll({
            attributes : [sequelize.fn('COUNT', sequelize.col('id')), 'total_likes'],
            group : 'blog_id',
            order : ['total_likes', 'DESC']
        });

        res.status(200).json({ favorite })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

export const userFavoriteBlogs = async (req, res) =>{
    try {
        const { id_user } = req.body;
        const UserFavorite = await likes?.findAll({
            attributes : [sequelize.fn('COUNT', sequelize.col('id')), 'total_likes'],
            group : 'blog_id',
            where :{user_id : id_user}
        });

        res.status(200).json({ UserFavorite })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

export const userBlogs = async (req, res) =>{
    try {
        const { id_user } = req.body;
        const UserBlog = await blog?.findAll({
            where :{user_id : id_user}
        });

        res.status(200).json({ UserBlog })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

