const testFolder = './src/background-image-mobile/';
const fs = require('fs');

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log("\"background-image-mobile/"+file+"\",");
  });
});
