import httpStatus from "http-status";
import mongoose, { SortOrder } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { getAuthConnection } from "../../../config/database";
import { getUserModel, UserRole, UserStatus } from "./user.model";
import { IUser } from "./user.interface";

/* =============================
   Private helper
============================= */
const getUserRepository = () => {
  const connection = getAuthConnection();
  return getUserModel(connection);
};

/* =============================
   Update User
============================= */
const updateUser = async (
  id: string,
  payload: Partial<IUser>,
): Promise<IUser> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const User = getUserRepository();

  const updateData: Partial<IUser> = {
    ...(payload.fullName && { fullName: payload.fullName }),
    ...(payload.phoneNo && { phoneNo: payload.phoneNo }),
    ...(payload.image && { image: payload.image }),
  };

  const updatedUser = await User.findOneAndUpdate(
    { _id: id, status: { $ne: UserStatus.DELETED } },
    updateData,
    { new: true, runValidators: true },
  ).lean();

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return updatedUser;
};

/* =============================
   Get My Profile
============================= */
const getMyProfile = async (userId: string) => {
  const User = getUserRepository();

  const user = await User.findOne({
    _id: userId,
    status: { $ne: UserStatus.DELETED },
  })
    .select("-password -tokenVersion")
    .lean();

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/* =============================
   Get Users (Admin)
============================= */
const getUsers = async (
  options: IPaginationOptions,
  filters: {
    role?: UserRole;
    status?: UserStatus;
    searchTerm?: string;
  },
) => {
  const User = getUserRepository();

  const { page, limit, sortBy, sortOrder, skip } =
    paginationHelpers.calculatePagination(options);

  const { role, status, searchTerm } = filters;

  const query: mongoose.FilterQuery<IUser> = {
    role: { $ne: UserRole.ADMIN },
    status: { $ne: UserStatus.DELETED },
  };

  if (searchTerm) {
    query.$or = [
      { fullName: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (role) query.role = role;
  if (status) query.status = status;

  const usersPromise = User.find(query)
    .select(
      "email phoneNo fullName image role status createdAt updatedAt isVerified",
    )
    .sort(
      sortBy && sortOrder
        ? { [sortBy]: sortOrder as SortOrder }
        : { createdAt: -1 },
    )
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPromise = User.countDocuments(query);

  const [users, total] = await Promise.all([usersPromise, totalPromise]);

  return {
    meta: { total, page, limit },
    data: users,
  };
};

/* =============================
   Get User By ID
============================= */
const getUserById = async (id: string): Promise<IUser> => {
  const User = getUserRepository();

  const user = await User.findOne({
    _id: id,
    status: { $ne: UserStatus.DELETED },
  }).lean();

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/* =============================
   Soft Delete User
============================= */
const deleteUser = async (userId: string): Promise<void> => {
  const User = getUserRepository();

  const result = await User.updateOne(
    { _id: userId },
    { status: UserStatus.DELETED },
  );

  if (result.matchedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
};

export const UserService = {
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
  getMyProfile,
};
