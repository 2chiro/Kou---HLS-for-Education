import React, {Component} from 'react'

import cursorIcon from '../img/icon-cursor.png'
import eraserIcon from '../img/icon-eraser.png'
import moveIcon from '../img/icon-move.png'

import connectIcon from '../img/icon-connect.png'

import addIcon from '../img/icon-adder.png'
import subIcon from '../img/icon-sub.png'
import multiIcon from '../img/icon-multi.png'
import divIcon from '../img/icon-divi.png'
import inputIcon from '../img/icon-input.png'
import outputIcon from '../img/icon-output.png'

export default class Tools extends Component {
    render () {
      let tools
      switch (this.props.id) {
        case 1:
          tools = <div className="tools-menu">
            <div className="tools-menu2">
              <div onClick={() => this.props.dfgmodeClickHandler(0)}><img src={cursorIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(1)}><img src={eraserIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(2)}><img src={moveIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(9)}><img src={connectIcon} className='dfg-icon' /></div>
            </div>
            <div className="tools-menu2">
              <div onClick={() => this.props.dfgmodeClickHandler(3)}><img src={addIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(4)}><img src={subIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(5)}><img src={multiIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(6)}><img src={divIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(7)}><img src={inputIcon} className='dfg-icon' /></div>
              <div onClick={() => this.props.dfgmodeClickHandler(8)}><img src={outputIcon} className='dfg-icon' /></div>
            </div>
          </div>
      }
      return (
        <div className="tools">
          <div className="tools-title"><p>ツール</p></div>
          {tools}
        </div>
      )
    }
  }