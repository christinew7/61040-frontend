import { createRouter, createWebHistory } from "vue-router";
import Home from "../Home.vue";
import Library from "../Library.vue";
import UploadPattern from "../UploadPattern.vue";
import Pattern from "../Pattern.vue";
import DictionaryManager from "../DictionaryManager.vue";
import { useUserStore } from "../stores/userStore";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/library/:userId",
    name: "Library",
    component: Library,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/upload/:userId",
    name: "UploadPattern",
    component: UploadPattern,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/pattern/:userId/:fileId",
    name: "Pattern",
    component: Pattern,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/dictionary",
    name: "DictionaryManager",
    component: DictionaryManager,
  },
  // ------- EXCEPTIONS -------
  // Catch-all redirect for /Library without userId
  {
    path: "/Library",
    redirect: { name: "Home" },
  },
  // Catch-all for 404s
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "Home" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    if (!userStore.isAuthenticated) {
      console.log(
        "Route requires auth but user not logged in, redirecting to home"
      );
      next({ name: "Home" });
      return;
    }

    // Check if user is trying to access their own resources
    if (to.params.userId && to.params.userId !== userStore.userId) {
      console.log("User trying to access another user's resources");
      // Redirect to user's own library - warning will be shown in component
      next({ name: "Library", params: { userId: userStore.userId } });
      return;
    }
  }

  next();
});

export default router;
