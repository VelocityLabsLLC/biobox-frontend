import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { freeSet } from '@coreui/icons';

const PaymentFailed = () => {
  return (
    <div className="row justify-content-center text-center">
      <CCard className="col-12 col-md-6">
        <CCardHeader>
          <h3>Payment Failed</h3>
          <div className="rounded-circle bg-danger d-flex justify-content-center align-items-center mx-auto" style={{ width: "3rem", height: "3rem" }}>
            <CIcon content={freeSet.cilSad} className="text-white" />
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex flex-column justify-content-center align-items-center text-dark bg-secondary py-5">
            <h3 className="mb-0">John Doe</h3>
            <p className="text-muted mb-0">hello@johndoe.com</p>
            <button type="button" className="btn btn-dark w-75 my-5">Try Again</button>
            <div className="d-inline-flex">
              <p className="px-2 py-1 bg-light mr-2 rounded-lg">FAILED</p>
              <p className="px-2 py-1 bg-light rounded-lg">#123456789</p>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default PaymentFailed

