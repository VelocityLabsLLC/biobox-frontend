import CIcon from '@coreui/icons-react';
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
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputError, Loader } from 'src/reusable';
import { login, unsubscribeSocketEvent } from 'src/services/AppService';
import * as Yup from 'yup';

const logo = 'logo/logo.webp';

const Login = () => {
  const _history = useHistory();
  const [isLoading, setLoading] = useState(false);

  const LoginSchema = Yup.object().shape({
    userEmail: Yup.string()
      .required('Email id is required')
      .min(4, 'Email too short'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password too short'),
  });

  const onLogin = async (data) => {
    try {
      setLoading(true);
      let req = {
        email: data.userEmail,
        password: data.password,
      };
      let res = await login(req);
      if (res.data.error) {
        toast.error(res.data.message);
      } else if (res.data) {
        localStorage.setItem('userDetail', JSON.stringify(res.data));
        if (res.data?.role === 'admin') {
          _history.push('/master-list');
        } else if (
          !res.data.subscription &&
          process.env.REACT_APP_ENV === 'CLOUD'
        ) {
          _history.push('/plans');
        } else {
          _history.push('/dashboard');
        }
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      toast.error('Incorrect username or password');
      setLoading(false);
    }
  };

  useEffect(() => {
    unsubscribeSocketEvent();
    localStorage.clear();
  });
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
                    <h4>Login</h4>
                    <Formik
                      enableReinitialize={true}
                      initialValues={{
                        userEmail: '',
                        password: '',
                      }}
                      validationSchema={LoginSchema}
                      onSubmit={(values) => {
                        onLogin(values);
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
                                id="userEmail"
                                name="userEmail"
                                placeholder="Email Id"
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

                          <CFormGroup>
                            <CInputGroup className="">
                              <CInputGroupPrepend>
                                <CInputGroupText>
                                  <CIcon name="cil-lock-locked" />
                                </CInputGroupText>
                              </CInputGroupPrepend>
                              <CInput
                                id="password"
                                name="password"
                                placeholder="Password"
                                type="password"
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
                          </CFormGroup>
                          <CFormGroup className="text-right">
                            <CButton
                              color="info"
                              className="px-4"
                              // onClick={() => handleSubmit()}
                              type="submit"
                            >
                              Login
                            </CButton>
                            {/* <button color="info" className="px-4" type="submit">
                              Login2
                            </button> */}
                          </CFormGroup>
                          <CFormGroup>
                            <CRow className="mt-3">
                              <CCol xs="6">
                                <CButton
                                  color="link"
                                  className="text-info px-0"
                                  onClick={() => _history.push('/register')}
                                  type="button"
                                >
                                  Sign Up
                                </CButton>
                              </CCol>
                              <CCol xs="6" className="text-right">
                                <CButton
                                  color="link"
                                  className="text-info px-0"
                                  onClick={() =>
                                    _history.push('/forgotPassword')
                                  }
                                  type="button"
                                >
                                  Forgot Password?
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

export default Login;
