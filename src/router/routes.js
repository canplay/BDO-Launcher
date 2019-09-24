const routes = [
  {
    path: "/",
    component: () => import("layouts/MyLayout.vue"),
    children: [
      { path: "index", component: () => import("pages/Index.vue") },
      { path: "window", component: () => import("pages/Window.vue") },
      { path: "redirect", component: () => import("pages/Redirect.vue") }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
