const fs = require('fs');
const path = require('path');

//! 将srcPath路径的文件复制到tarPath
const copyFile = function (srcPath, tarPath, cb) {
  let rs = fs.createReadStream(srcPath);
  rs.on('error', function (err) {
    if (err) {
      console.log('read error', srcPath);
    }
    cb && cb(err);
  });

  let ws = fs.createWriteStream(tarPath);
  ws.on('error', function (err) {
    if (err) {
      console.log('write error', tarPath);
    }
    cb && cb(err);
  });
  ws.on('close', function (ex) {
    cb && cb(ex);
  });

  rs.pipe(ws);
};

//! 将srcDir文件下的文件、文件夹递归的复制到tarDir下
const copyFolder = function (srcDir, tarDir, cb) {
  fs.readdir(srcDir, function (err, files) {
    let count = 0;
    let checkEnd = function () {
      ++count == files.length && cb && cb();
    };

    if (err) {
      checkEnd();
      return;
    }

    files.forEach(function (file) {
      let srcPath = path.join(srcDir, file);
      let tarPath = path.join(tarDir, file);

      fs.stat(srcPath, function (err, stats) {
        if (stats.isDirectory()) {
          console.log('mkdir', tarPath);
          fs.mkdir(tarPath, function (err) {
            if (err) {
              console.log(err);
              return;
            }

            copyFolder(srcPath, tarPath, checkEnd);
          });
        } else {
          copyFile(srcPath, tarPath, checkEnd);
        }
      });
    });

    //为空时直接回调
    files.length === 0 && cb && cb();
  });
};

const deleteFiles = function (folderPath) {
  const fs = require('fs');
  const path = require('path');
  let forlder_exists = fs.existsSync(folderPath);
  if (forlder_exists) {
    let fileList = fs.readdirSync(folderPath);
    fileList.forEach(function (fileName) {
      fs.unlinkSync(path.join(folderPath, fileName));
    });
  }
};

// deleteFiles(path.join(__dirname, 'testDist'));
// copyFolder(path.join(__dirname, 'dist'), path.join(__dirname, 'testDist'));
