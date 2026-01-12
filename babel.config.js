module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@theme': './src/theme',
          '@services': './src/services',
          '@types': './src/types',
          '@hooks': './src/hooks',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
