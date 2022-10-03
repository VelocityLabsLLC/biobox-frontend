import React from 'react'

function InputError({ text, touched }) {
  return text && touched ? <p className='text-danger'>{text}</p> : null
}

export default React.memo(InputError)

