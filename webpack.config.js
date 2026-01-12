webpack.config.js
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: './js/main.js',
    'shopping-cart': './js/shopping-cart.js', // Zëvendëso cart dhe checkout
    products: './js/products.js',
    admin: './js/admin.js',
    components: './js/components.js',
    'theme-switcher': './js/theme-switcher.js',
    'email-service': './js/email-service.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'assets', to: 'assets' },
        { from: 'components', to: 'components' },
      ],
    }),
    // Generate HTML files from templates
    new HtmlWebpackPlugin({
      template: 'pages/index.html',
      filename: 'index.html',
      chunks: ['main', 'components', 'theme-switcher'],
    }),
    new HtmlWebpackPlugin({
      template: 'pages/products.html',
      filename: 'pages/products.html',
      chunks: ['products', 'cart', 'components', 'theme-switcher'],
    }),
    new HtmlWebpackPlugin({
      template: 'pages/checkout.html',
      filename: 'pages/checkout.html',
      chunks: ['checkout', 'cart', 'products', 'email-service', 'components', 'theme-switcher'],
    }),
    // Add more pages as needed
  ],
};