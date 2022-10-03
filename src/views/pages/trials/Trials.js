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
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from '../../../reusable';
import {
  getAllTrials,
  getAllTrialswithid,
  getDisabledState,
} from '../../../services/AppService';

const Trials = ({ getTrials }) => {
  const _history = useHistory();
  const _param = useParams();
  const fields = _param.id
    ? [
        { key: 'trialName', _style: { width: '60%' } },
        { key: 'trialStatus', _style: { width: '30%' } },
        'Actions',
      ]
    : // : ["name", { key: "experiment", _style: { width: "60%" } }, "Actions"];
      [
        { key: 'trialName', _style: { width: '45%' } },
        { key: 'experiment', _style: { width: '45%' } },
        'Actions',
      ];
  const [trialData, settrialData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [trialCount, setTrialCount] = useState(0);
  const masterData = useSelector((store) => store.dataReducer.data);
  const [isDisabled, setDisabled] = useState(getDisabledState(masterData));

  const getAllTrialData = async () => {
    try {
      let data;
      if (_param.id) {
        const data = await getAllTrialswithid(masterData, _param.id);
        if (data && data.data) {
          settrialData(data.data.data);
          setTrialCount(data.data.count);
          setLoading(false);
        }
      } else {
        data = await getAllTrials(masterData);
      }
      if (data && data.data) {
        settrialData(data.data.data);
        setTrialCount(data.data.count);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  function getTrialsList() {
    if (trialData && trialData.length) {
      let list = trialData.map((data) => {
        return data.id;
      });
      if (getTrials) {
        getTrials(list);
      }
    } else {
      getTrials([]);
    }
  }

  useEffect(() => {
    getAllTrialData();
  }, [masterData]);

  useEffect(() => {
    getTrialsList();
  }, [trialData]);

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
                  <h4 className="m-0">
                    {_param.name} - Trials ({trialCount})
                  </h4>
                  {/* {_param.name && (
                    <h5>For Experiment: {_param.name}</h5>
                  )} */}
                </CCol>
                <CCol sm="4" className="text-right">
                  {_param.id && (
                    <CButton
                      color="info"
                      className="rounded"
                      disabled={isDisabled}
                      onClick={() => _history.push(`/createTrial/${_param.id}`)}
                    >
                      New Trial
                    </CButton>
                  )}
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
                    items={trialData}
                    fields={fields}
                    hover
                    striped
                    itemsPerPage={10}
                    pagination
                    addTableClasses="border mb-sm-0 mb-lg-3"
                    scopedSlots={{
                      trialName: (trialdata) => (
                        <td
                          onClick={() => {
                            _history.push(`/editTrial/${trialdata.id}`);
                          }}
                        >
                          <span className="experiment-name">
                            {trialdata.name}
                          </span>
                        </td>
                      ),
                      experiment: (trialdata) => (
                        <td>
                          <span>
                            {trialdata.experiment && trialdata.experiment.name}
                          </span>
                        </td>
                      ),
                      trialStatus: (trialdata) => (
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>
                            {trialdata.trialStatus || 'Available'}
                          </span>
                        </td>
                      ),
                      Actions: (id) => (
                        <td>
                          <CButton
                            color="info"
                            className=""
                            size="sm"
                            onClick={() => {
                              _history.push(`/editTrial/${id.id}`);
                            }}
                          >
                            <CIcon content={freeSet.cilPencil} />
                          </CButton>
                        </td>
                      ),
                    }}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Trials;
