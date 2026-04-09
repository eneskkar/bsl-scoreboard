import { createRouter, createWebHistory } from "vue-router";

import SportSelect from "./pages/SportSelect.vue";
import AdminRouter from "./pages/admin/AdminRouter.vue";
import OverlayRouter from "./pages/overlay/OverlayRouter.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/admin" },
    { path: "/admin", component: SportSelect },
    { path: "/admin/:matchId", component: AdminRouter },
    { path: "/overlay/:matchId", component: OverlayRouter }
  ]
});