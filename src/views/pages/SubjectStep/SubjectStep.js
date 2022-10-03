import { freeSet } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import * as Yup from "yup";
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CFormGroup,
  CInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from "@coreui/react";
import { FieldArray, Formik } from "formik";
import { countBy, each, sortBy, uniqBy } from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputError, Loader } from "../../../reusable";
import { createExperiment } from "../../../services/AppService";
import "./SubjectStep.scss";

export default function SubjectStep({
  masterData,
  changeTab,
  experimentDetails,
  setExperimentDetails,
}) {
  const _location = useLocation();
  const [isDisabled, setDisabled] = useState(
    _location.pathname.indexOf("editExperimentWizard") > -1 ? true : false
  );

  const treatmentFields = [
    "Treatment",
    "No of Subjects",
    // "Notes",
    "Action",
  ];

  const treatmentRowObj = {
    treatment: 1,
    name: "Unassigned",
    noOfSubjects: "",
    notes: "",
    action: null,
  };
  const _history = useHistory();
  const [treatmentCount, setTreatmentCount] = useState(1);
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [treatmentData, setTreatmentData] = useState({
    treatments: [{ ...treatmentRowObj }],
  });

  const [subjectData, setSubjectData] = useState({
    subjects:
      experimentDetails && experimentDetails.subjects
        ? experimentDetails.subjects
        : [],
  });

  const treatmentSchema = Yup.object().shape({
    treatments: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required("Treatment name required"),
          noOfSubjects: Yup.number()
            .required("Subjects required")
            .min(1, "Number of subjects between 1 ~ 100")
            .max(100, "Number of subjects between 1 ~ 100"),
        })
      )
      .min(1),
  });

  const subjectSchema = Yup.object().shape({
    subjects: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required("Please enter Subject name"),
      })
    ),
  });

  const assignSubjects = (values) => {
    let subjectsArray = [];
    each(values, (v) => {
      const tempSubjectArray = [];
      const startAt = subjectsArray.length + 1;
      const endAt = startAt + v.noOfSubjects;
      for (let i = startAt; i < endAt; i++) {
        tempSubjectArray.push({
          name: i,
          currentTreatment: v.name,
          notes: "",
          order: i,
        });
      }
      subjectsArray = subjectsArray.concat(tempSubjectArray);
    });
    setSubjectData({ subjects: [...sortBy(subjectsArray, ["order"])] });
  };

  const randomizeTreatmentsForSubjects = (makeLinear = false) => {
    let subjectsArray = [...subjectData.subjects];
    if (makeLinear) {
      subjectsArray = sortBy(subjectsArray, ["order"]);
    } else {
      subjectsArray = shuffle(subjectsArray);
    }
    let startAt = 0;
    each(treatments, (v) => {
      const endAt = startAt + v.noOfSubjects;
      for (let i = startAt; i < endAt; i++) {
        subjectsArray[i].currentTreatment = v.name;
      }
      startAt = endAt;
    });
    setSubjectData({ subjects: [...sortBy(subjectsArray, ["order"])] });
  };

  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */
  const shuffle = (a) => {
    for (let i = a.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const saveSubjects = async (values) => {
    if (isDisabled) {
      _history.push("/experiments");
      return;
    }
    setLoading(true);
    try {
      // console.log(values, experimentDetails);
      experimentDetails.subjects = [...values.subjects];
      if (experimentDetails.tags && experimentDetails.tags.length === 0) {
        delete experimentDetails.tags;
      }
      const createRes = await createExperiment(
        experimentDetails,
        masterData?.macAddress || masterData?.value?.macAddress
      );
      toast.success("Subjects Added Successfully");
      if (createRes && createRes.data) {
        _history.push(
          `/experimentDetails/${createRes.data.id}/${experimentDetails.name}`
        );
      } else {
        _history.push("/experiments");
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const createExistingTreatments = (subjects) => {
    const uniqTreatments = uniqBy(subjects, "currentTreatment");
    const counts = countBy(subjects, "currentTreatment");
    const tempTreatments = [];
    each(uniqTreatments, (n, i) => {
      const obj = {
        treatment: i + 1,
        name: n.currentTreatment,
        noOfSubjects: counts[n.currentTreatment],
        notes: "",
        action: null,
      };
      tempTreatments.push(obj);
    });
    setTreatmentData({ treatments: [...tempTreatments] });
    setTreatments([...tempTreatments]);
  };

  useEffect(() => {
    if (
      experimentDetails &&
      experimentDetails.subjects &&
      experimentDetails.subjects.length
    ) {
      createExistingTreatments(experimentDetails.subjects);
    }
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <Formik
        enableReinitialize={true}
        initialValues={treatmentData}
        validationSchema={treatmentSchema}
        key="treatment-data"
        onSubmit={(values) => {
          setTreatments([...values.treatments]);
          assignSubjects([...values.treatments]);
          setShowModal(!showModal);
        }}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          setFieldValue,
          errors,
          touched,
        }) => (
          <CModal
            show={showModal}
            onClose={() => setShowModal(!showModal)}
            size="lg"
            style={{ maxHeight: "90vh", overflow: "auto" }}
          >
            <CModalHeader closeButton>
              <CModalTitle>Add/Edit Treatments</CModalTitle>
            </CModalHeader>
            <CModalBody className="pb-0">
              <FieldArray
                name="treatments"
                render={(arrayHelpers) => (
                  <CRow>
                    <CCol>
                      <CCard>
                        <CCardHeader className="bg-gray-200">
                          <CRow>
                            <CCol className="font-xl text-dark">
                              Treatments
                            </CCol>
                            <CCol className="p-0 text-right mr-3">
                              <CButton
                                color="info"
                                className="roundBtn addBtn"
                                disabled={isDisabled}
                                onClick={() => {
                                  const temp = { ...treatmentRowObj };
                                  temp.name = "";
                                  temp.treatment = treatmentCount + 1;
                                  setTreatmentCount(treatmentCount + 1);
                                  arrayHelpers.push(temp);
                                }}
                              >
                                <CIcon content={freeSet.cilPlus} />
                              </CButton>
                            </CCol>
                          </CRow>
                        </CCardHeader>
                        <CCardBody>
                          <table>
                            <thead>
                              <tr>
                                {treatmentFields.map((field) => (
                                  <td
                                    className={
                                      field === "Treatment" ||
                                      field === "Action"
                                        ? "text-center"
                                        : ""
                                    }
                                  >
                                    {field}
                                  </td>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {values &&
                              values.treatments &&
                              values.treatments.length > 0
                                ? values.treatments.map((treatment, index) => (
                                    <tr>
                                      {/* <td className="text-center">
                                        {treatment.treatment}
                                      </td> */}
                                      <td>
                                        <CInput
                                          id={`treatmentName${index}`}
                                          name={`treatments.${index}.name`}
                                          placeholder="Treatment Name"
                                          value={treatment.name}
                                          onChange={handleChange}
                                          disabled={isDisabled}
                                          invalid={
                                            errors.treatments &&
                                            errors.treatments[index] &&
                                            touched.treatments &&
                                            touched.treatments[index] &&
                                            errors.treatments[index].name
                                              ? true
                                              : false
                                          }
                                          required
                                        />
                                      </td>
                                      <td>
                                        <CInput
                                          type="number"
                                          id={`treatmentSubjects${index}`}
                                          name={`treatments.${index}.noOfSubjects`}
                                          placeholder="No of Subjects"
                                          value={treatment.noOfSubjects}
                                          onChange={handleChange}
                                          invalid={
                                            errors.treatments &&
                                            touched.treatments &&
                                            errors.treatments[index] &&
                                            touched.treatments[index] &&
                                            errors.treatments[index]
                                              .noOfSubjects
                                              ? true
                                              : false
                                          }
                                          disabled={isDisabled}
                                          required
                                          min="1"
                                          max="100"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <CButton
                                          color="dark"
                                          className="roundBtn"
                                          disabled={
                                            values.treatments.length === 1 ||
                                            isDisabled
                                          }
                                          onClick={() => {
                                            arrayHelpers.remove(index);
                                          }}
                                        >
                                          <CIcon content={freeSet.cilMinus} />
                                        </CButton>
                                      </td>
                                    </tr>
                                  ))
                                : null}
                            </tbody>
                            {/* <tfoot>
                              {errors.treatments &&
                                errors.treatments.length > 0 && (
                                  <label className="mt-3 text-danger">
                                    Invalid Details.{" "}
                                  </label>
                                )}
                            </tfoot> */}
                          </table>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>
                )}
              ></FieldArray>
            </CModalBody>
            <CModalFooter>
              {" "}
              <CButton color="outline-danger" onClick={() => setShowModal(!showModal)}>
                Cancel
              </CButton>
              <CButton
                color="info"
                onClick={() => {
                  handleSubmit();
                }}
              >
                Assign Treatments
              </CButton>
            </CModalFooter>
          </CModal>
        )}
      </Formik>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4 className="m-0">Create Treatments and Subjects</h4>
            </CCardHeader>
            <CCardBody>
              <Formik
                enableReinitialize={true}
                initialValues={subjectData}
                key="subject-data"
                validationSchema={subjectSchema}
                onSubmit={async (values) => {
                  saveSubjects(values);
                }}
              >
                {({
                  values,
                  handleSubmit,
                  handleChange,
                  setFieldValue,
                  errors,
                  touched,
                }) => (
                  <>
                    <FieldArray
                      name="subjects"
                      render={(arrayHelpers) => (
                        <>
                          <CRow className="mt-20">
                            <CCol>
                              <CCard>
                                <CCardHeader className="bg-gray-200 font-xl text-dark">
                                  <CRow>
                                    <CCol sm="4" xs="4">
                                      Subjects
                                    </CCol>
                                    <CCol sm="8" xs="8" className="text-right">
                                      <CButton
                                        className="mr-10"
                                        color="info"
                                        disabled={
                                          treatments.length <= 1 || isDisabled
                                        }
                                        onClick={() => {
                                          randomizeTreatmentsForSubjects();
                                        }}
                                      >
                                        Randomize order
                                      </CButton>
                                      <CButton
                                        color="info"
                                        className="mr-10"
                                        disabled={
                                          treatments.length <= 1 || isDisabled
                                        }
                                        onClick={() => {
                                          randomizeTreatmentsForSubjects(true);
                                        }}
                                      >
                                        Linear order
                                      </CButton>
                                      <CButton
                                        color="info"
                                        className="roundBtn"
                                        disabled={isDisabled}
                                        onClick={() => {
                                          setShowModal(!showModal);
                                        }}
                                      >
                                        <CIcon content={freeSet.cilPencil} />
                                      </CButton>
                                    </CCol>
                                  </CRow>
                                </CCardHeader>
                                <CCardBody className="with-scroll">
                                  {subjectData.subjects.length === 0 && (
                                    <h4 className="text-center">
                                      No subjects added
                                    </h4>
                                  )}
                                  {subjectData.subjects.length > 0 && (
                                    <table>
                                      <thead>
                                        <tr>
                                          <td className="w-30">Subject ID</td>
                                          <td className="w-30">Treatment</td>
                                          <td className="w-30">Notes</td>
                                          <td className="text-center">
                                            Action
                                          </td>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {values.subjects.map(
                                          (subject, index) => (
                                            <tr>
                                              <td className="text-center">
                                                <CInput
                                                  id={`subjectName${index}`}
                                                  name={`subjects.${index}.name`}
                                                  placeholder="Subject Name"
                                                  value={subject.name}
                                                  onChange={handleChange}
                                                  disabled={isDisabled}
                                                  invalid={
                                                    errors.subjects &&
                                                    touched.subjects &&
                                                    errors.subjects[index] &&
                                                    touched.subjects[index] &&
                                                    errors.subjects[index].name
                                                      ? true
                                                      : false
                                                  }
                                                  required
                                                />
                                                {/* {subject.name} */}
                                              </td>
                                              <td>
                                                <CreatableSelect
                                                  custom
                                                  name={`subjects.${index}.currentTreatment`}
                                                  id={`subjects${index}`}
                                                  isDisabled={isDisabled}
                                                  value={treatments
                                                    .filter(
                                                      (treat) =>
                                                        treat.name ===
                                                        subject.currentTreatment
                                                    )
                                                    .map((e) => ({
                                                      label: e.name,
                                                      value: e.name,
                                                    }))}
                                                  onChange={(e, action) => {
                                                    setFieldValue(
                                                      `subjects.${index}.currentTreatment`,
                                                      e.value
                                                    );
                                                    if (
                                                      action.action ===
                                                      "create-option"
                                                    ) {
                                                      setTimeout(() => {
                                                        createExistingTreatments(
                                                          values.subjects
                                                        );
                                                      }, 500);
                                                    }
                                                  }}
                                                  options={treatments.map(
                                                    (treat) => ({
                                                      label: treat.name,
                                                      value: treat.name,
                                                    })
                                                  )}
                                                />
                                              </td>
                                              <td className="text-center">
                                                <CInput
                                                  id={`subjectNotes${index}`}
                                                  name={`subjects.${index}.notes`}
                                                  placeholder="Notes"
                                                  value={subject.notes}
                                                  onChange={handleChange}
                                                  disabled={isDisabled}
                                                  required
                                                />
                                              </td>
                                              <td className="text-center">
                                                <CButton
                                                  color="dark"
                                                  className="roundBtn"
                                                  disabled={isDisabled}
                                                  onClick={() => {
                                                    arrayHelpers.remove(index);
                                                  }}
                                                >
                                                  <CIcon
                                                    content={freeSet.cilMinus}
                                                  />
                                                </CButton>
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  )}
                                </CCardBody>
                                <CCardFooter>
                                  {errors &&
                                    errors.subjects &&
                                    errors.subjects.length > 0 && (
                                      <h className="text-danger my-1">
                                        Invalid Subject Name(s).{" "}
                                      </h>
                                    )}
                                </CCardFooter>
                              </CCard>
                            </CCol>
                          </CRow>
                        </>
                      )}
                    ></FieldArray>
                    <CRow className="mt-lg-3">
                      <CCol xs="12" className="text-right">
                        <CFormGroup
                          className="mb-sm-0 mb-lg-3">
                          <CButton
                            onClick={() => {
                              changeTab(2);
                            }}
                            className=""
                            color="dark"
                          >
                            Back
                          </CButton>
                          {!isDisabled && (
                            <>
                              <CButton
                                onClick={() => {
                                  _history.push("/experiments");
                                }}
                                className="ml-2"
                                color="outline-danger"
                              >
                                Cancel
                              </CButton>
                              <CButton
                                onClick={() => {
                                  console.log(errors);
                                  handleSubmit();
                                }}
                                disabled={values.subjects?.length <= 0}
                                className="ml-2"
                                color="info"
                              >
                                Save
                              </CButton>
                            </>
                          )}
                        </CFormGroup>
                      </CCol>
                    </CRow>
                  </>
                )}
              </Formik>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
}
