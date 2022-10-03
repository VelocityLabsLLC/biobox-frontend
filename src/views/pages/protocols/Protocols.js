import { freeSet } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow
} from "@coreui/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "src/reusable/index";
import { getAllProtocols } from "../../../services/AppService"; // todo : update API

const Protocols = () => {
  const _history = useHistory();
  const master = useSelector((store) => store.dataReducer.data);

  const fields = ["name", "trialDuration", "phases", "devices", "action"];

  const [protocolData, setProtocolData] = useState([]);
  const [protocolCount, setProtocolCount] = useState(0);
  const [isLoading, setLoading] = useState(true);

  const getAllProtocolsData = async () => {
    try {
      const data = await getAllProtocols(master); // todo: update API
      console.log(data.data.data);
      if (data && data.data) {
        setProtocolData(data.data.data);
        setProtocolCount(data.data.count);
        setLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProtocolsData();
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol sm="8">
              <h4 className="m-0">Protocols ({protocolCount})</h4>
            </CCol>
            {/* <CCol sm="4" className="text-right">
              <CButton
                color="info"
                className="rounded"
                onClick={() => _history.push("/createProtocol")}
              >
                Create New
              </CButton>
            </CCol> */}
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol>
              <CDataTable
                items={protocolData}
                fields={fields}
                striped
                hover
                itemsPerPage={10}
                pagination
                scopedSlots={{
                  phases: (protocolData) => (
                    <td>
                      <span>{protocolData?.phases?.length}</span>
                    </td>
                  ),
                  devices: (protocolData) => (
                    <td>
                      <span>{protocolData?.devices?.length}</span>
                    </td>
                  ),
                  action: (protocolData) => (
                    <td>
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => {
                          //setSelectedExperiment(item);
                          // _history.push(`/trials/${id.id}/${id.name}`);
                        }}
                      >
                        <CIcon content={freeSet.cilInfo} />
                      </CButton>
                    </td>
                  ),
                }}
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};
export default Protocols;
