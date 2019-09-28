import React, {Component} from 'react'

import Tools from '../container/tools'
import Canvas from '../container/canvas'

import newIcon from '../img/new.png'
import saveIcon from '../img/save.png'
import openIcon from '../img/open.png'


export default class App extends Component {
  render () {
    return (
      <div className="app">
        <div className="left">
          <Explorer />
          <Tools />
        </div>
        <div className="right">
          <Navigator />
          <Canvas />
        </div>
      </div>
    )
  }
}
  
class Explorer extends Component {
  render () {
    return (
      <div className="explorer">
        <div className="menu">
          <div><img src={newIcon} className='explorer-icon' /></div>
          <div><img src={saveIcon} className='explorer-icon' /></div>
          <div><img src={openIcon} className='explorer-icon' /></div>
        </div>
        <div className="exp-title"><p>エクスプローラー</p></div>
      </div>
    )
  }
}

class Navigator extends Component {
  render () {
    return (
      <div className="navigator">
        <ul className="breadcrumb">
          <li>動作記述</li>
          <li>DFG生成</li>
          <li>スケジューリング</li>
          <li>バインディング</li>
          <li>RTL回路生成</li>
        </ul>
      </div>
    )
  }
}