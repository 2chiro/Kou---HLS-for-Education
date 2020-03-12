import React, {Component} from 'react'
import {ipcRenderer} from 'electron'
import path from 'path'
import fs from 'fs'

import Tools from '../container/tools'
import Editor from '../container/editor'
import Navigator from '../container/navigator'
import Explorer from '../container/explorer'

export default class App extends Component {
  constructor (props) {
    super (props)
  }
  componentDidMount () {
    const __dirname = path.resolve()
    var tmpPath = path.join(__dirname, 'tmp')
    var tidPath = path.join(__dirname, 'tmp', '0')
    if (!isExistFile(tmpPath)) {
      fs.mkdirSync(tmpPath)
      if (!isExistFile(tidPath)) {
        fs.mkdirSync(tidPath)
      }
    }

    ipcRenderer.send('filepath', __dirname)

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
  }
  render () {
    var rightStyle
    if (this.props.id === 0) {
      rightStyle = {overflowX: "auto"}
    } else {
      rightStyle = {overflowX: "visible"}
    }
    return (
      <div className="app">
        <div className="left">
          <Explorer />
          <Tools />
        </div>
        <div className="right" style={rightStyle}>
          <Navigator />
          <Editor />
        </div>
      </div>
    )
  }
}
  
