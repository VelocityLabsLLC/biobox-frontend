import { freeSet } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
} from '@coreui/react';
import { find } from 'lodash';
import * as moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MASTER } from 'src/_redux/actions/data';
import { Loader } from '../../../reusable';
import {
  getAllDevices,
  getDisabledState,
  getExperimentWithMasterData,
} from '../../../services/AppService';

const fields = ['deviceName', 'macAddress', 'lastOnline', 'Actions'];

const Devices = () => {
  const _history = useHistory();
  const masterData = useSelector((store) => store.dataReducer.data);
  const [isDisabled, setDisabled] = useState(getDisabledState(masterData));
  const dispatch = useDispatch();
  const [devicesData, setDevicesData] = useState([]);
  const [devicesCount, setDevicesCount] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [masterList, setMasterList] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState();

  const getAllDeviceData = async () => {
    setLoading(true);
    try {
      const data = await getAllDevices(selectedMaster);
      if (data && data.data) {
        setDevicesData(data.data.data);
        setDevicesCount(data.data.count);
      }
    } catch (error) {
      toast.error(error || 'Something went wrong');
    }
    setLoading(false);
  };

  const getMasterList = async () => {
    setLoading(true);
    try {
      const list = await getExperimentWithMasterData();
      setMasterList(list.masterData);
      let currentSelected = find(list.masterData, (n) => {
        return n.value.macAddress === masterData.value.macAddress;
      });
      if (currentSelected) {
        setSelectedMaster(currentSelected);
      } else {
        setSelectedMaster(list.masterData[0]);
      }
    } catch (error) {
      toast.error(error || 'Something went wrong');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (process.env.REACT_APP_ENV === 'CLOUD') {
      getMasterList();
    } else {
      getAllDeviceData();
    }
  }, []);

  useEffect(() => {
    if (selectedMaster) {
      getAllDeviceData();
      dispatch(MASTER({ value: selectedMaster.value }));
    }
  }, [selectedMaster]);

  return (
    <div>
      {isLoading && <Loader />}
      <CRow className="m-2">
        {process.env.REACT_APP_ENV === 'CLOUD' && (
          <div className="align-self-center mx-2">Master Box:</div>
        )}
        {process.env.REACT_APP_ENV === 'CLOUD' ? (
          <Select
            className="w-25"
            value={selectedMaster}
            onChange={setSelectedMaster}
            options={masterList}
          />
        ) : (
          ''
        )}
      </CRow>
      <CRow className="mx-0">
        <CCol>
          <CCard>
            <CCardHeader>
              <h4 className="m-0">Devices ({devicesCount})</h4>
            </CCardHeader>
            <CCardBody className="p-sm-0 p-lg-3">
              <CDataTable
                items={devicesData}
                fields={fields}
                hover
                striped
                itemsPerPage={10}
                pagination
                addTableClasses="border mb-sm-0 mb-lg-3"
                scopedSlots={{
                  deviceName: (device) => (
                    <td>
                      <span>{device.name}</span>
                    </td>
                  ),
                  lastOnline: (device) => (
                    <td>
                      <span>
                        {device.lastOnline
                          ? moment(device.lastOnline).format(
                              'MM/DD/YYYY hh:mm:ss',
                            )
                          : ''}
                      </span>
                    </td>
                  ),
                  Actions: (id) => (
                    <td>
                      <CButton
                        color="info"
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => {
                          console.log(id);
                          _history.push(`/editDevice/${id.id}`);
                        }}
                      >
                        <CIcon content={freeSet.cilPencil} />
                      </CButton>
                    </td>
                  ),
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Devices;
