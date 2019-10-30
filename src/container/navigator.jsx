import {connect} from 'react-redux'
import React from 'react'

import Navigator from '../component/navigator'

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps)(Navigator)