import { User } from "../../models/all_models.js"
import { hashPassword, comparePassword } from "../../helpers/encryption.js"
import { createToken, verifyToken } from "../../helpers/token.js"
import { 
    LoginValidationSchema, 
    RegisterValidationSchema, 
    IsEmail, 
    changeUsernameSchema, 
    changePasswordSchema, 
    changeEmailSchema, 
    changePhoneSchema 
} from "./validation.js"

export const register = async (req, res) => {
    try {
        const { username, password, email, phone } = req.body;
        await RegisterValidationSchema.validate(req.body);

        const userExists = await User?.findOne({ where: { username, email } });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = hashPassword(password);
        const user = await User?.create({
            username,
            password : hashedPassword,
            email,
            phone
        });

        delete user?.dataValues?.password;

        const accessToken = createToken({ 
            id: userExists?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
            message: "User created successfully",
            user
        });

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Verification",
            html: `<h1>Click <a href="http://localhost:5000/api/auth/verification/${accessToken}">here</a> to verify your account</h1>`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        await LoginValidationSchema.validate(req.body);

        const isAnEmail = await IsEmail(username);
        const query = isAnEmail ? { email : username } : { username };

        const userExists = await User?.findOne({ where: query });
        if (!userExists) return res.status(400).json({ message: "User does not exists" });

        const isPasswordCorrect = comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Password is incorrect" });

        const accessToken = createToken({ 
            id: userExists?.dataValues?.id, 
            username : userExists?.dataValues?.username 
        });

        delete userExists?.dataValues?.password;

        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ user : userExists })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User?.findAll(
            { 
                attributes : {
                    exclude : ["password"]
                }
            }
        );

        res.status(200).json({ users })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        await changeEmailSchema.validate(req.body);

        const user = await User?.findOne(
            { where : { email : email } }
        );

        if(!user){
            throw ({status : 404, message : "Email not found"})
        };

        res.status(200).json({ 
            message : "Check Your Email",
            user 
        })
    } catch (error) {
        res.status(404).json({
            message : "Something went wrong",
            error : error?.message || error
        });
    }
}

export const verificationUser = async (req, res) => {
    try {
        const { token } = req.params;

        const decodedToken = verifyToken(token);

        await User?.update(
            { isVerified : 1 }, 
            { 
                where : { 
                    id : decodedToken?.id 
                } 
            }
        );

        res.status(200).json({ message : "Account verified successfully" })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changeUsername = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const { id } = decoded

        const { username } = req.body;

        await changeUsernameSchema.validate(req.body);
        
        await User?.update(
            { username: username }, 
            { 
                where: {
                    id: id
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Username Success, Please Login Again",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changePassword = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const { id } = decoded

        const { password } = req.body;

        await changePasswordSchema.validate(req.body);
        
        const hashedPassword = hashPassword(password);

        await User?.update(
            { password: hashedPassword }, 
            { 
                where: {
                    id: id
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Password Success, Please Login Again",
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changeEmail = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const {id} = decoded

        const { email } = req.body;

        await changeEmailSchema.validate(req.body);
        
        await User?.update(
            { email: email }, 
            { 
                where: {
                    id: id
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Email Success, Please Check Your Email", 
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changePhone = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const {id} = decoded

        const { phone } = req.body;
        
        await changePhoneSchema.validate(req.body);

        await User?.update(
            { phone: phone }, 
            { 
                where: {
                    id: id
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Phone Success, Please Login Again",
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changeProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = verifyToken(token)
        const {id} = decoded

        const { picture } = req.body;
        
        await User?.update(
            { profile_pic: picture }, 
            { 
                where: {
                    id: id
                }
            }
        );

        res.status(200).json({ 
            message : "Change Profile Picture Success",
            users 
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}