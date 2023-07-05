import User from "../../models/user.js"
import { hashPassword, comparePassword } from "../../helpers/encryption.js"
import { createToken } from "../../helpers/token.js"
import { LoginValidationSchema, RegisterValidationSchema, IsEmail, changeUsernameSchema, changePasswordSchema, changeEmailSchema, changePhoneSchema } from "./validation.js"

// @register process
export const register = async (req, res) => {
    try {
        // @validation
        const { username, password, email, phone } = req.body;
        await RegisterValidationSchema.validate(req.body);

        // @check if user already exists
        const userExists = await User?.findOne({ where: { username, email } });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // @create user -> encypt password
        const hashedPassword = hashPassword(password);
        const user = await User?.create({
            username,
            password : hashedPassword,
            email,
            phone
        });

        // @delete password from response
        delete user?.dataValues?.password;

        // @genearte access token
        const accessToken = createToken({ id: user?.dataValues?.id, role : user?.dataValues?.role });

        // @return response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
            message: "User created successfully",
            user
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

// @login process
export const login = async (req, res) => {
    try {
        // @validation, we assume that username will hold either username or email
        const { username, password } = req.body;
        await LoginValidationSchema.validate(req.body);

        // @check if username is email
        // const isAnEmail = await IsEmail(username);
        // const query = isAnEmail ? { email : username } : { username };

        // @check if user exists
        const userExists = await User?.findOne({ where: { username } });
        if (!userExists) return res.status(400).json({ message: "User does not exists" });

        // @check if password is correct
        const isPasswordCorrect = comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Password is incorrect" });

        // @generate access token
        const accessToken = createToken({ id: userExists?.dataValues?.id, role : userExists?.dataValues?.role });

        // @delete password from response
        delete userExists?.dataValues?.password;

        // @return response
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

// @get users data
export const getUsers = async (req, res) => {
    try {
        // @get users
        const users = await User?.findAll({ attributes : { exclude : ["password"] } });

        // @return response
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
        
        await changeEmailSchema.validate(email);

        const users = await User?.findOne(
            { where : { email : email } }
        );

        if(!user){
            res.status(500).json({
            message : "Email Not Found",
            error : error?.message || error
        });
        }

        res.status(200).json({ 
            message : "Check Your Email",
            users 
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message : "Something went wrong",
            error : error?.message || error
        });
    }
}

export const verificationUser = async (req, res) => {
    try {
        const { id_user } = req.body;
        
        const users = await User?.update(
            { isVerified: 1 }, 
            { 
                where: {
                    user_id: id_user
                }
            }
        );

        res.status(200).json({ 
            message : "Verification Success",
            users 
        })
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
        const { username, id_user} = req.body;

        await changeUsernameSchema.validate(username);
        
        const users = await User?.update(
            { username: username }, 
            { 
                where: {
                    user_id: id_user
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Username Success, Please Login Again",
            users 
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
        const { password, id_user} = req.body;

        await changePasswordSchema.validate(password);
        
        const hashedPassword = hashPassword(password);

        const users = await User?.update(
            { password: hashedPassword }, 
            { 
                where: {
                    user_id: id_user
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Password Success, Please Login Again",
            users 
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
        const { email, id_user} = req.body;

        await changeEmailSchema.validate(email);
        
        const users = await User?.update(
            { email: email }, 
            { 
                where: {
                    user_id: id_user
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Email Success, Please Check Your Email",
            users 
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
        const { phone, id_user} = req.body;
        
        await changePhoneSchema.valideate(req.body);

        const users = await User?.update(
            { phone: phone }, 
            { 
                where: {
                    user_id: id_user
                }
            }
        );

        res.status(200).json({ 
            message : "Changed Phone Success, Please Login Again",
            users 
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}

export const changeProfile = async (req, res) => {
    try {
        const { picture, id_user} = req.body;
        
        const users = await User?.update(
            { profile_pic: picture }, 
            { 
                where: {
                    user_id: id_user
                }
            }
        );

        res.status(200).json({ 
            message : "Change Profile Picture Success",
            users 
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong",
            error : error?.message || error
        });
    }
}