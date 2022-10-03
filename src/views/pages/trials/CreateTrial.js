import { freeSet } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CDataTable,
  CFormGroup,
  CInput,
  CLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react';
import { Formik } from 'formik';
import { each, find, findIndex } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connectToSocketSlave, getTrial } from 'src/services/SlaveServices';
import * as Yup from 'yup';
import { InputError, Loader } from '../../../reusable';
import {
  connectToSocket,
  DEVICE_STATE as deviceState,
  generateTrialData,
  getAllTrialsdataAPI,
  getDisabledState,
  getExperimentData,
  getMasterSocketUrl,
  INTERVALS,
  updateTrialData,
} from '../../../services/AppService';
import LiveDataGraph from '../livedata/LiveDataGraph';
import SelectedMater from '../selectedMaster/SelectedMaster';
import DeviceStateButton from './DeviceStateButton';
import NewData from './NewData';

const CreateTrial = ({ trialId, device, getUpdatedSlave }) => {
  const _params = useParams();
  const _history = useHistory();

  const [showPanel, setShowPanel] = useState(
    _params.id ? false : trialId ? false : true,
  );
  const deviceListRef = useRef();
  const [resetList, setResetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeviceLoading, setDeviceIsLoading] = useState([]);
  const [experimentData, setExperimentData] = useState(true);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [socketInstance, setSocketInstance] = useState();
  const fields = ['_', 'order', 'subjectName', 'treatment', 'status', 'action']; //"device"
  const masterData = useSelector((store) => store.dataReducer.data);
  const [isDisabled, setDisabled] = useState(getDisabledState(masterData));
  const initialValuesForTrial = {
    name: '',
    expId: _params.experimentId ? _params.experimentId : null,
  };
  const [trialData, setTrialData] = useState(initialValuesForTrial);
  const [devicesList, setDevicesList] = useState([]);
  const [socketData, setSocketData] = useState();
  const [intervalMapper, setIntervalMapper] = useState([]);

  const [temporarySelectedRowData, setTemporarySelectedRowData] = useState({});
  const [temporarySelectedDeviceForModal, setTemporarySelectedDeviceForModal] =
    useState({});

  // ! note: currentAssignment is relation between device and assigned trialSunject at any given time.
  // ! type: Object = { deviceId1: trialSubjectObject, deviceId2: trialSubjectObject }.
  const [currentAssignment, setCurrentAssignment] = useState({});
  const [currMaster, setCurrMaster] = useState(undefined);

  const getalltrialsData = async (master = undefined) => {
    setIsLoading(true);
    setCurrMaster(master);
    try {
      if (process.env.REACT_APP_ENV === 'SLAVE') {
        const resp = await getTrial(device.trialId);
        setTrialData(resp.data);
        setExperimentData(resp.data.experiment);
        setDevicesList([device]);
        let deviceStates = [false];
        setDeviceIsLoading(deviceStates);
        const ca = {
          [device.deviceId]: find(resp.data.trialSubjects, (x) => {
            if (x.subject && x.subject.id === device.subjectId) {
              return x;
            }
          }),
        };
        setCurrentAssignment({ ...ca });
      } else {
        if (_params.id) {
          const data = await getAllTrialsdataAPI(master, _params.id);
          if (data && data.data) {
            setTrialData(data.data);
            setExperimentData(data.data.experiment);
            deviceListRef.current = data.data?.experiment?.devices;
            setDevicesList([...data.data?.experiment?.devices]);
            let deviceStates = data.data?.experiment?.devices?.map((states) => {
              return false;
            });
            setDeviceIsLoading(deviceStates);

            // ! START XXX to update trialstatus when all trial subject status are complete
            checkSetTrialStatus(master, data.data);
            // ! END to update status when all are complete

            // assigning trialSubjects to devices
            let ca = currentAssignment;
            let tempList = [...data.data.trialSubjects];
            each(data.data?.experiment?.devices, (d, di) => {
              let f = {};
              //checking status and id
              let i = tempList.findIndex(
                (t) =>
                  t.device?.id === d.id &&
                  (t.status === deviceState.play ||
                    t.status === deviceState.paused),
              );
              if (i < 0) {
                f = undefined;
              } else {
                f = tempList[i];
                tempList.splice(i, 1);
              }
              ca = { ...ca, [d.id]: f };
            });
            // assigning values that are remaining
            Object.keys(ca).forEach((caId, caIndex) => {
              if (ca[caId] === undefined && tempList.length) {
                if (caIndex < tempList.length) {
                  if (tempList[caIndex]?.device === null) {
                    ca[caId] = tempList[caIndex];
                  } else if (
                    tempList[caIndex]?.status !== deviceState.complete &&
                    tempList[caIndex]?.status !== deviceState.stop
                  ) {
                    ca[caId] = tempList[caIndex];
                  } else {
                    ca[caId] = getNextAvailableSubject(tempList);
                  }
                  // tempList.splice(caIndex,1)
                } else if (
                  caIndex >= tempList.length &&
                  // (caId === tempList[caIndex - tempList.length]?.device?.id || tempList[caIndex - tempList.length]?.device === null)
                  (caId === tempList[0]?.device?.id ||
                    tempList[0]?.device === null)
                ) {
                  // ca[caId] = tempList[caIndex - tempList.length];
                  ca[caId] = tempList[0];
                  // tempList.splice(caIndex - tempList.length,1)
                  tempList.splice(0, 1);
                }
              }
            });

            setCurrentAssignment({ ...ca });
          }
        } else if (_params.experimentId) {
          const res = await getExperimentData(_params.experimentId, master);
          setExperimentData(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setDeviceLoading = (data, loading) => {
    let deviceloading = isDeviceLoading;
    devicesList?.map((device, i) => {
      if (device.id === data.deviceId) {
        deviceloading[i] = loading;
      }
    });
    setDeviceIsLoading([...deviceloading]);
  };

  // To assign the subject with status notYetStarted
  const getNextAvailableSubject = (tempList) => {
    const foundIndex = findIndex(tempList, {
      status: deviceState.notYetStarted,
    });
    if (foundIndex > -1) {
      const toReturn = tempList[foundIndex];
      tempList.splice(foundIndex, 1);
      return toReturn;
    }
    return undefined;
  };

  const initiateSocketConnection = async () => {
    if (!socketInstance) {
      const instance =
        process.env.REACT_APP_ENV !== 'SLAVE'
          ? await connectToSocket(
              masterData &&
                masterData.value &&
                masterData.value.eventType === 'connected'
                ? getMasterSocketUrl()
                : null,
            )
          : await connectToSocketSlave();
      setSocketInstance(instance);
      subscribeToEvents(instance);
    }
  };

  const subscribeToEvents = (instance) => {
    if (instance) {
      instance.off('trialCompleted').on('trialCompleted', (data) => {
        if (process.env.REACT_APP_ENV === 'SLAVE') {
          if (data.deviceId === device.deviceId) {
            setSocketData(data);
            getUpdatedSlave();
          }
        } else {
          setSocketData(data);
          // DESC: function for all status-complete check and update
          checkSetTrialStatus(currMaster, trialData);
        }
      });

      instance.off('deviceStateUpdated').on('deviceStateUpdated', (data) => {
        if (data.env !== process.env.REACT_APP_ENV) {
          if (process.env.REACT_APP_ENV === 'SLAVE') {
            if (data.deviceId === device.deviceId) {
              getUpdatedSlave();
            }
          } else {
            getalltrialsData(masterData);
          }
        }
      });

      instance.off('slave-disconnect').on('slave-disconnect', (data) => {
        if (process.env.REACT_APP_ENV !== 'SLAVE') {
          const foundIndex = findIndex(deviceListRef.current, data);
          if (
            foundIndex > -1 &&
            deviceListRef.current[foundIndex].status !== 'Disconnected'
          ) {
            console.log('slave disconnected >>> ', data);
            deviceListRef.current[foundIndex].status = 'Disconnected';
            deviceListRef.current[foundIndex].callPatch = true;
            setDevicesList([...deviceListRef.current]);
          }
        }
      });

      instance.off('slave-connect').on('slave-connect', (data) => {
        if (process.env.REACT_APP_ENV !== 'SLAVE') {
          const foundIndex = findIndex(deviceListRef.current, data);
          if (
            foundIndex > -1 &&
            deviceListRef.current[foundIndex].status !== 'Connected'
          ) {
            console.log('slave connected >>> ', data);
            deviceListRef.current[foundIndex].status = 'Connected';
            deviceListRef.current[foundIndex].callPatch = false;
            setDevicesList([...deviceListRef.current]);
          }
        }
      });
    }
  };

  const checkSetTrialStatus = async (master, data = trialData) => {
    let allcomplete = true;
    // checking if all trial subjects are complete
    if (!data || !data.trialSubjects) return;
    data.trialSubjects.forEach((element) => {
      if (element.status !== 'complete') {
        allcomplete = false;
      }
    });
    if (allcomplete === true) {
      let req = {
        id: data.id,
        trialStatus: 'complete',
      };
      await updateTrialData(master, req);
    }
  };

  const selectSubject = () => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      return 'mx-1 px-1';
    } else {
      return 'mx-1 px-1 font-weight-bold cursor-pointer text-underline bg-gray-100';
    }
  };

  useEffect(() => {
    if (socketData && process.env.REACT_APP_ENV !== 'SLAVE') {
      changeAssignedTrialSubjectOnDevice(socketData);
    }
  }, [socketData]);

  const changeAssignedTrialSubjectOnDevice = (data) => {
    if (
      data?.experimentId === trialData?.experiment?.id &&
      data?.deviceId &&
      currentAssignment?.[data.deviceId] &&
      data?.trialId === currentAssignment?.[data.deviceId]?.trial.id &&
      data?.subjectId === currentAssignment?.[data.deviceId].subject.id
    ) {
      let ca = currentAssignment;
      ca[data.deviceId].status = deviceState.complete;
      setCurrentAssignment({ ...ca });
      setSocketData();
      getalltrialsData(masterData);
    }
  };

  const trialschema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const onSubmitform = async (values) => {
    setIsLoading(true);
    try {
      if (_params.id ? _params.id : trialId) {
        await updateTrialData(masterData, values);
        toast.success('Trial Updated Successfully');
        // console.log("sucess update");
      } else {
        const valuesofall = {
          name: values.name,
          experiment: { id: _params.experimentId },
        };
        // console.log(valuesofall);
        const response = await generateTrialData(masterData, valuesofall);
        toast.success('Trial Added Successfully');
        _history.push(`/editTrial/${response.data.id}`);
      }
    } catch (error) {
      toast.error('Please try again');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onButtonPress = (data) => {
    let ca = currentAssignment;
    ca[data.deviceId].status = data.status;
    ca[data.deviceId].device = { id: data.deviceId };
    setCurrentAssignment({ ...ca });
  };

  const onReset = (data) => {
    let temp = [...resetList, data];
    setResetList(temp);
  };

  const resetDone = (data) => {
    let temp = resetList.filter((device) => {
      if (device !== data) {
        return device;
      }
    });
    setResetList(temp);
  };

  const showLiveData = (e) => {
    if (socketInstance) {
      if (process.env.REACT_APP_ENV === 'SLAVE') {
        if (
          currentAssignment[e.id]?.status !== deviceState.stop &&
          currentAssignment[e.id]?.status !== deviceState.complete
        ) {
          return true;
        }
      } else {
        if (currentAssignment[e.id]?.status) {
          return true;
        }
      }
    }
    return false;
  };

  const showControlButtons = (e) => {
    if (process.env.REACT_APP_ENV === 'SLAVE') {
      if (
        currentAssignment[e.id]?.status !== deviceState.stop &&
        currentAssignment[e.id]?.status !== deviceState.complete
      ) {
        return true;
      }
    } else {
      if (
        currentAssignment[e.id]?.status !== deviceState.complete &&
        currentAssignment[e.id]?.status !== deviceState.stop
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    getalltrialsData(masterData);
    initiateSocketConnection();
  }, [masterData]);

  return (
    <div>
      {isLoading && <Loader />}
      <SelectedMater />
      {(_params?.id || _params.experimentId) && (
        <Formik
          enableReinitialize={true}
          initialValues={trialData}
          validationSchema={trialschema}
          key="Trial-data"
          onSubmit={(values) => {
            onSubmitform(values);
          }}
        >
          {({ values, handleSubmit, handleChange, errors, touched }) => (
            <CRow className="mx-0">
              <CCol>
                <CCard className="mb-2">
                  <CCardHeader
                    onClick={() => {
                      if (_params.id ? _params.id : trialId) {
                        setShowPanel(!showPanel);
                      }
                    }}
                  >
                    <CRow>
                      <CCol>
                        <h4 className="m-0">
                          Trial{' '}
                          {experimentData && experimentData.name
                            ? 'for Experiment: ' + experimentData.name
                            : null}
                        </h4>
                      </CCol>
                      {(_params.id || trialId) && (
                        <CCol xs="3" className="text-right">
                          {showPanel === true && (
                            <CIcon content={freeSet.cilChevronTop} />
                          )}
                          {showPanel === false && (
                            <CIcon content={freeSet.cilChevronBottom} />
                          )}
                        </CCol>
                      )}
                    </CRow>
                  </CCardHeader>
                  <CCollapse show={showPanel}>
                    <CCardBody>
                      <CRow>
                        <CCol xs="12">
                          <CFormGroup>
                            <CLabel htmlFor="name">Trial Name</CLabel>
                            <CInput
                              id="name"
                              name="name"
                              placeholder="Trial Name"
                              required
                              value={values?.name}
                              onChange={handleChange}
                              invalid={errors.name}
                            />
                            <InputError
                              text={errors.name}
                              touched={touched.name}
                            />
                          </CFormGroup>
                        </CCol>
                      </CRow>
                      {experimentData && experimentData.protocol && (
                        <CRow>
                          <CCol md="4">
                            Trial Duration:{' '}
                            {experimentData.protocol.trialDuration} mins
                          </CCol>
                          <CCol md="4">
                            Sampling Frequency:{' '}
                            {experimentData.protocol.samplingFrequency} Hz
                          </CCol>
                          <CCol md="4">
                            Phases: {experimentData.protocol.phases.length}
                          </CCol>
                        </CRow>
                      )}
                      <CRow className="mt-1 mr-1">
                        <div className="ml-auto">
                          {/* <CFormGroup> */}
                          <CButton
                            onClick={() => {
                              _history.push('/experiments');
                            }}
                            className="mr-2"
                            color="outline-danger"
                          >
                            Cancel
                          </CButton>
                          <CButton
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              handleSubmit();
                            }}
                            color="info"
                          >
                            Save
                          </CButton>
                          {/* </CFormGroup> */}
                        </div>
                      </CRow>
                    </CCardBody>
                  </CCollapse>
                </CCard>
              </CCol>
            </CRow>
          )}
        </Formik>
      )}
      {_params?.id && (
        <div className="mb-2 mr-3 text-right">
          <CButton
            color="info "
            onClick={() => {
              setPreviewOnly(true);
              setShowModal(true);
            }}
          >
            Preview
          </CButton>
        </div>
      )}

      {_params?.id && (
        <CModal
          show={showModal}
          onClose={() => setShowModal(false)}
          size="lg"
          style={{ maxHeight: '90vh', overflow: 'auto' }}
        >
          <CModalHeader closeButton>
            <CModalTitle>Queue</CModalTitle>
          </CModalHeader>
          <CModalBody className="pb-0">
            <CRow>
              <CCol xs="12" lg="12">
                <CCard className="px-0">
                  <CCardBody className="p-0 border-top-0">
                    <CDataTable
                      addTableClasses="m-0"
                      items={trialData?.trialSubjects}
                      fields={fields}
                      scopedSlots={{
                        _: (rowData, rowIndex) =>
                          previewOnly ? (
                            <td></td>
                          ) : (
                            <td className="pl-1 pr-0">
                              <div
                                className={` rounded-icon 
                              ${
                                !temporarySelectedRowData.id &&
                                currentAssignment[
                                  temporarySelectedDeviceForModal?.id
                                ]?.id === rowData.id &&
                                ' active '
                              }
                              ${
                                rowData.id === temporarySelectedRowData.id &&
                                ' active '
                              }
                              ${
                                rowData.status === deviceState.notYetStarted &&
                                (rowData.device === null ||
                                  rowData.device?.id ===
                                    temporarySelectedDeviceForModal.id) &&
                                ' inactive '
                              }
                              ${
                                rowData.status != deviceState.notYetStarted &&
                                ' border-0 cursor-not-allowed bg-gray-100 '
                              }
                            `}
                                onClick={() => {
                                  // if already assigned to device disable reselecting again
                                  if (
                                    rowData.status === deviceState.stop ||
                                    rowData.status === deviceState.complete
                                  ) {
                                    return;
                                  } else if (
                                    currentAssignment[
                                      temporarySelectedDeviceForModal.id
                                    ]?.id === rowData.id
                                  )
                                    return;
                                  // if not assigned or was already sassigned to device then only set
                                  else if (
                                    rowData.device === null ||
                                    rowData?.device?.id ===
                                      temporarySelectedDeviceForModal.id
                                  ) {
                                    setTemporarySelectedRowData(rowData);
                                  }
                                }}
                              ></div>
                            </td>
                          ),
                        subjectName: (rowData) => (
                          <td>
                            <span>{rowData.name}</span>
                          </td>
                        ),
                        status: (rowData) => (
                          <td>
                            <span>{rowData.status || '--'}</span>
                          </td>
                        ),
                        device: (rowData) => (
                          <td>
                            <span>{rowData.device?.id || '--'}</span>
                          </td>
                        ),
                        action: (rowData) => (
                          <td className="pt-2 pb-1">
                            {/* // ! temporary hide move up/down buttons */}
                            {/* <button
                              type="button"
                              className="btn btn-sm small border py-0 px-1"
                              onClick={(event) => {
                                console.log("up ");
                                // todo: call API to change Order
                              }}
                            >
                              <CIcon content={freeSet.cilChevronTop} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm small border py-0 px-1"
                              onClick={(event) => {
                                console.log("down ");
                                // todo: call API to change Order
                              }}
                            >
                              <CIcon content={freeSet.cilChevronBottom} />
                            </button> */}
                            {rowData?.device?.id && (
                              <div
                                className="small px-1 py-0 cursor-pointer"
                                onClick={() => {
                                  _history.push(
                                    `/subjectGraph/${trialData.id}/${rowData.device.id}/${rowData.subject.id}`,
                                  );
                                }}
                              >
                                <CIcon
                                  content={freeSet.cilInfo}
                                  className="bg-info text-white c-icon-xl"
                                />
                              </div>
                            )}
                          </td>
                        ),
                      }}
                    />
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="outline-danger" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton
              color="info"
              onClick={() => {
                // assigning current selected rowdata of trialsubject to device id for which modal is opened.
                if (temporarySelectedRowData != {}) {
                  let c = currentAssignment;
                  c[temporarySelectedDeviceForModal.id] =
                    temporarySelectedRowData;
                  //START: to check for duplicate in other assigned devices and reset them to empty-object
                  Object.keys(c).forEach((oc, oi) => {
                    // console.log(oc);
                    if (
                      oc !== temporarySelectedDeviceForModal.id &&
                      c[oc] != undefined &&
                      c[oc].id === c[temporarySelectedDeviceForModal.id]?.id
                    ) {
                      // console.log("duplicate found");
                      c[oc] = {};
                    } else {
                      // console.log("unique");
                    }
                  });
                  //STOP: to check for duplicate in other assigned devices
                  setCurrentAssignment({ ...c });
                  // console.log(c);
                }

                // close modal
                setShowModal(false);
              }}
            >
              OK
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      <div>
        <CRow className="mx-0">
          {devicesList &&
            devicesList.length > 0 &&
            devicesList?.map((e, i) => {
              return (
                <CCol xs={!_params?.id ? 12 : 6} key={e.id}>
                  <CCard>
                    {isDeviceLoading[i] && <Loader customPosition={true} />}
                    <CCardHeader className="p-1">
                      <CRow>
                        <CCol sm="5">
                          <CButton
                            className="primarytext-left p-2"
                            disabled={!_params?.id && !_params?.experiment}
                            onClick={() => {
                              _history.push(
                                `/subjectData/${trialData.id}/${e.id}/${
                                  currentAssignment[e.id]?.subject.id
                                }`,
                              );
                            }}
                          >
                            <span
                              className={
                                process.env.REACT_APP_ENV !== 'SLAVE'
                                  ? e?.status === 'Connected'
                                    ? 'connected-dot'
                                    : 'disconnected-dot'
                                  : e?.connectionStatus === 'Connected'
                                  ? e.status === 'play'
                                    ? 'connected-dot blink'
                                    : 'idle-dot'
                                  : 'disconnected-dot'
                              }
                            />
                            <span className="pl-1">
                              {e.name}
                              {e.runningTrialId !== _params?.id &&
                              (e.runningStatus === deviceState.play ||
                                e.runningStatus === deviceState.paused) ? (
                                <span className="busy"> - Busy</span>
                              ) : (
                                ''
                              )}
                            </span>
                          </CButton>
                        </CCol>
                        <CCol sm="7" className="py-2">
                          <div className="d-flex justify-content-end">
                            {!_params?.id &&
                              !_params?.experiment &&
                              (currentAssignment[e.id]?.status ===
                                deviceState.stop ||
                                currentAssignment[e.id]?.status ===
                                  deviceState.complete) && (
                                <CButtonGroup className="mr-2 mb-2">
                                  {Object.keys(INTERVALS).map((value) => (
                                    <CButton
                                      color="outline-secondary"
                                      key={value}
                                      className="mx-0"
                                      active={
                                        INTERVALS[value] ===
                                        (intervalMapper[e.macAddress] ||
                                          'minute')
                                      }
                                      onClick={() => {
                                        if (
                                          intervalMapper[e.macAddress] ===
                                          INTERVALS[value]
                                        ) {
                                          return;
                                        }
                                        setIntervalMapper({
                                          ...intervalMapper,
                                          [e.macAddress]: INTERVALS[value],
                                        });
                                      }}
                                    >
                                      {value}s
                                    </CButton>
                                  ))}
                                </CButtonGroup>
                              )}
                            {showControlButtons(e) && (
                              <DeviceStateButton
                                device={e}
                                experiment={trialData.experiment}
                                trialId={_params.id ? _params.id : trialId}
                                trialSubject={currentAssignment[e.id]}
                                onButtonPress={onButtonPress}
                                deviceloading={setDeviceLoading}
                                reset={onReset}
                              ></DeviceStateButton>
                            )}
                          </div>
                        </CCol>
                      </CRow>
                    </CCardHeader>
                    <CCardBody className="py-3" style={{ minHeight: '200px' }}>
                      {process.env.REACT_APP_ENV !== 'SLAVE' && (
                        <CRow className="mx-0 mb-2 border p-1 rounded">
                          <CCol xs="12">
                            <div className="d-flex ">
                              <CLabel
                                htmlFor={`subjectselector${i}`}
                                className="my-auto"
                              >
                                Selected Subject :
                              </CLabel>
                              <div
                                color=""
                                className={selectSubject()}
                                style={{ minWidth: '25%' }}
                                onClick={() => {
                                  // check status and then only allow to open modal
                                  if (
                                    process.env.REACT_APP_ENV !== 'SLAVE' &&
                                    e.status === 'Connected' &&
                                    !(
                                      e.runningStatus === deviceState.play ||
                                      e.runningStatus === deviceState.paused
                                    )
                                  ) {
                                    if (
                                      !currentAssignment[e.id]?.status ||
                                      currentAssignment[e.id]?.status ===
                                        deviceState.notYetStarted ||
                                      currentAssignment[e.id]?.status ===
                                        deviceState.stop ||
                                      currentAssignment[e.id]?.status ===
                                        deviceState.complete
                                    ) {
                                      // reset values for tempdata
                                      setTemporarySelectedDeviceForModal(e);
                                      setTemporarySelectedRowData({});
                                      // open modal
                                      setPreviewOnly(false);
                                      setShowModal(true);
                                    }
                                  }
                                }}
                              >
                                {(currentAssignment[e.id]?.status !==
                                  deviceState.stop &&
                                  currentAssignment[e.id]?.name) ||
                                  '---'}
                              </div>
                            </div>
                          </CCol>
                          {/* <CCol xs="2">
                            {currentAssignment[e.id]?.subject?.id && (
                              <div
                                className="small px-1 py-0 cursor-pointer"
                                onClick={() => {
                                  _history.push(
                                    `/subjectGraph/${
                                      currentAssignment[e.id]?.subject.id
                                    }`
                                  );
                                }}
                              >
                                <CIcon content={freeSet.cilInfo} />
                              </div>
                            )}
                          </CCol> */}
                        </CRow>
                      )}
                      {/* //! Chart and table */}
                      {showLiveData(e) && (
                        <NewData
                          socketInstance={socketInstance}
                          deviceId={e.id}
                          trialData={trialData}
                          devicePlaying={e.status}
                          reset={resetList}
                          onReset={resetDone}
                          trialId={_params.id ? _params.id : trialId}
                          trialSubject={currentAssignment[e.id]}
                        ></NewData>
                      )}
                      {process.env.REACT_APP_ENV === 'SLAVE' &&
                        (currentAssignment[e.id]?.status === deviceState.stop ||
                          currentAssignment[e.id]?.status ===
                            deviceState.complete) && (
                          <LiveDataGraph
                            loadData={true}
                            deviceData={{
                              ...device,
                              status: currentAssignment[e.id]?.status,
                            }}
                            onCompleted={() => {}}
                            intervalRate={
                              intervalMapper[e.macAddress] || 'minute'
                            }
                          />
                        )}
                    </CCardBody>
                  </CCard>
                </CCol>
              );
            })}
        </CRow>
      </div>
    </div>
  );
};
export default CreateTrial;
