import { useRef, useState } from "react";
import {  withStyles } from '@material-ui/core/styles';
import { Box } from "@material-ui/core";


const Container = withStyles(theme => ({
  root: {
    position: 'relative',
    minWidth: 400,
    overflow: 'hidden',
    display: 'block',
    '&:hover': {
        boxShadow: "0 14px 24px rgba(0, 0, 0, 0.55), 0 14px 18px rgba(0, 0, 0, 0.55)"
    }       
  }
}))(Box);

export default function ImageViewer(props) {
  const sourceRef = useRef(null);
  const targetRef = useRef(null);
  const containerRef = useRef(null);

  const [opacity, setOpacity] = useState(0);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const handleMouseMove = (e) => {
    const targetRect = targetRef.current.getBoundingClientRect();
    const sourceRect = sourceRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const xRatio = (targetRect.width - containerRect.width) / sourceRect.width;
    const yRatio =
      (targetRect.height - containerRect.height) / sourceRect.height;

    const left = Math.max(
      Math.min(e.pageX - sourceRect.left, sourceRect.width),
      0
    );
    const top = Math.max(
      Math.min(e.pageY - sourceRect.top, sourceRect.height),
      0
    );

    setOffset({
      left: left * -xRatio,
      top: top * -yRatio
    });
  };

  return (
    <div className="ImageViewer" style={{display:(props.show)?'flex':'none'}}>
      <Container
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <img ref={sourceRef} src={props.source} alt={props.alt} style={{width:props.widthValue, height:`calc(100% - 12px)`, marginTop:8}} />
        <img id="targetimg" ref={targetRef} src={props.source} alt={props.alt} source={props.source}
              style={{
                position: 'absolute',
                left: `calc(${offset.left}px)`,
                top: `calc(${offset.top}px)`,
                opacity: opacity
              }} />
        
      </Container>
    </div>
  );
}
