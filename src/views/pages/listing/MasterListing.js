import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CDataTable,
  CRow,
} from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from 'src/reusable';
import { getMasterboxList } from 'src/services/AppService';

export const MasterListing = () => {
  const _history = useHistory();
  const [masterList, setMasterList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const fields = ['name', 'connectionStatus', 'macAddress', 'assignedToUser'];
  const getMasterboxes = async () => {
    try {
      setLoading(true);

      const res = await getMasterboxList();
      if (res.data && res.data.data) {
        setMasterList(res.data.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message ? error.message : error);
      setMasterList([]);
    }
  };

  useEffect(() => {
    getMasterboxes();
  }, []);

  return (
    <>
      {isLoading && <Loader />}

      <div className="px-3">
        <CRow className="m-2 justify-content-between">
          <h4>Master Devices ({masterList.length})</h4>
          <div>
            <CButton
              className=""
              type="button"
              onClick={() => {
                _history.push('/create-master');
              }}
              color="info"
            >
              Add Master
            </CButton>
          </div>
        </CRow>

        <CCard className="px-0">
          <CCardBody className="p-0 border-top-0">
            {masterList && masterList.length ? (
              <CDataTable
                addTableClasses="m-0"
                items={masterList}
                fields={fields}
                scopedSlots={{
                  name: (rowData) => (
                    <td>
                      <span>{rowData.name || '-'}</span>
                    </td>
                  ),
                  connectionStatus: (rowData) => (
                    <td>
                      <span>{rowData.eventType || 'disconnected'}</span>
                    </td>
                  ),
                  assignedToUser: (rowData) => (
                    <td>
                      <span>{rowData.userEmail || '-'}</span>
                    </td>
                  ),
                }}
              ></CDataTable>
            ) : (
              <div className="p-4 text-center">No data found</div>
            )}
          </CCardBody>
        </CCard>
      </div>
    </>
  );
};
export default MasterListing;
