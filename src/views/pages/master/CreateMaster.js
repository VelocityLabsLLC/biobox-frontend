import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormGroup,
  CInput,
  CLabel,
  CRow,
} from '@coreui/react';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import { InputError, Loader } from '../../../reusable';
import { CreateNewMaster } from '../../../services/AppService';

const CreateMaster = () => {
  const _history = useHistory();

  const [isLoading, setIsLoading] = useState(false);

  const [masterDetails, setMasterDetails] = useState({
    name: '',
    macAddress: '',
  });

  const masterSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    macAddress: Yup.string().required('Name is required'),
  });

  const onSubmitform = async (values) => {
    setIsLoading(true);
    try {
      const response = await CreateNewMaster(values);
      toast.success('Master Added Successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      {isLoading && <Loader />}

      <Formik
        enableReinitialize={true}
        initialValues={masterDetails}
        validationSchema={masterSchema}
        key="master"
        onSubmit={(values) => {
          onSubmitform(values);
        }}
      >
        {({ values, handleSubmit, handleChange, errors, touched }) => (
          <CRow className="mx-0">
            <CCol>
              <CCard className="mb-2">
                <CCardBody>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="name">Master Name</CLabel>
                        <CInput
                          id="name"
                          name="name"
                          placeholder="Master Box Name"
                          required
                          value={values?.name}
                          onChange={handleChange}
                          invalid={errors.name}
                        />
                        <InputError text={errors.name} touched={touched.name} />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="macAddress">MAC Address</CLabel>
                        <CInput
                          id="macAddress"
                          name="macAddress"
                          placeholder="Mac Address"
                          required
                          value={values?.macAddress}
                          onChange={handleChange}
                          invalid={errors.macAddress}
                        />
                        <InputError
                          text={errors.macAddress}
                          touched={touched.macAddress}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow className="mt-1 mr-1">
                    <div className="ml-auto">
                      {/* <CFormGroup> */}
                      <CButton
                        onClick={() => {
                          _history.push('/master-list');
                        }}
                        className="mr-2"
                        color="outline-danger"
                      >
                        Cancel
                      </CButton>
                      <CButton
                        type="button"
                        onClick={() => {
                          handleSubmit();
                        }}
                        color="info"
                      >
                        Save
                      </CButton>
                      {/* </CFormGroup> */}
                    </div>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}
      </Formik>
    </div>
  );
};
export default CreateMaster;
