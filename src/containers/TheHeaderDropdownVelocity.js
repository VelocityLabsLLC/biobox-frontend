import React from 'react';
import {
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CProgress,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useHistory } from 'react-router';

const TheHeaderDropdownVelocity = () => {
  const _history = useHistory();
  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    _history.push('/login');
  };

  return (
    <CDropdown
      inNav
      className="c-header-nav-items mx-2 border-dark"
      direction="down"
    >
      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <CIcon name="cil-user" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem header tag="div" color="light" className="text-center">
          <strong>Settings</strong>
        </CDropdownItem>
        <CDropdownItem onClick={() => _history.push('/profile')}>
          <CIcon name="cil-user" className="mfe-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={() => _history.push('/changePassword')}>
          <CIcon name="cil-lock-locked" className="mfe-2" />
          Change Password
        </CDropdownItem>
        <CDropdownItem divider />
        <CDropdownItem onClick={() => logout()}>
          <CIcon name="cil-arrow-right" className="mfe-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};
export default TheHeaderDropdownVelocity;
