import React, { useState } from "react";
import { CButton, CCard, CCardBody, CCol, CRow } from "@coreui/react";
import { CChartBar } from "@coreui/react-chartjs";

const SelectedTrial = () => {
  const phaseList = ["Summary", "Temperature", "Beam Breaks", "Contacts"];
  const subjectList = ["Naive", "Cap", "Cap"];
  return (
    <div>
      <CCard>
        <CCardBody>
          <CRow>
            <CCol sm="12" md="6">
              <h3>
                <span>{"Trial 1 : "}</span>
                <span>{"Nickname : "}</span>
                <span>{"Training 1 "} </span>
              </h3>
            </CCol>
            <CCol sm="12" md="6">
              <div style={{ fontSize: 18 }}>
                <span>{"Trial Segments : "}</span>
                <span>{" Neutral, Ramp up, Hot, Ramp down "}</span>
              </div>
            </CCol>
          </CRow>
          <CRow className="my-5">
            <CCol sm="12">
              <h3>Phase 1</h3>
            </CCol>
            {phaseList.map((item, index) => (
              <CCol key={index} sm="12" md="4" lg="3">
                <div className="border border-dark text-center p-3 rounded font-weight-bold">
                  {item}
                </div>
              </CCol>
            ))}
          </CRow>
          <CRow className="my-5">
            <CCol sm="12">
              <h3>Groups</h3>
            </CCol>
            <CCol sm="12" md="6">
              <CChartBar
                datasets={[
                  {
                    label: "G1",
                    backgroundColor: "#4472C4",
                    data: [30],
                  },
                  {
                    label: "G2",
                    backgroundColor: "#ED7F47",
                    data: [40],
                  },
                  {
                    label: "G3",
                    backgroundColor: "#FEC14A",
                    data: [21],
                  },
                ]}
              />
            </CCol>
            <CCol sm="12" md="6">
              <CChartBar
                datasets={[
                  {
                    label: "Naive",
                    backgroundColor: "#4472C4",
                    data: [25],
                  },
                  {
                    label: "Cap",
                    backgroundColor: "#ED7F47",
                    data: [40],
                  },
                  {
                    label: "Cap,Bup",
                    backgroundColor: "#FEC14A",
                    data: [32],
                  },
                ]}
              />
            </CCol>
          </CRow>
          <CRow className="my-5">
            <CCol sm="12">
              <h3>Recent Subjects</h3>
            </CCol>
            {subjectList.map((item, index) => (
              <CCol sm="12" md="4">
                <div className="card-box border shadow bg-gray-400 w-100 my-3 rounded d-flex align-items-center justify-content-around cursor-pointer">
                  <div>
                    <div>{"Subject " + (index + 1)}</div>
                    <div>Group : {item}</div>
                  </div>
                </div>
              </CCol>
            ))}
            <CCol sm="12" className="text-right">
              <CButton color="link" size="sm" className="text-muted">
                More Subjects
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};
export default SelectedTrial;
