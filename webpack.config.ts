import path from 'path';

export default {
  entry: './src/index.ts',
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    clean: true,
    globalObject: 'this',
    library: {
      name: 'reactMVVM',
      type: 'umd'
    }
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.tsx?$/,
        exclude: /node_modules/
      }
    ]
  },
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
    }
  }
}