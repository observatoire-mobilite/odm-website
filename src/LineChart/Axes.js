import React, {useState, useEffect, useRef, useLayoutEffect, createContext, useContext} from 'react';
import {axisBottom, axisLeft} from "d3-axis";
import { select } from "d3-selection";
import { extent } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import {Mouse} from './Mouse'


const AxisContext = createContext();


function Axis({ scale, width, generator }) {
    const ref = useRef(null);
    useLayoutEffect(() => {
      const host = select(ref.current);
      host.select("g").remove();
      const axisGenerator = generator(scale);
      const [start, end] = extent(scale.range());
      if (start == null || end == null) {
        return;
      }
      const pxPerTick = 80;
      const tickCount = Math.ceil((end - start) / pxPerTick);
      axisGenerator.ticks(tickCount);
  
      const group = host.append("g");
      group.call(axisGenerator);
    }, [scale, width]);
  
    return <g ref={ref} />;
};

export const BottomAxis = (o) => Axis({...o, generator: axisBottom});
export const LeftAxis = (o) => Axis({...o, generator: axisLeft});

export function Translate({ x = 0, y = 0, children }) {
  if (!x && !y) return children;
  return <g transform={`translate(${x},${y})`}>{children}</g>;
};

export function Plot({
    children,
    xExtent=[0, 100],
    yExtent=[0, 100],
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
  
  // d3 scales map from your data domain to another domain (in this case, our chart size).
  if (xExtent[0] == null || xExtent[1] == null || yExtent[0] == null || yExtent[1] == null) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Insufficient or incomplete data.
      </Alert>
    )
  }
  
  const xScale = scaleLinear().domain(xExtent).range([0, body.size.width]);
  const yScale = scaleLinear().domain(yExtent).range([body.size.height, 0]);

  return (
    <svg width="100%" height={viewBoxHeight} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
      <Translate {...body.pos}>
        {React.Children.map((c) => c({xScale: xScale, yScale: yScale}))}
        <Mouse {...body.size} closestDataPoint={(x, y) => { return {x: 0, y: 0}}} onClick={(e) => undefined} />
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


Plot.extent = function (...data_sets) {
  const x = data_sets.map((data) => extent(data, (d) => d.x))
  const y = data_sets.map((data) => extent(data, (d) => d.y))
  
  for (const data of data_sets) {
    x = extent(data, (d) => d.x);
    y = extent(data, (d) => d.y);
  }

}