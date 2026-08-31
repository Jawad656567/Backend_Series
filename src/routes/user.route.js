import { Router } from "express";
import { LoggedoutUser, LoginUser, refreshAccesstoken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/Multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(LoginUser);

router.route("/logout").post(verifyJWT, LoggedoutUser);

router.route("/refresh-token").post(refreshAccesstoken)

export default router;