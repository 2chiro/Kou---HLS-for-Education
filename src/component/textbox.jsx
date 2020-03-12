require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/mode/clike/clike.js');

import React, {Component} from 'react'
import {Controlled as CodeMirror} from 'react-codemirror2'


export default class TextBox extends Component {
  constructor (props) {
    super (props)
  }
  render () {
    var options = {
      mode: 'text/x-csrc',
      theme: 'material',
      lineNumbers: true
    }
    return (
      <CodeMirror
        value={this.props.nodeInfo[this.props.selectTabId].code}
        options={options}
        onBeforeChange={(editor, data, value) => {
          this.props.chageCodeHandler(value)
        }}
        onChange={(editor, data, value) => {
          console.log('controlled', {value});
        }}
      />
    )
  }
}