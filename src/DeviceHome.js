import React from 'react'
import DeviceModal from './DeviceModal'
import HeaderSelect from './HeaderSelect'
import DeviceRow from './DeviceRow'
import './DeviceManager.css'

const typeOptions = ['All', 'Windows Workstation', 'Windows Server', 'Mac']
const sortOptions = ['', 'System Name', 'HDD Capacity']
const invalidNumericEntries = [101, 43, 45, 46]

class DeviceHome extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      devices: [],
      isAddDeviceModalOpen: false,
      isUpdateDeviceModalOpen: false,
      addedDeviceName: '',
      addedDeviceType: '',
      addedDeviceCapacity: '',
      updatedDeviceName: '',
      updatedDeviceType: '',
      updatedDeviceCapacity: '',
      updatedDeviceId: '',
      updatedDeviceIndex: null,
      filteredByType: '',
      filteredDevices: [],
      sortCriterion: '',
      submissionError: false,
    }
  }

  componentDidMount = () => {
    this.getDeviceDataFromServer()
  }

  forceNumeric = (e) => {
    if (invalidNumericEntries.includes(e.charCode)) {
      e.preventDefault()
    }
  }

  validateDeviceForm = (device) => {
    let validated = true

    if (!device.type || !device.system_name || !device.hdd_capacity) {
      validated = false
    }
    return validated
  }

  isFormElementInvalid = (value) => {
    return !value && this.state.submissionError
  }

  getDeviceRows = () => {
    const {filteredByType, filteredDevices, devices} = this.state
    const deviceArr = filteredByType ? filteredDevices : devices

    return deviceArr.map((device) => {
      return (
        <DeviceRow
          onOpenUpdateDeviceModal={this.onOpenUpdateDeviceModal}
          deleteDevice={this.deleteDevice}
          device={device}
        />
      )
    })
  }

  onOpenUpdateDeviceModal = (e) => {
    const deviceId = e.target.id.replace('-update', '')
    const deviceIndex = this.getDeviceIndexById(deviceId)
    const device = this.state.devices[deviceIndex]

    this.setState({
      updatedDeviceName: device.system_name,
      updatedDeviceType: device.type,
      updatedDeviceCapacity: device.hdd_capacity,
      isUpdateDeviceModalOpen: true,
      updatedDeviceId: device.id,
      updatedDeviceIndex: deviceIndex,
    })
  }

  getDeviceIndexById = (deviceId) => {
    const {devices} = this.state

    for (let i = 0; i < devices.length; i++) {
      if (devices[i].id === deviceId) {
        return i
      }
    }
  }

  getDeviceDataFromServer = () => {
    fetch('http://localhost:3000/devices')
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          data.forEach((entry) => {
            entry.type = entry.type.replace('_', ' ')
              .toLowerCase()
              .replace(/\w\S*/g, (w) =>
                (w.replace(/^\w/, (c) => c.toUpperCase())))
          })
          this.setState({devices: data})
        }
      }).catch(() => {
        console.log('Error fetching device data from server.  Is the server running on port 3000?')
    })
  }

  saveNewDevice = () => {
    const {
      sortCriterion,
      filteredByType,
      addedDeviceName,
      addedDeviceType,
      addedDeviceCapacity
    } = this.state
    const device = {
      system_name: addedDeviceName,
      type: addedDeviceType,
      hdd_capacity: addedDeviceCapacity,
    }
    const validForm = this.validateDeviceForm(device)

    if (!validForm) {
      this.setState({submissionError: true})
      return
    }

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
    }

    fetch('http://localhost:3000/devices', requestOptions)
      .then((response) => Promise.all([response, response.json()]))
      .then(([response, json]) => {
        if (response.status === 200) {
          let tempArr = this.state.devices
          device.id = json.id

          tempArr.push(device)
          if (sortCriterion) {
            tempArr = this.sortDeviceList(tempArr, sortCriterion)
          }

          this.setState({
            devices: tempArr,
            addedDeviceName: '',
            addedDeviceType: '',
            addedDeviceCapacity: '',
            isAddDeviceModalOpen: false,
            submissionError: false,
            filteredDevices: filteredByType ? this.getFilteredDevices(filteredByType, tempArr) : []
          })
        }
      }).catch(() => {
        console.log('Error adding new device.  Is the server running on port 3000?')
    })
  }

  updateDevice = () => {
    const {
      updatedDeviceName,
      updatedDeviceType,
      updatedDeviceCapacity,
      updatedDeviceId,
      updatedDeviceIndex,
      devices,
      filteredByType,
      sortCriterion,
    } = this.state
    const updatedDevice = {
      system_name: updatedDeviceName,
      type: updatedDeviceType,
      hdd_capacity: updatedDeviceCapacity,
      id: updatedDeviceId,
    }

    const validForm = this.validateDeviceForm(updatedDevice)

    if (!validForm) {
      this.setState({submissionError: true})
      return
    }

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDevice)
    }

    fetch(`http://localhost:3000/devices/${updatedDeviceId}`, requestOptions)
      .then((response) => response.json())
      .then((updated) => {
        if (updated) {
          let tempArr = devices
          tempArr[updatedDeviceIndex] = updatedDevice

          if (sortCriterion) {
            tempArr = this.sortDeviceList(tempArr, sortCriterion)
          }

          this.setState({
            devices: tempArr,
            updatedDeviceName: '',
            updatedDeviceType: '',
            updatedDeviceCapacity: '',
            isUpdateDeviceModalOpen: false,
            filteredDevices: filteredByType ? this.getFilteredDevices(filteredByType, tempArr) : []
          })
        }
      }).catch(() => {
        console.log('Error updating device.  Is the server running on port 3000?')
    })
  }

  deleteDevice = (e) => {
    const {filteredByType} = this.state
    const id = e.target.id
    const payload = {id: id}

    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }

    fetch(`http://localhost:3000/devices/${id}`, requestOptions)
      .then((response) => response.json())
      .then((deleted) => {
        if (deleted) {
          const tempArr = this.state.devices.filter((device) => {
            return device.id !== id;
          })

          this.setState({
            devices: tempArr,
            filteredDevices: filteredByType ? this.getFilteredDevices(filteredByType, tempArr) : []
          })
        }
      }).catch(() => {
        console.log('Error deleting device.  Is the server running on port 3000?')
    })
  }

  getFilteredDevices = (filterOptions, deviceList) => {
    return deviceList.filter((device) => {
      return filterOptions.includes(device.type)
    })
  }

  filterByType = (e) => {
    const filterOptions = []

    if (e.target.value === 'All') {
      this.setState({
        filteredByType: false,
        filteredDevices: []
      })
    } else {
      const options = Array.from(e.target.options)

      options.forEach((opt) => {
        if (opt.selected) {
          filterOptions.push(opt.value)
        }
      })

      this.setState({
        filteredByType: filterOptions,
        filteredDevices: this.getFilteredDevices(filterOptions, this.state.devices)
      })
    }
  }

  sortDeviceList = (devices, criterion) => {
    return (criterion === 'HDD Capacity') ? devices.sort((a, b) => (parseInt(a.hdd_capacity) > parseInt(b.hdd_capacity)) ? 1 : -1) :
      devices.sort((a, b) => (a.system_name > b.system_name) ? 1 : -1)
  }

  sortDevices = (e) => {
    const value = e.target.value
    const {filteredByType, filteredDevices, devices} = this.state
    let sortedDevices = devices
    let sortedFilteredDevices = filteredDevices

    sortedDevices = this.sortDeviceList(devices, value)

    if (filteredByType) {
      sortedFilteredDevices = this.sortDeviceList(filteredDevices, value)
    }

    this.setState({
      devices: sortedDevices,
      filteredDevices: sortedFilteredDevices,
      sortCriterion: value,
    })
  }

  openAddDeviceModal = () =>
    this.setState({isAddDeviceModalOpen: true})

  closeAddDeviceModal = () =>
    this.setState({isAddDeviceModalOpen: false, submissionError: false})

  onChangeAddedDeviceName = (e) =>
    this.setState({addedDeviceName: e.target.value})

  onChangeAddedDeviceType = (e) =>
    this.setState({addedDeviceType: e.target.value})

  onChangeAddedDeviceCapacity = (e) =>
    this.setState({addedDeviceCapacity: e.target.value})

  closeUpdateDeviceModal = () =>
    this.setState({isUpdateDeviceModalOpen: false, submissionError: false})

  onChangeUpdatedDeviceName = (e) =>
    this.setState({updatedDeviceName: e.target.value})

  onChangeUpdatedDeviceType = (e) =>
    this.setState({updatedDeviceType: e.target.value})

  onChangeUpdatedDeviceCapacity = (e) =>
    this.setState({updatedDeviceCapacity: e.target.value})

  addDeviceModal() {
    const {
      addedDeviceCapacity,
      addedDeviceType,
      addedDeviceName,
      isAddDeviceModalOpen
    } = this.state

    return (
      <DeviceModal
        header={'Add Device'}
        deviceCapacity={addedDeviceCapacity}
        deviceType={addedDeviceType}
        deviceName={addedDeviceName}
        isOpen={isAddDeviceModalOpen}
        onCloseModal={this.closeAddDeviceModal}
        onChangeDeviceName={this.onChangeAddedDeviceName}
        onChangeDeviceType={this.onChangeAddedDeviceType}
        onChangeDeviceCapacity={this.onChangeAddedDeviceCapacity}
        isFormElementInvalid={this.isFormElementInvalid}
        forceNumeric={this.forceNumeric}
        saveDevice={this.saveNewDevice}
      />
    )
  }

  updateDeviceModal() {
    const {
      updatedDeviceCapacity,
      updatedDeviceType,
      updatedDeviceName,
      isUpdateDeviceModalOpen
    } = this.state

    return (
      <DeviceModal
        header={'Update Device'}
        deviceCapacity={updatedDeviceCapacity}
        deviceType={updatedDeviceType}
        deviceName={updatedDeviceName}
        isOpen={isUpdateDeviceModalOpen}
        onCloseModal={this.closeUpdateDeviceModal}
        onChangeDeviceName={this.onChangeUpdatedDeviceName}
        onChangeDeviceType={this.onChangeUpdatedDeviceType}
        onChangeDeviceCapacity={this.onChangeUpdatedDeviceCapacity}
        isFormElementInvalid={this.isFormElementInvalid}
        forceNumeric={this.forceNumeric}
        saveDevice={this.updateDevice}
      />
    )
  }


  getHeaderSelects() {
    return (
      <div>
        <span>Device Type:</span>
        <HeaderSelect
          onChange={this.filterByType}
          options={typeOptions}
          isMultiple
          selectId={'typeFilterSelect'}
        />
        <span>Sort by:</span>
        <HeaderSelect
          onChange={this.sortDevices}
          options={sortOptions}
          selectId={'sortFilterSelect'}
        />
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.addDeviceModal()}
        {this.updateDeviceModal()}
        <div className='banner'>
          NinjaRMM Device Manager
        </div>
        <div className='manager-body'>
          {this.getHeaderSelects()}
          <br />
          <table className='deviceTable'>
            <tbody>
              {this.getDeviceRows()}
            </tbody>
          </table>
          <br />
          <button onClick={this.openAddDeviceModal}>
            Add Device
          </button>
        </div>
      </div>
    )
  }
}

export default DeviceHome
