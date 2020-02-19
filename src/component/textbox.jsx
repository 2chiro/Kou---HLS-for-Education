import React, {Component} from 'react'

export default class TextBox extends Component {
  constructor (props) {
    super (props)
  }
  componentDidMount () {
    var style = document.getElementById('textarea').style
    style.width = '100%'
    style.height = '100%'
    style.resize = 'none'
  }
  doChange (e) {
    this.props.chageCodeHandler(e.target.value)
  }
  render () {
    return (
      <textarea
        id='textarea'
        onChange={e => this.doChange(e)}
        value={this.props.nodeInfo[this.props.selectTabId].code}
      ></textarea>
    )
  }
}