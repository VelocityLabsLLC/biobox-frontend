import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarMinimizer,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavDropdown,
  CSidebarNavItem,
  CSidebarNavTitle,
} from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMasters } from '../services/AppService';
import { SIDEBAR } from 'src/_redux/actions/sidebar';
// sidebar nav config
import navigation from './_nav';
import { useHistory } from 'react-router';

// logo path // todo: try taking from /assets instead of /public
const logo = 'logo/logo.webp';
const logoMinimized = 'logo/logo-minimized.webp';

const TheSidebar = () => {
  const dispatch = useDispatch();
  const _history = useHistory();
  const show = useSelector((state) => state.sidebarReducer.sidebarShow);
  const [masterData, setMasterData] = useState();
  const ud = JSON.parse(localStorage.getItem('userDetail'));

  const getSidebarOptions = () => {
    if (process.env.REACT_APP_ENV === 'LOCAL') {
      return navigation.concat({
        _tag: 'CSidebarNavItem',
        name: 'Settings',
        to: '/settings',
        icon: 'cil-settings',
      });
    } else {
      //   {
      //   _tag: "CSidebarNavItem",
      //   name: "Plans",
      //   to: "/plans",
      //   icon: "cil-dollar"
      // },
      const nListAdmin = [
        {
          _tag: 'CSidebarNavItem',
          name: 'Master Boxes',
          to: '/master-list',
          icon: 'cil-laptop',
        },
        {
          _tag: 'CSidebarNavItem',
          name: 'Users',
          to: '/user-list',
          icon: 'cil-user',
        },
      ];
      // const nListOthers = [
      //   {
      //     _tag: 'CSidebarNavItem',
      //     name: 'Change Password',
      //     to: '/changePassword',
      //     icon: 'cil-lock-locked',
      //   },
      //   {
      //     _tag: 'CSidebarNavItem',
      //     name: 'Logout',
      //     to: '/login',
      //     icon: 'cil-lock-locked',
      //   },
      // ];
      if (ud?.role == 'admin' || ud?.role == 'Admin') {
        return nListAdmin;
      } else {
        // return navigation.concat(nListOthers);
        return navigation;
      }
    }
  };

  const getMaster = async () => {
    if (process.env.REACT_APP_ENV === 'LOCAL') {
      const master = await getAllMasters();
      if (
        master &&
        master.data &&
        master.data.data &&
        master.data.data.length
      ) {
        setMasterData(master.data.data[0]);
      }
    }
  };

  useEffect(() => {
    getMaster();
  }, []);

  return (
    <>
      {process.env.REACT_APP_ENV !== 'SLAVE' && (
        <CSidebar show={show} onShowChange={(val) => dispatch(SIDEBAR(val))}>
          <CSidebarBrand className="d-md-down-none" to="/">
            {/* <CIcon
        className="c-sidebar-brand-full"
        name="logo-negative"
        height={35}
      />
      <CIcon
        className="c-sidebar-brand-minimized"
        name="sygnet"
        height={35}
      /> */}
            <img src={logo} className="c-sidebar-brand-full" width={'90%'} />
            <img
              src={logoMinimized}
              className="c-sidebar-brand-minimized"
              width={'100%'}
            />
          </CSidebarBrand>
          {process.env.REACT_APP_ENV === 'LOCAL' && masterData && (
            <div
              className="m-2 text-center c-sidebar-brand-full cursor-pointer"
              onClick={() => _history.push('/settings')}
            >
              {masterData.name
                ? masterData.name + ' - ' + masterData.macAddress
                : masterData.macAddress}
            </div>
          )}
          <CSidebarNav>
            <CCreateElement
              items={getSidebarOptions(navigation)}
              components={{
                CSidebarNavDivider,
                CSidebarNavDropdown,
                CSidebarNavItem,
                CSidebarNavTitle,
              }}
            />
          </CSidebarNav>
          <CSidebarMinimizer className="c-d-md-down-none" />
        </CSidebar>
      )}
    </>
  );
};

export default React.memo(TheSidebar);
