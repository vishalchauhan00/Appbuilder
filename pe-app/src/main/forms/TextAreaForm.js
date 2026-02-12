import React from 'react';
import { fade, withStyles, } from '@material-ui/core/styles';
import { FormGroup, InputBase } from '@material-ui/core';


class TextAreaForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        value: this.props.value,

        isfocused: false,
        timeout:null,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {      
    if(prevProps.value !== this.props.value)
    {
      this.setState({ value: this.props.value });
    }   
  }
  
  handleClick = (event) => {
    if(this.props.source === "uipart") {
      this.setState({ isfocused: false });
    }
  }
  handleKeypress = (event) => {
    if(this.props.source === "uipart" && !this.state.isfocused){
      console.log(".. TextAreaForm handleKeypress >>>", this.props.source);
      let _val = "`" + this.state.value;
      this.setState({ value: _val });
      this.setState({ isfocused: true });
    }
  }
  handleChangeValue = (event) => {
    clearTimeout(this.state.timeout);

    let _val = event.currentTarget.value;
    _val = _val.replace("`","");

    this.setState({ value: _val });    
    //this.props.onValueChange(_val);

    const timeout1 = setTimeout(this.doneTyping.bind(null, _val, this.props), 400);
    this.setState({ timeout: timeout1 });
  };
  doneTyping (val, props) {
    //console.log(props, "....doneTyping >>>>", val);
    props.onValueChange(val);
  };

  render() {
    const {value} = this.state;
    const lineHeight = (this.props.lineHeight) ? this.props.lineHeight : 4;

    return (
        <FormGroup style={{height:'100%', marginTop:4, }}>          
          <TextInput value={value}              
                     multiline rows={lineHeight} margin="dense" variant="outlined"          
                     onChange={this.handleChangeValue}
          />
        </FormGroup>
    );
  }
}

const TextInput = withStyles(theme => ({
  root: {},
  input: {
    position: 'relative',
    height: '100%',
    width: 125,
    fontSize: 14,
    background: theme.palette.background.default,
    border: '1px solid #ced4da',
    borderRadius: 4,
    padding: '3px 8px',//'10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.1rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

export default TextAreaForm;