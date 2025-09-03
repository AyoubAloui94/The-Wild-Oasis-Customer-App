/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "puanukmdksxbrsdogaca.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/cabin-images/**"
      }
    ],
    formats: ["image/webp"],
    minimumCacheTTL: 31536000 // 1 year
  }
  // output: "export"
}

export default nextConfig
