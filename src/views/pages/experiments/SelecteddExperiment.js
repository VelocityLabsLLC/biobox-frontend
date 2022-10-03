import React, { useState } from "react";
import { CButton, CCard, CCardBody, CCol, CRow } from "@coreui/react";
import { useHistory } from "react-router-dom";

export default function SelectedExperiment(expData = undefined) {
  const _history = useHistory();
  const trialList = ["Trial 1", "Trial 2", "Trial 3", "Trial 4"];

  return (
    <div>
      <h3>{expData.experimentName}</h3>
      <div>
        <CRow>
          <CCol sm="12" md="6">
            <CRow>
              <CCol sm="12">
                <h3>Experimental Design</h3>
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Trial Duration</CCol>
              <CCol sm="6">: {expData.trialDuration + " minutes"}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Sampling Rate</CCol>
              <CCol sm="6">: {expData.samplingRate + " Hz"}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Number of Subjects</CCol>
              <CCol sm="6">: {expData.noOfSubjects}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Number of Boxes</CCol>
              <CCol sm="6">: {expData.noOfBoxes}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Groups</CCol>
              <CCol sm="6">: {expData.groups}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Treatments</CCol>
              <CCol sm="6">: {expData.treatments}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Phases</CCol>
              <CCol sm="6">: {expData.phases}</CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton
                  color="dark"
                  size="lg"
                  className="mt-3"
                  variant="outline"
                >
                  Modify Experiment Design
                </CButton>
              </CCol>
            </CRow>
          </CCol>

          <CCol sm="12" md="6">
            <CRow>
              <CCol sm="12">
                <h3>Devices</h3>
              </CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Temperature Controllers</CCol>
              <CCol sm="6">: {"2"}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">IR Beams</CCol>
              <CCol sm="6">: {"20"}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">Contact Sensors</CCol>
              <CCol sm="6">: {"3"}</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">OR</CCol>
            </CRow>
            <CRow>
              <CCol sm="6">BioBox Mechanical</CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton
                  color="dark"
                  size="lg"
                  className="mt-3"
                  variant="outline"
                >
                  Modify Devices
                </CButton>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </div>

      <div className='mt-5'>
        <CRow>
          <CCol>
            <h3>{'Recent Trials'}</h3>
          </CCol>
        </CRow>
        <CRow>
          {trialList.slice(0, 3).map((item, index) => (
            <CCol sm="12" md="4" key={index}>
              <div className="card-box border shadow bg-gray-400 w-100 my-3 rounded d-flex align-items-center justify-content-around cursor-pointer"
              onClick={()=> _history.push('selectedTrial')}>
                <div className="font-weight-bold">{item}</div>
              </div>
            </CCol>
          ))}
        </CRow>
      </div>
    </div>
  );
}
