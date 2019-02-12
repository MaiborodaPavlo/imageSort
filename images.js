const fs = require('fs');
const path = require('path');
const util = require('util');

const assertExt = ['.jpg', '.jpeg', '.tif', '.tiff', '.png', '.gif', '.bmp', '.dib'];

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const lstat = util.promisify(fs.lstat);
const unlink = util.promisify(fs.unlink);
const rmdir = util.promisify(fs.rmdir);
const access = util.promisify(fs.access);

module.exports = {

  findImages: async function (base){
    const tree = {};

    const files = await readdir(base);

    for(let item of files){
      let localBase = path.join(base, item);
      let st = await stat(localBase);

      if (st.isDirectory()) {
        Object.assign(tree, await this.findImages(localBase));
      } else {
        if (assertExt.indexOf(path.extname(item)) !== -1) {
          tree[path.join(__dirname, localBase)] = path.basename(item);
        }
      }
    }
    return tree;
  },

  disassembleImages: async function (url, images) {

    for(let imagePath in images){
      let dir = path.join(url, images[imagePath][0].toUpperCase());

      await this.makeFolderIfNeed(dir);

      fs
        .createReadStream(imagePath)
        .pipe(fs.createWriteStream(path.join(dir, images[imagePath])))
        .on('error', (err) => {
          console.log(err.message);
        });
    }
  },

  makeFolderIfNeed: async function(dir) {
    try{
      await access(dir);
    } catch (err) {
      if(err.code == 'ENOENT')
        await mkdir(dir);
    else throw err;
    }
  },

  deleteFolder: async function (url) {

    let st = await access(url);
    if (!st) {
      let elems = await readdir(url);

      for(let file of elems){
        let curPath = path.join(url, file);

        st = await lstat(curPath);
        if (st.isDirectory()) {
          await this.deleteFolder(curPath);
        } else {
          await unlink(curPath);
        }
      }
      await rmdir(url);
    }
  }
};
