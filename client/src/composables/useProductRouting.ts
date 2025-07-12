import { useRouter } from "vue-router";

export default function useProductRouting() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const handleEdit = (productId: string) => {
    router.push(`/products/${productId}/edit`);
  };

  const handleCreate = () => {
    router.push("/products/create");
  };

  const handleView = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  return {
    goBack,
    handleEdit,
    handleCreate,
    handleView,
  };
}
