import React from "react";

function Loading({ width = "200px", height = "200px" }) {
  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      className="lds-eclipse"
      style={{ background: "none" }}
    >
      <path
        ng-attr-d="{{config.pathCmd}}"
        ng-attr-fill="{{config.color}}"
        stroke="none"
        d="M10 50A40 40 0 0 0 90 50A40 43 0 0 1 10 50"
        fill="rgb(60, 75, 100)"
        transform="rotate(68.5373 50 51.5)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          calcMode="linear"
          values="0 50 51.5;360 50 51.5"
          keyTimes="0;1"
          dur="0.7s"
          begin="0s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export default Loading;
