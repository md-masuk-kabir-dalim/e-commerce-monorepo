import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/pagination";
import UserModel, { UserRole, UserStatus } from "./user.model";
import { IUser } from "./user.interface";
import { paginationHelpers } from "../../../utils/paginationHelper";
import mongoose, { SortOrder } from "mongoose";
import userModel from "./user.model";

/*======================
  update user
  ========================
*/
const updateUser = async (
  id: string,
  payload: Partial<IUser>,
): Promise<IUser> => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    {
      fullName: payload.fullName,
      phoneNo: payload.phoneNo,
      ...(payload.image && { image: payload.image }),
    },
    { new: true },
  );

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return updatedUser;
};

/*==============================
      GET PROFILE
===============================*/
const getMyProfile = async (userId: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  const { password: _password, tokenVersion, ...userData } = user.toObject();
  return userData;
};

/*===========================
   get users
==========================
*/
const getUsers = async (
  options: IPaginationOptions,
  filters: {
    role?: UserRole;
    status?: UserStatus;
    searchTerm?: string;
  },
) => {
  const { page, limit, sortBy, sortOrder, skip } =
    paginationHelpers.calculatePagination(options);

  const { role, status, searchTerm } = filters;

  const query: mongoose.FilterQuery<IUser> = {
    role: { $ne: UserRole.ADMIN },
  };

  if (searchTerm) {
    query.$or = [
      { fullName: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (role) query.role = role;
  if (status) query.status = status;

  const users = await UserModel.find(query)
    .select(
      "id email phoneNo fullName image role status createdAt updatedAt isVerified",
    )
    .sort(
      sortBy && sortOrder
        ? { [sortBy]: sortOrder as SortOrder }
        : { createdAt: -1 },
    )
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await UserModel.countDocuments(query);

  return {
    meta: { total, page, limit },
    data: users,
  };
};

/*========================
  get user by ID
=============================
*/
const getUserById = async (id: string): Promise<IUser> => {
  const user = await UserModel.findById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/*================================
   delete user
=================================
**/
const deleteUser = async (userId: string): Promise<void> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.status = UserStatus.DELETED;
  await user.save();
};

export const UserService = {
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
  getMyProfile,
};
