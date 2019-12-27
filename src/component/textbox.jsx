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
  render () {
    return (
      <textarea
        id='textarea'
      ></textarea>
    )
  }
}