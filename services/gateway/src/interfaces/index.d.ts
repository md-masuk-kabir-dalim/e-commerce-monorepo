import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

interface CustomError extends Error {
  status?: number;
  code?: string;
}

declare module "mongoose" {
  type FilterQuery<T> = Record<string, any>;
}
