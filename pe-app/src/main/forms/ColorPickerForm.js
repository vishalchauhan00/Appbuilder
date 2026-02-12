import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, Typography, InputBase, Tooltip } from '@material-ui/core';


class ColorPickerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        value: getColorValue(this.props.value),

        showError: false,
        errorString: "",
        errorBoundary: "",
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {      
    if(prevProps.value !== this.props.value)
    {
      this.setState({ value: getColorValue(this.props.value) });
    }   
  }
  
  handleChangeValue = (event) => {
    //this.setState({ value: event.currentTarget.value });
    
    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    //this.props.onValueChange(event.currentTarget.value);
  };

  handleUpdateValue = (event) => {
    
    this.setState({ value: event.currentTarget.value });
    if(this.props['propkey']) {
      this.props.onValueChange(event.currentTarget.value, this.props['propkey']);
    }else {
      this.props.onValueChange(event.currentTarget.value);
    }    
  };

  handleInputValue = (event) => {
    
    let _val = event.currentTarget.value;
    const regextest = /^[0-9A-F]{6}$/i.test(_val);    
    if(_val.length > 6) {
      _val = _val.substr(0,6);
    }
    //console.log(_val, "... ColorInput ....handleInputValue", regextest);
    const colorval = "#"+_val;
    this.setState({ value: colorval });

    this.setState({ showError: false });
    this.setState({ errorString: "" });
    this.setState({ errorBoundary: "" });

    if(regextest && _val.length === 6) {
      if(this.props['propkey']) {
        this.props.onValueChange(colorval, this.props['propkey']);
      }else {
        this.props.onValueChange(colorval);
      }
    }else {
      //console.log("Invalid color code.............");
      this.setState({ showError: true });
      this.setState({ errorString: "Invalid color code" });
      this.setState({ errorBoundary: "1px solid red" });
    }
  };

  render() {
    const {value, errorString, showError, errorBoundary} = this.state;
    const hexval = value.replace('#','').toUpperCase();

    return (
      <FormGroup style={{width:140, flexDirection:'row'}} spellCheck="false" >
        <input type="color" value={value}
                onChange={this.handleChangeValue} onInput={this.handleUpdateValue.bind(this)} />
        <ColorBG ></ColorBG>
        <ColorLabel >#</ColorLabel>
        <ErrorTooltip title={errorString} open={showError} placement="left-start">
          <ColorInput required type="text" value={hexval} inputProps={{ maxLength: 6 }} style={{border:errorBoundary}}
                      onChange={this.handleInputValue.bind(this)} >
          </ColorInput>
        </ErrorTooltip>
      </FormGroup>
    );
  }
}

const ColorBG = withStyles(theme => ({
  root: {   
    width: 84,//72,
    height: 24,
    marginTop: 2,
    marginLeft: 4,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',        
  },
}))(Typography);
const ColorLabel = withStyles(theme => ({
  root: {
    position: 'absolute',
    width: 12,//72,
    height: 22,
    marginTop: 4,
    marginLeft: 56,
    fontSize: '0.875rem',
    textAlign: 'center',
    color: '#3d3d3d',  
  },
}))(Typography);
const ColorInput = withStyles(theme => ({
  root: {
    position: 'absolute',
    width: 70,
    height: 24,
    marginTop: 2,
    marginLeft: 68,
  },
  input: {
    width: 60,
    height: 20,    
    padding: theme.spacing(0,0.5),
    borderRadius: 4,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    background: theme.palette.background.default,
  },
}))(InputBase);

const ErrorTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

function getColorValue(colorObj) {
  if(colorObj) {
    let _red = parseInt(colorObj.red * 255);  //Math.ceil(colorObj.red * 255);
    let _green = parseInt(colorObj.green * 255);  //Math.ceil(colorObj.green * 255);
    let _blue = parseInt(colorObj.blue * 255);  //Math.ceil(colorObj.blue * 255);
    //console.log("color code >>", "rgb(" + _red +','+ _green +','+ _blue + ")");
  
    return fullColorHex(_red, _green, _blue);
  }else {
    return fullColorHex(0, 0, 0);
  }
}
function fullColorHex(r,g,b) {   
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return '#'+red+green+blue;
};
var rgbToHex = function (rgb) { 
  var hex = Number(rgb).toString(16);  
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};


export default ColorPickerForm;