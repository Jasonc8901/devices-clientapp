import React from 'react'
import {getSelectOptions} from './utils'
import PropTypes from 'prop-types'

const errorBorder = {border: '1px solid red'}
const modalTypeOptions = ['', 'Windows Workstation', 'Windows Server', 'Mac']

const DeviceModal = (props) => {
  const {
    header,
    deviceCapacity,
    deviceType,
    deviceName,
    isOpen,
    onCloseModal,
    onChangeDeviceName,
    isFormElementInvalid,
    onChangeDeviceType,
    onChangeDeviceCapacity,
    forceNumeric,
    saveDevice,
  } = props

  return isOpen ?
    <div className='modal-container'>
      <div className='modal'>
        <button className='modal-exit' onClick={onCloseModal}>X</button>
        <h1>{header}</h1>
        <table>
          <tr>
            <td>
              System Name*
            </td>
            <td>
              <input
                value={deviceName}
                className='modalInput'
                onChange={onChangeDeviceName}
                style={isFormElementInvalid(deviceName) ? errorBorder : {}}
              />
            </td>
          </tr>
          <tr>
            <td>
              Type*
            </td>
            <td>
              <select
                value={deviceType}
                onChange={onChangeDeviceType}
                className='modalSelect'
                style={isFormElementInvalid(deviceType) ? errorBorder : {}}
              >
                {getSelectOptions(modalTypeOptions)}
              </select>
            </td>
          </tr>
          <tr>
            <td>
              HDD Capacity (GB)*
            </td>
            <td>
              <input
                value={deviceCapacity}
                onChange={onChangeDeviceCapacity}
                type='number'
                onKeyPress={forceNumeric}
                className='modalInput'
                style={isFormElementInvalid(deviceCapacity) ? errorBorder : {}}
              />
            </td>
          </tr>
        </table>
        <button onClick={saveDevice}>
          Save
        </button>
        <button onClick={onCloseModal}>
          Close
        </button>
      </div>
    </div> :
    null
}

DeviceModal.propTypes = {
  header: PropTypes.string.isRequired,
  deviceCapacity: PropTypes.string,
  deviceType: PropTypes.string,
  deviceName: PropTypes.string,
  isOpen:  PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onChangeDeviceName: PropTypes.func.isRequired,
  isFormElementInvalid: PropTypes.func.isRequired,
  onChangeDeviceType: PropTypes.func.isRequired,
  onChangeDeviceCapacity: PropTypes.func.isRequired,
  forceNumeric: PropTypes.func.isRequired,
  saveDevice: PropTypes.func.isRequired,
}

export default DeviceModal