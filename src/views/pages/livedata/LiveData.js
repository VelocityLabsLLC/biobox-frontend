import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import { each } from 'lodash';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from '../../../reusable';
import {
  DEVICE_STATE,
  getAllMasters,
  getDeviceListForLiveData,
  INTERVALS,
} from '../../../services/AppService';
import SlaveBox from './SlaveBox';

const LiveData = () => {
  const [isLoading, setLoading] = useState(true);
  const [deviceList, setDeviceList] = useState();
  const [masterList, setMasterList] = useState();
  const [accordianList, setAccordianList] = useState([]);

  const getDevicesList = async () => {
    try {
      if (process.env.REACT_APP_ENV === 'LOCAL') {
        const resp = await getDeviceListForLiveData();
        if (resp && resp.data && resp.data.length) {
          each(resp.data, (n, i) => {
            accordianList.push(i === 0 ? true : false);
            n.interval = INTERVALS[15];
          });
          setAccordianList([...accordianList]);
          setDeviceList([...resp.data]);
          // setDeviceList([...resp.data, ...resp.data, ...resp.data]);
        } else {
          setAccordianList([...accordianList]);
          setDeviceList([]);
        }
      } else {
        let masters = await getAllMasters();
        if (
          masters &&
          masters.data &&
          masters.data.data &&
          masters.data.data.length
        ) {
          masters = masters.data.data;
          for (const master of masters) {
            try {
              let slaves = await getDeviceListForLiveData(master);
              if (slaves && slaves.data && slaves.data.length) {
                const dataToPush = [];
                each(slaves.data, (n, i) => {
                  n.interval = INTERVALS[15];
                  dataToPush.push(i === 0 ? true : false);
                });
                accordianList.push(dataToPush);
                master.slaves = slaves.data;
              } else {
                accordianList.push([]);
                master.slaves = [];
              }
            } catch (error) {
              toast.error(error.message ? error.message : error);
              accordianList.push([]);
              master.slaves = [];
            }
          }
          setMasterList(masters);
        } else {
          masters = [];
          setMasterList(masters);
        }
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message ? error.message : error);
    }
    setLoading(false);
  };

  const onCompleted = (deviceId, master) => {
    let device = undefined;
    if (process.env.REACT_APP_ENV === 'LOCAL') {
      device = [...deviceList];
    } else if (process.env.REACT_APP_ENV === 'CLOUD') {
      device = master ? [...master.slaves] : undefined;
    }
    device?.map((e) => {
      if (e.deviceId === deviceId) {
        e.status = DEVICE_STATE.complete;
      }
    });
    if (process.env.REACT_APP_ENV === 'LOCAL') {
      setDeviceList([...device]);
    } else if (process.env.REACT_APP_ENV === 'CLOUD') {
      let mastersList = masterList;
      mastersList.map((m) => {
        if (m.id === master.id) {
          m.slaves = device;
        }
      });
      setMasterList([...mastersList]);
    }
  };

  useEffect(() => {
    getDevicesList();
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      {process.env.REACT_APP_ENV === 'LOCAL' && (
        <div id="accordion">
          <CRow className="mx-0">
            {deviceList && deviceList.length === 0 && (
              <CCol className="bg-white text-dark text-center p-4 rounded">
                No Devices Found
              </CCol>
            )}
            {deviceList &&
              deviceList.length > 0 &&
              deviceList.map((m, mi) => {
                return (
                  <CCol sm={deviceList.length > 1 ? '6' : '12'} key={mi}>
                    <SlaveBox
                      slave={m}
                      sIndex={mi}
                      accordianList={accordianList}
                      setAccordianList={setAccordianList}
                      onCompleted={onCompleted}
                    />
                  </CCol>
                );
              })}
          </CRow>
        </div>
      )}
      {process.env.REACT_APP_ENV === 'CLOUD' && (
        <CRow className="mx-0">
          {masterList && masterList.length === 0 && (
            <CCol className="bg-white text-dark text-center p-4 rounded">
              No Master Devices Found
            </CCol>
          )}
          {masterList && masterList.length > 0 && (
            <CCol>
              {masterList.map((master, index) => {
                return (
                  <CCard key={'col' + index}>
                    <CCardHeader id={`masterHeading${index}`}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <span
                            className={
                              master.eventType === 'connected'
                                ? 'connected-dot'
                                : 'disconnected-dot'
                            }
                          />
                          <span className="mx-2">
                            {master.name ? master.name : master.macAddress}
                          </span>
                        </div>
                      </div>
                    </CCardHeader>
                    <CCardBody>
                      <CRow id={`accordian-${index}`}>
                        {master.slaves.map((slave, sIndex) => {
                          return (
                            <CCol
                              sm={master.slaves.length > 1 ? '6' : '12'}
                              key={sIndex}
                            >
                              <SlaveBox
                                master={master}
                                slave={slave}
                                index={index}
                                sIndex={sIndex}
                                accordianList={accordianList}
                                setAccordianList={setAccordianList}
                                onCompleted={onCompleted}
                              />
                            </CCol>
                          );
                        })}
                      </CRow>
                    </CCardBody>
                  </CCard>
                );
              })}
            </CCol>
          )}
        </CRow>
      )}
    </>
  );
};
export default LiveData;
