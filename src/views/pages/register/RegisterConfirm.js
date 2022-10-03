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
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { InputError, Loader } from 'src/reusable';
import { changePassword } from 'src/services/AppService';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PasswordCriteria from 'src/reusable/PasswordCriteria';
const logo = 'logo/logo.webp';

const RegisterConfirm = () => {
  const [isLoading, setLoading] = useState(false);
  const _history = useHistory();
  const _params = useParams();

  const SetFirstPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('Password is required')
      .min(8, 'Password too short')
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1})(?!.*[\s]).*$/,
        'Password does not meet all required conditions',
      ),
    passwordRepeat: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords do not match')
      .required('Required'),
  });

  const onSetPassword = async (data) => {
    try {
      setLoading(true);
      const req = {
        email: _params.email,
        password: _params.tempPassword,
        newPassword: data.newPassword.trim(),
      };
      const res = await changePassword(req);
      if (res.data.error) {
        toast.error(res.data.message);
      } else if (res.data) {
        toast.success(
          'Password changed successfully. Please Login with new Password.',
        );
        _history.push('/login');
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
                    <h4>Set New Password</h4>
                    <Formik
                      enableReinitialize={true}
                      initialValues={{
                        newPassword: '',
                        passwordRepeat: '',
                      }}
                      validationSchema={SetFirstPasswordSchema}
                      onSubmit={(values) => {
                        onSetPassword(values);
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
                              <CInput value={_params.email} disabled={true} />
                            </CInputGroup>
                          </CFormGroup>
                          <CFormGroup>
                            <CInputGroup className="">
                              <CInputGroupPrepend>
                                <CInputGroupText>
                                  <CIcon name="cil-lock-locked" />
                                </CInputGroupText>
                              </CInputGroupPrepend>
                              <CInput
                                id="newPassword"
                                type="password"
                                placeholder="Enter New Password"
                                required
                                value={values?.newPassword}
                                onChange={handleChange}
                                invalid={errors.newPassword}
                              />
                            </CInputGroup>
                            <InputError
                              text={errors.newPassword}
                              touched={touched.newPassword}
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
                          </CFormGroup>
                          <CFormGroup>
                            <CRow>
                              <CCol xs="6"></CCol>
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
                    <PasswordCriteria />
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

export default RegisterConfirm;
