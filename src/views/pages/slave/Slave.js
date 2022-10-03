import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from 'src/reusable';
import { getSlaveDevice } from '../../../services/SlaveServices';
import CreateTrial from '../trials/CreateTrial';
import * as moment from 'moment';

const SlaveData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDevice, setCurrentDevice] = useState();

  const getSlave = async () => {
    setCurrentDevice();
    setIsLoading(true);
    try {
      const resp = await getSlaveDevice();
      if (resp && resp.data) {
        setCurrentDevice({ ...resp.data });
      }
    } catch (error) {
      toast.error(error.message ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSlave();
  }, []);

  return (
    <div className="slave-dashboard">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {currentDevice && currentDevice?.trialId ? (
            <CreateTrial
              trialId={currentDevice?.trialId}
              device={currentDevice}
              getUpdatedSlave={getSlave}
            />
          ) : (
            <CCard key="slaveCard">
              <CCardHeader id="slabeHeading" className="cursor-pointer">
                <div className="d-flex justify-content-between">
                  <div className="mr-2">
                    <span
                      className={
                        currentDevice?.connectionStatus === 'Connected'
                          ? currentDevice.status === 'play'
                            ? 'connected-dot blink'
                            : 'idle-dot'
                          : 'disconnected-dot'
                      }
                    />
                    <span className="ml-1">{currentDevice?.name}</span>
                  </div>

                  <div className="d-flex">
                    {currentDevice?.lastOnline && (
                      <div className="small ml-2">
                        Last Online :{' '}
                        {moment(currentDevice.lastOnline).format(
                          'MM/DD/YYYY hh:mm:ss',
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CCardHeader>

              <CCardBody>
                <div>Device is idle</div>
              </CCardBody>
            </CCard>
          )}
        </>
      )}
    </div>
  );
};
export default SlaveData;
