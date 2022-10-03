import React from 'react';
import { useSelector } from 'react-redux';

const SelectedMater = () => {
  const masterData = useSelector((store) => store.dataReducer.data);

  return (
    <>
      {process.env.REACT_APP_ENV === 'CLOUD' && masterData && (
        <h5 className="px-3">
          Selected Master:{' '}
          <span className="border rounded py-1 px-2">
            <span
              className={
                masterData?.value?.eventType === 'connected'
                  ? 'connected-dot'
                  : 'disconnected-dot'
              }
            ></span>
            {masterData?.value?.name
              ? masterData?.value?.name + ' - ' + masterData?.value?.macAddress
              : masterData?.value?.macAddress}
          </span>
        </h5>
      )}
    </>
  );
};

export default SelectedMater;
