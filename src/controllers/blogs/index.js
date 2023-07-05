import Blog from "../../models/blog.js"

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

export const likeBlogs = async (req, res) => {
    try {
        const like_check = await Blog?.findAll({
            where: {
                user_id: id_user,
                blog_id: id_blog
            }
        });

        if(like_check.length == 0){
            res.status(500).json({
                message : "Blog already liked"
            })
        }
        
        const blogs = await Blog?.create({
            user_id : id_user,
            blog_id : id_blog
        })

        res.status(200).json({ blogs })
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

