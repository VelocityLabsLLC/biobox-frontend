import axios from 'axios';
import { io } from 'socket.io-client';
import { store } from '../_redux/store';
import { MASTER } from '../_redux/actions/data';
import { toast } from 'react-toastify';

const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
// const baseUrl = `http://192.168.0.108`;
// const baseUrl = `http://localhost`;

const apiUrl =
  process.env.REACT_APP_ENV === 'CLOUD'
    ? process.env.REACT_APP_API_URL
    : `${baseUrl}:3000`;

const socketUrl =
  process.env.REACT_APP_ENV === 'LOCAL'
    ? `${baseUrl}:3001`
    : process.env.REACT_APP_SOCKET_URL;

let socketIO;
let userId = new Date().getTime();
let connectToSocketPromise;
let localTags = [];
// const userId = 'test';

/* USER API -START*/

export const login = (req) => {
  const apiData = {
    method: 'POST',
    url: 'user/login',
    data: req,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const register = (req) => {
  const apiData = {
    method: 'POST',
    url: 'user/registerUser',
    data: req,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const changePassword = (req) => {
  const apiData = {
    method: 'POST',
    url: 'user/changePassword',
    data: req,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const forgotPassword = (req) => {
  const apiData = {
    method: 'POST',
    url: 'user/forgot-password',
    data: req,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const confirmCode = (req) => {
  const apiData = {
    method: 'POST',
    url: 'user/confirm-code',
    data: req,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const updateUser = (id, req) => {
  const apiData = {
    method: 'PATCH',
    url: `user/${id}`,
    data: req,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};
/* USER API -END */

/* TESTING APIS - STRIPE PAYMENTS */

export const getPlans = () => {
  return axios.get(`${apiUrl}/stripepayments/getPlans`);
};

export const getCheckoutSession = (payload) => {
  return axios.post(
    `${apiUrl}/stripepayments/create-checkout-session`,
    payload,
  );
};

export const getSessionDetails = (sessionId) => {
  return axios.get(`${apiUrl}/stripepayments/get-session-info/${sessionId}`);
};

/* TESTING APIS - STRIPE PAYMENTS */

const apiPromises = {};
let listenersAdded = false;

export const getMasterSocketUrl = () => {
  return `${socketUrl}?deviceType=browser&userId=${userId}`;
};

const createPromise = () => {
  let resolver, rejecter;
  return [
    new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    }),
    resolver,
    rejecter,
  ];
};

// const checkAndCloseSocket = () => {
//   if (
//     Object.keys(apiPromises).length === 0 &&
//     window.location.href.indexOf('dashboard') === -1 &&
//     window.location.href.indexOf('editTrial') === -1
//   ) {
//     // Socket will be open always
//     // unsubscribeSocketEvent();
//   }
// };

const addListenersForResponseAndError = (socketConnection) => {
  if (!listenersAdded) {
    socketConnection.on('api-response', (data) => {
      if (data.uuid && apiPromises[data.uuid]) {
        apiPromises[data.uuid][1](data);
        delete apiPromises[data.uuid];
        // checkAndCloseSocket();
      }
    });
    socketConnection.on('error', (err) => {
      if (err.uuid && apiPromises[err.uuid]) {
        apiPromises[err.uuid][2](err);
        delete apiPromises[err.uuid];
        // checkAndCloseSocket();
      } else {
        if (err && err.data) {
          err = err.data;
        }
        toast.error(err && err.message ? err.message : err);
        const loaderElem = document.getElementsByClassName('.loader');
        if (loaderElem && loaderElem[0]) {
          loaderElem.remove();
        }
      }
    });
    listenersAdded = true;
  }
};

const socketConnectionForCloud = async (masterMac, apiData) => {
  //! userid to be made dynamic
  userId = new Date().getTime();
  const masterSocketURL = getMasterSocketUrl();
  const socketConnection = await connectToSocket(masterSocketURL);

  addListenersForResponseAndError(socketConnection);

  const uuid = uuidv4();

  apiPromises[uuid] = createPromise();

  socketConnection.emit('api-request', {
    macAddress: masterMac,
    apiData,
    uuid,
  });

  return apiPromises[uuid][0];
};

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// tags api
export const getTags = async (master) => {
  let data;
  const apiData = {
    method: 'POST',
    url: 'tags/find',
    data:
      master && master.value && master.value.macAddress
        ? {
            macAddress: master.value.macAddress,
          }
        : {},
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

// Devices API
export const getAllDevices = async (master) => {
  const apiData = {
    method: 'POST',
    url: 'devices/find',
    data:
      master && master.value && master.value.macAddress
        ? {
            where: {
              masterMacAddress: master.value.macAddress,
            },
          }
        : {},
  };
  if (
    master &&
    ((master.value && master.value.eventType === 'connected') ||
      master.eventType === 'connected')
  ) {
    return socketConnectionForCloud(
      master.macAddress || master.value.macAddress,
      apiData,
    );
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getDeviceData = (id, master) => {
  const apiData = {
    method: 'GET',
    url: `devices/${id}`,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const updateDeviceData = (deviceData, master) => {
  const apiData = {
    method: 'PATCH',
    url: `devices/${deviceData.id}`,
    data: {
      name: deviceData.name,
    },
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

//experiments API
export const getExperimentWithMasterData = async () => {
  if (process.env.REACT_APP_ENV === 'LOCAL') {
    const experimentData = await getAllExperiments();
    return { undefined, experimentData: experimentData.data };
  } else {
    let resp = await getAllMasters();
    resp = resp.data.data.map((master) => {
      return {
        value: { ...master },
        label: (
          <>
            <span
              className={`${
                master.eventType === 'connected'
                  ? 'connected-dot'
                  : 'disconnected-dot'
              }`}
            ></span>
            <span>
              {master.name
                ? master.name + ' - ' + master.macAddress
                : master.macAddress}
            </span>
          </>
        ),
      };
    });
    return { masterData: resp };
  }
};

export const getAllMasters = () => {
  return axios.get(`${apiUrl}/masterbox`);
};

export const updateMaster = (id, data) => {
  const apiData = {
    method: 'PATCH',
    url: `masterbox/${data.macAddress}`,
    data: {
      macAddress: data.macAddress,
      name: data.masterName,
      userEmail: data.userEmail,
      // email : data.assignTo,
    },
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const getAllExperiments = async (master) => {
  const apiData = {
    method: 'POST',
    url: 'experiments/find',
    data:
      master && master.macAddress
        ? {
            where: {
              masterMacAddress: master.macAddress,
            },
          }
        : {},
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getExperimentData = (id, master) => {
  const apiData = {
    method: 'GET',
    url: 'experiments/' + id,
    data: {
      // where: {
      //   masterMacAddress: master.macAddress,
      // },
    },
  };
  if (
    master &&
    ((master.value && master.value.eventType === 'connected') ||
      master.eventType === 'connected')
  ) {
    return socketConnectionForCloud(
      master.macAddress || master.value.macAddress,
      apiData,
    );
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const updateExperimentData = (data, master) => {
  const apiData = {
    method: 'PATCH',
    url: 'experiments/' + data.id,
    data,
  };
  if (
    master &&
    ((master.value && master.value.eventType === 'connected') ||
      master.eventType === 'connected')
  ) {
    return socketConnectionForCloud(
      master.macAddress || master.value.macAddress,
      apiData,
    );
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const createExperiment = async (data, masterMac) => {
  const apiData = {
    method: 'POST',
    url: 'experiments',
    data: { ...data, masterMacAddress: masterMac },
  };
  if (masterMac) {
    return socketConnectionForCloud(masterMac, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

// Subjects API
export const getAllSubjects = (master) => {
  const apiData = {
    method: 'POST',
    url: 'subjects/find',
    data:
      master && master.macAddress
        ? {
            where: {
              masterMacAddress: master.macAddress,
            },
          }
        : {},
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getSubjectData = (master, id) => {
  const apiData = {
    method: 'GET',
    url: `subjects/${id}`,
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getExperimentSubjects = (master, data) => {
  const apiData = {
    method: 'POST',
    url: 'subjects/findInExperiment',
    data: {
      experimentIds: data,
    },
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const updateExperimentSubjects = (id, master, data) => {
  const apiData = {
    method: 'PATCH',
    url: `subjects/${id}`,
    data,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const createSubjectData = (master, data) => {
  const apiData = {
    method: 'POST',
    url: 'subjects',
    data,
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const CreateNewMaster = (data) => {
  const apiData = {
    method: 'POST',
    url: `masterbox`,
    data: data,
  };
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
};

export const updateSubjectData = (master, data, id) => {
  const apiData = {
    method: 'PATCH',
    url: `subjects/${data.id || id}`,
    data,
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

//trials Api
export const getAllTrialswithid = (master, id) => {
  const apiData = {
    method: 'POST',
    url: 'trials/findAllInExperiment',
    data: {
      experiment: id,
    },
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getAllTrials = (master) => {
  const apiData = {
    method: 'POST',
    url: 'trials/findAll',
    data:
      master && master.macAddress
        ? {
            where: {
              masterMacAddress: master.macAddress,
            },
          }
        : {},
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getAllTrialsdataAPI = (master, id) => {
  const apiData = {
    method: 'GET',
    url: 'trials/' + id,
    data: {},
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const updateTrialData = (master, data) => {
  const apiData = {
    method: 'PATCH',
    url: 'trials/' + data.id,
    data: data.name ? { name: data.name } : data,
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  }
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};
//   const trialDataUpdate = {
//     name: data.name,
//   };
//   return axios.patch(`${apiUrl}/trials/${data.id}`, trialDataUpdate);
// };
export const generateTrialData = (master, data) => {
  const apiData = {
    method: 'POST',
    url: 'trials',
    data: {
      ...data,
      masterMacAddress: master
        ? master.macAddress || master.value.macAddress
        : undefined,
    },
  };
  if (
    master &&
    ((master.value && master.value.eventType === 'connected') ||
      master.eventType === 'connected')
  ) {
    return socketConnectionForCloud(
      master.macAddress || master.value.macAddress,
      apiData,
    );
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const subscribeForDeviceDataOnCloud = async (master, trialMetadata) => {
  if (!socketIO || (socketIO && !socketIO.connected)) {
    await connectToSocket(getMasterSocketUrl());
  }
  if (
    socketIO &&
    socketIO.connected &&
    master?.value?.eventType === 'connected' &&
    trialMetadata
  ) {
    socketIO.emit('subscribeToDeviceData', {
      userId,
      trialId: trialMetadata.trialId,
      deviceId: trialMetadata.deviceId,
      subjectId: trialMetadata.subjectId,
      macAddress: master.value.macAddress,
    });
  }
  return true;
};

export const unsubscribeForDeviceDataOnCloud = async (
  master,
  trialMetadata,
) => {
  if (!socketIO || (socketIO && !socketIO.connected)) {
    await connectToSocket(getMasterSocketUrl());
  }
  if (
    socketIO &&
    socketIO.connected &&
    master?.value?.eventType === 'connected' &&
    trialMetadata
  ) {
    socketIO.emit('unsubscribeToDeviceData', {
      userId,
      trialId: trialMetadata.trialId,
      deviceId: trialMetadata.deviceId,
      subjectId: trialMetadata.subjectId,
      macAddress: master.value.macAddress,
    });
  }
  return true;
};

export const startData = async (trialMetadata, master) => {
  const apiData = {
    method: 'POST',
    url: `devices/start`,
    data: trialMetadata,
  };

  if (master && master.value && master.value.eventType === 'connected') {
    await subscribeForDeviceDataOnCloud(master, trialMetadata);
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const stopData = async (trialMetadata, master) => {
  const apiData = {
    method: 'GET',
    url: `devices/stop/${trialMetadata.deviceId}`,
  };

  if (master && master.value && master.value.eventType === 'connected') {
    await unsubscribeForDeviceDataOnCloud(master, trialMetadata);
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const pauseData = async (trialMetadata, master) => {
  const apiData = {
    method: 'POST',
    url: `devices/pause`,
    data: trialMetadata,
  };

  if (master && master.value && master.value.eventType === 'connected') {
    await unsubscribeForDeviceDataOnCloud(master, trialMetadata);
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const resumeData = async (trialMetadata, master) => {
  const apiData = {
    method: 'POST',
    url: `devices/resume`,
    data: trialMetadata,
  };

  if (master && master.value && master.value.eventType === 'connected') {
    await subscribeForDeviceDataOnCloud(master, trialMetadata);
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const resetDevice = (data, master) => {
  const apiData = {
    method: 'POST',
    url: `devices/reset`,
    data,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

// TrialSubject
export const patchTrialSubject = (id, data, master) => {
  const apiData = {
    method: 'PATCH',
    url: `trialsubject/${id}`,
    data,
  };

  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getExperimentTests = (data, master) => {
  const apiData = {
    method: 'POST',
    url: `trialsubject/findInTrial`,
    data: {
      trialIds: data,
    },
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const updateExperimentTests = (id, data, master) => {
  const apiData = {
    method: 'PATCH',
    url: `trialsubject/${id}`,
    data,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

// Socket
export const connectToSocket = (url = undefined) => {
  if (connectToSocketPromise) {
    return connectToSocketPromise;
  }
  connectToSocketPromise = new Promise((resolve) => {
    if (socketIO && socketIO.connected) {
      connectToSocketPromise = null;
      resolve(socketIO);
      return;
    } else if (socketIO) {
      unsubscribeSocketEvent();
    }
    const urlToConnect = url || socketUrl;
    const authObj =
      process.env.REACT_APP_ENV === 'CLOUD'
        ? {
            auth: {
              token: localStorage.getItem('token') || null,
            },
          }
        : {};
    socketIO = io(urlToConnect, authObj);
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
    socketIO.on('deviceOffline', ({ macAddress, message }) => {
      const currentMasterBoxData = store.getState()?.dataReducer?.data || {};
      if (currentMasterBoxData?.value?.macAddress === macAddress) {
        currentMasterBoxData.value.eventType = 'disconnected';
        store.dispatch(
          MASTER({
            ...currentMasterBoxData,
          }),
        );
      }
    });
    socketIO.on('deviceOnline', ({ macAddress, message }) => {
      const currentMasterBoxData = store.getState()?.dataReducer?.data || {};
      if (currentMasterBoxData?.value?.macAddress === macAddress) {
        currentMasterBoxData.value.eventType = 'connected';
        store.dispatch(
          MASTER({
            ...currentMasterBoxData,
          }),
        );
      }
    });
  });
  return connectToSocketPromise;
};

export const unsubscribeSocketEvent = () => {
  listenersAdded = false;
  if (socketIO) {
    socketIO.close();
    socketIO = undefined;
  }
};

//protocols
export const getAllProtocols = async (master) => {
  const apiData = {
    method: 'POST',
    url: 'protocols/find',
    data:
      master && master.macAddress
        ? {
            where: {
              masterMacAddress: master.macAddress,
            },
          }
        : {},
  };
  if (
    master &&
    ((master.value && master.value.eventType === 'connected') ||
      master.eventType === 'connected')
  ) {
    return socketConnectionForCloud(
      master.macAddress || master.value.macAddress,
      apiData,
    );
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const createNewProtocol = (data, master) => {
  const apiData = {
    method: 'POST',
    url: `protocols`,
    data,
  };
  if (
    master &&
    ((master.value && master.value.eventType === 'connected') ||
      master.eventType === 'connected')
  ) {
    return socketConnectionForCloud(
      master.macAddress || master.value.macAddress,
      apiData,
    );
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};
//
export const getAllTrialSubject = (master, trialid, deviceid) => {
  const apiData = {
    method: 'GET',
    url: `trialsubject/findSubjectsByDevice/${trialid}/${deviceid}`,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};
export const getSubjectGraph = (master, data) => {
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

  if (process.env.REACT_APP_ENV === 'CLOUD') {
    data['masterMacAddress'] = master?.value?.macAddress;
  }

  const apiData = {
    method: 'POST',
    url: `trialdata/forSubject/grouped`,
    data,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getDataInCSV = (master, data) => {
  const apiData = {
    method: 'POST',
    url: 'trialdata/csv-file',
    data,
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getSubjectDetailsoftrial = (master, subjectid) => {
  const apiData = {
    method: 'GET',
    url: `trialsubject/findTrialsBySubject/${subjectid}`,
  };
  if (master && master.value && master.value.eventType === 'connected') {
    return socketConnectionForCloud(master.value.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

export const getDeviceListForLiveData = (master = undefined) => {
  const apiData = {
    method: 'POST',
    url: 'livedata/deviceList',
    data:
      master && master.macAddress
        ? {
            masterMacAddress: master.macAddress,
          }
        : {},
  };
  if (master && master.eventType === 'connected') {
    return socketConnectionForCloud(master.macAddress, apiData);
  } else {
    return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  }
};

// masterbox list

export const getMasterboxList = (data, master) => {
  const apiData = {
    method: 'GET',
    url: `masterbox`,
  };
  // if (master && master.value && master.value.eventType === 'connected') {
  //   return socketConnectionForCloud(master.value.macAddress, apiData);
  // } else {
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  // }
};

export const getUsersList = (data, master) => {
  const apiData = {
    method: 'GET',
    url: `user`,
  };
  // if (master && master.value && master.value.eventType === 'connected') {
  //   return socketConnectionForCloud(master.value.macAddress, apiData);
  // } else {
  return axios({ ...apiData, url: `${apiUrl}/${apiData.url}` });
  // }
};

export const parseTags = (tags) => {
  if (tags) {
    let splitted = tags.split(',');
    if (splitted.length >= 2) {
      splitted.shift();
      splitted.pop();
      return splitted.map((e) => {
        return {
          label: e,
          value: e,
        };
      });
    }
  }
  return null;
};

export const unsubscribeSocketForDeviceData = (data, master) => {
  if (socketIO && socketIO.connected) {
    socketIO.emit('unsubscribeToDeviceData', {
      userId,
      trialId: data.trialId,
      deviceId: data.deviceId,
      subjectId: data.subjectId,
      macAddress: master.value.macAddress,
    });
  }
};

export const getDisabledState = (master, slave = null) => {
  if (master && master.value && master.value.eventType !== 'connected') {
    return true;
  }
  if (slave && slave.status !== 'Connected') {
    return true;
  }
  return false;
};

export const DEVICE_STATE = {
  paused: 'paused',
  stop: 'stop',
  play: 'play',
  notYetStarted: 'notYetStarted',
  complete: 'complete',
};

export const GROUPED_MESSAGE = {
  DATA_FILE_TRANSFER_IN_PROGRESS: 'File transfer in progress',
  DATA_FILE_TRANSFERED: 'File transfered',
  DATA_IMPORT_IN_PROGRESS: 'Import in progress',
  DATA_IMPORTED: '',
  DEFAULT: 'No data recorded',
};

export const INTERVALS = {
  5: 'fifteen',
  10: 'thirty',
  15: 'minute',
};

export const millisToMinutesAndSeconds = (millis) => {
  var seconds = (Math.ceil(millis / 1000) % 60).toFixed(0);
  var minutes =
    seconds <= 0 ? Math.ceil(millis / 60000) : Math.floor(millis / 60000);
  const dataToSet =
    (minutes < 10 ? '0' : '') +
    minutes +
    ':' +
    (seconds < 10 ? '0' : '') +
    seconds;
  return dataToSet;
};

export const GetLiveInterval = (datasets) => {
  return datasets.map((data) => {
    let time = data.trialDuration * 60000 - data.timeRemaining;
    return millisToMinutesAndSeconds(time);
  });
};
export const getBarGraphLabels = (data, interval) => {
  return data.map((d, j) => {
    let ind = Object.values(INTERVALS).findIndex((x) => x === interval);
    let temp = (j + 1) * Object.keys(INTERVALS)[ind] * 1000;
    return millisToMinutesAndSeconds(temp);
  });
};

export const emitDeviceStateUpdated = (trialMetadata, master) => {
  if (socketIO && socketIO.connected) {
    socketIO.emit('deviceStateUpdated', {
      ...trialMetadata,
      macAddress: master?.value?.macAddress,
      env: process.env.REACT_APP_ENV,
    });
  }
};

export const setLocalTags = (tags) => {
  localTags = [...localTags, ...tags];
};

export const getLocalTags = (tags) => {
  return [...localTags];
};

export const commonBarGraphOptions = (hexColorString) => {
  return {
    backgroundColor: hexColorString,
    borderColor: hexColorString,
    borderWidth: 1,
    barPercentage: 1.0,
    categoryPercentage: 1.0,
  };
};

export const commonLineGraphOptions = (hexColorString) => {
  return {
    backgroundColor: 'transparent',
    borderColor: hexColorString,
    // borderWidth: 2,
    // pointBorderColor: 'transparent',
    steppedLine: 'middle',
  };
};
