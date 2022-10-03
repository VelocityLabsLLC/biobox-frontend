import { CCol, CRow } from '@coreui/react';
import { CChartBar, CChartLine } from '@coreui/react-chartjs';
import { takeRight } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { MASTER } from 'src/_redux/actions/data';
import { Loader } from '../../../reusable';
import {
  commonBarGraphOptions,
  commonLineGraphOptions,
  connectToSocket,
  DEVICE_STATE,
  getBarGraphLabels,
  GetLiveInterval,
  getMasterSocketUrl,
  getSubjectGraph,
  GROUPED_MESSAGE,
  millisToMinutesAndSeconds,
  subscribeForDeviceDataOnCloud,
  unsubscribeForDeviceDataOnCloud,
} from '../../../services/AppService';
import {
  connectToSocketSlave,
  getGroupedData,
} from '../../../services/SlaveServices';
import './LiveDataGraph.scss';

const LiveDataGraph = ({
  loadData,
  deviceData,
  onCompleted,
  master,
  intervalRate,
}) => {
  const _history = useHistory();
  const dispatch = useDispatch();
  const refData = useRef([]);
  const [isLoading, setLoading] = useState(false);
  const [socketInstance, setSocketInstance] = useState();
  const [chartData, setChartData] = useState([]);
  const [message, setMessage] = useState();
  const [chartLabels, setChartLabels] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState();
  const [cumulative, setCumulative] = useState(-1);

  const getPreviousChartData = async () => {
    setLoading(true);
    const values = {
      trialId: deviceData.trialId,
      deviceId: deviceData.deviceId ? deviceData.deviceId : '',
      subjectId: deviceData.subjectId,
      interval: intervalRate,
    };

    try {
      let data =
        process.env.REACT_APP_ENV !== 'SLAVE'
          ? await getSubjectGraph(master ? { value: master } : null, {
              ...values,
            })
          : await getGroupedData({
              ...values,
            });
      // data.data = sortBy(data.data, ['time']);
      if (!data?.data?.message) {
        setMessage(GROUPED_MESSAGE['DEFAULT']);
        setChartLabels(getBarGraphLabels(data.data, values.interval));
        setChartData(data.data);
      } else {
        setChartLabels([]);
        setChartData([]);
        setMessage(
          data.data
            ? GROUPED_MESSAGE[data.data.message]
            : GROUPED_MESSAGE['DEFAULT'],
        );
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const initiateSocketConnection = async () => {
    const instance =
      process.env.REACT_APP_ENV !== 'SLAVE'
        ? await connectToSocket(
            master && master.eventType === 'connected'
              ? getMasterSocketUrl()
              : null,
          )
        : await connectToSocketSlave();

    setSocketInstance(instance);
    if (process.env.REACT_APP_ENV === 'CLOUD') {
      subscribeForDeviceDataOnCloud({ value: master }, deviceData);
    }
    subscribeToEvents(instance);
  };

  const subscribeToEvents = (instance) => {
    const keyToUse = `${deviceData.trialId}_${deviceData.deviceId}_${deviceData.subjectId}`;
    instance.on(keyToUse, (data) => {
      if (data && data.length > 0) {
        let millis = data[data.length - 1].timeRemaining;
        let time = millisToMinutesAndSeconds(millis);
        if (timeRemaining !== time) {
          setTimeRemaining(time);
        }
        const dataToSet = [...refData.current, ...data];
        refData.current = takeRight(dataToSet, 300);
        setChartData(refData.current);
        setChartLabels(GetLiveInterval(refData.current));
        setCumulative(
          refData.current[refData.current.length - 1].cumulativeData,
        );
      }
    });

    instance.on('trialCompleted', (data) => {
      if (data.deviceId === deviceData.deviceId) {
        setTimeRemaining();
        setChartData([]);
        setChartLabels([]);
        setCumulative(-1);
        onCompleted(deviceData.deviceId, master ? master : undefined);
        if (loadData) {
          getPreviousChartData();
        }
      }
    });

    instance.on(`fileTransfered`, (data) => {
      console.log('fileTransfered >>> ', data, deviceData);
      if (deviceData.macAddress === data.macAddress) {
        getPreviousChartData();
      }
    });
  };

  useEffect(() => {
    if (!socketInstance) {
      initiateSocketConnection();
    }
    if (
      deviceData.status !== DEVICE_STATE.complete &&
      deviceData.status !== DEVICE_STATE.stop
    ) {
      setMessage(`Trial Status: ${deviceData.status}`);
    } else {
      setMessage(GROUPED_MESSAGE['DEFAULT']);
    }
    return () => {
      if (process.env.REACT_APP_ENV === 'CLOUD') {
        unsubscribeForDeviceDataOnCloud({ value: master }, deviceData);
      }
      if (socketInstance) {
        socketInstance.off(
          `${deviceData.trialId}_${deviceData.deviceId}_${deviceData.subjectId}`,
        );
        socketInstance.off('trialCompleted');
        socketInstance.off(`fileTransfered`);
      }
    };
  }, []);

  useEffect(() => {
    if (
      deviceData &&
      (deviceData.status === DEVICE_STATE.stop ||
        deviceData.status === DEVICE_STATE.complete ||
        deviceData.connectionStatus === 'Disconnected')
    ) {
      if (loadData) {
        getPreviousChartData();
      }
    }
  }, [intervalRate]);

  useEffect(() => {
    if (
      deviceData &&
      (deviceData.status === DEVICE_STATE.stop ||
        deviceData.status === DEVICE_STATE.complete ||
        deviceData.connectionStatus === 'Disconnected')
    ) {
      if (loadData && chartData.length < 1) {
        getPreviousChartData();
      }
    }
  }, [loadData]);
  return (
    <>
      {isLoading && <Loader customPosition={true} />}
      <CRow>
        <CCol className="text-center">
          <strong>Experiment: {deviceData?.experiment?.name}</strong>
        </CCol>
        <CCol className="text-center">
          <strong>Subject: {deviceData?.subject?.name}</strong>
        </CCol>
        <CCol className="text-center">
          <strong>Treatment: {deviceData?.subject?.treatment}</strong>
        </CCol>
      </CRow>
      <CRow className="mt-2">
        {cumulative !== -1 && (
          <CCol className="text-center">
            <strong>Total no. of 1: {cumulative} </strong>
          </CCol>
        )}
        <CCol className="text-center">
          <strong
            className={
              process.env.REACT_APP_ENV !== 'SLAVE' ? 'trial-name' : ''
            }
            onClick={() => {
              if (process.env.REACT_APP_ENV !== 'SLAVE') {
                if (master) {
                  const masterData = { ...master };
                  delete masterData.slaves;
                  dispatch(MASTER({ value: masterData }));
                }
                _history.push(`editTrial/${deviceData?.trial.id}`);
              }
            }}
          >
            Trial: {deviceData?.trial?.name}
          </strong>
        </CCol>
        {timeRemaining && (
          <CCol className="text-center">
            <strong>Time remaining: {timeRemaining}</strong>
          </CCol>
        )}
      </CRow>
      {!isLoading && chartData && chartData.length === 0 && (
        <CRow className="mt-4">
          <CCol>
            <div className="text-center">
              <strong>{message}</strong>
            </div>
          </CCol>
        </CRow>
      )}
      {chartData && chartData.length > 0 && (
        <CRow className="mt-4">
          <CCol>
            {(deviceData.status ||
              deviceData.connectionStatus === 'Disconnected') && (
              // <CChartBar
              //   style={{
              //     height: '200px',
              //   }}
              //   datasets={[
              //     {
              //       ...commonBarGraphOptions('#36A2EB'),
              //       label: 'Pin 29',
              //       data: chartData.map((e) => {
              //         if (e)
              //           return e[0] && e[0]['sum_measure_value::double']
              //             ? parseInt(e[0]['sum_measure_value::double'])
              //             : e.pin_29;
              //       }),
              //     },
              //     {
              //       ...commonBarGraphOptions('#FF6384'),
              //       label: 'Pin 31',
              //       data: chartData.map((e) => {
              //         if (e)
              //           return e[1] && e[1]['sum_measure_value::double']
              //             ? parseInt(e[1]['sum_measure_value::double'])
              //             : e.pin_31;
              //       }),
              //     },
              //     {
              //       ...commonBarGraphOptions('#4BC0C0'),
              //       label: 'Pin 33',
              //       data: chartData.map((e) => {
              //         if (e)
              //           return e[2] && e[2]['sum_measure_value::double']
              //             ? parseInt(e[2]['sum_measure_value::double'])
              //             : e.pin_33;
              //       }),
              //     },
              //   ]}
              //   labels={
              //     chartLabels.length > 0
              //       ? chartLabels.map((e, i) => {
              //           return e || '';
              //         })
              //       : null
              //   }
              //   options={{
              //     tooltips: {
              //       enabled: true,
              //     },
              //     legend: {
              //       display: true,
              //     },
              //     scales: {
              //       xAxes: [
              //         {
              //           stacked: true,
              //         },
              //       ],
              //       yAxes: [
              //         {
              //           stacked: true,
              //           ticks: {
              //             maxTicksLimit: 5,
              //             beginAtZero: true,
              //             userCallback: function (label) {
              //               if (Math.floor(label) === label) {
              //                 return label;
              //               }
              //             },
              //           },
              //         },
              //       ],
              //     },

              //     // animation: {
              //     //   duration: !isLoading && chartData ? 800 : 0,
              //     // },
              //     animation: false,
              //     maintainAspectRatio: false,
              //   }}
              // />
              <CChartLine
                style={{
                  height: '200px',
                }}
                datasets={[
                  {
                    ...commonLineGraphOptions('#36A2EB'),
                    label: 'Pin 29',
                    data: chartData.map((e) => {
                      if (e)
                        return e[0] && e[0]['sum_measure_value::double']
                          ? parseInt(e[0]['sum_measure_value::double'])
                          : e.pin_29;
                    }),
                  },
                  {
                    ...commonLineGraphOptions('#FF6384'),
                    label: 'Pin 31',
                    data: chartData.map((e) => {
                      if (e)
                        return e[1] && e[1]['sum_measure_value::double']
                          ? parseInt(e[1]['sum_measure_value::double'])
                          : e.pin_31;
                    }),
                  },
                  {
                    ...commonLineGraphOptions('#ffcd56'),
                    label: 'Pin 33',
                    data: chartData.map((e) => {
                      if (e)
                        return e[2] && e[2]['sum_measure_value::double']
                          ? parseInt(e[2]['sum_measure_value::double'])
                          : e.pin_33;
                    }),
                  },
                ]}
                labels={
                  chartLabels.length > 0
                    ? chartLabels?.map((e, i) => {
                        return e || '';
                      })
                    : null
                }
                options={{
                  tooltips: {
                    enabled: true,
                  },
                  legend: {
                    display: true,
                  },
                  scales: {
                    yAxes: [
                      {
                        ticks: {
                          min: 0,
                          // max: 1,
                          stepSize: 1,
                        },
                      },
                    ],
                  },
                  animation: false,
                  maintainAspectRatio: false,
                }}
              />
            )}
            {/* {deviceData.status === DEVICE_STATE.play &&
              deviceData.connectionStatus === 'Connected' && (
                <CChartLine
                  // width: y.length*24,
                  style={{
                    height: '200px!important',
                  }}
                  className="chartAreaWrapper"
                  datasets={[
                    {
                      backgroundColor: 'transparent',
                      borderColor: '#3b5998',
                      borderWidth: '1.5',
                      pointBorderColor: 'transparent',
                      data: chartData.map((e) => {
                        if (e)
                          return e['measure_value_double']
                            ? parseInt(e['measure_value_double'])
                            : e.value;
                      }),
                      steppedLine: 'middle',
                    },
                  ]}
                  // labels={chartLabels}
                  labels={
                    chartLabels.length > 0
                      ? chartLabels.map((e, i) => {
                          return e || '';
                        })
                      : null
                  }
                  options={{
                    tooltips: {
                      enabled: true,
                    },
                    legend: {
                      display: false,
                    },
                    animation: {
                      duration: 0,
                    },
                    scales: {
                      yAxes: [
                        {
                          ticks: {
                            min: 0,
                            // max: 1,
                            stepSize: 1,
                          },
                        },
                      ],
                      xAxes: [],
                    },
                    maintainAspectRatio: false,
                  }}
                />
              )} */}
          </CCol>
        </CRow>
      )}
    </>
  );
};

export default LiveDataGraph;
