import React, { useState } from 'react';
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CRow,
} from '@coreui/react';
import * as moment from 'moment';

import { DEVICE_STATE, INTERVALS } from '../../../services/AppService';
import LiveDataGraph from './LiveDataGraph';

const SlaveBox = ({
  master,
  slave,
  index,
  sIndex,
  accordianList,
  setAccordianList,
  onCompleted,
}) => {
  const [intervalMapper, setIntervalMapper] = useState({});

  return (
    <>
      {slave ? (
        <CCard key={`${index ? index : '0'}-${sIndex}`}>
          <CCardHeader id={`heading${sIndex}`} className="cursor-pointer">
            <div className="d-flex justify-content-between">
              <div
                className="mr-2"
                onClick={() => {
                  if (process.env.REACT_APP_ENV !== 'CLOUD') {
                    accordianList[sIndex] = !accordianList[sIndex];
                  } else {
                    accordianList[index][sIndex] = !accordianList[index][
                      sIndex
                    ];
                  }
                  setAccordianList([...accordianList]);
                }}
              >
                <span
                  className={
                    slave?.connectionStatus === 'Connected'
                      ? slave.status === 'play'
                        ? 'connected-dot blink'
                        : 'idle-dot'
                      : 'disconnected-dot'
                  }
                />
                <span className="ml-1">{slave?.name}</span>
              </div>

              <div className="d-flex">
                {(slave.status !== DEVICE_STATE.play ||
                  slave.connectionStatus === 'Disconnected') &&
                  (process.env.REACT_APP_ENV === 'CLOUD'
                    ? accordianList[index][sIndex]
                    : accordianList[sIndex]) &&
                  slave.trialId && (
                    <div className="mr-2">
                      <CButtonGroup>
                        {Object.keys(INTERVALS).map((value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className="p-1 px-2"
                            active={
                              INTERVALS[value] ===
                              (intervalMapper[slave.macAddress] || 'minute')
                            }
                            onClick={() => {
                              if (
                                intervalMapper[slave.macAddress] ===
                                INTERVALS[value]
                              ) {
                                return;
                              }
                              setIntervalMapper({
                                ...intervalMapper,
                                [slave.macAddress]: INTERVALS[value],
                              });
                            }}
                          >
                            {value}s
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </div>
                  )}
                {slave?.lastOnline && (
                  <div className="small ml-2">
                    Last Online :{' '}
                    {moment(slave.lastOnline).format('MM/DD/YYYY hh:mm:ss')}
                  </div>
                )}
              </div>
            </div>
          </CCardHeader>

          <CCollapse
            show={
              accordianList &&
              ((accordianList[index] && accordianList[index][sIndex]) ||
                accordianList[sIndex])
            }
          >
            <CCardBody>
              {!slave.trialId && <div>Device is idle</div>}
              {slave.trialId && slave.subjectId && slave.deviceId && (
                <LiveDataGraph
                  loadData={
                    accordianList &&
                    ((accordianList[index] && accordianList[index][sIndex]) ||
                      accordianList[sIndex])
                  }
                  deviceData={slave}
                  onCompleted={onCompleted}
                  master={master}
                  intervalRate={intervalMapper[slave.macAddress] || 'minute'}
                />
              )}
            </CCardBody>
          </CCollapse>
        </CCard>
      ) : (
        <CCol className="text-center">No devices</CCol>
      )}
    </>
  );
};

export default SlaveBox;
