import { asynchandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import jwt from "jsonwebtoken"

// step 4 part b
const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid)
        const accesstoken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something Went Wrong While Generating Refresh and Access Token")
    }


}

const registerUser = asynchandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // yai ham abhi check karahy hai kai req.body mai hamaara wo text jo hai wo araaha hai ya nahi
    console.log(req.body);

    const { username, email, fullName, password } = req.body;


    if ([username, email, fullName, password].some((field) =>
        field?.trim() == "")

    ) {
        throw new ApiError(400, "All fields are required")
    }


    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with email or username already exists"
        );
    }

    // yai ham apne files check karty hai kai yaha files aye hai kai nahi aor detail kai sath
    // study karty hai per kai hamare files mai kya kya hai 
    // console.log(req.files);


    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;



    // Check for avatar
    if (!avatarLocalPath) {
        throw new ApiError(
            400,
            "Avatar file is required"
        );
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // yai avatar wali image jo cloudinary per uplaod horahi hai osky bare mai sab explanation deta hai 
    console.log(avatar);


    if (!avatar) {
        throw new ApiError(
            400,
            "Avatar upload failed"
        );
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })



    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )



    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        )
    }



    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered Successfully"
        )
    )


})

const LoginUser = asynchandler(async (req, res) => {
    console.log("REQ BODY:", req.body);
    //req body -> Data (username or email)
    // find the user
    // password check
    // access and refresh token
    // send cokkie

    // step 1 req body
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is requiered");
    }

    //step 2 find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (!user) {
        throw new ApiError(404, "User Does not Exist");
    }


    //step 3 password check
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password Incorrect");
    }


    //step 4 Access and Refresh Token
    //pass the userid in generateAccessAndRefreshToken
    const { refreshToken, accesstoken } = await generateAccessAndRefreshToken(user._id);

    //send cookie 

    const loggedinUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const Option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accesstoken, Option)
        .cookie("refreshToken", refreshToken, Option)
        .json(
            new ApiResponse(200,
                {
                    user: loggedinUser,
                    accesstoken,
                    refreshToken
                }
            )
        )
})

const LoggedoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    const option = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccesstoken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken._id)

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
    }

    const { accesstoken, refreshToken: newRefreshToken } = await
        generateAccessAndRefreshToken(user._id)

    const option = {
        httpOnly: true,
        secure: true,
    }


    return res
        .status(200)
        .cookie("accesstoken", accesstoken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(
            new ApiResponse(
                200,
                { accesstoken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )

})

const changeCurrentPassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, "Password Changed"))

})

const getCurrentUser = asynchandler(async (req, res) => {
    return res.status()
        .json(200, req.user, "Current User Fetched Successfuly")

})

const updateAccountDeatail = asynchandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || email) {
        throw new ApiError(400, "All Field are Required")
    }

    const user = User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {
            new: true
        }
    ).select(-password)
    return res.status(200)
        .json(new ApiResponse(200, user, "Account Detail Updated Successfuly"))
})

const updateUserAvatar = asynchandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error While Uploading of Avatar file")
    }

    const user = await User.findByIdAndUpdate(req.user._id,

        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select(-password)

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar File Uploaded Successfully"))

})

const updateCoverImage = asynchandler(async (req, res) => {
    const coverImageLocalPath = req.file?.url

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage File Missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error While Uploading of CoverImage file")
    }

    const user = await User.findByIdAndUpdate(req.user._id,

        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select(-password)

    return res
        .status(200)
        .json(new ApiResponse(200, user, "CoverImage File Uploaded Successfully"))

})

const getUserChannelProfile = asynchandler(async (req, res) => {
    const { username } = req.params

    if (!username.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subsciber",
                as: "subscribedTo"
            }

        },
        {
            $addFields: {
                subscibersCount: {
                    $size: "$subscribers"
                },
                channelsSubscibedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscibed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscibers.subsciber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscibersCount: 1,
                channelsSubscibedToCount: 1,
                isSubscibed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,



            }
        }
    ])

    if (!channel?.lenght) {
        throw new ApiError(404, "Channel Does not Exists")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, channel[0],
                "User Channel Fetched Successfuly")
        )

})




export {
    registerUser, LoginUser, LoggedoutUser, refreshAccesstoken, changeCurrentPassword,
    getCurrentUser, updateAccountDeatail, updateUserAvatar, updateCoverImage, getUserChannelProfile
}