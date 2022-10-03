import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormGroup,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useHistory } from 'react-router-dom';
import { Formik } from 'formik';
import { InputError, Loader } from 'src/reusable';
import * as Yup from 'yup';
import { register } from 'src/services/AppService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const logo = 'logo/logo.webp';

const Register = () => {
  const [isLoading, setLoading] = useState(false);
  const _history = useHistory();
  const RegisterSchema = Yup.object().shape({
    userEmail: Yup.string()
      .required('Email id is required')
      .min(4, 'Email too short'),
    // password: Yup.string()
    //   .required("Password is required")
    //   .min(8, "Password too short"),
    // passwordRepeat: Yup.string()
    //   .oneOf([Yup.ref("password"), null], "Passwords do not match")
    //   .required("Required"),
    userName: Yup.string().required('Name is required'),
    // .min(3, 'Username should be between 3-16 characters')
    // .min(16, 'Username should be between 3-16 characters'),
  });

  const onRegister = async (data) => {
    try {
      setLoading(true);
      const req = {
        name: data.userName,
        email: data.userEmail,
        // ! role optional default is 'user'
      };
      const res = await register(req);
      if (res.data.error) {
        toast.error(res.data.message);
      } else if (res.data) {
        toast.success(
          'Please check your entered Email account for Verification Link.',
        );
      }
      setLoading(false);
    } catch (e) {
      if (e && e.data && e.data.message) {
        toast.error(e.data.message);
      } else {
        toast.error('Oops! something went wrong. Please try after some time.');
      }
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="c-app c-default-layout flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md="8" lg="6">
              <CCardGroup>
                <CCard className="px-2 pl-4 mb-0 bg-info text-center">
                  <CCardBody>
                    <img className="" src={logo} width={'60%'} />
                  </CCardBody>
                </CCard>
              </CCardGroup>
              <CCardGroup>
                <CCard className="px-2">
                  <CCardBody>
                    <h4>Register</h4>
                    <Formik
                      enableReinitialize={true}
                      initialValues={{
                        userEmail: '',
                        // password: "",
                        // passwordRepeat: "",
                        userName: '',
                      }}
                      validationSchema={RegisterSchema}
                      onSubmit={(values) => {
                        onRegister(values);
                      }}
                    >
                      {({
                        values,
                        handleSubmit,
                        handleChange,
                        errors,
                        touched,
                      }) => (
                        <CForm onSubmit={handleSubmit}>
                          <CFormGroup>
                            <CInputGroup className="">
                              <CInputGroupPrepend>
                                <CInputGroupText>
                                  <CIcon name="cil-user" />
                                </CInputGroupText>
                              </CInputGroupPrepend>
                              <CInput
                                id="userName"
                                name="userName"
                                placeholder="Enter your Name"
                                required
                                value={values?.userName}
                                onChange={handleChange}
                                invalid={errors.userName}
                              />
                            </CInputGroup>
                            <InputError
                              text={errors.userName}
                              touched={touched.userName}
                            />
                          </CFormGroup>
                          <CFormGroup>
                            <CInputGroup className="">
                              <CInputGroupPrepend>
                                <CInputGroupText>
                                  <CIcon name="cil-envelope-open" />
                                </CInputGroupText>
                              </CInputGroupPrepend>
                              <CInput
                                id="userEmail"
                                name="userEmail"
                                placeholder="Enter your Email Id"
                                required
                                value={values?.userEmail}
                                onChange={handleChange}
                                invalid={errors.userEmail}
                              />
                            </CInputGroup>
                            <InputError
                              text={errors.userEmail}
                              touched={touched.userEmail}
                            />
                          </CFormGroup>
                          {/* <CFormGroup>
                          <CInputGroup className="">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-lock-locked" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput
                              id="password"
                              type="password"
                              placeholder="Enter New Password"
                              required
                              value={values?.password}
                              onChange={handleChange}
                              invalid={errors.password}
                            />
                          </CInputGroup>
                          <InputError
                            text={errors.password}
                            touched={touched.password}
                          />
                        </CFormGroup> */}
                          {/* <CFormGroup>
                          <CInputGroup className="">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-lock-locked" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput
                              id="passwordRepeat"
                              type="password"
                              placeholder="Re-enter Password"
                              required
                              value={values?.passwordRepeat}
                              onChange={handleChange}
                              invalid={errors.passwordRepeat}
                            />
                          </CInputGroup>
                          <InputError
                            text={errors.passwordRepeat}
                            touched={touched.passwordRepeat}
                          />
                        </CFormGroup> */}
                          <CFormGroup>
                            <CRow>
                              <CCol xs="6">
                                <CButton
                                  color="link"
                                  className="text-info px-0"
                                  onClick={() => _history.push('/login')}
                                  type="button"
                                >
                                  Back to Login
                                </CButton>
                              </CCol>
                              <CCol xs="6" className="text-right">
                                <CButton
                                  color="info"
                                  className="px-4"
                                  // onClick={() => handleSubmit()}
                                  type="submit"
                                >
                                  Register
                                </CButton>
                              </CCol>
                            </CRow>
                          </CFormGroup>
                        </CForm>
                      )}
                    </Formik>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  );
};

export default Register;
