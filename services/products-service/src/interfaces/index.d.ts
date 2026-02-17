import express, { Application } from "express";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

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
