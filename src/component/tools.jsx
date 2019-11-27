import React, {Component} from 'react'
import path from 'path'
import fs from 'fs'
import readLine from 'readline'
import classNames from 'classnames'
import request from 'superagent'
import {ipcRenderer} from 'electron'

import cursorIcon from '../img/icon-cursor.png'
import eraserIcon from '../img/icon-eraser.png'
import moveIcon from '../img/icon-move.png'

import connectIcon from '../img/icon-connect.png'
import paintIcon from '../img/icon-paint.png'

import addIcon from '../img/icon-adder.png'
import subIcon from '../img/icon-sub.png'
import multiIcon from '../img/icon-multi.png'
import divIcon from '../img/icon-divi.png'
import inputIcon from '../img/icon-input.png'
import outputIcon from '../img/icon-output.png'

export default class Tools extends Component {
  constructor (props) {
    super (props)
    this.state = {
      isManualSche: true, isManualBind: true,
      scheList: [], bindList: [],
      algoScheValue: '', algoBindValue: ''
    }
  }
  componentDidMount () {
    const __dirname = path.resolve()
    var algPath = path.join(__dirname, 'algorithms/algorithms.json')
    request.get(algPath)
      .end( (err, res) => {
        if (err) return
        console.log(res.body)
        this.setState({scheList: res.body.scheduling, bindList: res.body.binding,
          algoScheValue: res.body.scheduling[0].name, algoBindValue: res.body.binding[0].name})
      })
  }
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
        this.props.sdfgArrangeHandler()

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

          this.props.lifetimeAnalysisHandler()

        } catch (err) {
          console.log(err)
        }
        break
      
    }

    this.props.IDClickHandler(num)
  }
  //マニュアルー自動切り替え
  changeMASChe (e) {
    const v = Number(e.target.value)
    if (v === 0) {
      this.setState({isManualSche: true})
    } else {
      this.setState({isManualSche: false})
    }
  }
  changeMABind (e) {
    const v = Number(e.target.value)
    if (v === 0) {
      this.setState({isManualBind: true})
    } else {
      this.setState({isManualBind: false})
    }
  }
  //サイクル数変化
  changeCycle (e) {
    if (this.state.isManualSche) {
      const v = e.target.value
      const vrp = v.replace(/[^0-9]/g, '')
      const nv = Number(vrp) > 100 ? 100: Number(vrp)
      this.props.cycleChangeHandler(nv)
    }
  }
  incrementCycle () {
    if (this.state.isManualSche) {
      const v = this.props.nodeInfo[this.props.selectTabId].cycle + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].cycle + 1
      this.props.cycleChangeHandler(v)
    }
  }
  decrementCycle () {
    if (this.state.isManualSche) {
      const v = this.props.nodeInfo[this.props.selectTabId].cycle - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].cycle - 1
      this.props.cycleChangeHandler(v)
    }
  }
  //レジスタ数変化
  changeReg (e) {
    if (this.state.isManualBind) {
      const v = e.target.value
      const vrp = v.replace(/[^0-9]/g, '')
      const nv = Number(vrp) > 100 ? 100: Number(vrp)
      this.props.registerChangeHandler(nv)
    }
  }
  incrementReg () {
    if (this.state.isManualBind) {
      const v = this.props.nodeInfo[this.props.selectTabId].reg + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].reg + 1
      this.props.registerChangeHandler(v)
    }
  }
  decrementReg () {
    if (this.state.isManualBind) {
      const v = this.props.nodeInfo[this.props.selectTabId].reg - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].reg - 1
      this.props.registerChangeHandler(v)
    }
  }
  //演算器数変化
  changeOP (e, i) {
    if (!this.state.isManualSche) {
      const v = e.target.value
      const vrp = v.replace(/[^0-9]/g, '')
      const nv = Number(vrp) > 100 ? 100: Number(vrp)
      this.props.opChangeHandler(i, nv)
    }
  }
  incrementOP (i) {
    if (!this.state.isManualSche) {
      var op
      switch (i) {
        case 1:
          op = this.props.nodeInfo[this.props.selectTabId].add
          break
        case 2:
          op = this.props.nodeInfo[this.props.selectTabId].sub
          break
        case 3:
          op = this.props.nodeInfo[this.props.selectTabId].mult
          break
        case 4:
          op = this.props.nodeInfo[this.props.selectTabId].div
          break
      }
      const v = op + 1 > 100 ? 100 : op + 1
      this.props.opChangeHandler(i, v)
    }
  }
  decrementOP (i) {
    if (!this.state.isManualSche) {
      var op
      switch (i) {
        case 1:
          op = this.props.nodeInfo[this.props.selectTabId].add
          break
        case 2:
          op = this.props.nodeInfo[this.props.selectTabId].sub
          break
        case 3:
          op = this.props.nodeInfo[this.props.selectTabId].mult
          break
        case 4:
          op = this.props.nodeInfo[this.props.selectTabId].div
          break
      }
      const v = op - 1 < 1 ? 1 : op - 1
      this.props.opChangeHandler(i, v)
    }
  }
  changeAlgoSche (e) {
    const v = e.target.value
    this.setState({algoScheValue: v})
  }
  changeAlgoBind (e) {
    const v = e.target.value
    this.setState({algoBindValue: v})
  }
  startAlgoSche () {
    if (!this.state.isManualSche) {
      const node = this.props.nodeInfo[this.props.selectTabId]
      const target = this.state.scheList.find((v) => v.name === this.state.algoScheValue)
      const add = node.add
      const sub = node.sub
      const mult = node.mult
      const div = node.div
      ipcRenderer.send('scheduling', target, add, sub, mult, div)
      ipcRenderer.on('end_scheduling', (event, result) => {
        console.log(result)
        if (result === 'Complete') {
          const __dirname = path.resolve()
          const sdfgPath = path.join(__dirname, 'noname/sdfg.dat')
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
              this.props.nodeTimeSetHandler(nodeTime, cycle)
            } else {
              if (vertex) {
                nodeTime.push(Number(str[2]))
                cycle = Number(str[2]) > cycle ? Number(str[2]) : cycle
              }
            }
          })
        }
      })
    }
  }
  startAlgoBind () {
    if (!this.state.isManualBind) {
      const node = this.props.nodeInfo[this.props.selectTabId]
      const target = this.state.bindList.find((v) => v.name === this.state.algoBindValue)
      console.log(target)
      ipcRenderer.send('binding', target)
      ipcRenderer.on('end_binding', (event, result) => {
        console.log(result)
        if (result === 'Complete') {
          const __dirname = path.resolve()
          const bindPath = path.join(__dirname, 'noname/bind.dat')
          const bindFile = fs.createReadStream(bindPath, 'utf8')
          const bindLine = readLine.createInterface(bindFile, {})
          bindLine.on('line', data => {
            console.log(data)
          })
        }
      })
    }
  }
  changeALU (e) {
    const v = e.target.value
    this.props.changeALUHandler(v)
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
    const paint = classNames({'dfg-icon2': this.props.dfgMode === 11}, {'dfg-icon': this.props.dfgMode !== 11})

    const scheList = this.state.scheList.map(i => {
      return (
      <option value={i.name} title={i.comment}>{i.name}</option>
      )
    })

    const bindList = this.state.bindList.map(i => {
      return (
      <option value={i.name} title={i.comment}>{i.name}</option>
      )
    })

    const ALUList = this.props.nodeInfo[this.props.selectTabId].useALU.map(i => {
      return (
        <option value={i.name}>{i.name}</option>
      )
    })
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
            <form>
              <label className='manual-auto'>
                <input type='radio' name='manual-auto'
                  checked={this.state.isManualSche} value='0'
                  onChange={e => this.changeMASChe(e)} />
                マニュアル</label><br />
              <label className='ma'>サイクル数<br />
                <input type='text' placeholder='サイクル数を入力'
                  className="txtbox"
                  value={this.props.nodeInfo[this.props.selectTabId].cycle}
                  onChange={e => this.changeCycle(e)} />
                <input type='button' value='▲'
                  className="btn"
                  onClick={() => this.incrementCycle()} />
                <input type='button' value='▼'
                  className="btn"
                  onClick={() => this.decrementCycle()} />
              </label><br />
              <label className="manual-auto">
                <input type='radio' name='manual-auto'
                  checked={!this.state.isManualSche} value='1'
                  onChange={e => this.changeMASChe(e)}/>自動</label><br/>
              <label className='ma'>アルゴリズム<br />
                <select name="scheduling" className='txtbox'
                  value={this.state.algoScheValue} onChange={e => this.changeAlgoSche(e)}>
                  {scheList}
                </select>
                <input type='button' value='実行' onClick={() => this.startAlgoSche()} />
              </label><br />
              <label className='ma'>＋：
                <input type='text' placeholder='加算器数を入力'
                  className="op"
                  value={this.props.nodeInfo[this.props.selectTabId].add}
                  onChange={e => this.changeOP(e, 1)} />
                <input type='button' value='▲'
                  className="btn"
                  onClick={() => this.incrementOP(1)} />
                <input type='button' value='▼'
                  className="btn"
                  onClick={() => this.decrementOP(1)} />
              </label><br />
              <label className='ma'>－：
                <input type='text' placeholder='減算器数を入力'
                  className="op"
                  value={this.props.nodeInfo[this.props.selectTabId].sub}
                  onChange={e => this.changeOP(e, 2)} />
                <input type='button' value='▲'
                  className="btn"
                  onClick={() => this.incrementOP(2)} />
                <input type='button' value='▼'
                  className="btn"
                  onClick={() => this.decrementOP(2)} />
              </label><br />
              <label className='ma'>×：
                <input type='text' placeholder='乗算器数を入力'
                  className="op"
                  value={this.props.nodeInfo[this.props.selectTabId].mult}
                  onChange={e => this.changeOP(e, 3)} />
                <input type='button' value='▲'
                  className="btn"
                  onClick={() => this.incrementOP(3)} />
                <input type='button' value='▼'
                  className="btn"
                  onClick={() => this.decrementOP(3)} />
              </label><br />
              <label className='ma'>÷：
                <input type='text' placeholder='除算器数を入力'
                  className="op"
                  value={this.props.nodeInfo[this.props.selectTabId].div}
                  onChange={e => this.changeOP(e, 4)} />
                <input type='button' value='▲'
                  className="btn"
                  onClick={() => this.incrementOP(4)} />
                <input type='button' value='▼'
                  className="btn"
                  onClick={() => this.decrementOP(4)} />
              </label><br />
            </form>
          </div>
          <div className="tools-menu2">
            <button onClick={() => this.changeID(1)}>前へ</button>
            <button onClick={() => this.changeID(3)}>次へ</button>
          </div>
        </div>
        break
      case 3:
        tools = <div className="tools-menu">
          <div className="tools-menu2">
            <div onClick={() => this.props.dfgmodeClickHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(2)}><img src={moveIcon} className={move} /></div>
            <div onClick={() => this.props.dfgmodeClickHandler(11)}><img src={paintIcon} className={paint} /></div>
          </div>
          <div className="tools-menu2">
            <form>
              <label className='manual-auto'>
                <input type='radio' name='manual-auto'
                  checked={this.state.isManualBind} value='0'
                  onChange={e => this.changeMABind(e)} />
                マニュアル</label><br />
              <label className='ma'>レジスタ数<br />
                <input type='text' placeholder='レジスタ数を入力'
                  className="txtbox"
                  value={this.props.nodeInfo[this.props.selectTabId].reg}
                  onChange={e => this.changeReg(e)} />
                <input type='button' value='▲'
                  className="btn"
                  onClick={() => this.incrementReg()} />
                <input type='button' value='▼'
                  className="btn"
                  onClick={() => this.decrementReg()} />
              </label><br />
              <label className='ma'>演算器割当<br />
                <select name="scheduling" className='txtbox'
                  value={this.props.nodeInfo[this.props.selectTabId].ALUValue} onChange={e => this.changeALU(e)}>
                  <option value=''>演算器を選択</option>
                  {ALUList}
                </select>
              </label><br />
              <label className="manual-auto">
                <input type='radio' name='manual-auto'
                  checked={!this.state.isManualBind} value='1'
                  onChange={e => this.changeMABind(e)}/>自動</label><br/>
              <label className='ma'>アルゴリズム<br />
                <select name="scheduling" className='txtbox'
                  value={this.state.algoBindValue} onChange={e => this.changeAlgoBind(e)}>
                  {bindList}
                </select>
                <input type='button' value='実行' onClick={() => this.startAlgoBind()} />
              </label><br />
            </form>
          </div>
          <div className="tools-menu2">
            <button onClick={() => this.changeID(2)}>前へ</button>
            <button onClick={() => this.changeID(4)}>次へ</button>
          </div>
        </div>
        break
    }
    return (
      <div className="tools">
        <div className="tools-title"><p>ツール</p></div>
        {tools}
      </div>
     )
  }
}