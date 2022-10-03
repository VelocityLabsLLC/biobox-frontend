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
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// import "react-toastify/dist/ReactToastify.css";
import { Loader } from 'src/reusable/index';
import { getDeviceData, updateDeviceData } from '../../../services/AppService';

const CreateTrial = () => {
  const _history = useHistory();
  const _params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const masterData = useSelector((store) => store.dataReducer.data);

  const initialValuesFordevice = {
    name: '',
    macAddress: '',
  };

  const [device, setDevice] = useState(initialValuesFordevice);
  // const [showToast, setToast] = useState(false);
  // let toasts = [{ position: "top-right", autohide: 3000 }];
  // let toasters = (() => {
  //   return toasts.reduce((toasters, toast) => {
  //     toasters[toast.position] = toasters[toast.position] || [];
  //     toasters[toast.position].push(toast);
  //     return toasters;
  //   }, {});
  // })();

  const getDeviceDetails = async () => {
    try {
      const data = await getDeviceData(_params.id, masterData);
      const resp = data.data;
      setDevice(resp);
      setIsLoading(false);
    } catch (err) {}
  };

  const updateDeviceDetails = async (data) => {
    setIsLoading(true);
    try {
      await updateDeviceData(data, masterData);
      toast.success('Data Update successfully');
      // setToast(true);
      // setTimeout(() => {
      //   _history.push("/devices");
      // }, 3000);
      setIsLoading(false);
    } catch (error) {
      toast.error('Something went wrong please Try again later');
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDeviceDetails();
  }, []);

  return (
    <div>
      {isLoading && <Loader />}

      <Formik
        enableReinitialize={true}
        initialValues={device}
        key="Device-data"
        onSubmit={(values) => {
          updateDeviceDetails(values);
        }}
      >
        {({ values, handleSubmit, handleChange }) => (
          <CRow className="mx-0">
            <CCol>
              <CCard>
                <CCardHeader>
                  <h4 className="m-0">Edit Device</h4>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="name">Device Name</CLabel>
                        <CInput
                          id="name"
                          name="name"
                          placeholder="Device Name"
                          required
                          value={values?.name}
                          onChange={handleChange}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="macAddress">Mac address</CLabel>
                        <CInput
                          id="macAddress"
                          name="macAddress"
                          placeholder="Mac-Address"
                          required
                          value={values?.macAddress}
                          disabled={true}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>

                  <CRow className="mt-lg-3">
                    <CCol xs="12" className="text-right">
                      <CFormGroup className="mb-sm-0 mb-lg-3">
                        <CButton
                          onClick={() => {
                            _history.push('/devices');
                          }}
                          className=""
                          color="outline-danger"
                        >
                          {' '}
                          Cancel
                        </CButton>
                        <CButton
                          type="button"
                          onClick={() => {
                            handleSubmit();
                            // setToast(true);
                          }}
                          className="ml-2"
                          color="info"
                        >
                          {' '}
                          Save
                        </CButton>
                      </CFormGroup>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}
      </Formik>

      {/* {Object.keys(toasters).map((toasterKey) => (
        <CToaster position={toasterKey} key={"toaster" + toasterKey}>
          {toasters[toasterKey].map((toast, key) => {
            return (
              <CToast
                key={"toast"}
                show={showToast}
                autohide={toast.autohide}
                fade={toast.fade}
              >
                <CToastHeader closeButton={toast.closeButton}>
                  Success
                </CToastHeader>
                <CToastBody>Device Updated Successfully</CToastBody>
              </CToast>
            );
          })}
        </CToaster>
      ))} */}
    </div>
  );
};

export default CreateTrial;
