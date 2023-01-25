import React, { useState } from "react";


function pointsEqual(p1, p2) {
    return (!p1 && !p2) || (p1 && p2 && p1.x === p2.x && p1.y === p2.y);
};


// an invisible rectangle capturing mouse events
export function Mouse ({ width, height, onClick, children, closestDataPoint }) {
  const [hoverPt, setHoverPt] = useState(undefined);
  
  function handleMouseMove(e) {
    
    // compute position within graph's data-axes
    const dims = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - dims.left;
    const rawY = e.clientY - dims.top;
    const x = (rawX / dims.width) * width;
    const y = (rawY / dims.height) * height;
    
    const newPt = closestDataPoint(x, y);
    if (!pointsEqual(hoverPt, newPt)) {
      setHoverPt(newPt);
    }
  };

  function handleMouseLeave() {
    setHoverPt(undefined);
  };

  function handleMouseUp() {
    onClick && hoverPt && onClick(hoverPt);
  };

  return (
    <>
      <rect
        width={width}
        height={height}
        pointerEvents="all"
        fill="none"
        stroke="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
      />
      {children && children(hoverPt)}
    </>
  );
};
