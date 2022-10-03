import { freeSet } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
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
  CSelect,
} from "@coreui/react";
import { FieldArray, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { InputError } from "src/reusable";
import { Loader } from "src/reusable/index";
import * as Yup from "yup";
import {
  getAllSubjects,
  getSubjectData,
  createSubjectData,
  updateSubjectData,
} from "../../../services/AppService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const CreateSubject = () => {
  const _history = useHistory();
  const _params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const master = useSelector((store) => store.dataReducer.data);

  const subjectSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    experimentId: Yup.number()
      .min(0)
      .required("please select an existing experiment"),
  });
  const initialValuesForSubject = {
    name: "",
    experimentId: 0,
  };

  const [subjectData, setSubjectData] = useState(initialValuesForSubject);

  const onSubmitForm = async (values) => {
    setIsLoading(true);
    try {
      if (_params.id) {
        await updateSubjectData(master, values, _params.id);
        toast.success("Data Update successfully");
      } else {
        await createSubjectData(master, values);
        toast.success("Data Added  successfully");
      }
      setTimeout(() => {
        _history.push("/subjects");
      }, 1000);
    } catch (error) {
      toast.error("Something went wrong ");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectDetail = async () => {
    try {
      if (_params.id) {
        const data = await getSubjectData(master, _params.id);
        if (data && data.data) {
          setSubjectData(data.data);
        }
      }
    } catch (error) {}
  };

  return (
    <div>
      {isLoading && <Loader />}
      <Formik
        enableReinitialize={true}
        initialValues={subjectData}
        key="SubjectData"
        validationSchema={subjectSchema}
        onSubmit={(values) => {
          onSubmitForm(values);
        }}
      >
        {({ values, handleSubmit, handleChange }) => (
          <CRow>
            <CCol>
              <CCard>
                <CCardHeader>
                  <h4 className="m-0">
                    {_params.id ? "Edit" : "Create"} Subject
                  </h4>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="name">Subject Name</CLabel>
                        <CInput
                          id="name"
                          name="name"
                          placeholder="Subject Name"
                          required
                          value={values?.name}
                          onChange={handleChange}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol xs="12">
                      {/* // ! todo: add a dropdown to select a experiment */}
                      <CFormGroup>
                        <CLabel htmlFor="name">Experiment ID</CLabel>
                        <CInput
                          id="experimentId"
                          name="experimentId"
                          placeholder="Experiment ID"
                          required
                          value={values?.experimentId}
                          onChange={handleChange}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow className="mt-4 mr-2">
                    <div className="ml-auto">
                      <CFormGroup>
                        <CButton
                          onClick={() => {
                            _history.push("/subjects");
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
                          className="mr-2"
                          color="info"
                        >
                          Save
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
    </div>
  );
};
export default CreateSubject;
