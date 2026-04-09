export default function robots() {
  const baseUrl = process.env.APP_URL || "https://infocampus.com.br";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/me",
          "/login",
          "/register",
          "/logout",
          "/verify-email",
          "/verify-university-email",
          "/auth/",
          "/avaliar",
          "/em-breve",
          "/cursos/new",
          "/forgot-password",
          "/reset-password",
          "/docs",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
