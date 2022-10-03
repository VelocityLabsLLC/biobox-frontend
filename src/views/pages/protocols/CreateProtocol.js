import { freeSet } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
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
} from '@coreui/react';
import { FieldArray, Formik } from 'formik';
import { find, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import { InputError, Loader } from '../../../reusable';
import {
  createNewProtocol,
  getAllProtocols,
  getLocalTags,
  getTags,
  parseTags,
  setLocalTags,
} from '../../../services/AppService';
import './CreateProtocol.scss';

const CreateProtocol = ({
  masterData,
  changeTab,
  experimentDetails,
  setExperimentDetails,
}) => {
  const _location = useLocation();
  const [tagList, setTagList] = useState([]);

  const [isDisabled, setDisabled] = useState(
    _location.pathname.indexOf('editExperimentWizard') > -1 ? true : false,
  );

  const [selectedProtocolOption, setSelectedProtocolOption] = useState(null);

  //Select clear implementation

  const CustomClearText = () => 'clear';
  const ClearIndicator = (props) => {
    const {
      children = <CustomClearText />,
      getStyles,
      innerProps: { ref, ...restInnerProps },
    } = props;
    return (
      <div
        {...restInnerProps}
        ref={ref}
        style={getStyles('clearIndicator', props)}
      >
        <div style={{ padding: '0px 5px', color: 'grey' }}>{children}</div>
      </div>
    );
  };

  //

  const protocolSelected = (selectedOption) => {
    setSelectedProtocolOption(selectedOption);
    if (selectedOption) {
      experimentDetails.protocol = {
        id: selectedOption.value,
      };
      const protocol = find(protocolsList, { id: selectedOption.value });
      setProtocolData({ ...protocol });
      setExperimentDetails({ ...experimentDetails });
      setDisabled(true);
    } else {
      experimentDetails.protocol = null;
      setProtocolData({ ...initialValuesForProtocol });
      setExperimentDetails({ ...experimentDetails });
      setDisabled(false);
    }
    // console.log(`Option selected:`, selectedOption);
  };

  const protocolSchema = Yup.object().shape({
    name: Yup.string().required('Protocol Name is required'),
    samplingFrequency: Yup.number()
      .min(1, 'Sampling frequency must be between 1 ~ 100')
      .max(100, 'Sampling frequency must be between 1 ~ 100')
      .required('Sampling frequency must be between 1 ~ 100'),
    trialDuration: Yup.number()
      .min(1, 'Trial Duration must be between 1 ~ 20 minutes')
      .max(20, 'Trial Duration must be between 1 ~ 20 minutes')
      .required('Trial Duration must be between 1 ~ 20 minutes'),

    // subjects: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       name: Yup.string().required("Please enter Subject name"),
    //       // tags: Yup.string().required("Please select a Tag"),
    //     })
    //   )
    //   .min(1),
    phases: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required('Please enter Phase name'),
          startAt: Yup.number()
            .required('Please enter Starting minute of phase')
            .min(0, 'Starting minute must be greater than equal to 0'),
          endAt: Yup.number()
            .required('Please enter Ending Minute of phase')
            .min(1, 'Ending minute must be greater than 0'),
        }),
      )
      .min(1),
  });

  // const subjectObj = {
  //   name: 1,
  //   tags: "",
  // };

  const phaseObj = {
    name: 'Phase 1',
    startAt: 0,
    endAt: 10,
  };

  const initialValuesForProtocol = {
    name: '',
    trialDuration: 10,
    samplingFrequency: 10,
    tags: [],
    phases: [{ ...phaseObj }],
  };
  const [protocolData, setProtocolData] = useState({
    ...initialValuesForProtocol,
  });
  const [countphase, setcountphase] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [protocolsOptionsList, setProtocolsOptionsList] = useState([]);
  const [protocolsList, setProtocolsList] = useState([]);

  const phaseCount = () => {
    setcountphase(countphase + 1);
  };

  const onSubmitform = async (values) => {
    if (
      isDisabled &&
      _location.pathname.indexOf('createExperimentWizard') === -1
    ) {
      changeTab(3);
      return;
    }
    setIsLoading(true);
    try {
      if (!experimentDetails.protocol) {
        if (values.tags && values.tags.length > 0) {
          setLocalTags(values.tags);
          const tagString = `,${values.tags.map((x) => x.value).join(',')},`;
          values.tags = tagString;
        } else {
          delete values.tags;
        }
        const protocolResp = await createNewProtocol(values, masterData);
        experimentDetails.protocol = { id: protocolResp.data.id };
      }
      setExperimentDetails({ ...experimentDetails });
      // await updateExperimentData(experimentDetails);
      // toast.success("Experiment Updated Successfully");
      changeTab(3);
    } catch (error) {
      toast.error(error.message || error.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getProtocolDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProtocols(masterData);
      const resp = data.data.data || data.data;
      setProtocolsList([...resp]);
      const protocolListData = resp.map((e, i) => {
        return {
          label: `${e.name || e.label}`,
          value: `${e.id || e.value}`,
          isdisabled: false,
        };
      });
      setProtocolsOptionsList(protocolListData);
      console.log(protocolListData);
      if (
        experimentDetails &&
        experimentDetails.protocol &&
        experimentDetails.protocol.id
      ) {
        const selectedProtocol = find(resp, {
          id: experimentDetails.protocol.id,
        });
        setSelectedProtocolOption({
          label: selectedProtocol.name,
          value: selectedProtocol.id,
          isdisabled: false,
        });
        if (selectedProtocol.tags) {
          selectedProtocol.tags = parseTags(selectedProtocol.tags);
        }
        setProtocolData(selectedProtocol);
        console.log(selectedProtocol);
      }
    } catch (error) {
      console.log(error, '&&&&&&&&&&&&&&&&');
    } finally {
      setIsLoading(false);
    }
    getTagsFromAPI();
  };

  const [phaseError, setPhaseError] = useState(false);

  const checkPhaseTimingValidity = async (values) => {
    // ! check the timing and duration criteria for phases
    let total = 0;
    let isvalid = []; //false;
    let td = parseInt(values.trialDuration);
    await values.phases.forEach((element, index) => {
      let esa = parseInt(element.startAt);
      let eea = parseInt(element.endAt);
      // let lea = parseInt(values.phases[values.phases.length - 1].endAt);
      if (isvalid.includes((x) => x.startAt === esa) || eea - esa === 0) {
        isvalid.push({ startAt: esa, valid: false });
      } else {
        total = total + eea - esa;
        if (index === values.phases.length - 1 ? total == td : true) {
          isvalid.push({ startAt: esa, valid: true });
        } else {
          isvalid.push({ startAt: esa, valid: false });
        }
      }
      // console.log('esa', esa);
      // console.log('eea', eea);
      // console.log('lea', lea);
      // console.log('total', total);
      // if (
      //   esa < eea &&
      //   (index > 0 ? parseInt(values.phases[index - 1].endAt) == esa : true) &&
      //   lea == td &&
      //   (index === values.phases.length - 1 ? total == td : true)
      // ) {
      //   isvalid.push(true);
      // } else {
      //   isvalid.push(false);
      // }
    });
    setPhaseError(
      isvalid.findIndex((x) => x.valid === false) > -1 ? true : false,
    );
    console.log(isvalid);
    return isvalid.findIndex((x) => x.valid === false) > -1 ? false : true;
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
    // getExperimentDetails();
    // getAllTags();
    getProtocolDetails();
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <Formik
        enableReinitialize={true}
        initialValues={protocolData}
        validationSchema={protocolSchema}
        key="protocols-data"
        onSubmit={async (values) => {
          const validPhase = await checkPhaseTimingValidity(values);
          if (validPhase) {
            onSubmitform(values);
          }
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
          <CRow>
            <CCol>
              <CCard>
                <CCardHeader>
                  <h4 className="m-0">Select a Protocol</h4>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs="12">
                      <CLabel htmlFor="Protocol">Select Protocol</CLabel>
                      <Select
                        value={selectedProtocolOption}
                        components={{ ClearIndicator }}
                        isClearable={true}
                        placeholder="Select Protocol"
                        onChange={protocolSelected}
                        options={protocolsOptionsList}
                        isDisabled={
                          isDisabled &&
                          _location.pathname.indexOf(
                            'createExperimentWizard',
                          ) === -1
                        }
                      />
                    </CCol>
                  </CRow>
                  <div className="separator">Or Create New Protocol</div>
                  <CRow>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="name">Protocol Name</CLabel>
                        <CInput
                          id="name"
                          name="name"
                          placeholder="Protocol Name"
                          required
                          value={values?.name}
                          onChange={handleChange}
                          invalid={errors.name}
                          disabled={isDisabled}
                        />
                        <InputError text={errors.name} touched={touched.name} />
                      </CFormGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol xs="6" sm="6" md="6" lg="6">
                      <CFormGroup>
                        <CLabel htmlFor="trialDuration">
                          Trial Duration (minutes)
                        </CLabel>
                        <CInput
                          id="trialDuration"
                          name="trialDuration"
                          type="number"
                          placeholder="Trial Duration"
                          value={values?.trialDuration}
                          onChange={(e) => {
                            setFieldValue('trialDuration', e.target.value);
                            values.phases[values.phases.length - 1].endAt =
                              e.target.value;
                          }}
                          disabled={isDisabled}
                          required
                        />
                        <InputError
                          text={errors.trialDuration}
                          touched={touched.trialDuration}
                        />
                      </CFormGroup>
                    </CCol>
                    <CCol xs="6" sm="6" md="6" lg="6">
                      <CFormGroup>
                        <CLabel htmlFor="samplingFrequency">
                          Sampling Frequency (Hz)
                        </CLabel>
                        <CInput
                          id="samplingFrequency"
                          name="samplingFrequency"
                          type="number"
                          placeholder="Sampling Frequency"
                          value={values?.samplingFrequency}
                          onChange={handleChange}
                          disabled={isDisabled}
                          required
                        />
                        <InputError
                          text={errors.samplingFrequency}
                          touched={touched.samplingFrequency}
                        />
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
                          value={values.tags}
                          onChange={(e) => {
                            setFieldValue('tags', e);
                          }}
                          placeholder="Select or Create Tags"
                          options={tagList}
                          isDisabled={isDisabled}
                        />
                      </CFormGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <FieldArray
                      name="phases"
                      render={(arrayHelpers) => (
                        <CCol>
                          <CCard>
                            <CCardHeader className="bg-gray-200">
                              <CRow>
                                <CCol className="font-xl text-dark">
                                  Phases
                                </CCol>
                                <CCol className="text-right">
                                  <CButton
                                    color="info"
                                    className="roundBtn addBtn"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      phaseCount();
                                      const items1 = {
                                        ...phaseObj,
                                        startAt:
                                          values.phases[
                                            values.phases.length - 1
                                          ].endAt,
                                        endAt: values.trialDuration,
                                      };
                                      items1.name = `Phase ${countphase + 1}`;
                                      arrayHelpers.push(items1);
                                    }}
                                  >
                                    <CIcon content={freeSet.cilPlus} />
                                  </CButton>
                                </CCol>
                              </CRow>
                            </CCardHeader>
                            <CCardBody>
                              <>
                                {phaseError && (
                                  <CRow>
                                    <CCol xs="12 text-danger">
                                      Total duration of all phases does not
                                      match the Trial Duration (minutes) / Start
                                      and End time of a phase cannot be same.
                                    </CCol>
                                  </CRow>
                                )}
                                {values &&
                                values.phases &&
                                values.phases.length > 0
                                  ? values.phases.map((phase, index) => (
                                      <>
                                        <CRow key={`phasesRow${index}`}>
                                          <CCol xs="10" sm="10" md="10" lg="11">
                                            <CFormGroup>
                                              <CRow>
                                                <CCol>
                                                  <CLabel
                                                    htmlFor={`phaseName${index}`}
                                                  >
                                                    Phase Name
                                                  </CLabel>
                                                  <CInput
                                                    id={`phaseName${index}`}
                                                    name={`phases.${index}.name`}
                                                    placeholder="Phase Name"
                                                    value={phase.name}
                                                    disabled={isDisabled}
                                                    onChange={(e) =>
                                                      setFieldValue(
                                                        `phases.${index}.name`,
                                                        e.target.value,
                                                      )
                                                    }
                                                    required
                                                  />
                                                  {errors.phases &&
                                                    touched.phases &&
                                                    errors.phases[index] &&
                                                    touched.phases[index] && (
                                                      <InputError
                                                        text={
                                                          errors.phases[index]
                                                            .name
                                                        }
                                                        touched={
                                                          touched.phases[index]
                                                            .name
                                                        }
                                                      />
                                                    )}
                                                </CCol>
                                              </CRow>
                                              <CRow className="mt-2">
                                                <CCol
                                                  xs="6"
                                                  sm="6"
                                                  md="6"
                                                  lg="6"
                                                >
                                                  <CLabel
                                                    htmlFor={`phaseStart${index}`}
                                                  >
                                                    Start at (minutes)
                                                  </CLabel>
                                                  <CInput
                                                    id={`phaseStart${index}`}
                                                    name={`phases.${index}.startAt`}
                                                    type="number"
                                                    placeholder="start"
                                                    value={phase.startAt}
                                                    disabled={isDisabled}
                                                    onChange={(e) => {
                                                      setPhaseError(false);
                                                      setFieldValue(
                                                        `phases.${index}.startAt`,
                                                        e.target.value,
                                                      );
                                                      if (index > 0) {
                                                        setFieldValue(
                                                          `phases.${
                                                            index - 1
                                                          }.endAt`,
                                                          e.target.value,
                                                        );
                                                      }
                                                    }}
                                                    required
                                                  />
                                                  {errors.phases &&
                                                    touched.phases &&
                                                    errors.phases[index] &&
                                                    touched.phases[index] && (
                                                      <InputError
                                                        text={
                                                          errors.phases[index]
                                                            .startAt
                                                        }
                                                        touched={
                                                          touched.phases[index]
                                                            .startAt
                                                        }
                                                      />
                                                    )}
                                                </CCol>
                                                <CCol>
                                                  <CLabel
                                                    htmlFor={`phaseEnd${index}`}
                                                  >
                                                    End at (minutes)
                                                  </CLabel>
                                                  <CInput
                                                    id={`phaseEnd${index}`}
                                                    name={`phases.${index}.endAt`}
                                                    type="number"
                                                    placeholder="End"
                                                    value={phase.endAt}
                                                    disabled={isDisabled}
                                                    onChange={(e) => {
                                                      setPhaseError(false);
                                                      setFieldValue(
                                                        `phases.${index}.endAt`,
                                                        e.target.value,
                                                      );
                                                      if (
                                                        index + 1 <
                                                        values.phases.length
                                                      ) {
                                                        setFieldValue(
                                                          `phases.${
                                                            index + 1
                                                          }.startAt`,
                                                          e.target.value,
                                                        );
                                                      }
                                                    }}
                                                    required
                                                  />
                                                  {errors.phases &&
                                                    touched.phases &&
                                                    errors.phases[index] &&
                                                    touched.phases[index] && (
                                                      <InputError
                                                        text={
                                                          errors.phases[index]
                                                            .endAt
                                                        }
                                                        touched={
                                                          touched.phases[index]
                                                            .endAt
                                                        }
                                                      />
                                                    )}
                                                </CCol>
                                              </CRow>
                                            </CFormGroup>
                                          </CCol>
                                          <CCol
                                            xs="2"
                                            sm="2"
                                            md="2"
                                            lg="1"
                                            className="remove-container"
                                          >
                                            <CButton
                                              color="dark"
                                              className="roundBtn addBtn"
                                              disabled={
                                                values.phases.length === 1 ||
                                                isDisabled
                                              }
                                              onClick={() => {
                                                console.log(index);
                                                arrayHelpers.remove(index);
                                              }}
                                            >
                                              <CIcon
                                                content={freeSet.cilMinus}
                                              />
                                            </CButton>
                                          </CCol>
                                        </CRow>
                                        {values.phases.length - 1 !== index ? (
                                          <hr></hr>
                                        ) : null}
                                      </>
                                    ))
                                  : null}
                              </>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      )}
                    ></FieldArray>
                  </CRow>
                  <CRow className="mt-lg-3">
                    <CCol xs="12" className="text-right">
                      <CFormGroup className="mb-sm-0 mb-lg-3">
                        <CButton
                          onClick={() => {
                            changeTab(1);
                          }}
                          className=""
                          color="dark"
                        >
                          Back
                        </CButton>
                        <CButton
                          onClick={() => {
                            handleSubmit();
                          }}
                          className="ml-2"
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

export default CreateProtocol;
