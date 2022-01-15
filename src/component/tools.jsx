import React, { Component } from 'react'
import path from 'path'
import fs from 'fs'
import classNames from 'classnames'
import request from 'superagent'
import { ipcRenderer } from 'electron'

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
    constructor(props) {
        super(props)
        this.state = {
            isManualSche: true, isManualBind: true,
            scheList: [], bindList: [],
            algoScheValue: '', algoBindValue: '',
            dirPath: null
        }
    }
    componentDidMount() {
        const __dirname = path.resolve()
        this.setState({ dirPath: __dirname })
        var algPath = path.join(__dirname, 'algorithms/algorithms.json')
        request.get(algPath)
            .end((err, res) => {
                if (err) return
                console.log(res.body)
                this.setState({
                    scheList: res.body.scheduling, bindList: res.body.binding,
                    algoScheValue: res.body.scheduling[0].name, algoBindValue: res.body.binding[0].name
                })
            })
    }
    changeID(num) {
        switch (num) {
            case 1:
                if (this.props.id === 0) {
                    ipcRenderer.removeAllListeners('end_dfg')
                    ipcRenderer.send('dfg', this.props.nodeInfo[this.props.selectTabId], this.props.selectTabId)
                    ipcRenderer.on('end_dfg', (event, res) => {
                        this.props.setNodeTXYHandler(res[0], res[1], res[2], res[3], res[4], res[5])
                        console.log("C_DFG_END")
                    })
                }
            case 2:
                if (this.props.id === 1) {
                    try {
                        const node = this.props.nodeInfo[this.props.selectTabId]
                        const dfgPath = path.join(this.state.dirPath, 'tmp', '' + this.props.selectTabId, 'dfg.dat')
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
                        const sdfgPath = path.join(this.state.dirPath, 'tmp', '' + this.props.selectTabId, 'sdfg.dat')
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
                    ipcRenderer.removeAllListeners('end_reg_bind')
                    ipcRenderer.send('vhdl', this.props.nodeInfo[this.props.selectTabId], this.props.selectTabId)
                    ipcRenderer.on('end_reg_bind', (event) => {
                        this.props.setRegisterHandler()
                        console.log("REG_BIND_END")
                    })
                    ipcRenderer.on('end_vhdl', (event, res) => {
                        this.props.calculateCFHandler(res[0], res[1], res[2], res[3])
                        console.log("VHDL_END")
                    })
                }
                break
        }

        this.props.clickIDHandler(num)
    }
    //DFG-実行時間変化
    changeProcessTime(e, i) {
        const v = e.target.value
        const vrp = v.replace(/[^0-9]/g, '')
        var nv = Number(vrp)
        if (nv <= 0) {
            nv = 1
        } else if (nv > 5) {
            nv = 5
        }
        this.props.changeProcessTimeHandler(nv, i)
    }
    incrementProcessTime(i) {
        var v = 0
        switch (i) {
            case 1:
                v = this.props.nodeInfo[this.props.selectTabId].ptAdd + 1 > 5 ? 5 : this.props.nodeInfo[this.props.selectTabId].ptAdd + 1
                break
            case 2:
                v = this.props.nodeInfo[this.props.selectTabId].ptSub + 1 > 5 ? 5 : this.props.nodeInfo[this.props.selectTabId].ptSub + 1
                break
            case 3:
                v = this.props.nodeInfo[this.props.selectTabId].ptMult + 1 > 5 ? 5 : this.props.nodeInfo[this.props.selectTabId].ptMult + 1
                break
            case 4:
                v = this.props.nodeInfo[this.props.selectTabId].ptDiv + 1 > 5 ? 5 : this.props.nodeInfo[this.props.selectTabId].ptDiv + 1
                break
        }
        this.props.changeProcessTimeHandler(v, i)
    }
    decrementProcessTime(i) {
        var v = 0
        switch (i) {
            case 1:
                v = this.props.nodeInfo[this.props.selectTabId].ptAdd - 1 <= 0 ? 1 : this.props.nodeInfo[this.props.selectTabId].ptAdd - 1
                break
            case 2:
                v = this.props.nodeInfo[this.props.selectTabId].ptSub - 1 <= 0 ? 1 : this.props.nodeInfo[this.props.selectTabId].ptSub - 1
                break
            case 3:
                v = this.props.nodeInfo[this.props.selectTabId].ptMult - 1 <= 0 ? 1 : this.props.nodeInfo[this.props.selectTabId].ptMult - 1
                break
            case 4:
                v = this.props.nodeInfo[this.props.selectTabId].ptDiv - 1 <= 0 ? 1 : this.props.nodeInfo[this.props.selectTabId].ptDiv - 1
                break
        }
        this.props.changeProcessTimeHandler(v, i)
    }
    //マニュアルー自動切り替え
    changeMASChe(e) {
        const v = Number(e.target.value)
        if (v === 0) {
            this.setState({ isManualSche: true })
        } else {
            this.setState({ isManualSche: false })
        }
    }
    changeMABind(e) {
        const v = Number(e.target.value)
        if (v === 0) {
            this.setState({ isManualBind: true })
        } else {
            this.setState({ isManualBind: false })
        }
    }
    //サイクル数変化
    changeCycle(e) {
        if (this.state.isManualSche) {
            const v = e.target.value
            const vrp = v.replace(/[^0-9]/g, '')
            const nv = Number(vrp) > 100 ? 100 : Number(vrp)
            this.props.changeCycleHandler(nv)
        }
    }
    incrementCycle() {
        if (this.state.isManualSche) {
            const v = this.props.nodeInfo[this.props.selectTabId].cycle + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].cycle + 1
            this.props.changeCycleHandler(v)
        }
    }
    decrementCycle() {
        if (this.state.isManualSche) {
            const v = this.props.nodeInfo[this.props.selectTabId].cycle - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].cycle - 1
            this.props.changeCycleHandler(v)
        }
    }
    //レジスタ数変化
    changeReg(e) {
        if (this.state.isManualBind) {
            const v = e.target.value
            const vrp = v.replace(/[^0-9]/g, '')
            const nv = Number(vrp) > 100 ? 100 : Number(vrp)
            this.props.changeRegisterHandler(nv)
        }
    }
    incrementReg() {
        if (this.state.isManualBind) {
            const v = this.props.nodeInfo[this.props.selectTabId].reg + 1 > 100 ? 100 : this.props.nodeInfo[this.props.selectTabId].reg + 1
            this.props.changeRegisterHandler(v)
        }
    }
    decrementReg() {
        if (this.state.isManualBind) {
            const v = this.props.nodeInfo[this.props.selectTabId].reg - 1 < 0 ? 0 : this.props.nodeInfo[this.props.selectTabId].reg - 1
            this.props.changeRegisterHandler(v)
        }
    }
    //演算器数変化
    changeOP(e, i) {
        if (!this.state.isManualSche) {
            const v = e.target.value
            const vrp = v.replace(/[^0-9]/g, '')
            const nv = Number(vrp) > 100 ? 100 : Number(vrp)
            this.props.changeOPHandler(i, nv)
        }
    }
    incrementOP(i) {
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
    decrementOP(i) {
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
    changeAlgoSche(e) {
        const v = e.target.value
        this.setState({ algoScheValue: v })
    }
    changeAlgoBind(e) {
        const v = e.target.value
        this.setState({ algoBindValue: v })
    }
    startAlgoSche() {
        if (!this.state.isManualSche) {
            const node = this.props.nodeInfo[this.props.selectTabId]
            const target = this.state.scheList.find((v) => v.name === this.state.algoScheValue)
            ipcRenderer.removeAllListeners('end_scheduling')
            ipcRenderer.send('scheduling', node, target, this.props.selectTabId)
            ipcRenderer.on('end_scheduling', (event, res) => {
                console.log(res)
                this.props.setNodeTimeHandler(res[0], res[1])
                console.log("SCHEDULING_END")
            })
        }
    }
    startAlgoBind() {
        if (!this.state.isManualBind) {
            const node = this.props.nodeInfo[this.props.selectTabId]
            const target = this.state.bindList.find((v) => v.name === this.state.algoBindValue)
            ipcRenderer.removeAllListeners('end_binding')
            ipcRenderer.send('binding', node, target, this.props.selectTabId)
            ipcRenderer.on('end_binding', (event, res) => {
                console.log(res)
                this.props.setSDFGHandler(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7])
                this.props.useRegAndALUHandler(res[8], res[9], res[10])
                console.log("BINDING_END")
            })
        }
    }
    changeALU(e) {
        const v = e.target.value
        this.props.changeALUHandler(v)
    }
    render() {
        let tools
        const cursor = classNames({ 'dfg-icon2': this.props.dfgMode === 0 }, { 'dfg-icon': this.props.dfgMode !== 0 })
        const eraser = classNames({ 'dfg-icon2': this.props.dfgMode === 1 }, { 'dfg-icon': this.props.dfgMode !== 1 })
        const move = classNames({ 'dfg-icon2': this.props.dfgMode === 2 }, { 'dfg-icon': this.props.dfgMode !== 2 })
        const connect = classNames({ 'dfg-icon2': this.props.dfgMode === 9 }, { 'dfg-icon': this.props.dfgMode !== 9 })
        const add = classNames({ 'dfg-icon2': this.props.dfgMode === 3 }, { 'dfg-icon': this.props.dfgMode !== 3 })
        const sub = classNames({ 'dfg-icon2': this.props.dfgMode === 4 }, { 'dfg-icon': this.props.dfgMode !== 4 })
        const multi = classNames({ 'dfg-icon2': this.props.dfgMode === 5 }, { 'dfg-icon': this.props.dfgMode !== 5 })
        const div = classNames({ 'dfg-icon2': this.props.dfgMode === 6 }, { 'dfg-icon': this.props.dfgMode !== 6 })
        const input = classNames({ 'dfg-icon2': this.props.dfgMode === 7 }, { 'dfg-icon': this.props.dfgMode !== 7 })
        const output = classNames({ 'dfg-icon2': this.props.dfgMode === 8 }, { 'dfg-icon': this.props.dfgMode !== 8 })
        const paint = classNames({ 'dfg-icon2': this.props.dfgMode === 11 }, { 'dfg-icon': this.props.dfgMode !== 11 })

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
                        <div className='prev-btn' onClick={() => this.changeID(1)}>DFG変換</div>
                        <div className='next-btn' onClick={() => this.props.clickIDHandler(1)}>スキップ</div>
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
                        <label className='ma'>実行時間<br />
                            <label className='op-box'>＋
                                <input type='text' placeholder='実行時間を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].ptAdd}
                                    onChange={e => this.changeProcessTime(e, 1)} />
                                <input type='button' value='▲'
                                    className="btn"
                                    onClick={() => this.incrementProcessTime(1)} />
                                <input type='button' value='▼'
                                    className="btn"
                                    onClick={() => this.decrementProcessTime(1)} />
                            </label><br />
                            <label className='op-box'>ー
                                <input type='text' placeholder='実行時間を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].ptSub}
                                    onChange={e => this.changeProcessTime(e, 2)} />
                                <input type='button' value='▲'
                                    className="btn"
                                    onClick={() => this.incrementProcessTime(2)} />
                                <input type='button' value='▼'
                                    className="btn"
                                    onClick={() => this.decrementProcessTime(2)} />
                            </label><br />
                            <label className='op-box'>×
                                <input type='text' placeholder='実行時間を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].ptMult}
                                    onChange={e => this.changeProcessTime(e, 3)} />
                                <input type='button' value='▲'
                                    className="btn"
                                    onClick={() => this.incrementProcessTime(3)} />
                                <input type='button' value='▼'
                                    className="btn"
                                    onClick={() => this.decrementProcessTime(3)} />
                            </label><br />
                            <label className='op-box'>÷
                                <input type='text' placeholder='実行時間を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].ptDiv}
                                    onChange={e => this.changeProcessTime(e, 4)} />
                                <input type='button' value='▲'
                                    className="btn"
                                    onClick={() => this.incrementProcessTime(4)} />
                                <input type='button' value='▼'
                                    className="btn"
                                    onClick={() => this.decrementProcessTime(4)} />
                            </label><br />
                        </label><br />
                    </div>
                    <div className="tools-menu2">
                        <div className='prev-btn' onClick={() => this.changeID(0)}>前へ</div>
                        <div className='next-btn' onClick={() => this.changeID(2)}>次へ</div>
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
                            <label className='ma'>サイクル数
                                <input type='number' placeholder='サイクル数を入力'
                                    className="cycle-txtbox"
                                    value={this.props.nodeInfo[this.props.selectTabId].cycle}
                                    onChange={e => this.changeCycle(e)} />
                            </label><br />
                            <label className="manual-auto">
                                <input type='radio' name='manual-auto'
                                    checked={!this.state.isManualSche} value='1'
                                    onChange={e => this.changeMASChe(e)} />自動</label><br />
                            <label className='op-box'>＋
                                <input type='number' placeholder='加算器数を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].add}
                                    onChange={e => this.changeOP(e, 1)} />
                                ×
                                <input type='number' placeholder='乗算器数を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].mult}
                                    onChange={e => this.changeOP(e, 3)} />
                            </label>
                            <br />
                            <label className='op-box'>－
                                <input type='number' placeholder='減算器数を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].sub}
                                    onChange={e => this.changeOP(e, 2)} />
                                ÷
                                <input type='number' placeholder='除算器数を入力'
                                    className="op"
                                    value={this.props.nodeInfo[this.props.selectTabId].div}
                                    onChange={e => this.changeOP(e, 4)} />
                            </label><br />
                            <label className='ma'>アルゴリズム<br />
                                <select name="scheduling" className='txtbox'
                                    value={this.state.algoScheValue} onChange={e => this.changeAlgoSche(e)}>
                                    {scheList}
                                </select>
                                <input type='button' value='実行' onClick={() => this.startAlgoSche()} />
                            </label><br />
                        </form>
                    </div>
                    <div className="tools-menu2">
                        <div className='prev-btn' onClick={() => this.changeID(1)}>前へ</div>
                        <div className='next-btn' onClick={() => this.changeID(3)}>次へ</div>
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
                                    onChange={e => this.changeMABind(e)} />自動</label><br />
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
                        <button className='prev-btn' onClick={() => this.changeID(2)}>前へ</button>
                        <button className='next-btn' onClick={() => this.changeID(4)}>次へ</button>
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
                        <div className='prev-btn' onClick={() => this.changeID(3)}>前へ</div>
                    </div>
                </div>
                break;
        }
        return (
            <div className="tools">
                <div className="tools-title">ツール</div>
                {tools}
            </div>
        )
    }
}