import { z } from "zod";

const passwordPolicy = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[\W_]/, "Password must contain at least one special character");

const changePasswordValidationSchema = z.object({
  oldPassword: passwordPolicy,
  newPassword: passwordPolicy,
});

const registerStudentValidation = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phoneNo: z.string().optional(),
  image: z.string().optional(),
  password: passwordPolicy,
  isAgreedToTerms: z.boolean(),
});

const registerInstructorValidation = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phoneNo: z.string().optional(),
  image: z.string().optional(),
  password: passwordPolicy,
  isAgreedToTerms: z.boolean(),
  cv: z.string().min(1, "CV is required"),
});

export const authValidation = {
  changePasswordValidationSchema,
  passwordPolicy,
  registerStudentValidation,
  registerInstructorValidation,
};
