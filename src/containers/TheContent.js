import { CContainer } from '@coreui/react';
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
import React, { Suspense } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import ProtectedRoute from 'src/protectedRoute';
// routes config
import routes from '../routes';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

const TheContent = () => {
  // note: useState gives error for too many rerenders hence using let.
  let availableRoutes = [];
  if (process.env.REACT_APP_ENV === 'CLOUD') {
    const ud = JSON.parse(localStorage.getItem('userDetail'));
    if (!ud) {
      window.location = '/#/login';
    }
    if (ud && (ud.role === 'admin' || ud.role === 'Admin')) {
      availableRoutes = [...routes.routesCommon, ...routes.routesAdmin];
    } else if (ud && ud.role === 'user') {
      availableRoutes = [...routes.routesCommon, ...routes.routesUser];
    }

    availableRoutes = [...availableRoutes, ...routes.routesMisc];
  } else if (process.env.REACT_APP_ENV === 'SLAVE') {
    availableRoutes = [...routes.routesSlave];
  } else {
    availableRoutes = [...routes.routesCommon, ...routes.routesUser];
  }

  return (
    <main className="c-main">
      {process.env.REACT_APP_ENV === 'CLOUD' ? (
        // <Elements stripe={loadStripe(process.env.REACT_APP_STRIPE_PUBLISH_KEY)}>
        <CContainer fluid>
          <Suspense fallback={loading}>
            <Switch>
              {availableRoutes.length > 0 &&
                availableRoutes.map((route, idx) => {
                  return (
                    route.component && (
                      <ProtectedRoute
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        // render={props => (
                        //   <CFade>
                        //     <route.component {...props} />
                        //   </CFade>
                        // )}
                        component={route.component}
                      />
                    )
                  );
                })}
              {/* <Redirect from="/" to="/dashboard" /> */}
              {localStorage.token ? (
                <Redirect from="/" to="/dashboard" />
              ) : (
                <Redirect from="/" to="/login" />
              )}
            </Switch>
          </Suspense>
        </CContainer>
      ) : (
        // </Elements>
        <CContainer fluid>
          <Suspense fallback={loading}>
            <Switch>
              {availableRoutes.length > 0 &&
                availableRoutes.map((route, idx) => {
                  return (
                    route.component && (
                      <ProtectedRoute
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        // render={props => (
                        //   <CFade>
                        //     <route.component {...props} />
                        //   </CFade>
                        // )}
                        component={route.component}
                      />
                    )
                  );
                })}
              {/* <Redirect from="/" to="/dashboard" /> */}
              <Redirect from="/" to="/dashboard" />
            </Switch>
          </Suspense>
        </CContainer>
      )}
    </main>
  );
};

export default React.memo(TheContent);
