import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormGroup,
  CInput,
  CLabel,
  CRow,
} from '@coreui/react';
import { Formik } from 'formik';
import { values } from 'lodash-es';
import React, { lazy, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllMasters, updateMaster } from '../../../services/AppService';
import { toast } from 'react-toastify';
import { Loader } from '../../../reusable';

const Settings = () => {
  const [macAddr, setMacAddr] = useState('');
  const [dName, setDNAme] = useState('');
  const [assign, setAssign] = useState('');
  const [master, setMaster] = useState();
  const [loading, setLoading] = useState(false);
  let value = {
    macAddress: macAddr,
    masterName: dName,
    userEmail: assign,
  };

  const setMacAddress = async () => {
    try {
      setLoading(true);
      let resp = await getAllMasters();
      if (resp.data?.data) {
        setMaster(resp.data.data[0]);
        setMacAddr(resp.data.data[0].macAddress);
        setDNAme(resp.data.data[0].name);
        setAssign(resp.data.data[0].userEmail);
      } else {
        toast.error('Unable to get device details.');
      }
      setLoading(false);
      console.log(resp);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMacAddress();
  }, []);
  return (
    <>
      {loading && <Loader />}
      <CCard>
        <CCardBody>
          <Formik
            enableReinitialize={true}
            initialValues={value}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await updateMaster(master.id, values);
                toast.success('Updated Successfully');
              } catch (error) {
                toast.error('Something went wrong please Try again later');
              } finally {
                setLoading(false);
              }
            }}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              errors,
              touched,
              setFieldValue,
            }) => (
              <CRow>
                <CCol>
                  <CCard>
                    <CCardHeader>
                      <h4 className="m-0">Settings</h4>
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol xs="12">
                          <CFormGroup>
                            <CLabel htmlFor="macAddress">MAC Address</CLabel>
                            <CInput
                              id="macAddress"
                              name="macAddress"
                              placeholder="MAC Address"
                              value={values?.macAddress}
                              onChange={handleChange}
                              disabled={true}
                            />
                          </CFormGroup>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol xs="12">
                          <CFormGroup>
                            <CLabel htmlFor="masterName">Name</CLabel>
                            <CInput
                              id="masterName"
                              name="masterName"
                              placeholder="Enter Name"
                              value={values?.masterName}
                              onChange={handleChange}
                            />
                          </CFormGroup>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol xs="12">
                          <CFormGroup>
                            <CLabel htmlFor="userEmail">Email ID</CLabel>
                            <CInput
                              id="userEmail"
                              name="userEmail"
                              placeholder="Email ID"
                              value={values?.userEmail}
                              onChange={handleChange}
                            />
                          </CFormGroup>
                        </CCol>
                      </CRow>

                      <CRow className="mt-4 mr-2">
                        <div className="ml-auto">
                          <CFormGroup>
                            <CButton
                              type="button"
                              onClick={() => {
                                handleSubmit();
                              }}
                              className="mr-2"
                              color="info"
                            >
                              Submit
                            </CButton>
                          </CFormGroup>
                        </div>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            )}
          </Formik>
        </CCardBody>
      </CCard>
    </>
  );
};

export default Settings;
