import React from 'react';
import Loading from 'src/assets/loading';
import './loader.scss';

export default function Loader({ customPosition = false }) {
  return (
    <div
      className="loader"
      style={customPosition ? { position: 'absolute' } : {}}
    >
      <Loading />
    </div>
  );
}
