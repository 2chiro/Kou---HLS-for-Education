'use strict'

const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");
const exec = require('child_process').execFile

const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer')

let mainWindow

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

function createWindow () {
  installExtension(REDUX_DEVTOOLS)
      .then(name => console.log(name))
      .catch(err => console.log(err))
  installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(name))
      .catch(err => console.log(err))
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.setTitle('教育用高位合成CAD（仮）')
  mainWindow.loadURL(url.format({ //読み込むコンテンツを指定
    pathname: path.join(__dirname, 'out/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  //ウィンドウを閉じるときの処理
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

ipcMain.on('dfg', (event) => {
  var algPath = path.join(__dirname, 'algorithms/dfg-generator.jar')
  var cPath = path.join(__dirname, 'noname/noname.c')
  var dfgPath = path.join(__dirname, 'noname/dfg.dat')
  
  console.log(algPath, cPath, dfgPath)
  exec('java', ['-jar', algPath, cPath, dfgPath], (err, stdout, stderr) => {
    if (err != null) {
      console.log(err)
      var result = 'Error'
      event.sender.send('end_dfg', result)
    } else {
      console.log(stdout)
      var result = 'Complete'
      event.sender.send('end_dfg', result)
    }
  })
})

ipcMain.on('scheduling', (event, target, a, s, m, d) => {
  console.log(target)
  var algPath = path.join(__dirname, 'algorithms/scheduling/' + target.path)
  var dfgPath = path.join(__dirname, 'noname/dfg.dat')
  var sdfgPath = path.join(__dirname, 'noname/sdfg.dat')
  console.log(algPath, dfgPath, a, s, m, d)
  exec('perl', [algPath, dfgPath, sdfgPath, a, s, m, d], (err, stdout, stderr) => {
    if (err != null) {
      console.log(err)
      var result = 'Error'
      event.sender.send('end_scheduling', result)
    } else {
      console.log(stdout)
      var result = 'Complete'
      event.sender.send('end_scheduling', result)
    }
  })
})

ipcMain.on('binding', (event, target) => {
  console.log(target)
  var algPath = path.join(__dirname, 'algorithms/binding/', target.path)
  var sdfgPath = path.join(__dirname, 'noname/sdfg.dat')
  var bindPath = path.join(__dirname, 'noname/bind.dat')
  var newsdfgPath = target.newsdfg ? path.join(__dirname, 'noname/sdfg.dat') : "dummy"
  var topPath = target.top ? path.join(__dirname, 'noname/top.dat') : "dummy"
  
  console.log(algPath, sdfgPath, bindPath, newsdfgPath, topPath)
  exec('java', ['-jar', algPath, sdfgPath, bindPath, newsdfgPath, topPath], (err, stdout, stderr) => {
    if (err != null) {
      console.log(err)
      var result = 'Error'
      event.sender.send('end_binding', result)
    } else {
      console.log(stdout)
      var result = 'Complete'
      event.sender.send('end_binding', result)
    }
  })
})

ipcMain.on('vhdl', (event) => {
  var algPath = path.join(__dirname, 'algorithms/vhdl-generator.pl')
  var sdfgPath = path.join(__dirname, 'noname/sdfg.dat')
  var bindPath = path.join(__dirname, 'noname/bind.dat')
  var topPath = path.join(__dirname, 'noname/top.dat')
  var cfPath = path.join(__dirname, 'noname/cf.dat')
  var vhdlPath = path.join(__dirname, 'noname/noname.vhdl')
  console.log(algPath, sdfgPath, bindPath, topPath, cfPath, vhdlPath)
  exec('perl', [algPath, sdfgPath, bindPath, topPath, cfPath, vhdlPath], (err, stdout, stderr) => {
    if (err != null) {
      console.log(err)
      var result = 'Error'
      event.sender.send('end_vhdl', result)
    } else {
      console.log(stdout)
      var result = 'Complete'
      event.sender.send('end_vhdl', result)
    }
  })
})