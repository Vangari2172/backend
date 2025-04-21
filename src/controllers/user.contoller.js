import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
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
  console.log("first123", fullName, email, userName, password);

  if (
    ["fullName", "email", "userName", "password"]?.some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "Email or Username already exists");
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar or cover image");
  }

  const user = User.create({
    fullName,
    email,
    userName: userName?.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
});
