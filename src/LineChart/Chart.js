import React, { useState } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";
import {BottomAxis, LeftAxis} from './Axes.js';
import { line } from 'd3-shape';
import styles from "./style.css";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { animated, useSpring } from '@react-spring/web'
import {Mouse} from './Mouse'


export function Translate({ x = 0, y = 0, children }) {
  if (!x && !y) return children;
  return <g transform={`translate(${x},${y})`}>{children}</g>;
};


export function Chart({
    children,
    viewBoxWidth = 800,
    viewBoxHeight = 400,
    paddingX = 40,
    paddingY = 6,
    bottomAxisHeight = 30,
    leftAxisWidth = 20,
  }) {
  
  const bodyHeight = viewBoxHeight - bottomAxisHeight - 2 * paddingY;
  const bodyWidth = viewBoxWidth - leftAxisWidth - 2 * paddingX;
  
  const leftAxis = {
    pos: {
      x: paddingX,
      y: paddingY,
    },
    size: {
      width: leftAxisWidth,
      height: bodyHeight,
    },
  };
  
  const bottomAxis = {
    pos: {
      x: paddingX + leftAxisWidth,
      y: paddingY + bodyHeight,
    },
    size: {
      width: bodyWidth,
      height: bottomAxisHeight,
    },
  };
  
  const body = {
    pos: {
      x: leftAxis.pos.x + leftAxisWidth,
      y: paddingY,
    },
    size: {
      width: bodyWidth,
      height: bodyHeight,
    },
  };
  
  const [clickPt, setClickPt] = useState(undefined);
  const handleClick = (pt) => {
    setClickPt(pt);
    console.log(clickPt);
  };

  // d3 scales map from your data domain to another domain (in this case, our chart size).
  const xExtent = extent(data, (d) => d.x);
  const yExtent = extent(data, (d) => d.y);
  if (xExtent[0] == null || xExtent[1] == null || yExtent[0] == null || yExtent[1] == null) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Insufficient or incomplete data.
      </Alert>
    )
  }
  yExtent[0] = 0
  
  
  const xScale = scaleLinear().domain(xExtent).range([0, body.size.width]);
  // N.B.: because the svg co-ordinate system starts at the upper left, but
  // we would like to stick with a standard cartesian coordinate system for our
  // chart, which starts at the bottom left, we invert the range here, mapping
  // y values from height to 0, instead of from 0 to height.
  const yScale = scaleLinear().domain(yExtent).range([body.size.height, 0]);

  const mapToDataPoint = (mouse) => {
    // For larger datasets, consider d3-bisect https://observablehq.com/@d3/d3-bisect
    const closest = data.reduce(
      (result, datum, idx) => {
        const thisDistance = Math.abs(mouse.x - xScale(datum.x));
        if (thisDistance < result.distance) {
          return {
            distance: thisDistance,
            index: idx,
          };
        } else {
          return result;
        }
      },
      { distance: Infinity, index: -1 },
    );

    return data[closest.index];
  };

  return (
    <svg width="100%" height={viewBoxHeight} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
      <Translate {...body.pos}>
        <Chart.LineSeries data={data} xScale={xScale} yScale={yScales} />
        <Mouse {...body.size} closestDataPoint={(x, y) => { return {x: 0, y: 0}}} onClick={(e) => undefined}>

        </Mouse>
      </Translate>
      <Translate {...leftAxis.pos}>
        <LeftAxis scale={yScale} {...leftAxis.size} />
      </Translate>
      <Translate {...bottomAxis.pos}>
        <BottomAxis scale={xScale} {...bottomAxis.size} />
      </Translate>
    </svg>
  );
};

Chart.LineSeries = ({ xScale, yScale, data }) => {
  const props = useSpring({
    from: {strokeWidth: 0},
    to: {strokeWidth: 3},
    config: { duration: 3 }
  });
  const linePath = line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))(data);
  return <animated.path 
    stroke="#1976d2" // defines the colour of the "line"
    strokeWidth={props.strokeWidth}
    fill="none"
    className={styles.line}
    d={linePath} />;
};
