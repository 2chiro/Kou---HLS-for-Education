import {connect} from 'react-redux'
import React from 'react'

import App from '../component/app'

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps)(App)