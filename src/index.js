import axios from 'axios';
import 'core-js';
import React from 'react';
import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { icons } from './assets/icons';
import './polyfill';
import * as serviceWorker from './serviceWorker';
import { persistor, store } from './_redux/store';

require('dotenv').config();

React.icons = icons;

// if(localStorage.token) {
//   headers.Authorization = `Bearer ${localStorage.token}`;
// }

axios.interceptors.request.use((req) => {
  // console.log('INTERCEPTOR req ===>>> ',req);
  if (localStorage.token) {
    req.headers.Authorization = `Bearer ${localStorage.token}`;
  }
  return req;
});

axios.interceptors.response.use(
  (res) => {
    // console.log('INTERCEPTOR res ===>>> ', res);
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res;
  },
  (error) => {
    if (!error.response) {
      return error;
    }
    if (error.response.status === 403 || error.response.status === 455) {
      console.log('INTERCEPTOR 403');
      window.location = '/#/login';
    }
    throw error.response;
  },
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
