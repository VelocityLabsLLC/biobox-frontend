import {
  CBreadcrumb,
  CBreadcrumbItem,
  CBreadcrumbRouter,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CLink,
  CRow,
} from '@coreui/react';
import React from 'react';
import routes from '../../../routes';

const Breadcrumbs = () => {
  return (
    <CRow>
      <CCol xs="12">
        <CCard>
          <CCardHeader>Bootstrap Breadcrumbs</CCardHeader>
          <CCardBody>
            <h6>CBreadcrumbRouter wrapper component</h6>
            <CBreadcrumbRouter routes={routes} />
            <h6>Manual</h6>
            <CBreadcrumb>
              <CBreadcrumbItem>
                <CLink>Home</CLink>
              </CBreadcrumbItem>
              <CBreadcrumbItem active>Library</CBreadcrumbItem>
            </CBreadcrumb>
            <CBreadcrumb>
              <CBreadcrumbItem>
                <CLink>Home</CLink>
              </CBreadcrumbItem>
              <CBreadcrumbItem>
                <CLink>Library</CLink>
              </CBreadcrumbItem>
              <CBreadcrumbItem active>Data</CBreadcrumbItem>
            </CBreadcrumb>
            <CBreadcrumb>
              <CBreadcrumbItem>
                <CLink>Home</CLink>
              </CBreadcrumbItem>
              <CBreadcrumbItem>
                <CLink>Library</CLink>
              </CBreadcrumbItem>
              <CBreadcrumbItem>
                <CLink>Data</CLink>
              </CBreadcrumbItem>
              <CBreadcrumbItem active>
                <span>Bootstrap</span>
              </CBreadcrumbItem>
            </CBreadcrumb>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Breadcrumbs;
