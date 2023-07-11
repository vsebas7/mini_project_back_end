import { User } from "../../models/all_models.js"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import transporter from "../../helpers/transporter.js"
import cloudinary from "cloudinary"
import * as config from "../../config/index.js"
import { hashPassword, comparePassword } from "../../helpers/encryption.js"
import { createToken, createTokenLogin, verifyToken } from "../../helpers/token.js"
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

        const accessToken = createTokenLogin({ id: user?.dataValues?.id, username : user?.dataValues?.username });

        console.log(user)
        res.header("Authorization", `Bearer ${accessToken}`)
        .status(200)
        .json({
            message: "User created successfully",
            user
        });
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");
        const message  = handlebars.compile(template)({ link : `http://localhost:5000/api/auth/users/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Verification",
            html: message
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
        if (!userExists) return res.status(404).json({ message: "User does not exists" });

        const isPasswordCorrect = comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Password is incorrect" });

        const accessToken = createTokenLogin({ 
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

export const keepLogin = async (req, res) => {
    try {

        const users = await User?.findAll(
            { 
                where : {
                    id : req.user.id
                },
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

        const isUserExist = await User?.findOne(
            { where : { email : email } }
        );

        if(!isUserExist){
            return res.status(404).json({ message: "Email not found" })
        };

        const accessToken = createToken({ 
            id: isUserExist?.dataValues?.id, 
            username : isUserExist?.dataValues?.username 
        });

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");
        const message  = handlebars.compile(template)({ link : `http://localhost:5000/api/auth/users/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Forgot Password",
            html: message
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Check Your Email to Reset Your Password",
            isUserExist 
        })
    } catch (error) {
        res.status(500).json({
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
                    id : decodedToken.id 
                } 
            }
        );

        res.status(200).json({ message : "Account verified successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changeUsername = async (req, res) => {
    try {
        const { username } = req.body;

        await changeUsernameSchema.validate(req.body);

        await User?.update(
            { 
                username,
                isVerified : 0
            }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );

        const user = await User?.findOne(
            { 
                where : {
                    id : req.user.id
                },
                attributes : {
                    exclude : ["password"]
                }
            }
        );
        
        const email = user?.dataValues?.email
        
        const accessToken = createToken({ 
            id: user?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");
        const message  = handlebars.compile(template)({ link : `http://localhost:5000/api/auth/users/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Verification ",
            html: message
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Changed Username Success, Please Verify Again",
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
        const { password } = req.body;

        await changePasswordSchema.validate(req.body);
        
        const hashedPassword = hashPassword(password);

        await User?.update(
            { password: hashedPassword }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Password Success, Please Login Again",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changeEmail = async (req, res) => {
    try {
        const { email } = req.body;

        await changeEmailSchema.validate(req.body);
        
        await User?.update(
            { 
                email,
                isVerified : 0
            }, 
            { 
                where: {
                    id : id
                }
            }
        );

         const user = await User?.findOne(
            { 
                where : {
                    id : req.user.id
                },
                attributes : {
                    exclude : ["password"]
                }
            }
        );
                
        const accessToken = createToken({ 
            id: user?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");
        const message  = handlebars.compile(template)({ link : `http://localhost:5000/api/auth/users/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Verification ",
            html: message
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Changed Email Success, Please Check Your Email to verify", 
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changePhone = async (req, res) => {
    try {
        const { phone } = req.body;
        
        await changePhoneSchema.validate(req.body);

        await User?.update(
            { 
                phone,
                isVerified : 0
            }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );
        
        const user = await User?.findOne(
            { 
                where : {
                    id : req.user.id
                },
                attributes : {
                    exclude : ["password"]
                }
            }
        );
                
        const accessToken = createToken({ 
            id: user?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");
        const message  = handlebars.compile(template)({ link : `http://localhost:5000/api/auth/users/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: user?.dataValues?.email,
            subject: "Verification ",
            html: message
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Changed Phone Number Success, Please Verify Again before Login",
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
        if (!req.file) {
            throw new ({ status: 400, message: "Please upload an image." })
        }

        const user = await User?.findOne(
            { 
                where : {
                    id : req.user.id
                },
                attributes : ['profile_pic']
            }
        );
        
        if(user?.dataValues?.profile_pic){
            cloudinary.v2.api
                .delete_resources([`${user?.dataValues?.profile_pic}`], 
                    { type: 'upload', resource_type: 'image' })
                .then(console.log);
        }

        await User?.update(
            { 
                profile_pic : req?.file?.filename 
            }, 
            { 
                where : { 
                    id : req.user.id 
                } 
            }
        )

        res.status(200).json(
            { 
                message : "Image uploaded successfully.", 
                imageUrl : req.file?.filename 
            }
        )
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}