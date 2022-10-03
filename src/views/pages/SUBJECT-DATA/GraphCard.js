import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
} from '@coreui/react';
import { CChartBar, CChartLine } from '@coreui/react-chartjs';
import * as moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import GetInterval from 'src/reusable/GetInterval';
import { Loader } from 'src/reusable/index';
import {
  getDataInCSV,
  getSubjectGraph,
  getBarGraphLabels,
  INTERVALS,
  GROUPED_MESSAGE,
  commonBarGraphOptions,
  commonLineGraphOptions,
} from '../../../services/AppService';
import './SubjectGraph.scss';

const GraphCard = ({ selectedValues }) => {
  const _params = useParams();
  const masterData = useSelector((store) => store.dataReducer.data);
  const [subjectGraph, setSubjectGraph] = useState({});
  const fields = ['measure_name', 'measure_value_double', 'time'];
  const [message, setMessage] = useState(GROUPED_MESSAGE['DEFAULT']);
  const [isLoading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [labelx, setlabels] = useState([]);

  const updateGraph = async (parameters) => {
    setLoading(true);
    try {
      let data = await getSubjectGraph(masterData, { ...parameters });

      let trialData = [];
      if (!data.data.message) {
        setMessage(GROUPED_MESSAGE['DEFAULT']);
        setlabels(GetInterval(data.data, 'time'));
        // trialData = [...data.data].map((t) => {
        //   return parseInt(t['sum_measure_value::double']);
        // });
      } else {
        setMessage(GROUPED_MESSAGE[data.data.message]);
        setlabels([]);
      }
      let graphData = {
        ...subjectGraph,
        tableData: [...data.data],
        interval: parameters.interval,
        data: [...data.data],
      };
      setSubjectGraph({
        ...graphData,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsGraph = async () => {
    setLoading(true);
    try {
      const values = {
        trialId: selectedValues.value,
        deviceId: _params.deviceid ? _params.deviceid : '',
        subjectId: _params.subjectid,
      };

      let data = await getSubjectGraph(masterData, values);
      // let parsedData;
      if (!data.data.message) {
        setMessage(GROUPED_MESSAGE['DEFAULT']);
        setlabels(GetInterval(data.data, 'time'));

        // parsedData = data.data.map((e, i) => {
        //   return parseInt(e['sum_measure_value::double']);
        // });
      } else {
        setMessage(GROUPED_MESSAGE[data.data.message]);
        setSubjectGraph([]);
        setlabels([]);
      }

      let graphData = {
        tableData: data.data,
        toggle: 'Graph',
        interval: 'minute',
        data: data.data,
      };
      setSubjectGraph({ ...graphData });
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getData = () => {
    let item = [];
    subjectGraph.tableData.map((array) => {
      array.map((e) => {
        item.push(e);
      });
    });
    return item;
  };

  const downloadCSV = async (subject) => {
    setLoading(true);
    try {
      const values = {
        trialId: subject.value,
        deviceId: _params.deviceid ? _params.deviceid : '',
        subjectId: _params.subjectid,
      };
      const res = await getDataInCSV(masterData, values);
      console.log(res);
      var a = document.createElement('a');
      a.href = 'data:attachment/csv,' + res.data;
      a.target = '_blank';
      a.download = res.headers['filename']
        ? `${res.headers['filename']}`
        : `${subject.value}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubjectsGraph();
  }, [selectedValues]);

  return (
    <div>
      <div className="mt-3">
        <CRow className="mx-0">
          <CCol lg="12">
            <CCard>
              <CCardHeader>
                <CRow>
                  <CCol md="5">
                    {' '}
                    <h4 className="m-0">
                      Trial: {selectedValues.label}
                      <br />
                      Subject: {selectedValues.subjectname}
                    </h4>
                  </CCol>
                  <CCol md="7" className="text-right">
                    <CButtonGroup className="mr-3">
                      {Object.keys(INTERVALS).map((value) => (
                        <CButton
                          color="outline-secondary"
                          key={parseInt(value)}
                          className="mx-0"
                          active={INTERVALS[value] === subjectGraph?.interval}
                          onClick={() => {
                            if (
                              subjectGraph &&
                              !(INTERVALS[value] === subjectGraph?.interval)
                            ) {
                              let parameters = {
                                trialId: selectedValues.value,
                                deviceId: _params.deviceid
                                  ? _params.deviceid
                                  : '',
                                subjectId: _params.subjectid,
                                interval: INTERVALS[value],
                              };
                              updateGraph(parameters);
                            }
                          }}
                        >
                          {value}s
                        </CButton>
                      ))}
                    </CButtonGroup>

                    <CButtonGroup className="mr-3">
                      {['Graph', 'Table'].map((value) => (
                        <CButton
                          color="outline-secondary"
                          key={value}
                          className="mx-0"
                          active={value === subjectGraph?.toggle}
                          onClick={() => {
                            if (
                              subjectGraph &&
                              value !== subjectGraph?.toggle
                            ) {
                              subjectGraph.toggle = value;
                              setSubjectGraph({
                                ...subjectGraph,
                              });
                            }
                          }}
                        >
                          {value}
                        </CButton>
                      ))}
                    </CButtonGroup>

                    {subjectGraph?.data?.length > 0 && (
                      <CButton
                        className="mr-3"
                        color="info"
                        disabled={downloading}
                        onClick={() => {
                          downloadCSV(selectedValues);
                        }}
                      >
                        {!downloading ? <>CSV</> : ''}
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                {isLoading && <Loader customPosition="true" />}
                {subjectGraph?.toggle === 'Graph' && (
                  <div>
                    {subjectGraph?.data?.length > 0 ? (
                      // <CChartBar
                      //   style={{
                      //     height: '350px',
                      //   }}
                      //   datasets={[
                      //     {
                      //       ...commonBarGraphOptions('#36A2EB'),
                      //       label: 'Pin 29',
                      //       data: subjectGraph?.data.map(
                      //         (e) => e[0]['sum_measure_value::double'],
                      //       ),
                      //     },
                      //     {
                      //       ...commonBarGraphOptions('#FF6384'),
                      //       label: 'Pin 31',
                      //       data: subjectGraph?.data.map(
                      //         (e) => e[1]['sum_measure_value::double'],
                      //       ),
                      //     },
                      //     {
                      //       ...commonBarGraphOptions('#4BC0C0'),
                      //       label: 'Pin 33',
                      //       data: subjectGraph?.data.map(
                      //         (e) => e[2]['sum_measure_value::double'],
                      //       ),
                      //     },
                      //   ]}
                      //   labels={getBarGraphLabels(
                      //     subjectGraph.data,
                      //     subjectGraph.interval,
                      //   )}
                      //   options={{
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
                      //     animation: {
                      //       duration:
                      //         subjectGraph?.toggle === 'Graph' &&
                      //         !isLoading &&
                      //         subjectGraph
                      //           ? 800
                      //           : 0,
                      //     },
                      //     maintainAspectRatio: false,
                      //   }}
                      // />
                      <CChartLine
                        style={{
                          height: '350px',
                        }}
                        datasets={[
                          {
                            ...commonLineGraphOptions('#36A2EB'),
                            label: 'Pin 29',
                            data: subjectGraph?.data.map((e) => {
                              if (e)
                                return e[0] && e[0]['sum_measure_value::double']
                                  ? parseInt(e[0]['sum_measure_value::double'])
                                  : e.pin_29;
                            }),
                          },
                          {
                            ...commonLineGraphOptions('#FF6384'),
                            label: 'Pin 31',
                            data: subjectGraph?.data.map((e) => {
                              if (e)
                                return e[1] && e[1]['sum_measure_value::double']
                                  ? parseInt(e[1]['sum_measure_value::double'])
                                  : e.pin_31;
                            }),
                          },
                          {
                            ...commonLineGraphOptions('#ffcd56'),
                            label: 'Pin 33',
                            data: subjectGraph?.data.map((e) => {
                              if (e)
                                return e[2] && e[2]['sum_measure_value::double']
                                  ? parseInt(e[2]['sum_measure_value::double'])
                                  : e.pin_33;
                            }),
                          },
                        ]}
                        labels={getBarGraphLabels(
                          subjectGraph.data,
                          subjectGraph.interval,
                        )}
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
                    ) : (
                      <div className="text-center">
                        <strong>{message}</strong>
                      </div>
                    )}
                  </div>
                )}
                {subjectGraph?.toggle === 'Table' && (
                  <CRow>
                    <CCol>
                      <CDataTable
                        items={getData()}
                        fields={fields}
                        hover
                        itemsPerPage={10}
                        pagination
                        striped
                        scopedSlots={{
                          MeasureValue: (subjectGraph) => (
                            <td>
                              <span>
                                {subjectGraph['sum_measure_value::double']}
                              </span>
                            </td>
                          ),
                          time: (subjectGraph) => (
                            <td>
                              <span>
                                {moment(subjectGraph.time).format(
                                  'MM/DD/YYYY hh:mm:ss',
                                )}
                              </span>
                            </td>
                          ),
                        }}
                      />
                    </CCol>
                  </CRow>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </div>
  );
};

export default GraphCard;
