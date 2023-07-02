import connection from "../config/index.js"

const db = connection.promise()

export const registerUser = async (req, res) => {
   try {
        const QUERY = 
        "INSERT INTO blogs (
            token_user,
            token_temp,
            username,
            email,
            phone,
            password,
            profile_pic
        )
        VALUES (
            req.body?.username,
            req.body?.email,
            req.body?.phone,
            req.body?.password
        )
        ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(201).json({ message: "Expense created successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" })
    }
}

export const verifyUser = async (req, res) => {
   try {
        const QUERY = 
        "UPDATE users
        SET verified = 1
        WHERE token_temp = ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(201).json({ message: "Expense created successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" })
    }
}

export const userProfile = async (req, res) => {
    try {
        const QUERY = 
        "SELECT user_id,profile_pic FROM mini_project_backend.users;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(200).json({ users: rows })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}
