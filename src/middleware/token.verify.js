import { verifyToken } from "../helpers/token.js"

export async function verifyUser(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message : "Unauthorized" })
    }
}

export default verifyUser