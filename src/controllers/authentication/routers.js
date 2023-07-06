import { Router } from "express"
import verifyUser from "../../middleware/token.verify.js"

// @import the controller
import * as AuthControllers from "./index.js"

// @define routes
const router = Router()
router.get("/", AuthControllers.getUsers) //done
router.post("/register", AuthControllers.register) //done
router.post("/login", AuthControllers.login) //done
router.put("/forgot_password", AuthControllers.forgotPassword) //done
router.post("/users/verification/:token", verifyUser, AuthControllers.verificationUser) //done
router.patch("/users/change_username", verifyUser, AuthControllers.changeUsername)//done
router.patch("/users/change_email", verifyUser, AuthControllers.changeEmail) //done
router.patch("/users/change_password", verifyUser, AuthControllers.changePassword) //done
router.patch("/users/change_phone", verifyUser, AuthControllers.changePhone) //done


export default router
