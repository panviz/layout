import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

function absolute (...args) {
  return path.join(__dirname, ...args)
}

const plugins = []
const rules = [{
  test: /\.(scss|css)$/,
  loader: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader', 'sass-loader'],
  }),
}, {
  test: /\.csv/,
  loader: 'raw-loader',
}]

export default () => {
  plugins.push(new ExtractTextPlugin('[name].css'))

  return {
    entry: {
      demo: './demo/app.js',
    },
    output: {
      path: absolute('build'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.js'],
    },
    devtool: 'source-map',
    module: { rules },
    plugins,
  }
}
