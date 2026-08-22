import { Router } from "express";
import { LoggedoutUser, LoginUser, registerUser } from "../controllers/user.controller.js";
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

router.route("/login", LoginUser);
router.route("/logout", verifyJWT, LoggedoutUser)

export default router;