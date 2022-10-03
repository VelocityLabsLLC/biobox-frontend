import React from 'react';

export const PasswordCriteria = () => {
  return (
    <div className="border rounded py-2 px-4">
      <div>Password should meet all of the following conditions:</div>
      <ul>
        <li>Atleast one Uppercase character (A-Z)</li>
        <li>Atleast one Lowercase character (a-z)</li>
        <li>Atleast one Numeric character (0-9)</li>
        <li>Atleast one Special character</li>
        <li>Should not contain empty spaces</li>
        <li>Should be atleast 8 characters long</li>
      </ul>
    </div>
  );
};

export default PasswordCriteria;
