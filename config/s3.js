const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: `https://${process.env.YANDEX_ENDPOINT}`,
  region: process.env.YANDEX_REGION,
  accessKeyId: process.env.YANDEX_ACCESS_KEY,
  secretAccessKey: process.env.YANDEX_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

console.log('Yandex Cloud S3 настроен');
module.exports = s3;