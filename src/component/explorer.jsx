import React, {Component} from 'react'
import {ipcRenderer} from 'electron'
import fs from 'fs-extra'
import path from 'path'
import rimraf from 'rimraf'
import newIcon from '../img/new.png'
import saveIcon from '../img/save.png'
import openIcon from '../img/open.png'

export default class Explorer extends Component {
    constructor (props) {
      super (props)
      this.state = {
        content: []
      }
    }
    newHandler () {
      const __dirname = path.resolve()
      var newPath = path.join(__dirname, 'tmp', '' + this.props.nodeInfo.length)
      fs.mkdirSync(newPath)
      this.props.newHandler()
    }
    saveHandler () {
      ipcRenderer.removeAllListeners('end_save')
      ipcRenderer.send('save', this.props.nodeInfo)
      ipcRenderer.on('end_save', (event, response) => {
        console.log("SAVE_END")
      })
    }
    openHandler () {
      ipcRenderer.removeAllListeners('end_open')
      ipcRenderer.send('open')
      ipcRenderer.on('end_open', (event, json) => {
        this.props.openHandler(json)
        console.log("OPEN_END")
      })
    }
    clickFileHandler (id, index) {
      this.props.clickIDHandler(id)
      this.props.changeSelectHandler(parseInt(index))
    }
    nameRightClickHandler (index) {
      this.props.changePointHandler(parseInt(index))
      ipcRenderer.removeAllListeners('select')
      ipcRenderer.removeAllListeners('copy')
      ipcRenderer.removeAllListeners('s_rename')
      ipcRenderer.removeAllListeners('delete')
      const node = this.props.nodeInfo
      ipcRenderer.send('show-context-menu', node, parseInt(index))
      ipcRenderer.on('select', (event) => {
        this.props.changeSelectHandler(parseInt(index))
        console.log('SELECT')
        this.props.changePointHandler(null)
      })
      ipcRenderer.on('copy', (event) => {
        const __dirname = path.resolve()
        var tidPath1 = path.join(__dirname, 'tmp', '' + index)
        var tidPath2 = path.join(__dirname, 'tmp', '' + this.props.nodeInfo.length)
        fs.copySync(tidPath1, tidPath2)

        var node = Object.assign({}, this.props.nodeInfo[index])

        var c1 = path.join(__dirname, 'tmp', '' + this.props.nodeInfo.length, node.nodeName + ".c")
        var c2 = path.join(__dirname, 'tmp', '' + this.props.nodeInfo.length, node.nodeName + "_copy.c")
        var vhdl1 = path.join(__dirname, 'tmp', '' + this.props.nodeInfo.length, node.nodeName + ".vhdl")
        var vhdl2 = path.join(__dirname, 'tmp', '' + this.props.nodeInfo.length, node.nodeName + "_copy.vhdl")
        if (isExistFile(c1)) {
          fs.renameSync(c1, c2)
        }
        if (isExistFile(vhdl1)) {
          fs.renameSync(vhdl1, vhdl2)
        }

        
        node.nodeName += '_copy'
        console.log(node)

        this.props.copyNodeHandler(node)
        console.log('COPY')
        this.props.changePointHandler(null)

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
      })
      ipcRenderer.on('s_rename', (event, name) => {
        const __dirname = path.resolve()
        var node = Object.assign({}, this.props.nodeInfo[index])
        var c1 = path.join(__dirname, 'tmp', '' + index, node.nodeName+ ".c")
        var c2 = path.join(__dirname, 'tmp', '' + index, name + ".c")
        var vhdl1 = path.join(__dirname, 'tmp', '' + index, node.nodeName + ".vhdl")
        var vhdl2 = path.join(__dirname, 'tmp', '' + index, name + ".vhdl")
        console.log(c1, c2)
        if (isExistFile(c1)) {
          console.log("TEST")
          fs.renameSync(c1, c2)
        }
        if (isExistFile(vhdl1)) {
          fs.renameSync(vhdl1, vhdl2)
        }
        this.props.renameNodeHandler(parseInt(index), name)
        console.log('RENAME')
        this.props.changePointHandler(null)

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
      })
      ipcRenderer.on('delete', (event) => {
        const __dirname = path.resolve()
        var tidPath = path.join(__dirname, 'tmp', '' + index)
        rimraf.sync(tidPath)
        for (var i = index + 1; i < node.length; i++) {
          var renamePath1 = path.join(__dirname, 'tmp', '' + i)
          var renamePath2 = path.join(__dirname, 'tmp', '' + (i-1))
          fs.renameSync(renamePath1, renamePath2)
        }
        this.props.deleteNodeHandler(parseInt(index))
        console.log('DELETE')
        this.props.changePointHandler(null)
      })
    }
    render () {
      var content = []
      this.props.nodeInfo.map((value, index, array) => {
        const __dirname = path.resolve()
        const cpath = path.join(__dirname, 'tmp', "" + index)
        var nameStyle
        if (this.props.pointTabId == index) {
          nameStyle = {color: '#53FF70'}
        } else if (this.props.selectTabId == index) {
          nameStyle = {color: '#FF5370'}
        } else {
          nameStyle = {color: 'white'}
        }
        var c = isExistFile(cpath + "/" + value.nodeName + ".c") ? <div className="exp-workspace-file" onClick={() => this.clickFileHandler(0, index)}>{value.nodeName}.c</div> : null
        var dfg = isExistFile(cpath + "/dfg.dat") ? <div className="exp-workspace-file" onClick={() => this.clickFileHandler(1, index)}>dfg.dat</div> : null
        var sdfg = isExistFile(cpath + "/sdfg.dat") ? <div className="exp-workspace-file" onClick={() => this.clickFileHandler(2, index)}>sdfg.dat</div> : null
        var bind = isExistFile(cpath + "/bind.dat") ? <div className="exp-workspace-file" onClick={() => this.clickFileHandler(3, index)}>bind.dat</div> : null
        var vhdl = isExistFile(cpath + "/" + value.nodeName + ".vhdl") ? <div className="exp-workspace-file" onClick={() => this.clickFileHandler(4, index)}>{value.nodeName}.vhdl</div> : null
        content.push(
          <div className="exp-workspace" key={index}>
            <input id={index} className="exp-workspace-input" type="checkbox" />
            <label style={nameStyle} htmlFor={index} className="exp-workspace-openbox" onContextMenu={() => this.nameRightClickHandler(index)}>
              {value.nodeName}
            </label>
            <div className="exp-workspace-second">
              {c}{dfg}{sdfg}{bind}{vhdl}
            </div>
          </div>
        )
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
      return (
        <div className="explorer">
          <div className="menu">
            <div onClick={() => this.newHandler()}><img src={newIcon} className='explorer-icon' alt="新規" title="新規" /></div>
            <div onClick={() => this.saveHandler()}><img src={saveIcon} className='explorer-icon' alt="保存" title="保存" /></div>
            <div onClick={() => this.openHandler()}><img src={openIcon} className='explorer-icon' alt="開く" title="開く" /></div>
          </div>
          <div className="exp-title">エクスプローラー</div>
          <div className="exp-content" id="ec">
            {content}
          </div>
        </div>
      )
    }
  }