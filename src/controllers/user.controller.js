import { asynchandler } from "../utils/Asynchandler.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js"

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


export { registerUser }