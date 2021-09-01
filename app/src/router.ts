import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";

import MainPage from "./components/MainPage.vue";
import Post from './components/Post.vue';
import Maker from './components/Maker.vue';
import Cart from './components/Cart.vue';
import UserList from './components/UserList.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/main',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/post',
    name: 'Post',
    component: Post,
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
  },
  {
    path: '/userList',
    name: 'UserList',
    component: UserList,
  },
  {
    path: "/:catchAll(.*)",
    name: 'Default',
    redirect: '/main',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;