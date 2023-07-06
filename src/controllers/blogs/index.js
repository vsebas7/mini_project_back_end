import sequelize from "sequelize";
import { Blog, Category, Like, User} from "../../models/all_models.js"
import { PublishBlogSchema } from "./validation.js";
import moment from "moment";
import { verifyToken } from "../../helpers/token.js";


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
        const { id_blog } = req.params;

        await Blog?.destroy({
            where : {id : id_blog}
        });

        res.status(200).json({ 
            message : `Blog dengan id = ${id_blog} berhasil di delete`
        })
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
        const { id_blog } = req.params;

        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)

        const date = moment();

        const like_check = await Like?.findAll({
            where: {
                userId: decoded.id,
                blogId: id_blog
            }
        });

        if(like_check.length > 0){
            res.status(500).json({
                message : "Blog already liked"
            })
        }
        
        const like = await Like?.create({
            userId : decoded.id,
            blogId : id_blog,
            date 
        })

        res.status(200).json({
            message : "Like Added",
            like
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
        const favorite = await Like?.findAll({
            attributes: [
                'blogId',
                [sequelize.fn('COUNT', sequelize.col(`likes.id`)), 'total_likes'],
            ],
            group : 'blogId',
            include : Blog,
            order : [['total_likes','DESC']]
        });

        res.status(200).json({ 
            message : "Data Berhasil dimuat",
            favorite 
        })

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
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const {id} = decoded
        const UserFavorite = await Like?.findAll({
            attributes : [
                'blogId',
                [sequelize.fn('COUNT', sequelize.col(`likes.id`)), 'total_likes'],
            ],
            group : 'blogId',
            where :{userId : id},
            include : Blog,
        });

        res.status(200).json({ 
            message : "Data Berhasil dimuat",
            UserFavorite 
        })

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
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const {id} = decoded
        const UserBlog = await Blog?.findAll({
            where :{userId : id}
        });

        res.status(200).json({ 
            message : "Data Berhasil dimuat",
            UserBlog 
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Data not found",
            error : error?.message || error
        });
    }
}

