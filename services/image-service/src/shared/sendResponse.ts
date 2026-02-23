import { Response } from "express";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
  totalWork?: number;
  apiVersion?: string;
}

interface ResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T | null;
  errors?: any;
  meta?: Meta | null;
}

const sendResponse = <T>(res: Response, jsonData: ResponseData<T>) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    data: jsonData.data ?? null,
    errors: jsonData.errors ?? null,
    meta: {
      apiVersion: "v1",
      ...jsonData.meta,
    },
  });
};

export default sendResponse;
