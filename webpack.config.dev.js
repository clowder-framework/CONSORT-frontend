import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import autoprefixer from "autoprefixer";
import path from "path";
import ESLintPlugin from "eslint-webpack-plugin";


const PUBLIC_PATH = '';

export default {
	mode: "development",
	resolve: {
		modules: ["node_modules", "src"],
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
	},
	devtool: "source-map",
	entry: [
		"babel-polyfill",
		"whatwg-fetch",
		"./src/webpack-public-path",
		"webpack-hot-middleware/client?reload=true",
		path.resolve(__dirname, "src/index.tsx"),
		// "ol/ol.css",
		// "ol-layerswitcher/src/ol-layerswitcher.css",
	],
	target: "web",
	output: {
		path: path.resolve(__dirname, "dist"),
		publicPath: PUBLIC_PATH, // Empty string means root path
		filename: "bundle.js",
		// Ensure clean output
		clean: false // Don't clean in dev mode - webpack-dev-middleware serves from memory
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("development"),
				// CLOWDER_REMOTE_HOSTNAME and APIKEY removed - all API calls are proxied through Express server
				"SERVER_URL": JSON.stringify(process.env.SERVER_URL || ""),
				"SERVER_PORT": JSON.stringify(process.env.SERVER_PORT || ""),
				"PUBLIC_PATH": JSON.stringify(PUBLIC_PATH)
			},
			__DEV__: true
		}),
		new ESLintPlugin({
			extensions: ["ts", "tsx", "js", "jsx"],
			exclude: ["node_modules", "dist", "build"]
		}),
		new webpack.HotModuleReplacementPlugin(),
		// Don't use NoEmitOnErrorsPlugin in development - it can cause blank pages
		// Errors will still be shown in console, but the app will still be served
		// new webpack.NoEmitOnErrorsPlugin(),
		new HtmlWebpackPlugin({
			template: "src/index.ejs",
			favicon: "./src/public/assets/favicon.ico",
			// Don't minify in development for easier debugging
			minify: false,
			inject: true,
			// Ensure the HTML is generated with correct paths
			filename: 'index.html'
		}),
		new webpack.LoaderOptionsPlugin({
			debug: true,
			options: {
				sassLoader: {
					includePaths: [path.resolve(__dirname, "src", "scss")]
				},
				context: "/",
				postcss: [
					autoprefixer(),
				]
			}
		})
	],
	module: {
		rules: [
			{
				test: /\.[tj]sx?$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			},
			{
				test: /\.eot(\?v=\d+.\d+.\d+)?$/,
				type: "asset/inline"
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				type: "asset/inline"
			},
			{
				test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
				type: "asset/inline"
			},
			{
				test: /\.ico$/,
				type: "asset/resource"
			},
			{
				test: /\.svg(\?v=\d+.\d+.\d+)?$/,
				type: "asset/inline"
			},
			{
				test: /\.(jpe?g|png|gif)$/i,
				type: "asset/resource"
			},
			{
				test: /(\.css|\.scss)$/i,
				use: [
					"style-loader",
					"css-loader",
					{loader: "postcss-loader", options: {postcssOptions: {plugins: ["autoprefixer"]}}},
					{loader: "sass-loader", options: {sourceMap: true}}
				]
			},
			{
				test: /\.(pdf|gif|png|jpe?g|svg)$/,
				use: 'file-loader?name=[path][name].[ext]',
			}
			// {
			// 	test: /\.json$/,
			// 	loader: "json-loader"
			// }
		]
	},
};
