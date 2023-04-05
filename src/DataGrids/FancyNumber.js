import {useSpring, animated} from 'react-spring'


export default function FancyNumber({ count }) {
    const { number } = useSpring({
      from: { number: 0 },
      number: count,
      config: { mass:1, tension:200, friction:20, clamp: true }
    });
   
    if (count) {
      return <animated.span>{
          number.to(val => Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F"))
      }</animated.span>;
    } else {
      return <span style={{color: 'gray', fontStyle: 'italic'}}>(no data)</span>
    }
}