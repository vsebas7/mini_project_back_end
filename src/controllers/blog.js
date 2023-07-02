import connection from "../config/index.js"

const db = connection.promise()

export const getAllBlogs = async (req, res) => {
    try {
        const QUERY = "SELECT * FROM mini_project_backend.blogs;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

export const publishBlog = async (req, res) => {
    try {
        const QUERY = 
        "INSERT INTO blogs (user_id,title,content,country,category_id,url,keywords,blog_pic)
        VALUES (
            req.body?.title,
            req.body?.content,
            req.body?.country,
            req.body?.category_id,
            req.body?.url,
            req.body?.keywords,
            req.body?.blog_pic
            )
        ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(201).json({ message: "Expense created successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" })
    }
}

export const likeBlog = async (req, res) => {
    try {
        const QUERY = 
        "INSERT INTO like (date,blog_id,user_id)
        VALUES (
            
            )
        ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(201).json({ message: "Expense created successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" })
    }
}

export const getAllCategory = async (req, res) => {
    try {
        const QUERY = "SELECT * FROM mini_project_backend.category;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

export const getFavBlogs = async (req, res) => {
    try {
        const QUERY = 
        "SELECT COUNT(lk.date) as total_likes
        FROM mini_project_backend.like lk
        JOIN mini_project_backend.blogs bl
        ON lk.blog_id = bl.blog_id
        GROUP BY bl.blog_id
        ORDER BY total_likes DESC
        ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

export const getUserFavBlogs = async (req, res) => {
    try {
        const QUERY = 
        "SELECT bl.title,bl.content,bl.category,bl.blog_pic,
        FROM mini_project_backend.like lk
        JOIN mini_project_backend.blogs bl
        ON lk.blog_id = bl.blog_id
        JOIN mini_project_backend.users us
        ON lk.user_id = us.user_id
        WHERE lk.user_id = 
        ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

export const getUserPublishedBlogs = async (req, res) => {
    try {
        const QUERY = 
        "SELECT *
        FROM mini_project_backend.blogs bl
        WHERE bl.user_id = 
        ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

export const getBlogPic = async (req, res) => {
    try {
        const QUERY = 
        "SELECT blog_id,blog_pic FROM mini_project_backend.blogs;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

export const deleteBlog = async (req, res) => {
    try {
        const QUERY = 
        "DELETE FROM blogs WHERE blog_id = ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

