#!/usr/bin/env node

const { exec } = require('child_process');

const markdownFilePath = process.argv[2];

if (!markdownFilePath) {
  console.error('Usage: openmd <filename.md>');
  process.exit(1);
}

// Use npm start to launch the Electron app, passing the markdown file path
const command = `npm start -- "${markdownFilePath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stdout) {
    console.log(`stdout: ${stdout}`);
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
});
