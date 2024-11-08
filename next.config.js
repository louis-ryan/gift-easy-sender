require('dotenv').config();

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  images: {
    domains: ['your-domain.com'], // Add domains you want to allow for Image Optimization
    formats: ['image/webp'],
  },
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|ico)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[hash].[ext]',
          },
        },
      ],
    });

    return config;
  },
};