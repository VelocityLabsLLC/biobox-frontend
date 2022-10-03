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
  CTextarea,
} from '@coreui/react';
import { Formik } from 'formik';
import { uniqBy } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputError, Loader } from 'src/reusable';
import * as Yup from 'yup';
import {
  getLocalTags,
  getTags,
  setLocalTags,
  updateExperimentData,
} from '../../../services/AppService';

const CreateExperiment = ({
  masterData,
  changeTab,
  experimentDetails,
  setExperimentDetails,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tagList, setTagList] = useState([]);

  const experimentData = {
    name: '',
    notes: '',
    tags: [],
  };

  const [initialExperimentDetails, setInitialExperimentDetails] = useState(
    experimentDetails || experimentData,
  );

  const experimentDataSchema = Yup.object().shape({
    name: Yup.string().required('Experiment Name is required'),
  });

  const onSubmitform = async (values) => {
    try {
      if (values.tags && values.tags.length > 0) {
        setLocalTags(values.tags);
        const tagString = `,${values.tags.map((x) => x.value).join(',')},`;
        values.tags = tagString;
      }
      if (experimentDetails && experimentDetails.id) {
        const objToSave = { ...values };
        delete objToSave.devices;
        delete objToSave.protocol;
        delete objToSave.subjects;
        setIsLoading(true);
        await updateExperimentData(objToSave, masterData);
      } else {
        setExperimentDetails(values);
      }
      changeTab(1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTagsFromAPI = async () => {
    try {
      let data = await getTags(masterData);
      data.data = data.data.map((x) => {
        return { value: x, label: x };
      });
      const localTags = getLocalTags();
      data.data = uniqBy([...data.data, ...localTags], 'value');
      setTagList(data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getTagsFromAPI();
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <Formik
        enableReinitialize={true}
        initialValues={initialExperimentDetails}
        validationSchema={experimentDataSchema}
        key="exp-Data"
        onSubmit={(values) => {
          onSubmitform(values);
        }}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          errors,
          touched,
          setFieldValue,
        }) => (
          <CRow>
            <CCol>
              <CCard>
                <CCardHeader>
                  <h4 className="m-0">Set up Experiment</h4>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="expname">
                          Experiment Name{' '}
                          <label className="text-danger">*</label>
                        </CLabel>
                        <CInput
                          id="expname"
                          name="name"
                          placeholder="Experiment Name"
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
                        <CLabel htmlFor="tags">Tags</CLabel>
                        <CreatableSelect
                          isClearable
                          id="tags"
                          isMulti
                          placeholder="Select or Create Tags"
                          value={values.tags}
                          onChange={(e) => {
                            setFieldValue('tags', e);
                          }}
                          options={tagList}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="notesField">Notes</CLabel>
                        <CTextarea
                          name="notes"
                          id="notesField"
                          rows="5"
                          placeholder="Notes"
                          value={values?.notes}
                          onChange={handleChange}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow className="mt-lg-4">
                    <CCol xs="12" className="text-right">
                      <CFormGroup className="mb-sm-0 mb-lg-3">
                        {/* <CButton
                          type="button"
                          onClick={() => {
                            handleSubmit();
                          }}
                          className="mr-2"
                          color="info"
                        >
                          {" "}
                          Save
                        </CButton> */}

                        <CButton
                          type="button"
                          onClick={() => {
                            handleSubmit();
                          }}
                          color="info"
                        >
                          Next
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
    </div>
  );
};
export default CreateExperiment;
