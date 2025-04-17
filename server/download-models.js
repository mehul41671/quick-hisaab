const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'ssd_mobilenetv1_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json'
  }
];

const modelsDir = path.join(__dirname, 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('Downloading face-api.js models...');
  
  for (const model of models) {
    const filePath = path.join(modelsDir, model.name);
    try {
      await downloadFile(model.url, filePath);
      console.log(`Downloaded ${model.name}`);
    } catch (error) {
      console.error(`Error downloading ${model.name}:`, error);
    }
  }
  
  console.log('Model download complete!');
}

downloadModels(); 