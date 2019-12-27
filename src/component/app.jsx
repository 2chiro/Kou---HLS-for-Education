import React, {Component} from 'react'

import Tools from '../container/tools'
import Editor from '../container/editor'
import Navigator from '../container/navigator'
import Explorer from '../container/explorer'

export default class App extends Component {
  constructor (props) {
    super (props)
  }
  render () {
    return (
      <div className="app">
        <div className="left">
          <Explorer />
          <Tools />
        </div>
        <div className="right">
          <Navigator />
          <Editor />
        </div>
      </div>
    )
  }
}
  
