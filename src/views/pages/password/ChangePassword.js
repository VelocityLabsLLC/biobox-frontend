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
import { Formik } from 'formik';
import * as Yup from 'yup';
import { InputError, Loader } from 'src/reusable';
import { changePassword } from 'src/services/AppService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PasswordCriteria from 'src/reusable/PasswordCriteria';
const logo = 'logo/logo.webp';

const ChangePassword = () => {
  const [isLoading, setLoading] = useState(false);
  const _history = useHistory();
  const ChangePasswordSchema = Yup.object().shape({
    passwordOld: Yup.string()
      .required('Password is required')
      .min(8, 'Password too short'),
    passwordNew: Yup.string()
      .required('New Password is required')
      .min(8, 'Password too short')
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1})(?!.*[\s]).*$/,
        'Password does not meet all required conditions',
      ),
    passwordRepeat: Yup.string()
      .oneOf([Yup.ref('passwordNew'), null], 'New Passwords do not match')
      .required('Required'),
  });

  const onChangePassword = async (data) => {
    try {
      setLoading(true);
      const ud = JSON.parse(localStorage.getItem('userDetail'));
      const req = {
        email: ud.email,
        password: data.passwordOld.trim(),
        newPassword: data.passwordNew.trim(),
      };
      const res = await changePassword(req);
      if (res.data.error) {
        toast.error(res.data.message);
      } else if (res.data) {
        toast.success('Password updated Successfully');
        // _history.push('/dashboard');
        _history.push('/');
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
      <div className="">
        <CContainer>
          <CRow className="">
            <CCol md="12" lg="8">
              <CCardGroup>
                <CCard className="px-2">
                  <CCardBody>
                    <h4>Change Password</h4>
                    <Formik
                      enableReinitialize={true}
                      initialValues={{
                        passwordOld: '',
                        passwordNew: '',
                        passwordRepeat: '',
                      }}
                      validationSchema={ChangePasswordSchema}
                      onSubmit={(values) => {
                        onChangePassword(values);
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
                                id="passwordOld"
                                type="password"
                                placeholder="Enter Existing Password"
                                required
                                value={values?.passwordOld}
                                onChange={handleChange}
                                invalid={errors.passwordOld}
                              />
                            </CInputGroup>
                            <InputError
                              text={errors.passwordOld}
                              touched={touched.passwordOld}
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
                                id="passwordNew"
                                type="password"
                                placeholder="Enter New Password"
                                required
                                value={values?.passwordNew}
                                onChange={handleChange}
                                invalid={errors.passwordNew}
                              />
                            </CInputGroup>
                            <InputError
                              text={errors.passwordNew}
                              touched={touched.passwordNew}
                            />
                          </CFormGroup>
                          <CFormGroup>
                            <CInputGroup>
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
                              <CCol xs="12" className="text-right">
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

export default ChangePassword;
