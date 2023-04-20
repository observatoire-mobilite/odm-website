export function SVGPedestrian({color, style}) {
  return (
    <g style={{fill: color, stroke: 'none', ...style}}>
      <path d="m50.32,73.756c-2.497,1.044-4.719,2.061-7.006,2.899-1.668.611-2.704,1.672-3.572,3.215-3.918,6.964-7.946,13.866-11.957,20.778-1.949,3.358-4.74,4.234-8.097,2.36-5.559-3.105-11.083-6.277-16.547-9.545-3.376-2.019-4.036-4.95-1.951-8.286,5.472-8.755,11.01-17.469,16.519-26.2.644-1.021,1.349-2.013,1.895-3.085,1.345-2.64,3.529-4.136,6.221-5.254,9.177-3.813,18.295-7.765,27.433-11.673,1.628-.696,1.622-.731.614-2.155-2.686-3.796-4.301-7.993-4.367-12.661-.124-8.825,3.666-15.619,10.967-20.495C64.103,1.228,68.207-.005,72.488,0c11.635.013,20.767,7.96,23.089,18.424,1.56,7.032-.118,13.348-4.288,19.092-.508.699-.642,1.152.244,1.686,9.088,5.484,18.157,10.999,27.23,16.508,6.547,3.975,13.042,8.038,19.655,11.901,4.447,2.598,5.794,5.464,2.7,10.452-3.289,5.302-6.285,10.786-9.404,16.194-1.269,2.2-2.98,3.771-5.691,3.483-1.032-.109-2.083-.583-3.004-1.104-8.44-4.774-16.853-9.596-25.277-14.399-.533-.304-1.088-.568-1.835-.955-.034.652-.08,1.122-.08,1.592-.004,11.166.015,22.331-.028,33.497-.005,1.229.376,2.146,1.197,3.001,4.01,4.176,7.921,8.451,12.025,12.533,2.353,2.34,3.945,5.134,5.578,7.934,6.482,11.107,12.928,22.234,19.436,33.326,6.264,10.677.186,23.725-12.013,25.889-7.201,1.277-14.303-2.167-17.935-8.37-6.645-11.349-13.237-22.73-19.989-34.016-1.363-2.277-3.338-4.188-5.16-6.427-.778.894-1.325,1.456-1.796,2.075-9.187,12.059-18.396,24.101-27.528,36.201-3.146,4.168-7.022,7.064-12.264,7.867-9.02,1.381-17.747-4.69-18.687-13.456-.547-5.106.922-9.597,3.787-13.617,9.717-13.631,19.544-27.183,29.366-40.739.695-.959.82-1.699.337-2.818-1.042-2.412-1.675-4.958-1.676-7.619-.006-14.081-.009-28.162-.021-42.243,0-.639-.079-1.278-.136-2.135Zm11.023,10.272c.009,0,.017,0,.026,0,0,6.206.008,12.412-.009,18.618-.002.81.076,1.32,1.12,1.315,7.081-.037,14.162-.033,21.243-.004.981.004,1.185-.42,1.172-1.285-.069-4.788-.123-9.576-.139-14.364-.018-5.248.005-10.496.021-15.744.016-5.365,4.905-7.608,8.799-5.179,3.563,2.222,7.289,4.184,10.942,6.262,6.294,3.579,12.593,7.149,18.874,10.75.885.507,1.343.391,1.848-.544,1.344-2.489,2.77-4.936,4.241-7.352.542-.89.413-1.369-.459-1.896-7.943-4.799-15.869-9.625-23.798-14.448-7.716-4.693-15.417-9.409-23.163-14.05-.664-.398-1.705-.607-2.424-.398-4.215,1.222-8.402,1.346-12.67.294-.894-.22-2.026-.138-2.875.218-11.269,4.728-22.512,9.519-33.741,14.341-.676.29-1.348.87-1.744,1.492-4.966,7.791-9.865,15.625-14.829,23.417-.562.882-.552,1.351.385,1.861,1.644.894,3.255,1.851,4.863,2.811,1.737,1.037,1.719,1.047,2.693-.646,3.442-5.989,6.9-11.968,10.33-17.964.834-1.458,1.926-2.612,3.478-3.276,6.001-2.566,11.978-5.189,18.022-7.651,4.127-1.681,7.757.843,7.788,5.305.041,6.039.01,12.079.01,18.118Zm11.775,31.007c0,.008,0,.016,0,.024-3.456,0-6.913-.022-10.369.028-.438.006-1.237.37-1.25.602-.173,3.166-.082,6.326,2.659,8.556,2.615,2.128,5.344,4.114,7.992,6.2,4.635,3.651,9.647,6.854,13.475,11.464,2.361,2.844,5.179,5.38,7.139,8.47,4.609,7.268,8.817,14.79,13.206,22.198,2.544,4.294,5.029,8.628,7.72,12.829,1.931,3.014,5.801,3.738,8.683,1.907,3.254-2.066,4.161-5.59,2.263-8.867-5.879-10.152-11.728-20.322-17.669-30.437-1.825-3.107-3.311-6.437-5.932-9.052-3.979-3.97-7.727-8.184-11.845-12.001-3.193-2.959-5.051-6.211-4.443-10.633.148-1.077-.392-1.322-1.386-1.307-3.414.051-6.829.019-10.244.019Zm-36.98,70.408c1.418-.026,3.244-1.43,4.742-3.393,4.849-6.351,9.695-12.705,14.538-19.061,4.666-6.124,9.317-12.261,13.999-18.372,1.151-1.503,1.2-1.583-.318-2.713-2.571-1.912-5.178-3.777-7.735-5.707-.843-.637-1.344-.615-2.003.305-8.1,11.294-16.255,22.549-24.358,33.841-1.836,2.559-3.869,4.995-4.945,8.048-1.429,4.056.599,7.047,6.08,7.052ZM72.72,35.709c6.451-.121,12.41-4.671,12.384-12.359-.024-6.967-5.437-12.143-12.297-12.243-6.902-.101-12.473,5.856-12.377,12.867.086,6.223,5.886,11.761,12.29,11.735Z"/>
    </g>
  )
}


export default function IconPedestrian({color='white', height='100%'}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={height} preserveAspectRatio="xMidYMid meet" viewBox="0 0 142.796 199.318">
      <SVGPedestrian />
    </svg>
  )
}