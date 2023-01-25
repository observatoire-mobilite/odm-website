import React from "react";
import { Datum, Size, Layout } from "../util";
import { ScaleTime, ScaleLinear } from "d3-scale";
import { Translate } from "./Translate";

import styles from "./style.module.css";

const Tooltip = ({ point, xScale, yScale, width, height }) => {
  if (!point) {
    return null;
  }
  const tipY = 50;

  const screenX = xScale(point.x);
  const screenY = yScale(point.y);
  const time = new Date(point.x).toLocaleString();
  const value = point.y.toFixed(3);
  const tipContent = (
    <>
      <div>
        <span className={styles.tooltipLabel}>Time</span>: {time}
      </div>
      <div>
        <span className={styles.tooltipLabel}>Value</span>: {value}
      </div>
    </>
  );

  const placeRight = screenX < width / 2;
  const tipOverlay = {
    size: {
      width: placeRight ? width - screenX : screenX,
      height,
    },
    pos: {
      x: placeRight ? screenX : 0,
      y: tipY,
    },
  };
  return (
    <g pointerEvents="none">
      {/* circle highlighting the data point being hovered over */}
      <circle cx={screenX} cy={screenY} r={3} fill="none" stroke="#11a1c4" strokeWidth={3} />
      {/* the tooltip itself */}
      <Translate {...tipOverlay.pos}>
        <foreignObject {...tipOverlay.size}>
          <div className={styles.tooltipContainer}>
            <div className={[styles.tooltip, placeRight ? styles.tooltipRight : styles.tooltipLeft].join(" ")}>
              {tipContent}
            </div>
          </div>
        </foreignObject>
      </Translate>
      {/* line indicating hover point */}
      <line x1={screenX} y1={0} x2={screenX} y2={height} stroke="darkslategray" strokeWidth={1} />
    </g>
  );
};