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
} from "@coreui/react";
import { sortBy } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Loader } from "../../../reusable";
import { getExperimentData, parseTags } from "../../../services/AppService";
import DevicesDrop from "../Devicess/DevicesDrop";
import CreateExperiment from "../experiments/CreateExperiment";
import CreateProtocol from "../protocols/CreateProtocol";
import SelectedMater from "../selectedMaster/SelectedMaster";
import SubjectStep from "../SubjectStep/SubjectStep";
import "./Steps.scss";

const Steps = () => {
  const _params = useParams();
  const masterData = useSelector((store) => store.dataReducer.data);

  const [active, setActive] = useState(0);
  const [experimentDetails, setExperimentDetails] = useState();
  const [isLoading, setLoading] = useState(true);

  const changeTab = (tab) => {
    setActive(tab);
  };

  const getExperimentDetails = async (expId) => {
    try {
      setLoading(true);
      const res = await getExperimentData(expId, masterData);
      if (res.data) {
        if (res.data.devices) {
          res.data.devices = sortBy(res.data.devices, ["createdAt"]);
        }
        if (res.data.subjects) {
          res.data.subjects = sortBy(res.data.subjects, ["order"]);
        }
        if (res.data.protocol && res.data.protocol.phases) {
          res.data.protocol.phases = sortBy(res.data.protocol.phases, [
            "createdAt",
          ]);
        }
        if (res.data.tags) {
          res.data.tags = parseTags(res.data.tags);
        }
        if (res.data.protocol && res.data.protocol.tags) {
          if (res.data.protocol.tags === "[object Object]") {
            res.data.protocol.tags = null;
          }
          res.data.protocol.tags = parseTags(res.data.protocol.tags);
        }
      }
      setExperimentDetails(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (_params.id) {
      getExperimentDetails(_params.id);
    } else {
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
                        <CNavLink disabled={true}>Set up Experiment</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink disabled={true}>Set up Devices</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink disabled={true}>Set up Protocol</CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink disabled={true}>
                          Set up Subjects and Treatments
                        </CNavLink>
                      </CNavItem>
                    </CNav>
                    <CTabContent>
                      <CTabPane>
                        {active === 0 && (
                          <CreateExperiment
                            masterData={masterData}
                            changeTab={changeTab}
                            experimentDetails={experimentDetails}
                            setExperimentDetails={setExperimentDetails}
                          />
                        )}
                      </CTabPane>
                      <CTabPane>
                        {active === 1 && experimentDetails ? (
                          <DevicesDrop
                            masterData={masterData}
                            changeTab={changeTab}
                            experimentDetails={experimentDetails}
                            setExperimentDetails={setExperimentDetails}
                          />
                        ) : null}
                      </CTabPane>
                      <CTabPane>
                        {active === 2 && experimentDetails ? (
                          <CreateProtocol
                            masterData={masterData}
                            changeTab={changeTab}
                            experimentDetails={experimentDetails}
                            setExperimentDetails={setExperimentDetails}
                          />
                        ) : null}
                      </CTabPane>
                      <CTabPane>
                        {active === 3 && experimentDetails ? (
                          <SubjectStep
                            masterData={masterData}
                            changeTab={changeTab}
                            experimentDetails={experimentDetails}
                            setExperimentDetails={setExperimentDetails}
                          />
                        ) : null}
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

export default Steps;
