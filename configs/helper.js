// Helper functions
const path = require('path');
const ROOT = process.cwd()

const root = (args) => {
  return path.join(ROOT, 'src', args);
}
const rootOut = (args) => {
  return path.join(ROOT, args);
}
const rootDirNode = (args) => {
  return path.resolve(__dirname,'..', args);
}
const rootNode = (args) => {
  return path.join(__dirname, args);
}

const resolve = (dir) => {
  return path.join(ROOT, dir)
}

module.exports = {
  rootOut,
  root,
  rootNode,
  rootDirNode,
  resolve
}