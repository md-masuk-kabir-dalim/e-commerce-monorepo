import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import userModel from "../modules/User/user.model";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token) {
        token = req.cookies?.accessToken;
      }

      if (!token) {
        res.clearCookie("accessToken");
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_secret as Secret,
      );

      const user = await userModel.findOne({ email: verifiedUser.email });

      if (!user) {
        res.clearCookie("accessToken");
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
      }

      if (roles.length && !roles.includes(user.role)) {
        res.clearCookie("accessToken");
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      req.user = {
        id: user?._id.toString(),
        email: user?.email,
        role: user?.role,
      };

      next();
    } catch (err) {
      res.clearCookie("accessToken");
      res.clearCookie("XSRF-TOKEN");
      res.clearCookie("SESSION-ID");
      next(err);
    }
  };
};

export default auth;
