const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "src");

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? "development" : "production",
  devtool: isDev ? "source-map" : false,
  entry: {
    sidebar: path.join(srcDir, "sidebar/index.tsx"),
    options: path.join(srcDir, "options/index.tsx"),
    background: path.join(srcDir, "background/index.ts"),
    content_script: path.join(srcDir, "content/index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js",
    sourceMapFilename: "[name].js.map"
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: isDev,
            compilerOptions: {
              sourceMap: true
            }
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "../" }],
      options: {},
    }),
  ],
};
