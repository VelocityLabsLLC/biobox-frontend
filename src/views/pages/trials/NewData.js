import { CChartBar, CChartLine } from '@coreui/react-chartjs';
import { find, get, takeRight } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  commonBarGraphOptions,
  commonLineGraphOptions,
  DEVICE_STATE,
  GetLiveInterval,
  millisToMinutesAndSeconds,
  subscribeForDeviceDataOnCloud,
  unsubscribeForDeviceDataOnCloud,
  unsubscribeSocketForDeviceData,
} from '../../../services/AppService';
import './NewData.scss';

export default function NewData({
  socketInstance,
  deviceId,
  trialData,
  reset,
  onReset,
  trialId,
  trialSubject,
}) {
  const refData = useRef([]);
  const [chartData, setChartData] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [currentPhase, setCurrentPhase] = useState();
  const [timeRemaining, setTimeRemaining] = useState();
  const masterData = useSelector((store) => store.dataReducer.data);
  const [cumulative, setCumulative] = useState(1);

  const resetCheck = () => {
    if ([...reset].some((data) => data === deviceId)) {
      resetValues();
      onReset(deviceId);
    }
  };

  const subscribeToSocket = () => {
    if (trialSubject && trialSubject.subject) {
      const keyToUse = `${trialId}_${deviceId}_${trialSubject.subject.id}`;
      if (process.env.REACT_APP_ENV === 'CLOUD') {
        subscribeForDeviceDataOnCloud(masterData, {
          trialId,
          deviceId,
          subjectId: trialSubject.subject.id,
        });
      }
      socketInstance.on(keyToUse, (data) => {
        if (data && data.length > 0) {
          findAndSetCurrentPhase(data[data.length - 1].phaseId);
          let time = millisToMinutesAndSeconds(
            data[data.length - 1].timeRemaining,
          );
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
      socketInstance.on('trialCompleted', (data) => {
        if (data.deviceId === deviceId && data.trialId === trialId) {
          resetValues();
        }
      });
    }
  };

  const findAndSetCurrentPhase = (phaseId) => {
    const phases = get(trialData, 'experiment.protocol.phases', []);
    const foundPhase = find(phases, { id: phaseId });
    if (foundPhase && currentPhase !== foundPhase.name) {
      setCurrentPhase(foundPhase.name);
    }
  };

  const resetValues = () => {
    setChartData([]);
    setChartLabels([]);
    setCurrentPhase();
    setTimeRemaining();
    setCumulative(-1);
    refData.current = [];
    if (masterData && masterData.value) {
      unsubscribeSocketForDeviceData(
        { deviceId, trialId, subjectId: trialSubject?.subject?.id },
        masterData,
      );
    }
  };

  useEffect(() => {
    subscribeToSocket();
    if (trialSubject.status === DEVICE_STATE.stop) {
      resetValues();
    }
    return () => {
      if (
        process.env.REACT_APP_ENV === 'CLOUD' &&
        trialSubject &&
        trialSubject.subject
      ) {
        resetValues();
      }
      if (socketInstance) {
        socketInstance.off(`${trialId}_${deviceId}_${trialSubject.subject.id}`);
      }
    };
  }, [trialSubject]);

  useEffect(() => {
    resetCheck();
  }, [reset]);

  return (
    <>
      {
        <div className={process.env.REACT_APP_ENV}>
          {process.env.REACT_APP_ENV === 'SLAVE' && (
            <div className="d-flex justify-content-center mb-2">
              {currentPhase && trialSubject?.name && (
                <div className="f1">Subject: {trialSubject.name}</div>
              )}
              {currentPhase && trialSubject?.treatment && (
                <div className="f1">Treatment: {trialSubject.treatment}</div>
              )}
            </div>
          )}
          <div className="d-flex justify-content-center">
            {!currentPhase && <div>Timeline</div>}
            {currentPhase && cumulative !== -1 && (
              <div className="f1 text-center">Total no. of 1: {cumulative}</div>
            )}
            {currentPhase && (
              <div className="f1 text-center">
                Current Phase: {currentPhase}
              </div>
            )}
            {timeRemaining && (
              <div className="f1 text-center">
                Time Remaining: {timeRemaining}
              </div>
            )}
          </div>
          <div>
            {/* <CChartBar
              style={{
                height: '200px',
              }}
              datasets={
                chartData && chartData.length > 0
                  ? [
                      {
                        ...commonBarGraphOptions('#36A2EB'),
                        label: 'Pin 29',
                        data: chartData.map((e) => {
                          if (e)
                            return e[0] && e[0]['sum_measure_value::double']
                              ? parseInt(e[0]['sum_measure_value::double'])
                              : e.pin_29;
                        }),
                      },
                      {
                        ...commonBarGraphOptions('#FF6384'),
                        label: 'Pin 31',
                        data: chartData.map((e) => {
                          if (e)
                            return e[1] && e[1]['sum_measure_value::double']
                              ? parseInt(e[1]['sum_measure_value::double'])
                              : e.pin_31;
                        }),
                      },
                      {
                        ...commonBarGraphOptions('#4BC0C0'),
                        label: 'Pin 33',
                        data: chartData.map((e) => {
                          if (e)
                            return e[2] && e[2]['sum_measure_value::double']
                              ? parseInt(e[2]['sum_measure_value::double'])
                              : e.pin_33;
                        }),
                      },
                    ]
                  : []
              }
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
                  xAxes: [
                    {
                      stacked: true,
                    },
                  ],
                  yAxes: [
                    {
                      stacked: true,
                      ticks: {
                        maxTicksLimit: 5,
                        beginAtZero: true,
                        userCallback: function (label) {
                          if (Math.floor(label) === label) {
                            return label;
                          }
                        },
                      },
                    },
                  ],
                },

                // animation: {
                //   duration: !isLoading && chartData ? 800 : 0,
                // },
                animation: false,
                maintainAspectRatio: false,
              }}
            /> */}
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
          </div>
        </div>
      }
    </>
  );
}
