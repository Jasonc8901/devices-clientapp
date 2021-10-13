import React from 'react'
import PropTypes from 'prop-types'


const DeviceRow = ({device, onOpenUpdateDeviceModal, deleteDevice}) => {
  return (
    <tr key={device.id}>
      <td className='deviceInfoCell deviceTableCell'>
        {device.system_name}
        <br />
        {device.type}
        <br />
        {device.hdd_capacity} (GB)
      </td>
      <td className='deviceTableCell'>
        <button id={`${device.id}-update`} onClick={onOpenUpdateDeviceModal}>
          Edit
        </button>
      </td>
      <td className='deviceTableCell'>
        <button id={device.id} onClick={deleteDevice}>
          Delete
        </button>
      </td>
    </tr>
  )
}

DeviceRow.propTypes = {
  device: PropTypes.object.isRequired,
  onOpenUpdateDeviceModal: PropTypes.func.isRequired,
  deleteDevice: PropTypes.func.isRequired,
}

export default DeviceRow