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
import { find } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MASTER } from 'src/_redux/actions/data';
import { Loader } from '../../../reusable';
import {
  getAllExperiments,
  getDisabledState,
  getExperimentWithMasterData,
} from '../../../services/AppService';

const Experiments = () => {
  const _history = useHistory();
  const dispatch = useDispatch();

  const [masterData, setMasterData] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState();

  const selectedMasterData = useSelector((store) => store.dataReducer.data);

  const [isDisabled, setDisabled] = useState(false);

  const fields = [
    { key: 'experimentName', _style: { width: '40%' } },
    'trialDuration',
    'subjects',
    'phases',
    'devices',
    { key: 'actions' },
  ];

  const [experimentData, setExperimentData] = useState([]);
  const [experimentCount, setExperimentCount] = useState(0);
  const [isLoading, setLoading] = useState(true);

  const getAllExperimentsData = async (master = undefined) => {
    try {
      setLoading(true);
      const data = await getAllExperiments(master);
      if (data && data.data) {
        setExperimentData(data.data.data);
        setExperimentCount(data.data.count);
      }
    } catch (error) {
      toast.error(error.message ? error.message : error);
      setExperimentData([]);
      setExperimentCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMaster) {
      getAllExperimentsData(selectedMaster.value);
      dispatch(MASTER({ value: selectedMaster.value }));
      setDisabled(getDisabledState(selectedMaster));
    }
  }, [selectedMaster]);

  const getAllData = async () => {
    try {
      setLoading(true);
      const data = await getExperimentWithMasterData();
      if (data.masterData) {
        setMasterData(data.masterData);
        if (selectedMasterData && selectedMasterData.value) {
          const foundMaster = find(data.masterData, (n) => {
            return n.value.macAddress === selectedMasterData.value.macAddress;
          });
          setSelectedMaster(foundMaster);
        } else {
          setSelectedMaster(data.masterData[0]);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (process.env.REACT_APP_ENV === 'LOCAL') {
      getAllExperimentsData();
    } else {
      getAllData();
    }
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      {process.env.REACT_APP_ENV === 'CLOUD' && (
        <CRow className="mb-2">
          <CCol xs="12" sm="10" md="8" className="d-flex">
            <div className="align-self-center pr-2">Master Devices:</div>
            <Select
              className="w-50"
              value={selectedMaster || masterData[0]}
              onChange={setSelectedMaster}
              options={masterData}
            />
          </CCol>
        </CRow>
      )}
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol sm="8">
              <h4 className="m-0">Experiments ({experimentCount || 0})</h4>
            </CCol>
            <CCol sm="4" className="text-right">
              <CButton
                color="info"
                className="rounded"
                disabled={isDisabled}
                onClick={() => {
                  if (selectedMaster) {
                    _history.push(
                      `/createExperimentWizard/${selectedMaster.value.macAddress}`,
                    );
                  } else {
                    _history.push(`/createExperimentWizard`);
                  }
                }}
              >
                New Experiment
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-sm-0 p-lg-3">
          <CRow>
            <CCol>
              <CDataTable
                items={experimentData}
                fields={fields}
                striped
                hover
                itemsPerPage={10}
                pagination
                addTableClasses="border mb-sm-0 mb-lg-3"
                scopedSlots={{
                  experimentName: (experimentData) => (
                    <td
                      onClick={() => {
                        //setSelectedExperiment(item);
                        _history.push(
                          `/experimentDetails/${experimentData.id}/${experimentData.name}`,
                        );
                      }}
                    >
                      <span className="experiment-name">
                        {experimentData?.name}
                      </span>
                    </td>
                  ),
                  trialDuration: (experimentData) => (
                    <td>
                      <span>{experimentData?.protocol?.trialDuration}</span>
                    </td>
                  ),
                  subjects: (experimentData) => (
                    <td>
                      <span>{experimentData?.subjects?.length}</span>
                    </td>
                  ),
                  phases: (experimentData) => (
                    <td>
                      <span>{experimentData?.protocol?.phases?.length}</span>
                    </td>
                  ),
                  devices: (experimentData) => (
                    <td>
                      <span>{experimentData?.devices?.length}</span>
                    </td>
                  ),
                  actions: (id) => (
                    <td>
                      {/* <CButton
                        color="info"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          //setSelectedExperiment(item);
                          _history.push(
                            `/experimentDetails/${id.id}/${id.name}`
                          );
                        }}
                      >
                        <CIcon src={"eye.webp"} />
                      </CButton> */}
                      <CButton
                        color="info"
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => {
                          if (selectedMaster) {
                            _history.push(
                              `/editExperimentWizard/${id.id}/${selectedMaster.value.macAddress}`,
                            );
                          } else {
                            _history.push(`/editExperimentWizard/${id.id}`);
                          }
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
    </div>
  );
};
export default Experiments;
