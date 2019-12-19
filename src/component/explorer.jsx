import React, {Component} from 'react'

import newIcon from '../img/new.png'
import saveIcon from '../img/save.png'
import openIcon from '../img/open.png'

export default class Explorer extends Component {
    constructor (props) {
      super (props)
    }
    render () {
      return (
        <div className="explorer">
          <div className="menu">
            <div onClick={() => this.props.newHandler()}><img src={newIcon} className='explorer-icon' /></div>
            <div><img src={saveIcon} className='explorer-icon' /></div>
            <div><img src={openIcon} className='explorer-icon' /></div>
          </div>
          <div className="exp-title"><p>エクスプローラー</p></div>
        </div>
      )
    }
  }