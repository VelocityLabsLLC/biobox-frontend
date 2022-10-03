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
import { sortBy, update } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader } from '../../../reusable';
import {
  DEVICE_STATE,
  getAllSubjects,
  getExperimentSubjects,
  updateExperimentTests,
  updateSubjectData,
} from '../../../services/AppService';
const Subjects = ({ getSubjects, tests }) => {
  const _history = useHistory();
  const _params = useParams();
  const masterData = useSelector((store) => store.dataReducer.data);

  // const fields = ["name", "experimentId", "actions"];
  const [subjectsData, setSubjectsData] = useState([]);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [changes, setChanges] = useState([]);
  const fields = !_params.id
    ? [
        { key: 'subjectName', _style: { width: '45%' } },
        { key: 'experimentName', _style: { width: '45%' } },
        'actions',
      ]
    : [
        { key: 'subjectName', _style: { width: '30%' } },
        { key: 'treatment', _style: { width: '30%' } },
        { key: 'notes' },
      ];
  const getAllSubjectsData = async () => {
    try {
      const data = _params.id
        ? await getExperimentSubjects(masterData, [_params.id])
        : await getAllSubjects(masterData);
      if (data && data.data) {
        console.log(data.data);
        setSubjectsData(
          _params.id ? sortBy(data.data, ['order']) : data.data[0],
        );
        setSubjectsCount((_params.id ? data.data : data.data[0]).length);
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const updateSubject = async (data, newVal, done) => {
    try {
      if (tests) {
        tests.map((testObj) => {
          if (testObj.subject.id === data.id) {
            updateTest(testObj, newVal);
          }
        });
        data.currentTreatment = newVal;
        await updateSubjectData(masterData, { data }, data.id);
        if (done) {
          toast.success('Data Updated Successfully.');
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      localStorage.setItem('currentExperimentTab', 1);
      window.location.reload();
    }
  };

  const updateTest = async (data, newVal) => {
    if (
      data.status === DEVICE_STATE.notYetStarted ||
      data.status === DEVICE_STATE.complete
    ) {
      try {
        await updateExperimentTests(data.id, { treatment: newVal }, masterData);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getTreatment = (data) => {
    const temp = changes?.find((x) => x.data.id === data.id);
    if (temp) {
      return temp.value;
    } else {
      return data.currentTreatment;
    }
  };

  useEffect(() => {
    getAllSubjectsData();
  }, []);

  useEffect(() => {
    if (subjectsData.length > 0 && getSubjects) {
      getSubjects(subjectsData);
    }
  }, [subjectsData]);

  //   updateSubject(subjectsData[0], 'treatment-A');

  return (
    <div>
      {isLoading && <Loader />}
      {/* <SelectedMater /> */}
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol sm="8">
              <h4 className="m-0">Subjects ({subjectsCount})</h4>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-sm-0 p-lg-3">
          <CRow>
            <CCol>
              <CDataTable
                items={subjectsData}
                fields={fields}
                striped
                hover
                itemsPerPage={10}
                pagination
                addTableClasses="border mb-sm-0 mb-lg-3"
                scopedSlots={
                  _params.id
                    ? {
                        subjectName: (Subjectdata) => (
                          <td>
                            <span>{Subjectdata.name}</span>
                          </td>
                        ),
                        treatment: (Subjectdata) => (
                          <td>
                            <div
                              key={`treatment-${Subjectdata.id}`}
                              id={`treatment-${Subjectdata.id}`}
                              contentEditable={true}
                              onBlur={() => {
                                let temp = document.getElementById(
                                  `treatment-${Subjectdata.id}`,
                                ).textContent;
                                if (temp !== Subjectdata.currentTreatment) {
                                  setChanges([
                                    {
                                      data: Subjectdata,
                                      value: temp,
                                    },
                                    ...changes,
                                  ]);
                                }
                              }}
                            >
                              {getTreatment(Subjectdata)}
                            </div>
                          </td>
                        ),
                        notes: (Subjectdata) => (
                          <td>
                            <span>{Subjectdata.notes}</span>
                          </td>
                        ),
                      }
                    : {
                        subjectName: (Subjectdata) => (
                          <td>
                            <span>{Subjectdata.name}</span>
                          </td>
                        ),
                        experimentName: (subjectsData) => (
                          <td>
                            <span>
                              {subjectsData.experiment &&
                                subjectsData.experiment.name}
                            </span>
                          </td>
                        ),
                        actions: (id) => (
                          <td>
                            {/* <CButton
                        color="info"
                        size="sm"
                        onClick={() => {
                          //setSelectedExperiment(item);
                          // _history.push(`/trials/${id.id}`);
                        }}
                      >
                        <CIcon content={freeSet.cilInfo} />
                      </CButton> */}
                            <CButton
                              color="info"
                              size="sm"
                              onClick={() => {
                                //setSelectedExperiment(item);
                                _history.push(`/editSubject/${id.id}`);
                              }}
                            >
                              <CIcon content={freeSet.cilPencil} />
                            </CButton>
                          </td>
                        ),
                      }
                }
              />
            </CCol>
          </CRow>
          {changes.length > 0 && (
            <div className="d-flex justify-content-center">
              <CButton
                color="success"
                onClick={() => {
                  changes.map((entry, i) => {
                    updateSubject(
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
    </div>
  );
};
export default Subjects;
