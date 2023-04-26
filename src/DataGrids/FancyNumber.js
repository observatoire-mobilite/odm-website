import {useSpring, animated} from 'react-spring'


export default function FancyNumber({ count, round=0 }) {
    const { number } = useSpring({
      from: { number: 0 },
      number: count,
      config: { mass:1, tension:200, friction:20, clamp: true }
    });
   
    if (count !== null) {
      return <animated.span>{
          number.to(val => (Math.round(val * Math.pow(10, round)) / Math.pow(10, round)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F"))
      }</animated.span>;
    } else {
      return <span style={{color: 'gray', fontStyle: 'italic'}}>(pas de données)</span>
    }
}