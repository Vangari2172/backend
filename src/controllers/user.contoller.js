import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  //TODO
  //Get users details from request body
  //validate user input
  //check if user already exists
  //check for images, check for avatar
  //upload to cloudinar, avatar and cover image
  //create user object - create entry in db
  //remove password and remove refresh Token from response
  //check for creation
  //return response

  const { fullName, email, userName, password } = req.body;

  if (
    ["fullName", "email", "userName", "password"]?.some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "Email or Username already exists");
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar or cover image");
  }

  const user = await User.create({
    fullName,
    email,
    userName: userName?.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User created successfully", createdUser));
});
