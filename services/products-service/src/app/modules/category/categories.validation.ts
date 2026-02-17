import z from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.object({
    url: z.string(),
    altText: z.string(),
    publicId: z.string(),
    description: z.string().optional(),
  }),
});


type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export { createCategorySchema, type CreateCategoryInput };