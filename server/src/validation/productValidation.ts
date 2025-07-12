import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(1000).trim(),
  price: z.number().min(0),
  category: z.string().min(1).max(100).trim(),
  sku: z.string().min(1).max(50).trim(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  isEnabled: z.boolean().optional(),
  stock: z.number().min(0).default(0),
  tags: z.array(z.string().trim()).default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().min(1).max(1000).trim().optional(),
  price: z.number().min(0).optional(),
  category: z.string().min(1).max(100).trim().optional(),
  sku: z.string().min(1).max(50).trim().optional(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  isEnabled: z.boolean().optional(),
  stock: z.number().min(0).optional(),
  tags: z.array(z.string().trim()).optional(),
});

export const bulkUploadSchema = z.array(createProductSchema).min(1).max(1000);

export const querySchema = z.object({
  page: z
    .string()
    .min(1)
    .transform((val) => parseInt(val))
    .default(1),
  limit: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => parseInt(val))
    .default(20),
  category: z.string().optional(),
  minPrice: z
    .string()
    .min(0)
    .transform((val) => parseInt(val))
    .optional(),
  maxPrice: z
    .string()
    .min(0)
    .transform((val) => parseInt(val))
    .optional(),
  search: z.string().optional(),
  isEnabled: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
