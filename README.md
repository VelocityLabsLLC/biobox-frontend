<h1 align="center">Biobox Frontend</h1>

<p align="center" id="logo">
<a href="https://reactjs.org/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1280px-React-icon.svg.png" width="320" alt="React Logo" /></a>
<h2 align="center" id="name"><a href="https://reactjs.org/" target="blank">React JS</a></h2>
</p>

<p align="center">A JavaScript library for building user interfaces.</p>

## Description
A [React](https://reactjs.org/) app that runs on all the three environments i.e. Master, Slave and Cloud.

The app supports/performs following operations:
- Lists/Create/Update Experiments, Protocols, Subjects, Trials, Tests, Devices
- Start/Pause/Resume/Stop Trials and display Live Data over socket
- Display existing trial data if any any with an option to download the csv
- Connects to socket (Local socket if running on Master/Slave, Cloud socket if running on Cloud)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# on Cloud
$ npm run start-cloud

# on Master
$ npm run start-local

# on Slave
$ npm run start-slave
```

## Building the app

```bash
# on Cloud
$ npm run build-cloud

# on Master
$ npm run build-local

# on Slave
$ npm run build-slave
```

## Deployment
The cloud environment of the app auto deploys using Netlify (On alpha branch only)

## License

React is [MIT licensed](https://github.com/facebook/react/blob/master/LICENSE).
