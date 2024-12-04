/** @type {import('next').NextConfig} */
import 'dotenv/config'
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'mtxymbzvxrtkqtnwoluq.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
      ],
    },
  }
  
  export default nextConfig;
  