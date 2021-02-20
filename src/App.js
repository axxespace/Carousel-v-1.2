import React, {useState, useEffect, useRef} from 'react'
import './App.css';
import styled, { css, keyframes } from 'styled-components';

// following function returns dynamical animation
const animation  = (left, leftOn100Percents, shouldIUseAnimation) =>{
  return shouldIUseAnimation==true ? css`${
      keyframes`
        100%{
          left: ${leftOn100Percents}px;
        }`
  }` : null;
}


//styled component, that contains all color components
const Element = styled.div.attrs( props => ({
  style: {
    left: `${props.left}px`,
    width: `${props.width}%`,
  },
}))`
  position: absolute;
  display: grid;
  height: 100%;
  grid-template-columns: repeat(20, 1fr);
  animation-name: ${props => animation(props.left, props.leftOn100Percents, props.shouldIUseAnim)};
  animation-duration: 1s;
  animation-fill-mode: forwards;
  transition-timing-function: cubic-bezier(.17,.67,.83,.67);
`


function App(props) {
  const pageWidth = useRef(); //width of page

  const prevPageWidth = useRef(); //width of page before changing resolution

  const componentWidth = useRef(); //width of color component

  const [left, setLeft] = useState(); //left state

  const [percentWidth, setPercentWidth] = useState(); //percent width of carousel (defines how many color components will be on one page)

  const [startingX, setStartingX] = useState(); // starting x coordinate of click/touch

  const [carouselWidth, setCarouselWidth] = useState(); //width of carousel in pixels

  const [distance, setDistance] = useState(0); //distance between starting and current x coordinate

  const [shouldIUseAnim, setShouldIUseAnim] = useState(); //defines if app should use animation

  const [componentsOnPage, setComponentsOnPage] = useState(1); // amount of components on page

  const [mouseIsClicked, setMouseIsCLicked] = useState(false); //shows if mouse is clicked

  const [leftOn100Percents, setLeftOn100Percents] = useState(0); //is used in animation 100%

  useEffect(() => { //we set a timer
    const timer = setInterval(() => setResolution(componentWidth.current.getBoundingClientRect().width, pageWidth.current.getBoundingClientRect().width), 50);
    return () => clearInterval(timer);
  }, [leftOn100Percents]);

  useEffect(() => {
    prevPageWidth.current=carouselWidth;
  });


  const setResolution = (componentWidth, pageWidth) => { //function that controls resolution
    const oldResolutionWidth = prevPageWidth.current;
    const amountOfPages = Math.round(pageWidth/componentWidth);
    // if resolution width is changed we set carousel width and components on page
    if(componentWidth!==oldResolutionWidth) {
      setCarouselWidth(componentWidth);
      setPercentWidth(() => pageWidth<500 ? 2000 : pageWidth<1200 ? 1000 : 2000/3);
      setComponentsOnPage(amountOfPages);
      if(oldResolutionWidth!==undefined){ //if our app hasn't just mounted we change left, distance, 100% distance
        setShouldIUseAnim(false);
        let changed = leftOn100Percents / oldResolutionWidth * componentWidth;
        if (-changed>(20-amountOfPages)*componentWidth) changed +=componentWidth;
        setLeft(changed);
        setDistance(changed);
        setLeftOn100Percents(changed);
      }
    }
  }

  const touchStart = event => { //this function runs on touch
    setLeft(leftOn100Percents);
    setDistance(leftOn100Percents);
    setStartingX(event.touches[0].clientX);
    setShouldIUseAnim(false);
  }

  const touchMove = event => { //this function runs on touch swipe
    const currentDistance = event.touches[0].clientX - startingX;
    if(currentDistance<0 ? -(distance+currentDistance) <= carouselWidth * (19-componentsOnPage+1) : distance <= -currentDistance){
      setLeft(distance + currentDistance);
    }
  }

  const touchEnd = event => {  //this function runs on end of touch
    setDistance(left);
    setShouldIUseAnim(true);
    const a = Math.round(-left/carouselWidth);
    setLeftOn100Percents(-a*carouselWidth);
  }

  const mouseStart = event => { //this function runs on click
    setLeft(leftOn100Percents);
    setDistance(leftOn100Percents);
    setStartingX(event.clientX);
    setShouldIUseAnim(false);
    setMouseIsCLicked(true);
  }

  const mouseMove = event => { //this function runs on mouse swipe
    if(mouseIsClicked==true){
      const currentDistance = event.clientX - startingX;
      if(currentDistance<0 ? -(distance+currentDistance) <= carouselWidth * (19-componentsOnPage+1) : distance <= -currentDistance){
        setLeft(distance + currentDistance);
      }
    }
  }

  const mouseEnd = event => { //this function runs on end of mouse touch
    setDistance(left);
    setShouldIUseAnim(true);
    const a = Math.round(-left/carouselWidth);
    setLeftOn100Percents(-a*carouselWidth);
    setMouseIsCLicked(false);
  }

  return(
      <div id="frame">
        <div id = "carousel" ref = {pageWidth}>
          <Element left={left} width={percentWidth} shouldIUseAnim={shouldIUseAnim} leftOn100Percents={leftOn100Percents} onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} onMouseDown={mouseStart} onMouseMove={mouseMove} onMouseUp={mouseEnd}>
            {props.SHADESOFBLUE.map((elem) =>  <div ref = {componentWidth} style={{"backgroundColor": elem[1]}} className={"colorPage"} key={elem[0]}><h1>{elem[0]}</h1></div>)}
          </Element>
        </div>
      </div>
  )
}

export default App;

