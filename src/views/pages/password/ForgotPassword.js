import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import * as Yup from 'yup';
import { Formik } from 'formik';
import { InputError, Loader } from 'src/reusable';
import { forgotPassword, confirmCode } from 'src/services/AppService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PasswordCriteria from 'src/reusable/PasswordCriteria';
const logo = 'logo/logo.webp';

const ForgotPassword = () => {
  const [isLoading, setLoading] = useState(false);
  const _history = useHistory();
  const [enableResetSection, setEnableResetSection] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const emailSchema = Yup.object().shape({
    userEmail: Yup.string()
      .required('Email Id is required')
      .min(8, 'Password too short'),
  });

  const ForgotPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password too short'),
    passwordRepeat: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords do not match')
      .required('Password is Required'),
    verificationCode: Yup.string().required().length(6),
  });

  const onGetVerificationCode = async (data) => {
    try {
      setLoading(true);
      const req = {
        email: data.userEmail,
      };
      setUserEmail(data.userEmail);
      const res = await forgotPassword(req);
      if (res.data.error) {
        toast.error(res.data.message);
      } else if (res.data) {
        toast.success(
          'Please check your entered Email account for Verification Link.',
        );
        setEnableResetSection(true);
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.message) {
        toast.error(e.data.message);
      } else {
        toast.error('Oops! something went wrong. Please try after some time.');
      }
      setLoading(false);
    }
  };

  const onUpdatePassword = async (data) => {
    try {
      setLoading(true);
      const req = {
        email: userEmail,
        newPassword: data.password,
        code: data.verificationCode,
      };
      const res = await confirmCode(req);
      if (res.data.error) {
        toast.error(res.data.message);
      } else if (res.data) {
        toast.success(`Password for ${userEmail} updated `);
        _history.push('/login');
      }
    } catch (e) {
      console.log(e);
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
                    <h4>Reset Password</h4>
                    {!enableResetSection && (
                      <Formik
                        enableReinitialize={true}
                        initialValues={{
                          userEmail: '',
                        }}
                        validationSchema={emailSchema}
                        onSubmit={(values) => {
                          onGetVerificationCode(values);
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
                                  placeholder="Enter your Email Id"
                                  required
                                  value={values?.userEmail}
                                  onChange={handleChange}
                                  invalid={errors.userEmail}
                                  disabled={enableResetSection}
                                />
                              </CInputGroup>
                              <InputError
                                text={errors.userEmail}
                                touched={touched.userEmail}
                              />
                            </CFormGroup>

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
                                    Submit
                                  </CButton>
                                </CCol>
                              </CRow>
                            </CFormGroup>
                          </CForm>
                        )}
                      </Formik>
                    )}

                    {enableResetSection && (
                      <>
                        <Formik
                          enableReinitialize={true}
                          initialValues={{
                            password: '',
                            passwordRepeat: '',
                            verificationCode: '',
                          }}
                          validationSchema={ForgotPasswordSchema}
                          onSubmit={(values) => {
                            onUpdatePassword(values);
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
                              </CFormGroup>

                              <CFormGroup>
                                <CInputGroup className="">
                                  <CInputGroupPrepend>
                                    <CInputGroupText>
                                      <CIcon name="cil-lock-locked" />
                                    </CInputGroupText>
                                  </CInputGroupPrepend>
                                  <CInput
                                    id="passwordRepeat"
                                    type="password"
                                    placeholder="Re-Enter New Password"
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
                              </CFormGroup>

                              <CFormGroup>
                                <CInputGroup className="">
                                  <CInputGroupPrepend>
                                    <CInputGroupText>
                                      <CIcon name="cil-notes" />
                                    </CInputGroupText>
                                  </CInputGroupPrepend>
                                  <CInput
                                    id="verificationCode"
                                    type="password"
                                    placeholder="Enter 6-digit Verification Code"
                                    required
                                    value={values?.verificationCode}
                                    onChange={handleChange}
                                    invalid={errors.verificationCode}
                                  />
                                </CInputGroup>
                                <InputError
                                  text={errors.verificationCode}
                                  touched={touched.verificationCode}
                                />
                              </CFormGroup>

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
                                      Update Password
                                    </CButton>
                                  </CCol>
                                </CRow>
                              </CFormGroup>
                            </CForm>
                          )}
                        </Formik>
                        <PasswordCriteria />
                      </>
                    )}
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

export default ForgotPassword;
