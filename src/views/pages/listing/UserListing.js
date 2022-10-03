import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CDataTable,
  CRow,
} from '@coreui/react';
import { getUsersList } from 'src/services/AppService';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from 'src/reusable';

export const UserListing = () => {
  const [userList, setUserList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const fields = ['name', 'email', 'role', 'subscription'];
  const getUser = async () => {
    try {
      setLoading(true);

      const res = await getUsersList();
      if (res.data) {
        console.log(res.data);
        setUserList(res.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.message ? error.message : error);
      setUserList([]);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      {isLoading && <Loader />}

      <div className="px-3">
        <h4>User List ({userList.length})</h4>

        <CCard className="px-0">
          <CCardBody className="p-0 border-top-0">
            {userList && userList.length ? (
              <CDataTable
                addTableClasses="m-0"
                items={userList}
                fields={fields}
                pagination={true}
                itemsPerPage={25}
                scopedSlots={{
                  userEmail: (rowData) => (
                    <td>
                      <span>{rowData.userEmail || '-'}</span>
                    </td>
                  ),
                  subscription: (rowData) => (
                    <td>
                      <span>
                        {rowData.subscription ? rowData.subscription : '-'}
                      </span>
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
export default UserListing;
