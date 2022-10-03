import { freeSet } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
} from '@coreui/react';
import { groupBy, sortBy } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from '../../../reusable';
import {
  DEVICE_STATE,
  getExperimentTests,
  updateExperimentTests,
} from '../../../services/AppService';

const Tests = ({ trialList, getTest }) => {
  const _history = useHistory();
  const _param = useParams();
  // const fields = _param.id
  //   ? [{ key: "name", _style: { width: "90%" } }, "Actions"]
  //   : // : ["name", { key: "experiment", _style: { width: "60%" } }, "Actions"];
  //     [
  //       { key: "name", _style: { width: "45%" } },
  //       { key: "experiment", _style: { width: "45%" } },
  //       "Actions",
  //     ];
  const [testData, setTestData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [testCount, setTestCount] = useState(0);
  const [changes, setChanges] = useState([]);
  const masterData = useSelector((store) => store.dataReducer.data);

  const fields = [
    { key: 'subjectName', _style: { width: '12%' } },
    { key: 'treatment', _style: { width: '24%' } },
    { key: 'status', _style: { width: '24%' } },
    { key: 'trialName' },
    { key: 'notes' },
    'Actions',
  ];

  const getTests = async () => {
    if (trialList.length > 0) {
      try {
        let data = await getExperimentTests(trialList, masterData);
        if (data && data.data) {
          const groupedData = groupBy(
            sortBy(data.data, ['order']),
            (n) => n.trial.id,
          );
          let dataToSet = [];
          for (const key in groupedData) {
            dataToSet = [...dataToSet, ...groupedData[key]];
          }
          console.log(dataToSet);
          setTestData(dataToSet);
          setTestCount(dataToSet.length);
          getTest(dataToSet);
        }
      } catch (error) {
        toast.error('Something went wrong');
      }
    }
    setLoading(false);
  };

  const getTreatment = (data) => {
    let templist = changes?.reverse((e) => {
      templist.push(e);
    });
    const temp = templist?.find((x) => x.data.id === data.id);
    if (temp) {
      return temp.value;
    } else {
      return data.treatment;
    }
  };

  const updateTest = async (data, newVal, done) => {
    try {
      data.treatment = newVal;
      await updateExperimentTests(data.id, { ...data }, masterData);
      if (done) {
        toast.success('Data Updated Successfully.');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      localStorage.setItem('currentExperimentTab', 2);
      window.location.reload();
    }
  };

  useEffect(() => {
    getTests();
  }, [trialList]);

  return (
    <div>
      {isLoading && <Loader />}
      <CRow>
        <CCol>
          {/* <SelectedMater /> */}
          <CCard>
            <CCardHeader>
              <CRow>
                <CCol sm="8">
                  <h4 className="m-0">Tests ({testCount})</h4>
                </CCol>
              </CRow>
            </CCardHeader>
            <div>
              {/* .experiment.name */}
              {/* {trialData.length && trialData.map((x,i) => 
                (  <div>{i}-{x.id}={Object.keys(x)} * {x.experiment && x.experiment.name}</div>)
                )} */}
            </div>
            <CCardBody className="p-sm-0 p-lg-3">
              <CRow>
                <CCol>
                  <CDataTable
                    items={testData}
                    fields={fields}
                    hover
                    // onRowClick={(item) => {
                    //   console.log(item);
                    // }}
                    striped
                    itemsPerPage={10}
                    onPaginationChange={() => {
                      toast.error(changes);
                    }}
                    pagination
                    addTableClasses="border mb-sm-0 mb-lg-3"
                    scopedSlots={{
                      subjectName: (testData) => (
                        <td
                          onClick={() => {
                            if (true) {
                              _history.push(
                                `/subjectGraph/${testData.trial.id}/${testData.device.id}/${testData.subject.id}`,
                              );
                            }
                          }}
                        >
                          <span className="experiment-name">
                            {testData.name}
                          </span>
                        </td>
                      ),
                      treatment: (testData) => (
                        <td>
                          <div
                            key={`test-${testData.id}`}
                            id={`test-${testData.id}`}
                            contentEditable={
                              testData.status === DEVICE_STATE.notYetStarted ||
                              testData.status === DEVICE_STATE.complete
                            }
                            onBlur={() => {
                              let temp = document.getElementById(
                                `test-${testData.id}`,
                              ).textContent;
                              if (temp !== testData.treatment) {
                                setChanges([
                                  {
                                    data: testData,
                                    value: temp,
                                  },
                                  ...changes,
                                ]);
                              }
                            }}
                          >
                            {getTreatment(testData)}
                          </div>
                        </td>
                      ),
                      notes: (testData) => (
                        <td>
                          <span>{testData.notes}</span>
                        </td>
                      ),
                      status: (testData) => (
                        <td>
                          <span>{testData.status}</span>
                        </td>
                      ),
                      trialName: (testData) => (
                        <td>
                          <span>{testData?.trial?.name}</span>
                        </td>
                      ),
                      Actions: (testData) => (
                        <td>
                          {testData.device?.id && (
                            <CButton
                              color="info"
                              className=""
                              size="sm"
                              onClick={() => {
                                _history.push(
                                  `/subjectGraph/${testData.trial.id}/${testData.device.id}/${testData.subject.id}`,
                                );
                              }}
                            >
                              <CIcon content={freeSet.cilInfo} />
                            </CButton>
                          )}
                        </td>
                      ),
                    }}
                  />
                </CCol>
              </CRow>
              {changes.length > 0 && (
                <div className="d-flex justify-content-center">
                  <CButton
                    color="success"
                    onClick={() => {
                      changes.map((entry, i) => {
                        updateTest(
                          entry.data,
                          entry.value,
                          i === changes.length - 1,
                        );
                      });
                      setChanges([]);
                    }}
                  >
                    Save
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Tests;
