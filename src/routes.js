import React from 'react';

// For BioBox start

//Settings
const Settings = React.lazy(() => import('./views/pages/settings/Settings'));

const Plans = React.lazy(() => import('./views/pages/stripe/Plans'));

// Experiments
const Experiments = React.lazy(() =>
  import('./views/pages/experiments/Experiments'),
);

const ExperimentDetails = React.lazy(() =>
  import('./views/pages/experiments/ExperimentDetails'),
);

const Steps = React.lazy(() => import('./views/pages/steps/Steps'));
const Slave = React.lazy(() => import('./views/pages/slave/Slave'));

// Trials
const Trials = React.lazy(() => import('./views/pages/trials/Trials'));
const Createtrial = React.lazy(() =>
  import('./views/pages/trials/CreateTrial'),
);

//subject and devices data show
const SubjectData = React.lazy(() =>
  import('./views/pages/SUBJECT-DATA/SubjectData'),
);
const SubjectGraph = React.lazy(() =>
  import('./views/pages/SUBJECT-DATA/SubjectGraph'),
);

// Devices
const Devices = React.lazy(() => import('./views/pages/devices/Devices'));
const EditDevice = React.lazy(() => import('./views/pages/devices/EditDevice'));

// Extras
const LiveData = React.lazy(() => import('./views/pages/livedata/LiveData'));
const ChangePassword = React.lazy(() =>
  import('./views/pages/password/ChangePassword'),
);
const Profile = React.lazy(() => import('./views/pages/profile/Profile'));

// Listing
const UserListing = React.lazy(() =>
  import('./views/pages/listing/UserListing'),
);
const MasterListing = React.lazy(() =>
  import('./views/pages/listing/MasterListing'),
);
const CreateMaster = React.lazy(() =>
  import('./views/pages/master/CreateMaster'),
);

// For BioBox end

const routesCommon = [
  {
    path: '/changePassword',
    name: 'Change Password',
    component: ChangePassword,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
];
const routesUser = [
  { path: '/dashboard', name: 'Live Data', component: LiveData },

  // Experiments
  { path: '/experiments', name: 'Experiments', component: Experiments },
  {
    path: '/createExperimentWizard/:masterMac?',
    name: 'Create Experiment Wizard',
    component: Steps,
  },
  {
    path: '/editExperimentWizard/:id',
    name: 'Edit Experiment Wizard',
    component: Steps,
  },
  {
    path: '/experimentDetails/:id/:name',
    name: 'Experiment Details',
    component: ExperimentDetails,
  },
  // Subject Data
  {
    path: '/subjectData/:trialid?/:deviceid?',
    name: 'Subject Data',
    component: SubjectData,
  },
  {
    path: '/subjectGraph/:trialid?/:deviceid?/:subjectid?',
    name: 'Subject Graph',
    component: SubjectGraph,
  },
  // Trials
  { path: '/trials/:id?/:name?', name: 'Trials', component: Trials },
  {
    path: '/createTrial/:experimentId?',
    name: 'Create Trial',
    component: Createtrial,
  },
  { path: '/editTrial/:id', name: 'Edit Trial', component: Createtrial },

  // Devices
  { path: '/devices', name: 'Devices', component: Devices },
  { path: '/editDevice/:id', name: 'Edit Device', component: EditDevice },

  // Extras
  { path: '/settings', name: 'Settings', component: Settings },
];

const routesMisc = [
  { path: '/plans', name: 'Plans', component: Plans },
  // { path: "/account", name: "Account", component: Account },
  // { path: "/paymentsuccess/:sessionId?", name: "Payment Success", component: PaymentSuccess },
  // { path: "/paymentfailed", name: "Payment Failed", component: PaymentFailed },
];

const routesAdmin = [
  { path: '/user-list', name: 'Master Listing', component: UserListing },
  { path: '/master-list', name: 'Master Listing', component: MasterListing },
  { path: '/create-master', name: 'Create Master', component: CreateMaster },
];

const routesSlave = [{ path: '/dashboard', name: 'Slave', component: Slave }];

const routes = {
  routesCommon: routesCommon,
  routesUser: routesUser,
  routesAdmin: routesAdmin,
  routesSlave: routesSlave,
  routesMisc: routesMisc,
};
export default routes;
