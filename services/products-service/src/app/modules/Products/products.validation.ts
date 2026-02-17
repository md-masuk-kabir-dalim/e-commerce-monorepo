import { z } from "zod";

const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.preprocess(Number, z.number()),
    originalPrice: z.preprocess(Number, z.number().optional()).default(0),
    description: z.string(),
    specifications: z.object(),
    categoryId:z.string(),
    inStock: z.boolean().optional().default(true),
    metaTitle: z.string(),
    metaDescription: z.string(),
    metaKeywords: z.string(),
    images: z
    .array(
      z.object({
        url: z.string(),
        altText: z.string(),
        publicId: z.string(),
        description: z.string().optional(),
      })
    )
  })


type CreateProductInput = z.infer<typeof createProductSchema>;
export { createProductSchema, type CreateProductInput };
