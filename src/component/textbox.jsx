import React, {Component} from 'react'

export default class TextBox extends Component {
  constructor (props) {
    super (props)
  }
  componentDidMount () {
    var style = document.getElementById('textarea').style
    style.width = this.props.width
    style.height = this.props.height
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