import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { toast } from "react-toastify";
import { freeSet } from '@coreui/icons';
import { useParams } from 'react-router';
import * as _ from 'lodash'
import { getSessionDetails } from '../../../services/AppService'

const PaymentSuccess = () => {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({})
  const [customerDetails, setCustomerDetails] = useState({})

  const handleGetSessionDetails = async () => {
    try {
      setLoading(true)
      const { data: { paymentDetails, customerDetails } } = await getSessionDetails(params.sessionId)
      setCustomerDetails(customerDetails);
      setPaymentDetails(paymentDetails);
    } catch (error) {
      toast.error("Something went wrong please Try again later");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGetSessionDetails()
  }, [])

  return (
    <div className="row justify-content-center text-center">
      <CCard className="col-12 col-md-6">
        <CCardHeader>
          <h3>Payment Successfull</h3>
          <h4 className="text-muted">Thank You</h4>
          <div className="rounded-circle bg-success d-flex justify-content-center align-items-center mx-auto" style={{ width: "3rem", height: "3rem" }}>
            <CIcon content={freeSet.cilCheck} className="text-white" />
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex flex-column justify-content-center align-items-center text-dark bg-secondary py-5">
            <p className="text-muted mb-0">
              {
                _.get(customerDetails, 'email', '')
              }
            </p>
            <div className="d-inline-flex align-items-center my-5">
              <h5 className="mr-1 text-uppercase">
                {
                  _.get(paymentDetails, 'currency', '')
                }
              </h5>
              <h1>
                {
                  _.get(paymentDetails, 'amount_total', '') === '' ? '' : ((_.get(paymentDetails, 'amount_total') / 100).toFixed(2))
                }
              </h1>
            </div>
            <div className="d-inline-flex">
              <p className="px-2 py-1 bg-light mr-2 rounded-lg">INVOICE</p>
              <p className="px-2 py-1 bg-light rounded-lg">
                {
                  _.get(customerDetails, 'invoice_prefix', '') === '' ? '' : `${_.get(customerDetails, 'invoice_prefix')}...`
                }
              </p>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default PaymentSuccess
