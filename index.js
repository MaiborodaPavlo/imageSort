const path = require('path');
const img = require('./images.js');
const app = require('commander');

app
  .usage( '-m <dirName> -t <pathToDirectory> [-d]')
  .option('-m, --mkdir <name>', 'Make a new directory in current path')
  .option('-t, --targetdir <path>', 'Path to target directory for necessary sort files')
  .option('-d, --delete', 'Delete target directory')
  .parse(process.argv);

if (!app.mkdir || !app.targetdir) {
  app.outputHelp();
  return;
}

const base = app.targetdir;
const dest = app.mkdir;
let needDelete = app.delete;

const destDir = path.join(base, '..', dest);

async function main(){
  try{
    let images = await img.findImages(base);
    await img.makeFolderIfNeed(destDir);
    await img.disassembleImages(destDir, images);
    if(needDelete){
      await img.deleteFolder(base);
    }
  } catch(err) {
    console.log(err.message);
  }
}

main();
