// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { ipcRenderer, nativeImage } from 'electron';

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }

  let mainBody = document.querySelector('body');
  if (mainBody !== null) {
    mainBody.addEventListener('click', function () {
      ipcRenderer.send('get-cursor-position-channel', 'getCursorPosition');
    });
  }

  let myPicture = nativeImage.createFromPath('./my-picture.jpg');
  const jpegBtn = document.getElementById('jpeg-btn');
  const pngBtn = document.getElementById('png-btn');
  const previewBtn = document.getElementById('preview-btn');

  jpegBtn.addEventListener('click', function () {
    let jpegImage = myPicture.toJPEG(1000);
  });

  pngBtn.addEventListener('click', function () {
    let pngImage = myPicture.toPNG();
  });

  previewBtn.addEventListener('click', function () {
    let previewImageElem = document.getElementById('preview-image');
    if (previewImageElem !== null) {
      let previewImage = myPicture.resize({
        width: 100,
        height: 100
      }).toDataURL();
      previewImageElem.setAttribute('src', previewImage);
    }
  });

});

ipcRenderer.on('response-cursor-position-channel', function (e, args) {
  let cursorX = document.getElementById('cursor-x');
  let cursorY = document.getElementById('cursor-y');

  cursorX.innerText = args.x;
  cursorY.innerText = args.y;

})