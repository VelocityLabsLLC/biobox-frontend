import { CButton } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  DEVICE_STATE,
  emitDeviceStateUpdated,
  getDisabledState,
  patchTrialSubject,
  pauseData,
  resumeData,
  startData,
  stopData,
} from '../../../services/AppService';
import {
  emitDeviceStateUpdatedSlave,
  slavePatchTrialSubject,
  slavePauseData,
  slaveResumeData,
  slaveStartData,
  slaveStopData,
} from '../../../services/SlaveServices';

export default function DeviceStateButton({
  device,
  experiment,
  trialId,
  trialSubject,
  onButtonPress,
  deviceloading,
  reset,
}) {
  const masterData = useSelector((store) => store.dataReducer.data);
  const [isDisabled, setDisabled] = useState(
    process.env.REACT_APP_ENV === 'SLAVE'
      ? false
      : getDisabledState(masterData, device),
  );

  const [buttonState, setButtonState] = useState(
    (trialSubject && trialSubject?.status) || DEVICE_STATE.notYetStarted,
  );

  useEffect(() => {
    setButtonState(trialSubject?.status);
  }, [trialSubject]);

  useEffect(() => {
    deviceloading({ deviceId: device.id }, false);
  }, [buttonState]);

  useEffect(() => {
    if (device.callPatch === true) {
      if (device.status === 'Disconnected') {
        setDisabled(true);
        console.log('calling patch with paused state');
        patchData(DEVICE_STATE.paused);
        setTimeout(() => {
          deviceloading(
            { deviceId: device.id, status: DEVICE_STATE.paused },
            false,
          );
        }, 2000);
      }
    } else if (device.callPatch === false) {
      if (device.status === 'Connected') {
        setDisabled(false);
      }
    }
  }, [device.callPatch]);

  const getRequestBody = () => {
    return {
      trialSubjectId: trialSubject.id,
      experimentId: experiment.id,
      deviceId: device.id,
      trialId: trialId,
      phases: experiment.protocol.phases,
      subjectId: trialSubject.subject.id,
      frequency: +experiment.protocol.samplingFrequency,
      trialDuration: +experiment.protocol.trialDuration,
    };
  };

  const startReceivingData = async () => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      return slaveStartData(getRequestBody());
    } else {
      return startData(getRequestBody(), masterData);
    }
  };

  const pauseReceivingData = async () => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      return slavePauseData(getRequestBody());
    } else {
      return pauseData(getRequestBody(), masterData);
    }
  };

  const stopReceivingData = async () => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      return slaveStopData(getRequestBody());
    } else {
      return stopData(getRequestBody(), masterData);
    }
  };

  const resumeReceivingData = async () => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      return slaveResumeData(getRequestBody());
    } else {
      return resumeData(getRequestBody(), masterData);
    }
  };

  const isRunningTrial = () => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      return false;
    }
    return (
      device.runningTrialId !== trialId &&
      (device.runningStatus === DEVICE_STATE.play ||
        device.runningStatus === DEVICE_STATE.paused)
    );
  };

  //! called on btn click for updating db record
  const patchData = async (newState) => {
    deviceloading({ deviceId: device.id, status: newState }, true);
    const data = {
      device: {
        id: device.id,
      },
      status: newState,
    };
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      await slavePatchTrialSubject(trialSubject.id, data);
    } else {
      await patchTrialSubject(trialSubject.id, data, masterData);
    }
    setButtonState(newState);
    onButtonPress({ deviceId: device.id, status: newState });
    stateUpdated(newState);
  };

  const ResetDevice = async () => {
    deviceloading({ deviceId: device.id }, true);
    reset(device.id);
    const data = {
      deviceId: device.id,
      trialId: trialId,
      subjectId: trialSubject.subject.id,
    };
    await stopReceivingData();
    // if (process.env.REACT_APP_ENV === 'SLAVE') {
    //   await slaveResetDevice(data);
    // } else {
    //   await resetDevice(data, masterData);
    // }
    await startReceivingData();
    await patchData(DEVICE_STATE.play);
  };

  const stateUpdated = (newState) => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      emitDeviceStateUpdatedSlave({ ...getRequestBody(), newState });
    } else {
      emitDeviceStateUpdated({ ...getRequestBody(), newState }, masterData);
    }
  };

  return (
    <>
      {buttonState === DEVICE_STATE.play && (
        <CButton
          disabled={isDisabled || isRunningTrial()}
          onClick={async () => {
            await pauseReceivingData();
            await patchData(DEVICE_STATE.paused);
          }}
          color="warning"
          size="sm"
          className="mr-1 mb-2"
        >
          Pause
        </CButton>
      )}
      {buttonState === DEVICE_STATE.notYetStarted && (
        <CButton
          disabled={isDisabled || isRunningTrial()}
          onClick={async () => {
            await startReceivingData();
            await patchData(DEVICE_STATE.play);
          }}
          color="success"
          size="sm"
          className="mr-1 mb-2"
        >
          Play
        </CButton>
      )}
      {buttonState === DEVICE_STATE.paused && (
        <CButton
          disabled={isDisabled || isRunningTrial()}
          onClick={async () => {
            await resumeReceivingData();
            await patchData(DEVICE_STATE.play);
          }}
          color="success"
          size="sm"
          className="mr-1 mb-2"
        >
          Resume
        </CButton>
      )}
      {buttonState === DEVICE_STATE.paused && (
        <CButton
          disabled={isDisabled || isRunningTrial()}
          onClick={async () => {
            await stopReceivingData();
            await patchData(DEVICE_STATE.stop);
          }}
          color="danger"
          size="sm"
          className="mr-1 mb-2"
        >
          Stop
        </CButton>
      )}
      {buttonState === DEVICE_STATE.paused && (
        <CButton
          disabled={isDisabled || isRunningTrial()}
          onClick={() => {
            ResetDevice();
          }}
          color="warning"
          size="sm"
          className="mr-1 mb-2"
        >
          Restart
        </CButton>
      )}
    </>
  );
}
