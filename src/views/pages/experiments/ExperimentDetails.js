import {
  CCard,
  CCardBody,
  CCol,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
  CTabs,
} from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Loader } from '../../../reusable';
import SelectedMater from '../selectedMaster/SelectedMaster';
import Subjects from '../subjects/Subjects';
import Tests from '../tests/Tests';
import Trials from '../trials/Trials';
import './ExperimentDetails.scss';
// import "./Steps.scss";

const ExperimentDetails = () => {
  const _params = useParams();

  const [active, setActive] = useState();
  const [isLoading, setLoading] = useState(true);
  const [loadSubjects, setLoadSubjects] = useState(false);
  const [loadTests, setLoadTests] = useState(false);
  const [trialList, setTrialList] = useState(false);
  const [tests, setTests] = useState([]);

  const changeTab = (tab) => {
    setActive(tab);
  };

  const getTrials = (list) => {
    setTrialList(list);
    setLoadSubjects(true);
  };

  const getSubjects = (list) => {
    setLoadTests(true);
  };

  const getTests = (list) => {
    setTests(list);
  };

  useEffect(() => {
    let tab = localStorage.getItem('currentExperimentTab');
    if (tab != -1) {
      setActive(parseInt(tab));
      localStorage.setItem('currentExperimentTab', -1);
    } else {
      setActive(0);
    }
    if (_params.id) {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <SelectedMater />
          <CRow className="mx-0">
            <CCol xs="12" md="12" className="mb-4">
              <CCard>
                <CCardBody>
                  <CTabs activeTab={active}>
                    <CNav variant="tabs">
                      <CNavItem>
                        <CNavLink>Trials</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink>Subjects</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink>Tests</CNavLink>
                      </CNavItem>
                    </CNav>
                    <CTabContent className="mt-3">
                      <CTabPane
                        onClick={() => {
                          changeTab(0);
                        }}
                      >
                        {<Trials getTrials={getTrials} />}
                      </CTabPane>
                      <CTabPane
                        onClick={() => {
                          changeTab(1);
                        }}
                      >
                        {loadSubjects && (
                          <Subjects getSubjects={getSubjects} tests={tests} />
                        )}
                      </CTabPane>
                      <CTabPane
                        onClick={() => {
                          changeTab(2);
                        }}
                      >
                        {loadSubjects && loadTests && (
                          <Tests trialList={trialList} getTest={getTests} />
                        )}
                      </CTabPane>
                    </CTabContent>
                  </CTabs>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </div>
      )}
    </>
  );
};

export default ExperimentDetails;
