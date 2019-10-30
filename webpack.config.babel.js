import path from 'path'

export default () => ({
  mode: 'development',
  entry: {
    layout: './index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: 'source-map',
})
