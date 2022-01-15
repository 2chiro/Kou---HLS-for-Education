'use strict'

const {app, BrowserWindow, ipcMain, dialog, shell, Menu, MenuItem} = require('electron')
const path = require('path')
const url = require('url')
const ProgressBar = require('electron-progressbar')
const fs = require('fs')
const readLine = require('readline')
const archiver = require('archiver')
const rimraf = require('rimraf')
const unzipper = require('unzipper')

let dirPath

app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");
const exec = require('child_process').execFile

const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer') // デバッグ用ツール

let mainWindow, renameWindow

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

function createWindow () {

  // デバッグ用ツール
  installExtension(REDUX_DEVTOOLS)
      .then(name => console.log(name))
      .catch(err => console.log(err))
  installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(name))
      .catch(err => console.log(err))
  
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    frame: false,
    resizable: true,
    useContentSize: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
  })
  mainWindow.setTitle('Kou - High-level Synthesis for Education')
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'out/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
    const __dirname = path.resolve()
    var tmpPath = path.join(__dirname, 'tmp')
    rimraf.sync(tmpPath)
  })
  
}

ipcMain.on('filepath', (event, dir) => {
  dirPath = dir
})

/* 名前変更画面 */
function createRenameWindow () {
  renameWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: 250,
    height: 70,
    resizable: false,
    frame: false,
    useContentSize: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
  })
  renameWindow.setTitle('名前の変更')
  renameWindow.setMenuBarVisibility(false)
  renameWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'out/rename.html'),
    protocol: 'file:',
    slashes: true
  }))
}

// エクスプローラ　編集メニュー画面
ipcMain.on('show-context-menu', (event, node, index) => {
  var menu = new Menu()
  menu.append(new MenuItem({label: '選択', click: () => event.sender.send('select')}))
  menu.append(new MenuItem({label: '複製', click: () => event.sender.send('copy')}))
  menu.append(new MenuItem({label: '名前変更', click: () => {
    createRenameWindow()
    renameWindow.show()
  }}))
  if (node.length > 1) {
    menu.append(new MenuItem({label: '削除', click: () => event.sender.send('delete')}))
  }
  //編集メニューを閉じたとき
  menu.on('menu-will-close', () => {
    event.sender.send('menu-close')
  })
  menu.popup()
})

ipcMain.on('rename', (event, value) => {
  console.log(value)
  renameWindow.close()
  mainWindow.webContents.send('s_rename', value)
})

ipcMain.on('dfg', (event, node, tid) => {
  var progressBar = new ProgressBar({
    title: 'DFG変換',
    text: 'DFG変換',
    indeterminate: false,
    browserWindow: {
      webPreferences: {
        nodeIntegration: true
      }
    }
  })
  progressBar
    .on('completed', function () {
      progressBar.detail = 'DFGに変換しました'
    })
    .on('aborted', function () {

    })

  var algPath = path.join(dirPath, 'algorithms/dfg-generator.jar')
  var cPath = path.join(dirPath, 'tmp', '' + tid, node.nodeName + '.c')
  var dfgPath = path.join(dirPath, 'tmp', '' + tid, 'dfg.dat')
  console.log(algPath, cPath, dfgPath)
  
  function cFileGenerate () {
    return new Promise ((resolve) => {
      try {
        console.log('C言語ファイルを作成しています')
        progressBar.value = 0
        progressBar.detail = 'C言語ファイルを作成しています'
        const cFile = fs.createWriteStream(cPath, 'utf8')
        cFile.write(node.code)
        cFile.end()
        resolve('C file generation completed...')
      } catch (err) {
        console.log(err)
      }
    })
  }

  function dfgRun () {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.value < 30) {
          setTimeout(progress, 1000/30)
        }
      }
      setTimeout(() => {
        console.log('変換器を実行しています')
        progressBar.detail = '変換器を実行しています'
        progressBar.value = 30
        exec('java', ['-jar', algPath, cPath, dfgPath], (err, stdout, stderr) => {
          if (err != null) {
            console.log(err)
            var result = 'Error'
            resolve(result)
          } else {
            console.log(stdout)
            var result = 'Complete'
            resolve(result)
          }
        })
      }, 1000)
    })
  }

  function dfgFileInput (result) {
    return new Promise ((resolve) => {
      console.log(result)
      if (result === 'Error') {
        resolve()
      } else {
        progress()
        function progress () {
          progressBar.value += 1
          if (progressBar.isInProgress() && progressBar.value < 95) {
            setTimeout(progress, 2000/70)
          }
        }
        setTimeout(() => {
          console.log('DFGに変換しています')
          progressBar.detail = 'DFGに変換しています'
          const dfgFile = fs.createReadStream(dfgPath, 'utf8')
          const dfgLine = readLine.createInterface(dfgFile, {})
          var vertex = false
          var edge = false
          var separator = /\s+/
          var nodeType = []
          var nodeX = []
          var nodeY = []
          var nodeEdge1 = []
          var nodeEdge2 = []
          var nodeEdgeType = []
          dfgLine.on('line', data => {
            var str = data.split(separator)
            if (str[0] === '--vertex') {
              vertex = true
              edge = false
            } else if (str[0] === '--edge') {
              vertex = false
              edge = true
            } else if (str[0] === '--exclusive') {
              var arrangedNode = [nodeType, nodeX, nodeY, nodeEdge1, nodeEdge2, nodeEdgeType]
              progressBar.value = 100
              resolve(arrangedNode)
            } else {
              if (vertex) {
                nodeType.push(str[1])
                nodeX.push(Number(str[2]))
                nodeY.push(Number(str[3]))
              } else if (edge) {
                nodeEdge1.push(Number(str[1]))
                nodeEdge2.push(Number(str[2]))
                nodeEdgeType.push(str[3])
              }
            }
          })
        }, 2000)
      }
    })
  }

  cFileGenerate().then(dfgRun).then(dfgFileInput).then((response) => {
    console.log(response)
    event.sender.send('end_dfg', response)
    progressBar.setCompleted()
  })
})

ipcMain.on('scheduling', (event, node, target, tid) => {
  var progressBar = new ProgressBar({
    title: 'スケジューリング中',
    text: 'スケジューリング中',
    indeterminate: false,
    browserWindow: {
      webPreferences: {
        nodeIntegration: true
      }
    }
  })
  progressBar
    .on('completed', function () {
      progressBar.detail = 'スケジューリングが完了しました'
    })
    .on('aborted', function () {

    })
  
  console.log(target)
  var algPath = path.join(dirPath, 'algorithms/scheduling/' + target.path)
  var dfgPath = path.join(dirPath, 'tmp', '' + tid, 'dfg.dat')
  var sdfgPath = path.join(dirPath, 'tmp', '' + tid, 'sdfg.dat')
  var a = node.add, s = node.sub, m = node.mult, d = node.div
  console.log(algPath, dfgPath, sdfgPath, a, s, m, d)

  function schedulingRun () {
    return new Promise ((resolve) => {
      progressBar.value = 0
      progressBar.detail = '指定したアルゴリズムを実行しています'
      exec('perl', [algPath, dfgPath, sdfgPath, a, s, m, d], (err, stdout, stderr) => {
        if (err != null) {
          console.log(err)
          var result = 'Error'
          resolve(result)
        } else {
          console.log(stdout)
          var result = 'Complete'
          resolve(result)
        }
      })
    })
  }

  function sdfgFileInput () {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.isInProgress() && progressBar.value < 95) {
          setTimeout(progress, 2000/100)
        }
      }
      setTimeout(() => {
        const sdfgFile = fs.createReadStream(sdfgPath, 'utf8')
        const sdfgLine = readLine.createInterface(sdfgFile, {})
        var vertex = false
        var separator = /\s+/
        var nodeTime = []
        var cycle = 0
        sdfgLine.on('line', data => {
          var str = data.split(separator)
          if (str[0] === '--vertex') {
            vertex = true
          } else if (str[0] === '--edge') {
            vertex = false
          } else if (str[0] === '--exclusive') {
            cycle = cycle + 1
            var arrangedNode = [nodeTime, cycle]
            progressBar.value = 100
            resolve(arrangedNode)
          } else {
            if (vertex) {
              nodeTime.push(Number(str[2]))
              cycle = Number(str[2]) > cycle ? Number(str[2]) : cycle
            }
          }
        })
      }, 2000)
    })
  }

  schedulingRun().then(sdfgFileInput).then((response) => {
    console.log(response)
    event.sender.send('end_scheduling', response)
    progressBar.setCompleted()
  })

})

ipcMain.on('binding', (event, node, target, tid) => {
  var progressBar = new ProgressBar({
    title: 'バインディング中',
    text: 'バインディング中',
    indeterminate: false,
    browserWindow: {
      webPreferences: {
        nodeIntegration: true
      }
    }
  })
  progressBar
    .on('completed', function () {
      progressBar.detail = 'バインディングが完了しました'
    })
    .on('aborted', function () {

    })

  console.log(target)
  var algPath = path.join(dirPath, 'algorithms/binding/', target.path)
  var sdfgPath = path.join(dirPath, 'tmp', '' + tid, 'sdfg.dat')
  var bindPath = path.join(dirPath, 'tmp', '' + tid, 'bind.dat')
  var newsdfgPath = path.join(dirPath, 'tmp', '' + tid, 'newsdfg.dat')
  var topPath = path.join(dirPath, 'tmp', '' + tid, 'top.dat')
  console.log(algPath, sdfgPath, bindPath, newsdfgPath, topPath)

  function bindingRun () {
    return new Promise ((resolve) => {
      progressBar.value = 0
      progressBar.detail = '指定したアルゴリズムを実行しています'
      exec('java', ['-jar', algPath, sdfgPath, bindPath, newsdfgPath, topPath], (err, stdout, stderr) => {
        if (err != null) {
          console.log(err)
          var result = 'Error'
          resolve(result)
        } else {
          console.log(stdout)
          var result = 'Complete'
          resolve(result)
        }
      })
    })
  }

  function newsdfgFileInput () {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.isInProgress() && progressBar.value < 95) {
          setTimeout(progress, 2000/60)
        }
      }
      setTimeout(() => {
        var sdfgFile
        var sdfgLine
        if (target.newsdfg) {
          sdfgFile = fs.createReadStream(newsdfgPath, 'utf8')
          sdfgLine = readLine.createInterface(sdfgFile, {})
        } else {
          sdfgFile = fs.createReadStream(sdfgPath, 'utf8')
          sdfgLine = readLine.createInterface(sdfgFile, {})
          console.log(newsdfgPath)
          if (isExistFile(newsdfgPath)) {
            try {
              fs.unlinkSync(newsdfgPath)
            } catch (err) {
              console.log(err)
            }
          }

        }
        var separator = /\s+/
        var nodeType = []
        var nodeX = []
        var nodeY = []
        var nodeTime = []
        var nodeEdge1 = []
        var nodeEdge2 = []
        var nodeEdgeType = []
        var vertex = false
        var edge = false
        var cycle = 0
        var k = 0
        sdfgLine.on('line', data => {
          var str = data.split(separator)
          if (str[0] === '--vertex') {
            vertex = true
            edge = false
          } else if (str[0] === '--edge') {
            vertex = false
            edge = true
          } else if (str[0] === '--exclusive') {
            cycle = cycle + 1
            var arrangedNode = [nodeType, nodeX, nodeY, nodeTime, nodeEdge1, nodeEdge2, nodeEdgeType, cycle]
            resolve(arrangedNode)
          } else {
            if (vertex) {
              cycle = Number(str[2]) > cycle && str[1] !== 'R' ? Number(str[2]) : cycle
              nodeType.push(str[1])
              nodeTime.push(str[1] === 'I' && Number(str[2]) === -1 ? 0 : Number(str[2]))
              if (str[3] === 'exop') {
                nodeX.push(node.nodeMinX - 80 * k)
                nodeY.push(node.nodeMinY + 120 * Number(str[2]))
                k = k + 1
              } else {
                nodeX.push(Number(str[3]))
                nodeY.push(Number(str[4]))
              }
            }
            if (edge) {
              nodeEdge1.push(Number(str[1]))
              nodeEdge2.push(Number(str[2]))
              nodeEdgeType.push(str[3])
            }
          }
        })
      }, 2000)
    })
  }

  function bindFileInput (arrangeNode) {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.isInProgress() && progressBar.value < 95) {
          setTimeout(progress, 1000/40)
        }
      }

      setTimeout(() => {
        const bindFile = fs.createReadStream(bindPath, 'utf8')
        const bindLine = readLine.createInterface(bindFile, {})
        var reg_bind = false
        var op_bind = false
        var separator = /\s+/
        var useRegister = []
        var useALU = []
        var reg = 0
        bindLine.on('line', data => {
          var str = data.split(separator)
          if (str[0] === 'Register.') {
            reg = Number(str[1])
          } else if (str[0] === '--register') {
            reg_bind = true
            op_bind = false
          } else if (str[0] === '--operation') {
            reg_bind = false
            op_bind = true
          } else if (str[0] === '--exclusive') {
            arrangeNode.push(reg)
            arrangeNode.push(useRegister)
            arrangeNode.push(useALU)
            resolve(arrangeNode)
          } else {
            if (reg_bind) {
              var r = []
              for (var i = 1; i < str.length; i++) {
                r.push(Number(str[i]))
              }
              useRegister.push(r)
            }
            if (op_bind) {
              var op = str[0].substr(0, 3)
              var num = str[0].substr(3)
              var node = []
              switch (op) {
                case 'Add':
                  for (var i = 1; i < str.length; i++) {
                    node.push(Number(str[i]))
                  }
                  useALU.push({name: '加算器' + num, node: node})
                  break;
                case 'Sub':
                  for (var i = 1; i < str.length; i++) {
                    node.push(Number(str[i]))
                  }
                  useALU.push({name: '減算器' + num, node: node})
                  break;
                case 'Mul':
                  for (var i = 1; i < str.length; i++) {
                    node.push(Number(str[i]))
                  }
                  useALU.push({name: '乗算器' + num, node: node})
                  break;
                case 'Div':
                  for (var i = 1; i < str.length; i++) {
                    node.push(Number(str[i]))
                  }
                  useALU.push({name: '除算器' + num, node: node})
                  break;
               }
            }
          }
        })
      }, 1000)
    })
  }

  bindingRun().then(newsdfgFileInput).then(bindFileInput).then((response) => {
    console.log(response)
    event.sender.send('end_binding', response)
    progressBar.setCompleted()
  })
  
})

ipcMain.on('vhdl', (event, node, tid) => {
  var progressBar = new ProgressBar({
    title: 'ハードウェア記述に変換中',
    text: 'ハードウェア記述に変換中',
    indeterminate: false,
    browserWindow: {
      webPreferences: {
        nodeIntegration: true
      }
    }
  })
  progressBar
    .on('completed', function () {
      progressBar.detail = 'ハードウェア記述に変換しました'
    })
    .on('aborted', function () {

    })
  
  
  var algPath = path.join(dirPath, 'algorithms/vhdl-generator.pl')
  var sdfgPath = isExistFile(path.join(dirPath, 'tmp', '' + tid, 'newsdfg.dat')) ? path.join(dirPath, 'tmp', '' + tid, 'newsdfg.dat') : path.join(dirPath, 'tmp', '' + tid, 'sdfg.dat')
  var bindPath = path.join(dirPath, 'tmp', '' + tid, 'bind.dat')
  var topPath = path.join(dirPath, 'tmp', '' + tid, 'top.dat')
  var cfPath = path.join(dirPath, 'tmp', '' + tid, 'cf.dat')
  var vhdlPath = path.join(dirPath,  'tmp', '' + tid, node.nodeName + '.vhdl')
  console.log(algPath, sdfgPath, bindPath, topPath, cfPath, vhdlPath)

  function registerSet () {
    return new Promise ((resolve) => {
      progressBar.value = 0
      progressBar.detail = 'ハードウェア記述に変換しています'
      event.sender.send('end_reg_bind')
      resolve()
    })
  }

  function bindFileGenerate () {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.value < 10) {
          setTimeout(progress, 1000/10)
        }
      }
      setTimeout(() => {
        try {
          const useRegister = node.useRegister
          const useALU = node.useALU
          const bindFile = fs.createWriteStream(bindPath, 'utf8')
          bindFile.write('Register.' + '\t' + node.reg + '\n')
          bindFile.write('add.' + '\t' + node.add + '\n')
          bindFile.write('sub.' + '\t' + node.sub + '\n')
          bindFile.write('mult.' + '\t' + node.mult + '\n')
          bindFile.write('div.' + '\t' + node.div + '\n')
          bindFile.write('--register binding' + '\n')
          for (var i in useRegister) {
            var reg_num = Number(i) + 1
            bindFile.write(String(reg_num))
            for (var j in useRegister[i]) {
              bindFile.write('\t' + useRegister[i][j])
            }
            bindFile.write('\n')
          }
          bindFile.write('--operation binding' + '\n')
          for (var i in useALU) {
            var op = useALU[i].name
            var opName = op.substr(0, 3)
            var opNum = op.substr(3)
            switch (opName) {
              case '加算器':
                bindFile.write('Add' + opNum)
                for (var j in useALU[i].node) {
                  bindFile.write('\t' + useALU[i].node[j])
                }
                bindFile.write('\n')
                break
              case '減算器':
                bindFile.write('Sub' + opNum)
                for (var j in useALU[i].node) {
                  bindFile.write('\t' + useALU[i].node[j])
                }
                bindFile.write('\n')
                break
              case '乗算器':
                bindFile.write('Mul' + opNum)
                for (var j in useALU[i].node) {
                  bindFile.write('\t' + useALU[i].node[j])
                }
                bindFile.write('\n')
                break
              case '除算器':
                bindFile.write('Div' + opNum)
                for (var j in useALU[i].node) {
                  bindFile.write('\t' + useALU[i].node[j])
                }
                bindFile.write('\n')
                break
            }
          }
          bindFile.write('--exclusive block' + '\n')
          bindFile.end()
          resolve()
        } catch (err) {
          console.log(err)
          resolve('Error')
        }
      }, 1000)
    })
  }

  function vhdlRun () {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.value < 20) {
          setTimeout(progress, 1000/10)
        }
      }
      setTimeout(() => {
        exec('perl', [algPath, sdfgPath, bindPath, topPath, cfPath, vhdlPath], (err, stdout, stderr) => {
          if (err != null) {
            console.log(err)
            var result = 'Error'
            resolve(result)
          } else {
            console.log(stdout)
            var result = 'Complete'
            resolve(result)
          }
        })
      }, 1000)
    })
  }

  function CFFileInput () {
    return new Promise ((resolve) => {
      progress()
      function progress () {
        progressBar.value += 1
        if (progressBar.isInProgress() && progressBar.value < 95) {
          setTimeout(progress, 2000/80)
        }
      }
      setTimeout(() => {
        const cfFile = fs.createReadStream(cfPath, 'utf8')
        const cfLine = readLine.createInterface(cfFile, {})
        var separator = /\s+/
        var cf_node = false
        var cf_line = false
        var cn = [], cl1 = [], cl2 = [], cl3 = []
        cfLine.on('line', data => {
          console.log(data)
          var str = data.split(separator)
          if (str[0] === '--cadformat-node') {
            cf_node = true
            cf_line = false
          } else if (str[0] === '--cadformat-line') {
            cf_node = false
            cf_line = true
          } else if (str[0] === '--cadformat-end') {
            console.log(cn, cl1, cl2, cl3)
            var CN = [cn, cl1, cl2, cl3]
            resolve(CN)
          } else {
            if (cf_node) {
              cn.push(Number(str[1]))
            }
            if (cf_line) {
              cl1.push(Number(str[0]))
              cl2.push(Number(str[1]))
              cl3.push(Number(str[2]))
            }
          }
        })
      }, 2000)
    })
  }

  registerSet().then(bindFileGenerate).then(vhdlRun).then(CFFileInput).then((response) => {
    console.log(response)
    event.sender.send('end_vhdl', response)
    progressBar.setCompleted()
  })

})

function isExistFile (file) {
  try {
    fs.statSync(file)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }
  }
}

ipcMain.on('save', (event, node) => {
  dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    title: "保存",
    filters: [
      {name: '圧縮ファイル', extensions: ['zip']}
    ]
  }).then(result => {
    fs.writeFileSync(path.join(dirPath, 'tmp', 'nodeinfo.json'), JSON.stringify(node, null, '  '))
    var filename = result.filePath
    var canceled = result.canceled
    if (filename === undefined || canceled === true) {
      event.sender.send('end_save')
    } else {
      var archive = archiver.create('zip', {});
      var output = fs.createWriteStream(filename);
      archive.pipe(output);
      
      archive.directory(path.join(dirPath, 'tmp'), false);

      archive.finalize()
      output.on("close", () => {
        var archive_size = archive.pointer();
        console.log(`complete! total size : ${archive_size} bytes`)
      })
      event.sender.send('end_save')
    }

  })
})

ipcMain.on('open', (event) => {
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    title: '開く',
    filters: [
      {name: '圧縮ファイル', extensions: ['zip']}
    ]
  }).then(result => {
    var filename = result.filePaths[0]
    var canceled = result.canceled
    console.log(result)
    if (!(filename === undefined || canceled === true)) {
      fs.createReadStream(filename)
        .pipe(unzipper.Extract({path: path.join(dirPath, 'tmp')}))
        .on('close', () => {
          var jsonPath = path.join(__dirname, 'tmp', 'nodeinfo.json')
          var json = JSON.parse(fs.readFileSync(jsonPath))
          console.log(json)
          event.sender.send('end_open', json)
        })
    }
  })
})

/* 使わないと思う
ipcMain.on('openfile', (event, path) => {
  shell.openItem(path)
  event.sender.send('end_openfile')
})
*/