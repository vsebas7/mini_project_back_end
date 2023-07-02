import fs from "fs";

function apiKeyValidator (req, res, next) {
    // @get api key from headers
    const apiKey = req.headers["x-api-key"]

    // @read api keys from json file
    const apiKeys = JSON.parse(fs.readFileSync("./json/api.keys.json", "utf-8"));

    // @check if api key is valid
    const apiKeyIsValid = apiKeys.find(item => item.key === apiKey);

    // @if not valid
    if (!apiKeyIsValid) {
        return res.status(401).json({ message: "Invalid API Key" });
    }

    // @if api key is valid
    next()
}

export const tokenValidator = async (req, res) => {
   try {
        const QUERY = 
        "SELECT token_user FROM mini_project_bakcend.users WHERE user.id = ;"
        const [rows, fields] = await db.execute(QUERY)

        res.status(201).json({ message: "Expense created successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" })
    }
}
