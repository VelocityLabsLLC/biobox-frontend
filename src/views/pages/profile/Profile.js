import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormGroup,
  CInput,
  CLabel,
  CRow,
} from '@coreui/react';
import { Loader } from 'src/reusable';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Formik } from 'formik';
import { updateUser } from 'src/services/AppService';
import CIcon from '@coreui/icons-react';

export const Profile = () => {
  const [isLoading, setLoading] = useState(false);
  const ud = JSON.parse(localStorage.getItem('userDetail'));
  const [enableEdit, setEnableEdit] = useState(false);
  const userNameSchema = Yup.object().shape({
    username: Yup.string()
      .required('User Name is required')
      .min(2, 'User Name too short'),
  });

  const updateUserName = async (data) => {
    try {
      if (data.username === ud.name) return;
      setLoading(true);
      const req = {
        name: data.username,
      };
      const res = await updateUser(ud.id, req);
      console.log(res.data);
      if (res && res.data) {
        let temp = { ...ud };
        temp.name = res.data.name || data.username;
        localStorage.setItem('userDetail', JSON.stringify(temp));
        setEnableEdit(false);
        toast.success('Username updated successfully.');
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      if (e && e.data && e.data.message) {
        toast.error(e.data.message);
      } else {
        toast.error('Oops! something went wrong. Please try after some time.');
      }
    }
  };

  return (
    <>
      {isLoading && <Loader />}

      <CCard>
        <CCardHeader>
          <h5>Profile</h5>
        </CCardHeader>
        <CCardBody>
          <Formik
            initialValues={{
              username: ud.name,
            }}
            validationSchema={userNameSchema}
            onSubmit={(values) => {
              updateUserName(values);
            }}
          >
            {({ values, handleSubmit, handleChange, errors, touched }) => (
              <CForm onSubmit={handleSubmit}>
                <CRow className="my-2">
                  <CCol xs="5" sm="4" md="3" lg="2" className="d-flex">
                    <CLabel className="align-self-center mb-0">
                      User Name
                    </CLabel>
                  </CCol>
                  {/* <CCol xs="6" sm="6" md="4" lg="3"> */}
                  <CCol xs="7" sm="8" md="9" lg="10">
                    <CInput
                      id="username"
                      placeholder="Enter New Username"
                      required
                      value={values?.username}
                      onChange={handleChange}
                      invalid={errors.username}
                      readOnly={!enableEdit}
                      className={
                        !enableEdit
                          ? 'border-0 bg-white text-dark w-auto d-inline-block'
                          : 'text-dark w-auto d-inline-block'
                      }
                    />
                    {/* </CCol>
                  <CCol> */}
                    <CButton
                      color={enableEdit ? 'danger' : 'info'}
                      type="button"
                      className="mx-2"
                      onClick={() => setEnableEdit(!enableEdit)}
                    >
                      {enableEdit ? (
                        <CIcon name="cil-x" />
                      ) : (
                        <CIcon name="cil-pencil" />
                      )}
                    </CButton>
                    {enableEdit && (
                      <CButton color="info" type="submit">
                        Update
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </CForm>
            )}
          </Formik>
          <CRow className="my-2">
            <CCol xs="5" sm="4" md="3" lg="2" className="d-flex">
              <CLabel className="align-self-center mb-0">User Email Id</CLabel>
            </CCol>
            <CCol xs="6" sm="6" md="4" lg="3">
              <CInput
                value={ud && ud.email ? ud.email : '-'}
                disabled
                className="bg-white text-dark border-0"
              />
            </CCol>
          </CRow>
          <CRow className="my-2">
            <CCol xs="5" sm="4" md="3" lg="2" className="d-flex">
              <CLabel className="align-self-center mb-0">Role</CLabel>
            </CCol>
            <CCol xs="6" sm="6" md="4" lg="3">
              <CInput
                value={ud && ud.role ? ud.role : '-'}
                disabled
                className="bg-white text-dark border-0"
              />
            </CCol>
          </CRow>
          <CFormGroup></CFormGroup>
        </CCardBody>
      </CCard>
    </>
  );
};
export default Profile;
