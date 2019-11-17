import React, {Component} from 'react'
import path from 'path'
import fs from 'fs'
import classNames from 'classnames'

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
  changeID (num) {
    switch (num) {
      case 2:
        try {
          const node = this.props.nodeInfo[this.props.selectTabId]
          const __dirname = path.resolve()
          const dfgPath = path.join(__dirname, 'noname/dfg.dat')
          const dfgFile = fs.createWriteStream(dfgPath, 'utf8')
          dfgFile.write('--vertex' + '\n')
          for (var i in node.nodeType) {
            dfgFile.write(i + '\t' + node.nodeType[i] + '\t' + node.nodeX[i] + '\t' + node.nodeY[i] + '\n')
          }
          dfgFile.write('--edge' + '\n')
          for (var i in node.nodeEdgeType) {
            dfgFile.write(i + '\t' + node.nodeEdge1[i] + '\t' + node.nodeEdge2[i] + '\t' + node.nodeEdgeType[i] + '\n')
          }
          dfgFile.write('--exclusive block' + '\n')
          dfgFile.end()

        } catch (err) {
          console.log(err)
        }
        break
      case 3:
        this.props.SdfgArrangeHandler(this.props.selectTabId)

        try {
          const node = this.props.nodeInfo[this.props.selectTabId]
          const __dirname = path.resolve()
          const sdfgPath = path.join(__dirname, 'noname/sdfg.dat')
          const sdfgFile = fs.createWriteStream(sdfgPath, 'utf8')
          sdfgFile.write('add.' + '\t' + node.add + '\n')
          sdfgFile.write('sub.' + '\t' + node.sub + '\n')
          sdfgFile.write('mult.' + '\t' + node.mult + '\n')
          sdfgFile.write('div.' + '\t' + node.div + '\n')
          sdfgFile.write('--vertex' + '\n')
          for (var i in node.nodeType) {
            sdfgFile.write(i + '\t' + node.nodeType[i] + '\t' + node.nodeTime[i] + '\t' + node.nodeX[i] + '\t' + node.nodeY[i] + '\n')
          }
          sdfgFile.write('--edge' + '\n')
          for (var i in node.nodeEdgeType) {
            sdfgFile.write(i + '\t' + node.nodeEdge1[i] + '\t' + node.nodeEdge2[i] + '\t' + node.nodeEdgeType[i] + '\n')
          }
          sdfgFile.write('--exclusive block' + '\n')
          sdfgFile.end()

        } catch (err) {
          console.log(err)
        }
        break
      
    }

    this.props.IDClickHandler(num)
  }
  changeCycle (e) {
    const v = e.target.value
    const vrp = v.replace(/[^0-9]/g, '')
    const nv = Number(vrp) > 100 ? 100: Number(vrp)
    this.props.cycleChangeHandler(nv, this.props.selectTabId)
  }
  incrementCycle () {
    const v = this.props.nodeInfo[this.props.selectTabId].cycle + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].cycle + 1
    this.props.cycleChangeHandler(v, this.props.selectTabId)
  }
  decrementCycle () {
    const v = this.props.nodeInfo[this.props.selectTabId].cycle - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].cycle - 1
    this.props.cycleChangeHandler(v, this.props.selectTabId)
  }
  render () {
    let tools
    const cursor = classNames({'dfg-icon2': this.props.dfgMode === 0}, {'dfg-icon': this.props.dfgMode !== 0})
    const eraser = classNames({'dfg-icon2': this.props.dfgMode === 1}, {'dfg-icon': this.props.dfgMode !== 1})
    const move = classNames({'dfg-icon2': this.props.dfgMode === 2}, {'dfg-icon': this.props.dfgMode !== 2})
    const connect = classNames({'dfg-icon2': this.props.dfgMode === 9}, {'dfg-icon': this.props.dfgMode !== 9})
    const add = classNames({'dfg-icon2': this.props.dfgMode === 3}, {'dfg-icon': this.props.dfgMode !== 3})
    const sub = classNames({'dfg-icon2': this.props.dfgMode === 4}, {'dfg-icon': this.props.dfgMode !== 4})
    const multi = classNames({'dfg-icon2': this.props.dfgMode === 5}, {'dfg-icon': this.props.dfgMode !== 5})
    const div = classNames({'dfg-icon2': this.props.dfgMode === 6}, {'dfg-icon': this.props.dfgMode !== 6})
    const input = classNames({'dfg-icon2': this.props.dfgMode === 7}, {'dfg-icon': this.props.dfgMode !== 7})
    const output = classNames({'dfg-icon2': this.props.dfgMode === 8}, {'dfg-icon': this.props.dfgMode !== 8})
    switch (this.props.id) {
      case 1:
        tools = <div className="tools-menu">
          <div className="tools-menu2">
            <div onClick={() => this.props.dfgmodeClickHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(1)}><img src={eraserIcon} className={eraser} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(2)}><img src={moveIcon} className={move} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(9)}><img src={connectIcon} className={connect} /></div>
          </div>
          <div className="tools-menu2">
            <div onClick={() => this.props.dfgmodeClickHandler(3)}><img src={addIcon} className={add} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(4)}><img src={subIcon} className={sub} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(5)}><img src={multiIcon} className={multi} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(6)}><img src={divIcon} className={div} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(7)}><img src={inputIcon} className={input} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(8)}><img src={outputIcon} className={output} /></div>
          </div>
          <div className="tools-menu2">
            <button onClick={() => this.changeID(2)}>次へ</button>
          </div>
        </div>
        break;
      case 2:
          tools = <div className="tools-menu">
          <div className="tools-menu2">
            <div onClick={() => this.props.dfgmodeClickHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(2)}><img src={moveIcon} className={move} /></div>
          </div>
          <div className="tools-menu2">
            <label>サイクル数<br />
              <input type='text' placeholder='サイクル数を入力'
                className="txtbox"
                value={this.props.nodeInfo[this.props.selectTabId].cycle}
                onChange={e => this.changeCycle(e)} />
              <input type='button' value='▲'
                className="btn"
                onClick={() => this.incrementCycle()} />
              <input type='button' value='▼'
                className="btn"
                onClick={() => this.decrementCycle()}/>
            </label>
          </div>
          <div className="tools-menu2">
            <button onClick={() => this.changeID(1)}>前へ</button>
            <button onClick={() => this.changeID(3)}>次へ</button>
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