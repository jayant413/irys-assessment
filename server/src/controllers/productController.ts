import { Request, Response } from "express";
import Product from "../models/Product";
import {
  createProductSchema,
  updateProductSchema,
  bulkUploadSchema,
  querySchema,
} from "../validation/productValidation";

export class ProductController {
  // Get products with pagination and filters
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const result = querySchema.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({
          error: result.error.issues[0]?.message || "Validation error",
        });
        return;
      }
      const value = result.data;

      const {
        page,
        limit,
        category,
        minPrice,
        maxPrice,
        search,
        isEnabled,
        sortBy,
        sortOrder,
      } = value;

      // Build filter object
      const filter: any = {};

      if (category) filter.category = category;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }
      if (search) {
        filter.$text = { $search: search };
      }
      if (isEnabled !== undefined) filter.isEnabled = isEnabled;

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [products, totalCount, totalEnabledCount, totalDisabledCount] =
        await Promise.all([
          Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
          Product.countDocuments(),
          Product.countDocuments({ isEnabled: true }),
          Product.countDocuments({ isEnabled: false }),
        ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          totalEnabledCount,
          totalDisabledCount,
          hasNext,
          hasPrev,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get single product by ID
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Create new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const result = createProductSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          error: result.error.issues[0]?.message || "Validation error",
        });
        return;
      }
      const value = result.data;

      const product = new Product(value);
      await product.save();

      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
      if (error.code === 11000) {
        res.status(400).json({ error: "Product with this SKU already exists" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = updateProductSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          error: result.error.issues[0]?.message || "Validation error",
        });
        return;
      }
      const value = result.data;

      const product = await Product.findByIdAndUpdate(id, value, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json(product);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Enable/Disable product
  async toggleProductStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isEnabled } = req.body;

      if (typeof isEnabled !== "boolean") {
        res.status(400).json({ error: "isEnabled must be a boolean value" });
        return;
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { isEnabled },
        { new: true }
      );

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error("Error toggling product status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Bulk upload products
  async bulkUpload(req: Request, res: Response): Promise<void> {
    try {
      const result = bulkUploadSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          error: result.error.issues[0]?.message || "Validation error",
        });
        return;
      }
      const value = result.data;

      try {
        // Disable all existing products
        await Product.updateMany({}, { isEnabled: false });

        // Create new products with isEnabled: true
        const newProducts = value.map((product: any) => ({
          ...product,
          isEnabled: true,
        }));

        const createdProducts = await Product.insertMany(newProducts, {
          ordered: false, // Continue on error
        });

        res.status(201).json({
          message: "Bulk upload completed successfully",
          created: createdProducts.length,
          disabled: await Product.countDocuments({ isEnabled: false }),
        });
      } catch (error) {
        throw error;
      } finally {
      }
    } catch (error: any) {
      console.error("Error in bulk upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get categories
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Product.distinct("category");
      res.json(categories.sort());
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
