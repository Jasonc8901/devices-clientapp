import {getSelectOptions} from './utils'
import React from 'react'
import PropTypes from 'prop-types'


const HeaderSelect = (props) => {
  const {
    onChange,
    options,
    isMultiple,
    selectId,
  } = props

  return (
    <select onChange={onChange} multiple={isMultiple} id={selectId}>
      {getSelectOptions(options)}
    </select>
  )
}

HeaderSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  isMultiple: PropTypes.bool,
  selectId: PropTypes.string,
}

export default HeaderSelect