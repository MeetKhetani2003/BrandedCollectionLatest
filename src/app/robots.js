export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/operator/"],
    },
    sitemap: "https://brandedcollections.in/sitemap.xml",
  };
}