import React from 'react'
import { CFooter } from '@coreui/react'
const logo = "logo/logo.webp";

const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      <div>
        {/* <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">CoreUI</a> */}
        {/* <span className="ml-1">&copy; 2020 creativeLabs.</span> */}
        <img src={logo} height="24" alt="Logo" className="bg-dark p-1 rounded"/>
      </div>
      <div className="mfs-auto">
        <span className="mr-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">CoreUI for React</a>
        <span className="mx-1">{"|"}</span>
        <span className="mr-1">Developed by</span>
        <a href="https://codeb.online/" target="_blank" rel="noopener noreferrer">Code-b</a> 
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
