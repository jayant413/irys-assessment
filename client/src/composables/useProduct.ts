import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useDialog, useMessage } from "naive-ui";
//
import { useProductStore, type Product } from "../stores/productStore";

type ProductForm = {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  imageUrl: string;
  stock: number;
  tags: string[];
  isEnabled: boolean;
};

export default function useProduct() {
  const dialog = useDialog();
  const message = useMessage();
  const productStore = useProductStore();

  // Local state
  const tagInput = ref("");
  const router = useRouter();
  const loading = ref(false);
  const initialLoading = ref(false);
  const jsonInput = ref("");
  const repeataionCount = ref(500);
  const validationError = ref("");
  const currentProduct = ref<Product | null>(null);

  // Form state
  const formData = ref<ProductForm>({
    name: "",
    description: "",
    price: 0,
    category: "",
    sku: "",
    imageUrl: "",
    stock: 0,
    tags: [] as string[],
    isEnabled: true,
  });

  /* Form actions */
  // Add Tag
  const addTag = () => {
    const tag = tagInput.value.trim();
    if (tag && !formData.value.tags.includes(tag)) {
      formData.value.tags.push(tag);
      tagInput.value = "";
    }
  };

  // Remove Tag
  const removeTag = (index: number) => {
    formData.value.tags.splice(index, 1);
  };

  // Insert Sample Products
  const insertSampleProducts = () => {
    if (repeataionCount.value > 1000) {
      message.error("Maximum 1000 products allowed per upload");
      return;
    }

    const sampleData = Array.from(
      { length: repeataionCount.value },
      (_, index) => ({
        ...productsSampleData[index % productsSampleData.length],
        sku: `${productsSampleData[index % productsSampleData.length].sku}-${
          index + 1
        }`,
      })
    );

    jsonInput.value = JSON.stringify(sampleData, null, 2);
  };

  // Parse Products
  const parsedProducts = computed(() => {
    if (!jsonInput.value.trim()) return [];

    try {
      const parsed = JSON.parse(jsonInput.value);

      if (!Array.isArray(parsed)) {
        validationError.value = "Data must be an array of products";
        return [];
      }

      if (parsed.length === 0) {
        validationError.value = "Array cannot be empty";
        return [];
      }

      if (parsed.length > 1000) {
        validationError.value = "Maximum 1000 products allowed per upload";
        return [];
      }

      // Validate each product
      for (let i = 0; i < parsed.length; i++) {
        const product = parsed[i];
        const requiredFields = [
          "name",
          "description",
          "price",
          "category",
          "sku",
          "stock",
        ];

        for (const field of requiredFields) {
          if (!(field in product)) {
            validationError.value = `Product ${
              i + 1
            }: Missing required field "${field}"`;
            return [];
          }
        }

        if (typeof product.price !== "number" || product.price < 0) {
          validationError.value = `Product ${
            i + 1
          }: Price must be a positive number`;
          return [];
        }

        if (typeof product.stock !== "number" || product.stock < 0) {
          validationError.value = `Product ${
            i + 1
          }: Stock must be a non-negative number`;
          return [];
        }
      }

      validationError.value = "";
      return parsed;
    } catch (error) {
      validationError.value = "Invalid JSON format";
      return [];
    }
  });

  /* Product CRUD */
  // Create Product
  const handleProductCreate = async () => {
    if (!formData.value.name)
      return message.warning("Product name is required");
    if (!formData.value.price)
      return message.warning("Product price is required");
    if (!formData.value.category)
      return message.warning("Product category is required");
    if (!formData.value.sku) return message.warning("Product SKU is required");
    if (!formData.value.description)
      return message.warning("Product description is required");

    loading.value = true;
    try {
      await productStore.createProduct(formData.value as Product);
      message.success("Product created successfully!");
      router.back();
    } catch (error) {
      message.error("Failed to create product");
    } finally {
      loading.value = false;
    }
  };

  // Load Product
  const loadProduct = async (productId: string) => {
    initialLoading.value = true;
    try {
      const product = await productStore.fetchProductById(productId);
      currentProduct.value = product;
      if (product) {
        formData.value = {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          sku: product.sku,
          imageUrl: product.imageUrl || "",
          stock: product.stock,
          tags: [...product.tags],
          isEnabled: product.isEnabled,
        };
      } else {
        message.error("Product not found");
        router.back();
      }
    } catch (error) {
      message.error("Failed to load product");
      router.back();
    } finally {
      initialLoading.value = false;
    }
  };

  // Update Product
  const handleProductUpdate = async (productId: string) => {
    if (
      !formData.value.name ||
      !formData.value.price ||
      !formData.value.category
    ) {
      message.error("Please fill in all required fields");
      return;
    }

    loading.value = true;
    try {
      await productStore.updateProduct(productId, formData.value);
      message.success("Product updated successfully");
      router.back();
    } catch (error) {
      message.error("Failed to update product");
    } finally {
      loading.value = false;
    }
  };

  // Delete Product
  const handleDeleteProduct = (
    id: string,
    name: string,
    goBack = false
  ): void => {
    if (!id) return;
    dialog.warning({
      title: "Delete Product",
      content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      positiveText: "Delete",
      negativeText: "Cancel",
      onPositiveClick: async () => {
        try {
          await productStore.deleteProduct(id);
          message.success("Product deleted successfully");
          if (goBack) router.back();
        } catch (error) {
          message.error("Failed to delete product");
        }
      },
    });
  };

  // Bulk Upload Products
  const handleBulkUpload = async (
    products: Product[],
    closeModal: () => void
  ) => {
    try {
      await productStore.bulkUpload(products);
      closeModal();
      message.success("Products uploaded successfully");
    } catch (error) {
      message.error("Failed to upload products");
    }
  };

  // Toggle Product Status
  const toggleProductStatus = async (productId: string, isEnabled: boolean) => {
    try {
      await productStore.toggleProductStatus(productId, isEnabled);
      message.success(
        `Product ${isEnabled ? "enabled" : "disabled"} successfully`
      );
      if (currentProduct.value?._id === productId) {
        currentProduct.value.isEnabled = isEnabled;
      }
    } catch (error) {
      message.error("Failed to update product status");
    }
  };

  // Return
  return {
    handleDeleteProduct,
    handleBulkUpload,
    addTag,
    removeTag,
    formData,
    tagInput,
    handleProductUpdate,
    loading,
    toggleProductStatus,
    handleProductCreate,
    insertSampleProducts,
    jsonInput,
    repeataionCount,
    validationError,
    parsedProducts,
    loadProduct,
    initialLoading,
    currentProduct,
  };
}

// Sample Data
const productsSampleData = [
  {
    name: "iPhone 15 Pro",
    description: "Latest flagship smartphone with titanium design",
    price: 999.99,
    category: "Electronics",
    sku: "IPHONE15PRO-001",
    stock: 50,
    imageUrl: "https://example.com/iphone15pro.jpg",
    tags: ["smartphone", "apple", "flagship"],
  },
  {
    name: "MacBook Air M3",
    description: "Thin and light laptop with M3 chip",
    price: 1299.99,
    category: "Electronics",
    sku: "MACBOOKAIR-M3-001",
    stock: 30,
    imageUrl: "https://example.com/macbookair.jpg",
    tags: ["laptop", "apple", "m3"],
  },
  {
    name: "Nike Air Max 90",
    description: "Classic running shoes with air cushioning",
    price: 129.99,
    category: "Sports",
    sku: "NIKE-AIRMAX90-001",
    stock: 100,
    imageUrl: "https://example.com/airmax90.jpg",
    tags: ["shoes", "nike", "running"],
  },
];
