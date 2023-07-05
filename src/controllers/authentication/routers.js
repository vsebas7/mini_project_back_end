import { Router } from "express"
import verifyJWTToken from "../../middleware/token.verify.js"

// @import the controller
import * as AuthControllers from "./index.js"

// @define routes
const router = Router()
router.post("/register", AuthControllers.register)
router.post("/login", AuthControllers.login)
router.put("/forgot_password", AuthControllers.forgotPassword)
router.get("/users", verifyJWTToken, AuthControllers.getUsers)
router.post("/users/verification", verifyJWTToken, AuthControllers.verificationUser)
router.patch("/users/change_username", verifyJWTToken, AuthControllers.changeUsername)
router.patch("/users/change_email", verifyJWTToken, AuthControllers.changeEmail)
router.patch("/users/change_password", verifyJWTToken, AuthControllers.changePassword)
router.patch("/users/change_phone", verifyJWTToken, AuthControllers.changePhone)


export default router
