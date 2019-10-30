import React, {Component} from 'react'
import classNames from 'classnames'

export default class Navigator extends Component {
  render () {
    const code = classNames({'hls-nav2': this.props.id === 0}, {'hls-nav': this.props.id !== 0})
    const dfg = classNames({'hls-nav2': this.props.id === 1}, {'hls-nav': this.props.id !== 1})
    const sch = classNames({'hls-nav2': this.props.id === 2}, {'hls-nav': this.props.id !== 2})
    const bin = classNames({'hls-nav2': this.props.id === 3}, {'hls-nav': this.props.id !== 3})
    const rtl = classNames({'hls-nav2': this.props.id === 4}, {'hls-nav': this.props.id !== 4})
    return (
      <div className="navigator">
        <ul className="breadcrumb">
          <li><span className={code}>動作記述</span></li>
          <li><span className={dfg}>DFG生成</span></li>
          <li><span className={sch}>スケジューリング</span></li>
          <li><span className={bin}>バインディング</span></li>
          <li><span className={rtl}>RTL回路生成</span></li>
        </ul>
      </div>
    )
  }
}