import { createRouter, createWebHistory } from "vue-router";
import Home from "../Home.vue";
import Library from "../Library.vue";
import UploadPattern from "../UploadPattern.vue";
import Pattern from "../Pattern.vue";
import DictionaryManager from "../DictionaryManager.vue";

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
  },
  {
    path: "/upload/:userId",
    name: "UploadPattern",
    component: UploadPattern,
    props: true,
  },
  {
    path: "/pattern/:userId/:fileId",
    name: "Pattern",
    component: Pattern,
    props: true,
  },
  {
    path: "/dictionary",
    name: "DictionaryManager",
    component: DictionaryManager,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
