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
} from "@coreui/react";
import { FieldArray, Formik } from "formik";
import { find, each, cloneDeep } from "lodash";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputError, Loader } from "src/reusable";
import * as Yup from "yup";
import {
  getAllDevices,
  updateExperimentData,
} from "../../../services/AppService";
import "./DevicesDrop.scss";

const DevicesDrop = ({
  masterData,
  changeTab,
  experimentDetails,
  setExperimentDetails,
}) => {
  const [listdatacopy, setlistdatacopy] = useState([]);
  const deviceSchema = Yup.object().shape({
    devices: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required("Please select a device from the list"),
        })
      )
      .min(1),
  });

  const deviceObj = {
    id: "",
  };

  const initialValuesForDevice = {
    devices: [{ ...deviceObj }],
  };
  const [deviceData, setdeviceData] = useState({
    ...initialValuesForDevice,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isLoadingFor = {
    device: false,
  };
  const [devicesData, setDevicesData] = useState([]);

  const onSubmitform = async (values) => {
    setIsLoading(true);
    try {
      if (experimentDetails && experimentDetails.id) {
        setIsLoading(true);
        values.id = experimentDetails.id;
        await updateExperimentData({ ...values }, masterData);
      } else {
        setExperimentDetails({ ...experimentDetails, ...values });
      }
      changeTab(2);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceDetails = async () => {
    setIsLoading(true);
    isLoadingFor.devices = true;
    try {
      const data = await getAllDevices(masterData);
      const resp = data.data.data;
      const listdata = resp.map((e, i) => {
        return {
          label: `${e.name}-${e.macAddress}`,
          value: `${e.id}`,
        };
      });
      setDevicesData(listdata);
      setlistdatacopy(listdata);
      if (experimentDetails && !experimentDetails.id) {
        setdeviceData({ devices: [...resp] });
        removeSelectedOptions([...resp], listdata);
      } else {
        removeSelectedOptions([...experimentDetails.devices], listdata);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      isLoadingFor.devices = false;
      !isLoadingFor.devices &&
        !isLoadingFor.tags &&
        !isLoadingFor.experiment &&
        setIsLoading(false);
    }
  };

  const removeSelectedOptions = (seletedOptions, allOptions) => {
    const state = seletedOptions;
    each(state, (n, index) => {
      state[index] = { id: n.id };
    });
    let t = allOptions.map((elt) => {
      const i = state.findIndex((i) => i.id === elt.value);
      if (i === -1) return elt;
    });
    t = t.filter((element) => {
      return element !== undefined;
    });
    setlistdatacopy(t);
  };

  useEffect(() => {
    getDeviceDetails();
    if (experimentDetails && experimentDetails.devices) {
      setdeviceData({ devices: [...experimentDetails.devices] });
    }
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <Formik
        enableReinitialize={true}
        initialValues={deviceData}
        validationSchema={deviceSchema}
        key="device-data"
        onSubmit={onSubmitform}
      >
        {({ values, handleSubmit, setFieldValue, errors, touched }) => (
          <CRow>
            <CCol>
              <CCard>
                <CCardHeader>
                  <h4 className="m-0">Select Devices</h4>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <FieldArray
                      name="devices"
                      render={(arrayHelpers) => (
                        <CCol>
                          <CCard>
                            <CCardHeader className="bg-gray-200 ">
                              <CRow>
                                <CCol className="font-xl text-dark">
                                  Device
                                </CCol>
                                <CCol className="text-right">
                                  <CButton
                                    color="info"
                                    className="roundBtn addBtn"
                                    disabled={
                                      values.devices.length >=
                                      devicesData.length
                                    }
                                    onClick={() => {
                                      arrayHelpers.push({ ...deviceObj });
                                    }}
                                  >
                                    <CIcon content={freeSet.cilPlus} />
                                  </CButton>
                                </CCol>
                              </CRow>
                            </CCardHeader>
                            <CCardBody className="pb-sm-0 pb-lg-3">
                              <>
                                {values &&
                                values.devices &&
                                values.devices.length > 0
                                  ? values.devices.map((device, index) => (
                                      <CRow key={`devicesRow${index}`}>
                                        <CCol xs="10" sm="10" md="10" lg="11">
                                          <CFormGroup>
                                            <CLabel htmlFor={`device${index}`}>
                                              Device Name
                                            </CLabel>
                                            <Select
                                              custom
                                              className="devicedrop"
                                              name={`devices.${index}`}
                                              id={`device${index}`}
                                              value={devicesData.find(
                                                (e) => e.value === device.id
                                              )}
                                              onChange={(e) => {
                                                const state = values.devices;
                                                state[index] = { id: e.value };
                                                let t = devicesData.map(
                                                  (elt) => {
                                                    const i = state.findIndex(
                                                      (i) => i.id === elt.value
                                                    );
                                                    if (i === -1) return elt;
                                                  }
                                                );
                                                t = t.filter((element) => {
                                                  return element !== undefined;
                                                });
                                                setlistdatacopy(t);
                                                setFieldValue(
                                                  `devices.${index}.id`,
                                                  e.value
                                                );
                                              }}
                                              options={listdatacopy}
                                            />
                                            {errors.devices &&
                                              touched.devices &&
                                              errors.devices[index] &&
                                              touched.devices[index] && (
                                                <InputError
                                                  text={
                                                    errors.devices[index].id
                                                  }
                                                  touched={
                                                    touched.devices[index].id
                                                  }
                                                />
                                              )}
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
                                              values.devices.length === 1
                                            }
                                            onClick={() => {
                                              arrayHelpers.remove(index);
                                              const arr = cloneDeep(
                                                values.devices
                                              );
                                              arr.splice(index, 1);
                                              removeSelectedOptions(
                                                arr,
                                                devicesData
                                              );
                                            }}
                                          >
                                            <CIcon content={freeSet.cilMinus} />
                                          </CButton>
                                        </CCol>
                                      </CRow>
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
                      <CFormGroup
                        className="mb-sm-0 mb-lg-3">
                        <CButton
                          onClick={() => {
                            changeTab(0);
                          }}
                          className="mr-2"
                          color="dark"
                        >
                          Back
                        </CButton>
                        <CButton
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

export default DevicesDrop;
