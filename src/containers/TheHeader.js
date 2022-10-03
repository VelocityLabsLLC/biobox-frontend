import { CHeader, CHeaderBrand, CHeaderNav, CToggler } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SIDEBAR } from 'src/_redux/actions/sidebar';
import { TheHeaderDropdownVelocity } from '.';

const logo = 'logo/logo.webp';

const TheHeader = () => {
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarReducer.sidebarShow);

  const toggleSidebar = () => {
    const val = [true, 'responsive'].includes(sidebarShow)
      ? false
      : 'responsive';
    dispatch(SIDEBAR(val));
  };

  const toggleSidebarMobile = () => {
    const val = [false, 'responsive'].includes(sidebarShow)
      ? true
      : 'responsive';
    dispatch(SIDEBAR(val));
  };

  const toggleFullScreen = () => {
    let elem = document.querySelector('html');
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <CHeader withSubheader className="bg-gray-600">
      {process.env.REACT_APP_ENV !== 'SLAVE' && (
        <>
          <CToggler
            inHeader
            className="ml-md-3 d-lg-none bg-gray-600"
            onClick={toggleSidebarMobile}
          />
          <CToggler
            inHeader
            className="ml-3 my-lg-2 d-md-down-none"
            onClick={toggleSidebar}
          />
        </>
      )}
      <CHeaderBrand className="mr-auto d-lg-none" to="/">
        {/* <CIcon name="logo" height="48" alt="Logo"/> */}
        <img src={logo} height="48" alt="Logo" />
      </CHeaderBrand>

      <CToggler inHeader className="ml-auto" onClick={() => toggleFullScreen()}>
        <span className="border-dark rounded p-2">
          <CIcon name="cil-fullscreen" alt="Fullscreen" />
        </span>
      </CToggler>
      {process.env.REACT_APP_ENV === 'CLOUD' && (
        <CHeaderNav className="px-2">
          <TheHeaderDropdownVelocity />
        </CHeaderNav>
      )}
      {/* <CHeaderNav className="d-md-down-none mr-auto">
        <CHeaderNavItem className="px-3" >
          <CHeaderNavLink to="/dashboard">Dashboard</CHeaderNavLink>
        </CHeaderNavItem>
        <CHeaderNavItem  className="px-3">
          <CHeaderNavLink to="/users">Users</CHeaderNavLink>
        </CHeaderNavItem>
        <CHeaderNavItem className="px-3">
          <CHeaderNavLink>Settings</CHeaderNavLink>
        </CHeaderNavItem>
      </CHeaderNav> */}

      {/* <CHeaderNav className="px-3">
        <TheHeaderDropdownNotif />
        <TheHeaderDropdownTasks />
        <TheHeaderDropdownMssg />
        <TheHeaderDropdown />
      </CHeaderNav> */}

      {/* <CSubheader className="px-3 justify-content-between">
        <CBreadcrumbRouter 
          className="border-0 c-subheader-nav m-0 px-0 px-md-3" 
          routes={routes} 
        />
          <div className="d-md-down-none mfe-2 c-subheader-nav">
            <CLink className="c-subheader-nav-link"href="#">
              <CIcon name="cil-speech" alt="Settings" />
            </CLink>
            <CLink 
              className="c-subheader-nav-link" 
              aria-current="page" 
              to="/dashboard"
            >
              <CIcon name="cil-graph" alt="Dashboard" />&nbsp;Dashboard
            </CLink>
            <CLink className="c-subheader-nav-link" href="#">
              <CIcon name="cil-settings" alt="Settings" />&nbsp;Settings
            </CLink>
          </div>
      </CSubheader> */}
    </CHeader>
  );
};

export default TheHeader;
