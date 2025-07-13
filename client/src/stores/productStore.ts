import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  imageUrl?: string;
  isEnabled: boolean;
  stock: number;
  tags: string[];
  index: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  isEnabled: boolean | null;
  sortBy: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  totalEnabledCount: number;
  totalDisabledCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const useProductStore = defineStore("products", () => {
  // State
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const categories = ref<string[]>([]);
  const pagination = ref<Pagination>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    totalEnabledCount: 0,
    totalDisabledCount: 0,
    hasNext: false,
    hasPrev: false,
    limit: 20,
  });
  const showBulkUploadModal = ref(false);

  const filters = ref<ProductFilters>({
    search: "",
    category: "",
    minPrice: null,
    maxPrice: null,
    isEnabled: null,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Computed
  const filteredProductCount = computed(() => pagination.value.totalCount);

  // Actions
  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    loading.value = true;
    error.value = null;

    if (!filters.value.minPrice) filters.value.minPrice = null;
    if (!filters.value.maxPrice) filters.value.maxPrice = null;

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", pagination.value.limit.toString());

      if (filters.value.search) params.append("search", filters.value.search);
      if (filters.value.category)
        params.append("category", filters.value.category);
      if (filters.value.minPrice !== null)
        params.append("minPrice", filters.value.minPrice.toString());
      if (filters.value.maxPrice !== null)
        params.append("maxPrice", filters.value.maxPrice.toString());
      if (filters.value.isEnabled !== null)
        params.append("isEnabled", filters.value.isEnabled.toString());
      params.append("sortBy", filters.value.sortBy);
      params.append("sortOrder", filters.value.sortOrder);

      const response = await axios.get(`${API_BASE_URL}/products?${params}`);

      if (append) {
        products.value.push(...response.data.products);
      } else {
        products.value = response.data.products;
      }

      pagination.value = response.data.pagination;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to fetch products";
      console.error("Error fetching products:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchNextPage = async () => {
    if (loading.value || !pagination.value.hasNext) {
      return;
    }

    const nextPage = pagination.value.currentPage + 1;
    await fetchProducts(nextPage, true);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`);
      categories.value = response.data;
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProductById = async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to fetch product";
      throw err;
    }
  };

  const createProduct = async (productData: Product) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/products`,
        productData
      );
      await fetchProducts(pagination.value.currentPage);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to create product";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${id}`,
        productData
      );
      await fetchProducts(pagination.value.currentPage);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to update product";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`);
      await fetchProducts(pagination.value.currentPage);
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to delete product";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleProductStatus = async (id: string, isEnabled: boolean) => {
    try {
      await axios.patch(`${API_BASE_URL}/products/${id}/toggle-status`, {
        isEnabled,
      });
      products.value = products.value.map((product) => {
        if (product._id === id) {
          return { ...product, isEnabled };
        }
        return product;
      });
    } catch (err: any) {
      error.value =
        err.response?.data?.error || "Failed to toggle product status";
      throw err;
    }
  };

  const bulkUpload = async (products: Product[]) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/bulk-upload`,
        products
      );
      await fetchProducts(1); // Reset to first page
      await fetchCategories(); // Refresh categories
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Failed to upload products";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    filters.value = { ...filters.value, ...newFilters };
    // Reset pagination when filters change
    pagination.value.currentPage = 1;
    // Clear existing products and fetch from the beginning
    products.value = [];
    fetchProducts(1, false);
  };

  const resetFilters = () => {
    filters.value = {
      search: "",
      category: "",
      minPrice: null,
      maxPrice: null,
      isEnabled: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    products,
    loading,
    error,
    categories,
    pagination,
    filters,
    showBulkUploadModal,

    // Computed
    filteredProductCount,

    // Actions
    fetchProducts,
    fetchNextPage,
    fetchCategories,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    bulkUpload,
    updateFilters,
    resetFilters,
    clearError,
  };
});
