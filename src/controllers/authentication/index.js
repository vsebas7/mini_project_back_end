import { ValidationError } from "yup"
import { User } from "../../models/all_models.js"
import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import cloudinary from "cloudinary"
import * as validation from "./validation.js"
import * as config from "../../config/index.js"
import transporter from "../../helpers/transporter.js"
import * as encryption from "../../helpers/encryption.js"
import * as tokenHelper from "../../helpers/token.js"
import * as errorMiddleware from "../../middleware/error.handler.js"
import db from "../../models/index.js"
import { Op } from "sequelize";
import moment from "moment";

export const register = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { username, password, email, phone } = req.body;

        await validation.RegisterValidationSchema.validate(req.body);

        const userExists = await User?.findOne({ 
            where: { 
                [Op.or]: [
                    { username },
                    { email }
                ]
            } 
        });

        if (userExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_ALREADY_EXISTS 
        });
        
        const accessToken = tokenHelper.createToken(
            { 
                id: user?.dataValues?.id, 
                username : user?.dataValues?.username 
            }
        );

        const hashedPassword = encryption.hashPassword(password);

        const user = await User?.create({
            username,
            password : hashedPassword,
            email,
            phone,
            verify_token : accessToken,
            expired_token : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")
        });

        delete user?.dataValues?.password;

        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
                message: "User created successfully",
                user
            });

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

        const message  = handlebars.compile(template)({ link : `http://localhost:3000/verification/${accessToken}` })

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

        await transaction.commit();

    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        await validation.LoginValidationSchema.validate(req.body);

        const isAnEmail = await validation.IsEmail(username);

        const query = isAnEmail ? { email : username } : { username };

        const userExists = await User?.findOne(
            {
                where: query,
                attributes : {
                    exclude : ["verify_token","expired_token"]
                } 
            }
        );

        if (!userExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        })
        
        const isPasswordCorrect = encryption.comparePassword(password, userExists?.dataValues?.password);

        if (!isPasswordCorrect) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS,
            message : errorMiddleware.INCORRECT_PASSWORD 
        });      

        if(!userExists.dataValues.isVerified){
            const isTokenExpired = moment().isAfter(userExists?.dataValues?.expired_token);

            if(isTokenExpired){
                const accessToken = tokenHelper.createToken(
                    { 
                        id: userExists?.dataValues?.id, 
                        username : userExists?.dataValues?.username 
                    }
                );

                await User?.update(
                    { 
                        verify_token : accessToken,
                        expired_token : moment().add(1, "days").format("YYYY-MM-DD HH:mm:ss")
                    }, 
                    { 
                        where : { 
                            id : userExists.dataValues.id
                        } 
                    }
                )

                const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

                const message  = handlebars.compile(template)({ link : `http://localhost:3000/verification/${accessToken}` })

                const mailOptions = {
                    from: config.GMAIL,
                    to: userExists?.dataValues?.email,
                    subject: "Verification",
                    html: message
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) throw error;
                    console.log("Email sent: " + info.response);
                })
            }

            return next({
                status : errorMiddleware.UNAUTHORIZED_STATUS, 
                message : errorMiddleware.UNVERIFIED
            })
        }
        
        const accessToken = tokenHelper.createTokenLogin({ 
            id: userExists?.dataValues?.id, 
            username : userExists?.dataValues?.username 
        });
        
        delete userExists?.dataValues?.password;

        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ 
                user : userExists 
            })

    } catch (error) {
        if (error instanceof ValidationError) {
            return next({ 
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

export const keepLogin = async (req, res, next) => {
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

        if(!users[0].dataValues.isVerified)throw ({ 
            status : errorMiddleware.UNAUTHORIZED_STATUS, 
            message : errorMiddleware.UNVERIFIED
        })

        res.status(200).json({ users })
    } catch (error) {
        next(error)
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        await validation.EmailValidationSchema.validate(req.body);

        const isUserExist = await User?.findOne(
            { where : { email } }
        );

        if (!isUserExist) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        })

        const accessToken = tokenHelper.createToken({ 
            id: isUserExist?.dataValues?.id, 
            username : isUserExist?.dataValues?.username 
        });

        await User?.update(
            { 
                verify_token : accessToken,
                expired_token : moment().add(1, "days").format("YYYY-MM-DD HH:mm:ss")
            }, 
            { 
                where : { 
                    id : isUserExist?.dataValues?.id
                } 
            }
        )

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

        const message  = handlebars.compile(template)({ link : `http://localhost:3000/reset_password/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Reset Password",
            html: message
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Check Your Email to Reset Your Password",
        })
    } catch (error) {
        if (error instanceof ValidationError) {
            return next({ 
                status : errorMiddleware.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }
        next(error)
    }
}

export const verificationUser = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { token } = req.body;

        const decodedToken = tokenHelper.verifyToken(token);

        const userExists = await User?.findOne({ 
            where : { 
                id : decodedToken.id 
            } 
        });

        if (!userExists) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        });

        await User?.update(
            { 
                isVerified : 1,
                verify_token : null,
                expired_token : null 
            }, 
            { 
                where : { 
                    id : decodedToken.id 
                }
            }
        );

        res.status(200).json({ 
            message : "Verification Account Success" 
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        next(error)
    }
}

export const changeUsername = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { username } = req.body;

        await validation.changeUsernameSchema.validate(req.body);

        const usernameExists = await User?.findOne({ 
            where: { username }
        });

        if (usernameExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USERNAME_ALREADY_EXISTS 
        });

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

        const accessToken = tokenHelper.createToken({ 
            id: user?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        await User?.update(
            { 
                username,
                isVerified : 0,
                verify_token : accessToken,
                expired_token : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")
            }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );      
        
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

        const message  = handlebars.compile(template)({ link : `http://localhost:3000/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: user?.dataValues?.email,
            subject: "Verification Change Username ",
            html: message
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Change Username Success, Please Verify Again",
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const changePassword = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { password } = req.body;

        await validation.changePasswordSchema.validate(req.body);
        
        const hashedPassword = encryption.hashPassword(password);

        await User?.update(
            { 
                password: hashedPassword 
            }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );

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

        res.status(200).json({ 
            message : "Changed Password Success, Please Login Again",
            users
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({ 
                status : errorMiddleware.BAD_REQUEST_STATUS , 
                message : error?.errors?.[0] 
            })
        }

        next(error)
    }
}

export const changeEmail = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { email } = req.body;

        await validation.EmailValidationSchema.validate(req.body);
        
        const emailExists = await User?.findOne({ 
            where: { email }
        });

        if (emailExists) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.EMAIL_ALREADY_EXISTS 
        });

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

        const accessToken = tokenHelper.createToken({ 
            id: user?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        await User?.update(
            { 
                email,
                isVerified : 0,
                verify_token : accessToken,
                expired_token : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")
            }, 
            { 
                where: {
                    id : req.user.id
                }
            }
        );
        
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

        const message  = handlebars.compile(template)({ link : `http://localhost:3000/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: email,
            subject: "Verification Change Email",
            html: message
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Changed Email Success, Please Check Your Email to verify", 
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }
        next(error)
    }
}

export const changePhone = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { phone } = req.body;
        
        await validation.changePhoneSchema.validate(req.body);

        const phoneExist = await User?.findOne(
            { where : { phone } }
        );

        if (phoneExist) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.PHONE_ALREADY_EXISTS 
        })

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
                
        const accessToken = tokenHelper.createToken({ 
            id: user?.dataValues?.id, 
            username : user?.dataValues?.username 
        });

        await User?.update(
            { 
                phone,
                isVerified : 0,
                verify_token : accessToken,
                expired_token : moment().add(1,"days").format("YYYY-MM-DD HH:mm:ss")
            }, 
            { 
                where: {
                    id: req.user.id
                }
            }
        );        

        const template = fs.readFileSync(path.join(process.cwd(), "templates", "email.html"), "utf8");

        const message  = handlebars.compile(template)({ link : `http://localhost:3000/verification/${accessToken}` })

        const mailOptions = {
            from: config.GMAIL,
            to: user?.dataValues?.email,
            subject: "Verification Change Phone Number",
            html: message
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw error;
            console.log("Email sent: " + info.response);
        })

        res.status(200).json({ 
            message : "Changed Phone Number Success, Please Verify Again before Login",
        })

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ValidationError) {
            return next({
                status : errorMiddleware.BAD_REQUEST_STATUS, 
                message : error?.errors?.[0]
            })
        }

        next(error)
    }
}

export const changeProfile = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        if (!req.file) {
            return next ({ 
                status: errorMiddleware.BAD_REQUEST_STATUS,
                message: "Please upload an image." 
            })
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

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        next(error)
    }
}

export const getProfilePicture = async (req, res, next) => {
    try {
        const user = await User?.findOne(
            { 
                where : 
                { 
                    id : req.user.id 
                } 
            }
        );

        if (!user) throw ({ 
            status : errorMiddleware.BAD_REQUEST_STATUS, 
            message : errorMiddleware.USER_DOES_NOT_EXISTS 
        })

        if (!user.profile_pic) throw ({ 
            status : errorMiddleware.NOT_FOUND_STATUS, 
            message : "Profile Picture is empty"
        })

        res.status(200).json(config.URL_PIC + user.profile_pic) //https://res.cloudinary.com/dpgk4f2eu/image/upload/f_auto,q_auto/v1/
    } catch (error) {
        next(error)
    }
}