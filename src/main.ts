import { app, BrowserWindow, dialog, globalShortcut, Menu, MenuItem,Tray,powerMonitor,session,desktopCapturer,ipcMain,screen } from "electron";
import * as path from "path";

let appTray,mainWindow:BrowserWindow;

var trayMenu=Menu.buildFromTemplate([
  {
    label:'Item 1'
  },{
    label:'Item 2'
  }
])

var mainMenu = Menu.buildFromTemplate([{
  label: 'Electron',
  submenu: [
    {
      label: 'Item1',
      enabled: false
    },
    {
      label: 'Item2',
      click: () => {
        console.log(' Item 2 From Electron Is Click');
      }
    },
    {
      label: 'Item3',
      accelerator: 'shift + F',
      click: () => {
        console.log(' Item 3 From Electron Is Click');
      }
    }, {
      label: 'Item 4',
      role: 'togglefullscreen'
    }
  ]
},
{
  label: 'Edit',
  submenu: [
    {
      label: 'Action 1'
    }, {
      label: 'Action 2'
    }
  ]
}


]);

function createWindow() {
  // Create the browser window.

  var primaryDisplay=screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    height: primaryDisplay.size.height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration:true
    },
    width: primaryDisplay.size.width/2,
    title: 'First Test App',
    backgroundColor: '#fcba03',
    show: false,
    alwaysOnTop: false,
    x:primaryDisplay.bounds.x,
    y:primaryDisplay.bounds.y
  });

  CreateAppTray();


  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  mainWindow.setMenu(mainMenu);

  mainWindow.on('ready-to-show', function () {
    mainWindow.show();

    setTimeout(function(){
      TakeScreenshot();
    },2000);

  });

  session.defaultSession.cookies.get({url:'https://github.com/'}).then(data=>{
      console.log(data)
    });

  mainWindow.webContents.on('did-finish-load', function () {
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

}

function CreateAppTray(){
  let imagePath:string=path.join('assets','app-icon.png');
  appTray=new Tray(imagePath);

  appTray.setToolTip('My Application');

  appTray.setContextMenu(trayMenu);

  appTray.on('click',function(e){

    if(e.shiftKey){
      app.quit();
    }else{
      mainWindow.isVisible()?mainWindow.hide():mainWindow.show();
    }

  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function TakeScreenshot(){
  desktopCapturer.getSources({
    types:['window'],
    thumbnailSize:{width:800,height:600}
  }).then(res=>{
    mainWindow.webContents.send('screenshot-channel',res[0].thumbnail.toDataURL());
  })
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('get-cursor-position-channel',function(e,args){
  let cursorPosition=screen.getCursorScreenPoint();
  console.log(cursorPosition);
  e.sender.send('response-cursor-position-channel',cursorPosition);
});