const path = require('path');

module.exports = {
  SRC: path.resolve(__dirname, '..', 'src'),
  SHARED: path.resolve(__dirname, '..', 'src', 'shared'),
  ASSETS: path.resolve(__dirname, '..', 'src', 'assets'),
  SASS: path.resolve(__dirname, '..', 'src', 'assets', 'sass'),
  IMAGES: path.resolve(__dirname, '..', 'src', 'assets', 'images'),
  FONTS: path.resolve(__dirname, '..', 'src', 'assets', 'fonts')
};
