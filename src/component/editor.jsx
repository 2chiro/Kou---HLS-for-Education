import React, {Component} from 'react'

import TextBox from '../container/textbox'
import Canvas from '../container/canvas'

export default class Editor extends Component {
  constructor (props) {
    super (props)
    this.editor = null
    this.state = {
      width: null, height: null
    }
  }
  updateDimensions () {
    var client_w = this.editor.clientWidth
    var client_y = this.editor.clientHeight
    this.setState({width: client_w, height: client_y})
  }
  componentDidMount () {
    if (!this.editor) return
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }
  render () {
    var main
    if (this.props.id === 0) {
      main = <TextBox width={this.state.width} height={this.state.height} />
    } else {
      main = <Canvas width={this.state.width} height={this.state.height} />
    }
    return (
      <div className='editor'
        ref={(e) => { this.editor = e }}
        width={this.state.width}
        height={this.state.height}>
        {main}
      </div>
    )
  }
}
  