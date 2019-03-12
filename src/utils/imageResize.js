const sharp = require('sharp');
export default function (imageBuffer, width, height) {
  return new Promise(function (resolve, reject) {
    sharp(imageBuffer)
        // .jpeg({ quality: 70, progressive: true })
        .resize(width, height)
        .toBuffer()
        .then(resolve)
        .catch(reject)
  })
}