import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import * as d3 from "d3";
import {axisBottom, axisLeft} from "d3-axis";
import { select } from "d3-selection";
import { extent } from "d3-array";

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
