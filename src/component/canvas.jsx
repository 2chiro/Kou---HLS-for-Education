import React, {Component} from 'react'

export default class Canvas extends Component {
  constructor (props) {
    super(props)
    this.canvas = this.ctx = null
    this.animationIds = null
    this.state = {
      mouseover: false, isDragging: false,
      ratioId: 4, ratio: [0.4, 0.5, 0.64, 0.82, 1, 1.2, 1.5, 1.8, 2.2, 2.6, 3.2], before_ratio: 1,
      mouse_x: 0, mouse_y: 0, origin_x: 0, origin_y: 0,
      selectNode: [], selectEdge: false, selectEdgeStore: [],
      width: null, height: null
    }
  }
  updateDimensions () {
    this.setState({width: this.canvas.clientWidth, height: this.canvas.clientHeight})
  }
  componentDidMount () {
    if (!this.canvas) return
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
    this.initCanvas()
  }
  initCanvas () {
    if (!this.ctx) this.ctx = this.canvas.getContext("2d")
    if (this.animationIds !== null) {
      cancelAnimationFrame(this.animationIds)
    }
    this.renderCanvas(this.ctx)
  }
  renderCanvas (ctx) {
    this.animationIds = requestAnimationFrame(() => {this.renderCanvas(ctx)})
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const ratio = this.state.ratio[this.state.ratioId]
    const nodeInfo =  this.props.nodeInfo[this.props.selectTabId]
    const nodeType = nodeInfo.nodeType
    const nodeX = nodeInfo.nodeX
    const nodeY = nodeInfo.nodeY
    const nodeEdge1 = nodeInfo.nodeEdge1
    const nodeEdge2 = nodeInfo.nodeEdge2
    const nodeEdgeType = nodeInfo.nodeEdgeType
    const cycle = nodeInfo.cycle
    const reg = nodeInfo.reg
    const nodeMaxX = nodeInfo.nodeMaxX
    const nodeMinY = nodeInfo.nodeMinY
    const registerX = nodeInfo.registerX
    const registerY = nodeInfo.registerY
    const startEdge = nodeInfo.startEdge
    const endEdge = nodeInfo.endEdge

    const useALU = nodeInfo.useALU
    const ALUValue = nodeInfo.ALUValue
    var targetALUNode = []

    for (var i in useALU) {
      if (useALU[i].name === ALUValue) {
        targetALUNode = useALU[i].node
        break
      }
    }

    if (this.props.id > 1 && this.props.id < 4) {
      // サイクル線描画
      for (var i = 0; i < cycle; i++) {
        ctx.strokeStyle = "rgb(47, 79, 79)"
        ctx.lineWidth = "1px"
        ctx.beginPath()
        ctx.moveTo(0, (nodeMinY + 60 + (120 * i) - this.state.origin_y) * ratio)
        ctx.lineTo(this.canvas.width, (nodeMinY + 60 + (120 * i) - this.state.origin_y) * ratio)
        ctx.closePath()
        ctx.stroke()
      }
      //ライフタイム描画
      if (this.props.id >= 3) {
        var fontSize = 16 * ratio
        var font = fontSize + "px 'Times New Roman'"

        for (var i = 0; i < reg; i++) {
          if (i > 0) {
            ctx.strokeStyle = "rgb(47, 79, 79)"
            ctx.lineWidth = "2px"
            ctx.beginPath()
            ctx.setLineDash([8, 8])
            ctx.moveTo((nodeMaxX + 90 + 40 * i - this.state.origin_x) * ratio, (nodeMinY - this.state.origin_y) * ratio)
            ctx.lineTo((nodeMaxX + 90 + 40 * i - this.state.origin_x) * ratio, (nodeMinY + 120 * cycle - this.state.origin_y) * ratio)
            ctx.stroke()
            ctx.closePath()
            ctx.setLineDash([0, 0])
            ctx.lineDashOffset = 0
          }
        }
        for (var i in registerX) {
          if (registerX[i] !== 'none' && registerY[i] !== 'none') {
            ctx.fillStyle = "rgb(255, 255, 255)"
            ctx.strokeStyle = "rgb(0, 0, 0)"
            ctx.fillRect((registerX[i] - this.state.origin_x) * ratio, (registerY[i] - this.state.origin_y) * ratio, 20 * ratio, 120 * (endEdge[i] - startEdge[i]) * ratio)
            ctx.strokeRect((registerX[i] - this.state.origin_x) * ratio, (registerY[i] - this.state.origin_y) * ratio, 20 * ratio, 120 * (endEdge[i] - startEdge[i]) * ratio)
            ctx.font = font
            ctx.strokeText(i, (registerX[i] + 10 - this.state.origin_x) * ratio, (registerY[i] + 60 - this.state.origin_y) * ratio)
          }
        }
      }
    }

    // ポート選択描画
    if (this.state.selectEdge) {
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(this.state.mouse_x, this.state.mouse_y)
      switch (this.state.selectEdgeStore[1]) {
        case 0:
          ctx.lineTo((nodeX[this.state.selectEdgeStore[0]] - this.state.origin_x) * ratio, (nodeY[this.state.selectEdgeStore[0]] - this.state.origin_y + 35) * ratio)
          break
        case 1:
          ctx.lineTo((nodeX[this.state.selectEdgeStore[0]] - this.state.origin_x - 20) * ratio, (nodeY[this.state.selectEdgeStore[0]] - this.state.origin_y - 35) * ratio)
          break
        case 2:
          ctx.lineTo((nodeX[this.state.selectEdgeStore[0]] - this.state.origin_x + 20) * ratio, (nodeY[this.state.selectEdgeStore[0]] - this.state.origin_y - 35) * ratio)
          break
        case 3:
          ctx.lineTo((nodeX[this.state.selectEdgeStore[0]] - this.state.origin_x) * ratio, (nodeY[this.state.selectEdgeStore[0]] - this.state.origin_y - 35) * ratio)
          break
      }
      ctx.closePath()
      ctx.stroke()
    }

    // ポート接続線描画
    for (var i in nodeEdge1) {
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo((nodeX[nodeEdge1[i]] - this.state.origin_x) * ratio, (nodeY[nodeEdge1[i]] - this.state.origin_y + 35) * ratio)
      switch (nodeEdgeType[i]) {
        case 'l':
          ctx.lineTo((nodeX[nodeEdge2[i]] - this.state.origin_x - 20) * ratio, (nodeY[nodeEdge2[i]] - this.state.origin_y - 35) * ratio)
          break
        case 'r':
          ctx.lineTo((nodeX[nodeEdge2[i]] - this.state.origin_x + 20) * ratio, (nodeY[nodeEdge2[i]] - this.state.origin_y - 35) * ratio)
          break
        case 'c':
          ctx.lineTo((nodeX[nodeEdge2[i]] - this.state.origin_x) * ratio, (nodeY[nodeEdge2[i]] - this.state.origin_y - 35) * ratio)
          break
      }
      ctx.closePath()
      ctx.stroke()
    }

    // ノード描画
    for (var i in nodeType) {
      switch (nodeType[i]) {
        case 'A':
          if (targetALUNode.indexOf(Number(i)) === -1) {
            drawAdd(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 0)
          } else {
            drawAdd(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 1)
          }
          break
        case 'S':
          if (targetALUNode.indexOf(Number(i)) === -1) {
            drawSub(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 0)
          } else {
            drawSub(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 1)
          }
          break
        case 'M':
          if (targetALUNode.indexOf(Number(i)) === -1) {
            drawMulti(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 0)
          } else {
            drawMulti(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 1)
          }
          break
        case 'D':
          if (targetALUNode.indexOf(Number(i)) === -1) {
            drawDiv(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 0)
          } else {
            drawDiv(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio, 1)
          }
          break
        case 'I':
          drawIn(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio)
          break
        case 'O':
          drawOut(ctx, (nodeX[i] - this.state.origin_x) * ratio, (nodeY[i] - this.state.origin_y) * ratio, ratio)
          break
      }
    }
    // マウスカーソル付属描画
    if (this.state.mouseover) {
      switch (this.props.id) {
        case 1:
          switch (this.props.dfgMode) {
            case 3:
              drawAdd(ctx, this.state.mouse_x, this.state.mouse_y, ratio)
              break
            case 4:
              drawSub(ctx, this.state.mouse_x, this.state.mouse_y, ratio)
              break
            case 5:
              drawMulti(ctx, this.state.mouse_x, this.state.mouse_y, ratio)
              break
            case 6:
              drawDiv(ctx, this.state.mouse_x, this.state.mouse_y, ratio)
              break
            case 7:
              drawIn(ctx, this.state.mouse_x, this.state.mouse_y, ratio)
              break
            case 8:
              drawOut(ctx, this.state.mouse_x, this.state.mouse_y, ratio)
              break
          }
          break;
        default:
          break;
      }
    }
    function drawAdd(ctx, x, y, ratio, i) {
      //下部接続線
      ctx.strokeStyle = "rgb(20, 20, 20)"
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = "rgb(200 ,100 ,40)"
      ctx.beginPath()
      ctx.arc(x, y + (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //上部接続線
      ctx.fillStyle = "rgb(40, 100, 200)"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x - (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //中央
      if (i === 1) {
        ctx.fillStyle = "rgb(220, 20, 20)"
      } else {
        ctx.fillStyle = "rgb(220, 220, 220)"
      }
      ctx.beginPath()
      ctx.arc(x, y, 20 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = "rgb(20, 20, 20)"
      ctx.font = 24 * ratio + "px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("＋", x, y)
    }
    function drawSub(ctx, x, y, ratio, i) {
      //下部接続線
      ctx.strokeStyle = "rgb(20, 20, 20)"
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = "rgb(200 ,100 ,40)"
      ctx.beginPath()
      ctx.arc(x, y + (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //上部接続線
      ctx.fillStyle = "rgb(40, 100, 200)"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x - (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //中央
      if (i === 1) {
        ctx.fillStyle = "rgb(220, 20, 20)"
      } else {
        ctx.fillStyle = "rgb(220, 220, 220)"
      }
      ctx.beginPath()
      ctx.arc(x, y, 20 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = "rgb(20, 20, 20)"
      ctx.font = 24 * ratio + "px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("ー", x, y)
    }
    function drawMulti(ctx, x, y, ratio, i) {
      //下部接続線
      ctx.strokeStyle = "rgb(20, 20, 20)"
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = "rgb(200, 100, 40)"
      ctx.beginPath()
      ctx.arc(x, y + (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //上部接続線
      ctx.fillStyle = "rgb(40, 100, 200)"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x - (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //中央
      if (i === 1) {
        ctx.fillStyle = "rgb(220, 20, 20)"
      } else {
        ctx.fillStyle = "rgb(220, 220, 220)"
      }
      ctx.beginPath()
      ctx.arc(x, y, 20 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = "rgb(20, 20, 20)"
      ctx.font = 24 * ratio + "px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("×", x, y)
    }
    function drawDiv(ctx, x, y, ratio, i) {
      //下部接続線
      ctx.strokeStyle = "rgb(20, 20, 20)"
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = "rgb(200, 100, 40)"
      ctx.beginPath()
      ctx.arc(x, y + (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //上部接続線
      ctx.fillStyle = "rgb(40, 100, 200)"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - (20 * ratio), y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x - (20 * ratio), y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //中央
      if (i === 1) {
        ctx.fillStyle = "rgb(220, 20, 20)"
      } else {
        ctx.fillStyle = "rgb(220, 220, 220)"
      }
      ctx.beginPath()
      ctx.arc(x, y, 20 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = "rgb(20, 20, 20)"
      ctx.font = 24 * ratio + "px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("÷", x, y)
    }
    function drawIn (ctx, x, y, ratio) {
      //下部接続線
      ctx.strokeStyle = "rgb(20, 20, 20)"
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = "rgb(200, 100, 40)"
      ctx.beginPath()
      ctx.arc(x, y + (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //中央
      ctx.fillStyle = "rgb(40, 100, 200)"
      ctx.beginPath()
      ctx.arc(x, y, 20 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
    }
    function drawOut (ctx, x, y, ratio) {
      //上部接続線
      ctx.strokeStyle = "rgb(20, 20, 20)"
      ctx.lineWidth = "2px"
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - (35 * ratio))
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = "rgb(40, 100, 200)"
      ctx.beginPath()
      ctx.arc(x, y - (35 * ratio), 5 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
      //中央
      ctx.fillStyle = "rgb(200, 100, 40)"
      ctx.beginPath()
      ctx.arc(x, y, 20 * ratio, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.stroke()
    }
  }
  doMouseMove (e) {
    var x = e.clientX - this.canvas.offsetLeft
    var y = e.clientY - this.canvas.offsetTop
    var ratio = this.state.ratio[this.state.ratioId]
    if (this.state.isDragging) {
      switch (this.props.dfgMode) {
        case 2:
          if (Number(this.state.selectNode[0]) !== -1 && Number(this.state.selectNode[1]) === -1 && Number(this.state.selectNode[2]) === -1) {
            var moveX = x / ratio + this.state.origin_x
            var moveY = y / ratio + this.state.origin_y
            this.props.moveNodeHandler(Number(this.state.selectNode[0]), moveX, moveY)
          } else if (Number(this.state.selectNode[0]) !== -1 && Number(this.state.selectNode[1]) === -1 && Number(this.state.selectNode[2]) === 2) {
            var moveX = x / ratio + this.state.origin_x
            this.props.moveLifetimeHandler(Number(this.state.selectNode[0]), moveX)
          } else {
            var origin_x = (this.state.mouse_x - x) / ratio + this.state.origin_x
            var origin_y = (this.state.mouse_y - y) / ratio + this.state.origin_y
            this.setState({origin_x: origin_x, origin_y: origin_y})
          }
          break
      }
    } else {
      const nodeInfo = this.props.nodeInfo[this.props.selectTabId]
      const selectnode = selectNode(x / ratio + this.state.origin_x, y / ratio + this.state.origin_y, nodeInfo)
      //console.log(selectnode)
      this.setState({selectNode: selectnode})
    }

    this.setState({mouse_x: x, mouse_y: y})

    function selectNode (x, y, nodeInfo) {
      const nodeType = nodeInfo.nodeType
      const nodeX = nodeInfo.nodeX
      const nodeY = nodeInfo.nodeY
      const registerX = nodeInfo.registerX
      const registerY = nodeInfo.registerY
      const startEdge = nodeInfo.startEdge
      const endEdge = nodeInfo.endEdge
      let selectnode = [-1,-1,-1]
      for (var i in nodeType) {
        if (Math.pow(nodeX[i] - x, 2) + Math.pow(nodeY[i] - y, 2) <= Math.pow(20, 2)) {
          selectnode.splice(0,1,i)
          return selectnode
        }
        switch (nodeType[i]) {
          case 'A':
          case 'S':
          case 'M':
          case 'D':
            if (Math.pow(nodeX[i] - x, 2) + Math.pow(nodeY[i] - y + 35, 2) <= Math.pow(8, 2)) {
              selectnode.splice(0,2,i,0)
              return selectnode
            }
            if (Math.pow(nodeX[i] - x - 20, 2) + Math.pow(nodeY[i] - y - 35, 2) <= Math.pow(8, 2)) {
              selectnode.splice(0,2,i,1)
              return selectnode
            }
            if (Math.pow(nodeX[i] - x + 20, 2) + Math.pow(nodeY[i] - y - 35, 2) <= Math.pow(8, 2)) {
              selectnode.splice(0,2,i,2)
              return selectnode
            }
            break
          case 'I':
            if (Math.pow(nodeX[i] - x, 2) + Math.pow(nodeY[i] - y + 35, 2) <= Math.pow(8, 2)) {
              selectnode.splice(0,2,i,0)
              return selectnode
            }
            break
          case 'O':
            if (Math.pow(nodeX[i] - x, 2) + Math.pow(nodeY[i] - y - 35, 2) <= Math.pow(8, 2)) {
              selectnode.splice(0,2,i,3)
              return selectnode
            }
            break
        }
      }
      for (var i in registerX) {
        if (registerX[i] !== 'none' && registerY[i] !== 'none') {
          if (registerX[i] < x && registerX[i] + 20 > x) {
            if (registerY[i] < y && registerY[i] + 120 * (endEdge[i] - startEdge[i]) > y) {
              selectnode.splice(0,3,i,-1,2)
              return selectnode
            }
          }
        }
      }
      return selectnode
    }
  }
  doWheel (e) {
    var ratioId = this.state.ratioId
    this.setState({before_ratio: this.state.ratio[ratioId]})
    if (e.deltaY > 0) {
      ratioId = ratioId + 1
      if (ratioId > 10) {
        ratioId = 10
      }
    } else {
      ratioId = ratioId - 1
      if (ratioId < 0) {
        ratioId = 0
      }
    }
    var ratio = this.state.ratio[ratioId]
    var origin_x = (this.state.mouse_x / this.state.before_ratio) - (this.state.mouse_x / ratio) + this.state.origin_x
    var origin_y = (this.state.mouse_y / this.state.before_ratio) - (this.state.mouse_y / ratio) + this.state.origin_y
    this.setState({ratioId: ratioId, origin_x: origin_x, origin_y: origin_y})
  }
  doMouseDown () {
    this.setState({isDragging: true})
  }
  doMouseUp () {
    this.setState({isDragging: false})
    var ratio = this.state.ratio[this.state.ratioId]
    var nodeX = this.state.mouse_x / ratio + this.state.origin_x
    var nodeY = this.state.mouse_y / ratio + this.state.origin_y
    var nodeType
    switch (this.props.dfgMode) {
      case 1:
        if (this.state.selectNode[0] !== -1 && this.state.selectNode[1] === -1) {
          this.props.removeNodeHandler(this.state.selectNode)
        }
        break
      case 3:
        nodeType = 'A'
        break
      case 4:
        nodeType = 'S'
        break
      case 5:
        nodeType = 'M'
        break
      case 6:
        nodeType = 'D'
        break
      case 7:
        nodeType = 'I'
        break
      case 8:
        nodeType = 'O'
        break
      case 9:
        if (this.state.selectNode[0] !== -1 && this.state.selectNode[1] !== -1) {
          if (!this.state.selectEdge) {
            this.setState({selectEdge: true, selectEdgeStore: this.state.selectNode})
          } else {
            if (this.state.selectEdgeStore[1] === 0 && this.state.selectNode[1] > 0 && !(this.state.selectEdgeStore[0] === this.state.selectNode[0])) {
              var edgeType
              switch (this.state.selectNode[1]) {
                case 1:
                  edgeType = 'l'
                  break
                case 2:
                  edgeType = 'r'
                  break
                case 3:
                  edgeType = 'c'
                  break
              }
              this.props.drawEdgeHandler(this.state.selectEdgeStore[0], this.state.selectNode[0], edgeType)
            }
            if (this.state.selectEdgeStore[1] > 0 && this.state.selectNode[1] === 0 && !(this.state.selectEdgeStore[0] === this.state.selectNode[0])) {
              var edgeType
              switch (this.state.selectEdgeStore[1]) {
                case 1:
                  edgeType = 'l'
                  break
                case 2:
                  edgeType = 'r'
                  break
                case 3:
                  edgeType = 'c'
                  break
              }
              this.props.drawEdgeHandler(this.state.selectNode[0], this.state.selectEdgeStore[0], edgeType)  
            }
            
            this.setState({selectEdge: false})
          }
        }
        break
      case 11:
        if (Number(this.state.selectNode[0]) !== -1 && Number(this.state.selectNode[1]) === -1 && Number(this.state.selectNode[2]) === -1) {
          this.props.paintNodeHandler(this.state.selectNode[0])
        }
        break
    }
    if (this.props.dfgMode >= 3 && this.props.dfgMode <= 8) {
      this.props.putNodeHandler(nodeType, nodeX, nodeY)
    }
  }
  render () {
    const doMouseOver = () => {
      this.setState({mouseover: true})
    }
    const doMouseOut = () => {
      this.setState({mouseover: false})
    }
    return (
      <canvas
        className="canvas"
        ref={(e) => { this.canvas = e }}
        width={this.state.width}
        height={this.state.height}
        onMouseMove={e => this.doMouseMove(e)}
        onMouseOver={doMouseOver}
        onMouseOut={doMouseOut}
        onMouseDown={() => this.doMouseDown()}
        onMouseUp={() => this.doMouseUp()}
        onWheel={e => this.doWheel(e)}
        >
      </canvas>
    )
  }
}