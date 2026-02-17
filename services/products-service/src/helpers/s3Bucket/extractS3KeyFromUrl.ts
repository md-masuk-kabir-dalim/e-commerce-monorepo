import ApiError from "../../errors/ApiErrors";

export const extractS3KeyFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname.slice(1));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, `Invalid URL format: ${url}`);
  }
};
