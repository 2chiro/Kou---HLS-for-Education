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
        if (this.props.id === 1) {
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
        }
        break
      case 3:
        if (this.props.id === 2) {
          this.props.arrangeSDFGHandler()

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
  
            this.props.analysisLifetimeHandler()
  
          } catch (err) {
            console.log(err)
          }
        }
        break
      case 4:
        if (this.props.id === 3) {

          f0(this.props).then(f1).then(f2)
            .then((response) => {
              console.log(response)
              console.log("BIND_VHDL_END")
            })
          
          function f0 (props) {
            return new Promise ((resolve, reject) => {
              console.log('TEST')
              props.setRegisterHandler()
              console.log('TEST1')
              resolve(props, "f0 ==> f1")
            })
          }

          function f1(props, passVal) {
            return new Promise ((resolve, reject) => {
              console.log(passVal)
              try {
                const node = props.nodeInfo[props.selectTabId]
                const useRegister = node.useRegister
                const useALU = node.useALU
                const __dirname = path.resolve()
                const bindPath = path.join(__dirname, 'noname/bind.dat')
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
                resolve(props, "f1 ==> f2")
              } catch (err) {
                console.log(err)
              }
            })
            
          }
          
          function f2 (props, passVal) {
            return new Promise ((resolve, reject) => {
              console.log(passVal)
              ipcRenderer.send('vhdl')
              ipcRenderer.on('end_vhdl', (event, result) => {
                console.log(result)
                if (result === 'Complete') {
                  const __dirname = path.resolve()
                  const cfPath = path.join(__dirname, 'noname/cf.dat')
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
                      props.calculateCFHandler(cn, cl1, cl2, cl3)
                      resolve("f2")
                    }
                    else {
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
                }
              })
            })
            
          }
        }
        break
    }

    this.props.clickIDHandler(num)
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
      this.props.changeCycleHandler(nv)
    }
  }
  incrementCycle () {
    if (this.state.isManualSche) {
      const v = this.props.nodeInfo[this.props.selectTabId].cycle + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].cycle + 1
      this.props.changeCycleHandler(v)
    }
  }
  decrementCycle () {
    if (this.state.isManualSche) {
      const v = this.props.nodeInfo[this.props.selectTabId].cycle - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].cycle - 1
      this.props.changeCycleHandler(v)
    }
  }
  //レジスタ数変化
  changeReg (e) {
    if (this.state.isManualBind) {
      const v = e.target.value
      const vrp = v.replace(/[^0-9]/g, '')
      const nv = Number(vrp) > 100 ? 100: Number(vrp)
      this.props.changeRegisterHandler(nv)
    }
  }
  incrementReg () {
    if (this.state.isManualBind) {
      const v = this.props.nodeInfo[this.props.selectTabId].reg + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].reg + 1
      this.props.changeRegisterHandler(v)
    }
  }
  decrementReg () {
    if (this.state.isManualBind) {
      const v = this.props.nodeInfo[this.props.selectTabId].reg - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].reg - 1
      this.props.changeRegisterHandler(v)
    }
  }
  //演算器数変化
  changeOP (e, i) {
    if (!this.state.isManualSche) {
      const v = e.target.value
      const vrp = v.replace(/[^0-9]/g, '')
      const nv = Number(vrp) > 100 ? 100: Number(vrp)
      this.props.changeOPHandler(i, nv)
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
      this.props.changeOPHandler(i, v)
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
      this.props.changeOPHandler(i, v)
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
              this.props.setNodeTimeHandler(nodeTime, cycle)
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

          f0(this.props, target).then(f1)
            .then((response) => {
              console.log(response)
              console.log("BIND_END")
          })

          function f0 (props, target) {
            return new Promise ((resolve, reject) => {
              if (target.newsdfg) {
                const sdfgPath = path.join(__dirname, 'noname/sdfg.dat')
                const sdfgFile = fs.createReadStream(sdfgPath, 'utf8')
                const sdfgLine = readLine.createInterface(sdfgFile, {})
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
                    props.setSDFGHandler(nodeType, nodeX, nodeY, nodeTime, nodeEdge1, nodeEdge2, nodeEdgeType, cycle)
                    resolve(props, 'f0 => f1')
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
              } else {
                resolve(props, 'f0 => f1')
              }
            })
          }
          
          function f1 (props, passVal) {
            return new Promise ((resolve, reject) => {
              console.log(props)
              const bindPath = path.join(__dirname, 'noname/bind.dat')
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
                  props.useRegAndALUHandler(reg, useRegister, useALU)
                  resolve('f1')
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
            })
          }
          
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
      case 0:
        tools = <div className="tools-menu">
          <div className="tools-menu2">
            <button onClick={() => this.changeID(1)}>次へ</button>
          </div>
        </div>
        break
      case 1:
        tools = <div className="tools-menu">
          <div className="tools-menu2">
            <div onClick={() => this.props.clickDFGModeHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(1)}><img src={eraserIcon} className={eraser} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(2)}><img src={moveIcon} className={move} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(9)}><img src={connectIcon} className={connect} /></div>
          </div>
          <div className="tools-menu2">
            <div onClick={() => this.props.clickDFGModeHandler(3)}><img src={addIcon} className={add} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(4)}><img src={subIcon} className={sub} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(5)}><img src={multiIcon} className={multi} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(6)}><img src={divIcon} className={div} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(7)}><img src={inputIcon} className={input} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(8)}><img src={outputIcon} className={output} /></div>
          </div>
          <div className="tools-menu2">
            <button onClick={() => this.changeID(0)}>前へ</button>
            <button onClick={() => this.changeID(2)}>次へ</button>
          </div>
        </div>
        break;
      case 2:
        tools = <div className="tools-menu">
          <div className="tools-menu2">
            <div onClick={() => this.props.clickDFGModeHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(2)}><img src={moveIcon} className={move} /></div>
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
            <div onClick={() => this.props.clickDFGModeHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(2)}><img src={moveIcon} className={move} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(11)}><img src={paintIcon} className={paint} /></div>
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
      case 4:
        tools = <div className="tools-menu">
          <div className="tools-menu2">
            <div onClick={() => this.props.clickDFGModeHandler(0)}><img src={cursorIcon} className={cursor} /></div>
            <div onClick={() => this.props.clickDFGModeHandler(2)}><img src={moveIcon} className={move} /></div>
          </div>
          <div className="tools-menu2">
            <button onClick={() => this.changeID(3)}>前へ</button>
          </div>
        </div>
        break;
    }
    return (
      <div className="tools">
        <div className="tools-title"><p>ツール</p></div>
        {tools}
      </div>
     )
  }
}