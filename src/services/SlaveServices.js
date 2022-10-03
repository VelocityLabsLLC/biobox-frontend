import axios from 'axios';
import { io } from 'socket.io-client';

// const baseUrl = `http://192.168.0.103`;
const baseUrl = `http://localhost`;

const apiUrl = `${baseUrl}:3000`;
let socketUrl;

let socketIO;
let userId = new Date().getTime();
let connectToSocketPromise;

export const getSlaveDevice = () => {
  const apiData = {
    method: 'POST',
    url: `livedata/devicelist`,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const getGroupedData = (data) => {
  switch (data.interval) {
    case 'fifteen':
      data.interval = 5;
      break;
    case 'thirty':
      data.interval = 10;
      break;
    case 'minute':
      data.interval = 15;
      break;
    default:
      data.interval = 15;
      break;
  }
  const apiData = {
    method: 'POST',
    url: `trialdata/forSubject/grouped`,
    data,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const connectToSocketSlave = () => {
  if (connectToSocketPromise) {
    return connectToSocketPromise;
  }
  connectToSocketPromise = new Promise(async (resolve) => {
    if (socketIO && socketIO.connected) {
      connectToSocketPromise = null;
      resolve(socketIO);
      return;
    } else if (socketIO) {
      unsubscribeSocketEvent();
    }

    if (!socketUrl) {
      const result = await axios.get(`${apiUrl}/masterIp`);
      if (result?.data) {
        socketUrl = `${result.data}:3001`;
      } else {
        return;
      }
    }

    socketIO = io(socketUrl);
    socketIO.on('connect', () => {
      connectToSocketPromise = null;
      resolve(socketIO);
    });
    socketIO.on('connect_error', (err) => {
      connectToSocketPromise = null;
      console.log(err);
      if (
        err &&
        err.toString().indexOf('Session expired. Please login again.') > -1
      ) {
        unsubscribeSocketEvent();
        window.location = '/#/login';
      }
    });
  });
  return connectToSocketPromise;
};

export const unsubscribeSocketEvent = () => {
  if (socketIO) {
    socketIO.close();
    socketIO = undefined;
  }
};

export const getTrial = (id) => {
  const apiData = {
    method: 'GET',
    url: 'trials/' + id,
    data: {},
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const slaveStartData = async (trialMetadata) => {
  const apiData = {
    method: 'POST',
    url: `devices/start`,
    data: trialMetadata,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const slaveStopData = async (trialMetadata) => {
  const apiData = {
    method: 'GET',
    url: `devices/stop/${trialMetadata.deviceId}`,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const slavePauseData = async (trialMetadata) => {
  const apiData = {
    method: 'POST',
    url: `devices/pause`,
    data: trialMetadata,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const slaveResumeData = async (trialMetadata) => {
  const apiData = {
    method: 'POST',
    url: `devices/resume`,
    data: trialMetadata,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const slaveResetDevice = (data) => {
  const apiData = {
    method: 'POST',
    url: `devices/reset`,
    data,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

// TrialSubject
export const slavePatchTrialSubject = (id, data) => {
  const apiData = {
    method: 'PATCH',
    url: `trialsubject/${id}`,
    data,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const emitDeviceStateUpdatedSlave = (trialMetadata) => {
  if (socketIO && socketIO.connected) {
    socketIO.emit('deviceStateUpdated', {
      ...trialMetadata,
      env: process.env.REACT_APP_ENV,
    });
  }
};
