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
    imageUrl:
      "https://tecnoga.com.py/wp-content/uploads/2023/09/4-3-2048x2048.jpg",
    tags: ["smartphone", "apple", "flagship"],
  },
  {
    name: "MacBook Air M3",
    description: "Thin and light laptop with M3 chip",
    price: 1299.99,
    category: "Electronics",
    sku: "MACBOOKAIR-M3-001",
    stock: 30,
    imageUrl:
      "https://imgs.nmplus.hk/wp-content/uploads/2023/10/screenshot-2023-10-25-at-12.32.11-pm_62373383565389af71c918.jpg",
    tags: ["laptop", "apple", "m3"],
  },
  {
    name: "Nike Air Max 90",
    description: "Classic running shoes with air cushioning",
    price: 129.99,
    category: "Sports",
    sku: "NIKE-AIRMAX90-001",
    stock: 100,
    imageUrl:
      "https://www.driving-ideas.de/images/g/nike%20air%20max%2090%20essential-061ruq.jpg",
    tags: ["shoes", "nike", "running"],
  },
  {
    name: "The Lean Startup",
    description: "Book on entrepreneurship and lean methodology",
    price: 19.99,
    category: "Books",
    sku: "BOOK-LEANSTARTUP-001",
    stock: 200,
    imageUrl: "https://storiesmart.com/images/book-50-big.jpg",
    tags: ["book", "startup", "business"],
  },
  {
    name: "LEGO Star Wars Millennium Falcon",
    description: "Iconic Star Wars spaceship building kit",
    price: 159.99,
    category: "Toys",
    sku: "LEGO-SW-MF-001",
    stock: 40,
    imageUrl:
      "https://asset.conrad.com/media10/isa/160267/c1/-/en/001934660PI02/image.jpg",
    tags: ["lego", "star wars", "toy"],
  },
  {
    name: "Patagonia Down Sweater",
    description: "Lightweight and warm down jacket",
    price: 229.99,
    category: "Clothing",
    sku: "PATAGONIA-DOWN-001",
    stock: 25,
    imageUrl:
      "https://www.bfgcdn.com/1500_1500_90/104-3820/patagonia-womens-down-sweater-hoody-down-jacket-detail-8.jpg",
    tags: ["jacket", "patagonia", "outdoor"],
  },
  {
    name: 'Samsung 55" QLED 4K TV',
    description: "Ultra HD Smart TV with vibrant colors",
    price: 699.99,
    category: "Electronics",
    sku: "SAMSUNG-QLED55-001",
    stock: 20,
    imageUrl:
      "https://images-na.ssl-images-amazon.com/images/I/91LJVJ7VasL._AC_SL1500_.jpg",
    tags: ["tv", "samsung", "qled"],
  },
  {
    name: "Yoga Mat Pro",
    description: "Non-slip, eco-friendly yoga mat",
    price: 39.99,
    category: "Sports",
    sku: "YOGAMAT-PRO-001",
    stock: 80,
    imageUrl:
      "https://i5.walmartimages.com/seo/Manduka-Black-Mat-PRO-Yoga-Mat_f9f245b1-344e-40c2-aa24-de214bf51b6f.07bea10c3ce0403337fde0c12aaa44bb.jpeg",
    tags: ["yoga", "fitness", "mat"],
  },
];
