import { freeSet } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
} from "@coreui/react";
import { sortBy } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "src/reusable/index";
import { getAllTrialSubject } from "../../../services/AppService";

const Subjectdata = () => {
  const _params = useParams();
  const _history = useHistory();
  const masterData = useSelector((store) => store.dataReducer.data);

  const [trialSubject, setTrialSubject] = useState([]);
  const fields = ["name", "Treatment", "Actions"];
  const [isLoading, setLoading] = useState(true);
  const getAlltrialSubject = async () => {
    try {
      const data = await getAllTrialSubject(
        masterData,
        _params.trialid,
        _params.deviceid
      );
      if (data.data) {
        data.data = sortBy(data.data, ["createdAt"]);
        setTrialSubject(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  useEffect(() => {
    getAlltrialSubject();
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <CRow>
                <CCol sm="8">
                  <h4 className="m-0">Subjects </h4>
                </CCol>
              </CRow>
            </CCardHeader>
            <div>
              {/* .experiment.name */}
              {/* {trialData.length && trialData.map((x,i) => 
                (  <div>{i}-{x.id}={Object.keys(x)} * {x.experiment && x.experiment.name}</div>)
                )} */}
            </div>
            <CCardBody>
              <CRow>
                <CCol>
                  <CDataTable
                    items={trialSubject}
                    fields={fields}
                    hover
                    striped
                    itemsPerPage={10}
                    pagination
                    scopedSlots={{
                      name: (trialSubject) => (
                        <td>
                          <span>{trialSubject.name}</span>
                        </td>
                      ),
                      Treatment: (trialSubject) => (
                        <td>
                          <span>{trialSubject.treatment}</span>
                        </td>
                      ),
                      Actions: (id) => (
                        <td>
                          <CButton
                            color="info"
                            className=""
                            size="sm"
                            onClick={() => {
                              _history.push(
                                // `/subjectGraph/${_params.trialid}/${_params.deviceid}/${id.id}`
                                `/subjectGraph/${_params.trialid}/${_params.deviceid}/${id.subject.id}`
                              );
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
      {/* <CRow>
        {usersData.map((e) => {
          return (
            <CCol xs="6">
              <CCard>
                <CCardHeader>{e.name}</CCardHeader>
                <CCardBody style={{ minHeight: "200px" }}>
                  {e.currentTreatment}
                  <div>
                    <CChartLine
                      datasets={[
                        {
                          label: "data",
                          backgroundColor: "transparent",
                          borderColor: "rgb(95, 158, 160)",
                          pointBorderColor: "#3b5998",
                          data: [10, 20, 30, 10, 30, 80, 40, 30, 10, 20],
                          steppedLine: true,
                        },
                      ]}
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
                                // min: 0,
                                // max: 1,
                                stepSize: 1,
                              },
                            },
                          ],
                        },
                      }}
                    />
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          );
        })}
      </CRow> */}
    </div>
  );
};

export default Subjectdata;
