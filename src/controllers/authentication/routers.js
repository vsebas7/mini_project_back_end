import { Router } from "express"
import verifyUser from "../../middleware/token.verify.js"
import * as AuthControllers from "./index.js"
import { createCloudinaryStorage, createUploader } from "../../helpers/uploader.js"

const storage = createCloudinaryStorage("profiles")
const uploader = createUploader(storage)
const router = Router()

router.post("/register", AuthControllers.register)
router.post("/login", AuthControllers.login)
router.get("/keep_login", verifyUser, AuthControllers.keepLogin)
router.put("/forgot_password", AuthControllers.forgotPassword)
router.patch("/reset_password", verifyUser, AuthControllers.resetPassword)
router.get("/users/verification", AuthControllers.verificationUser)
router.patch("/users/change_username", verifyUser, AuthControllers.changeUsername)
router.patch("/users/change_email", verifyUser, AuthControllers.changeEmail)
router.patch("/users/change_password", verifyUser, AuthControllers.changePassword)
router.patch("/users/change_phone", verifyUser, AuthControllers.changePhone)
router.patch("/users/change_profile", verifyUser, uploader.single("file"), AuthControllers.changeProfile)
router.get("/users/profile_picture", verifyUser, AuthControllers.getProfilePicture)

export default router
