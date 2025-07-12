import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// Import pages
import ProductListPage from "../pages/ProductListPage.vue";
import ProductCreatePage from "../pages/ProductCreatePage.vue";
import ProductDetailPage from "../pages/ProductDetailPage.vue";
import ProductEditPage from "../pages/ProductEditPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/products",
  },
  {
    path: "/products",
    name: "ProductList",
    component: ProductListPage,
  },
  {
    path: "/products/create",
    name: "ProductCreate",
    component: ProductCreatePage,
  },
  {
    path: "/products/:id",
    name: "ProductDetail",
    component: ProductDetailPage,
    props: true,
  },
  {
    path: "/products/:id/edit",
    name: "ProductEdit",
    component: ProductEditPage,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
