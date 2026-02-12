import React from 'react';
import { FormGroup, InputBase } from '@material-ui/core';
import { fade, withStyles } from '@material-ui/core/styles';
//import Select from '@material-ui/core/Select';


class ComboBoxForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      options: this.props.options,
      placeholder: '',
      showOptions: true,

      actions: this.props.dependentActions,
    };
  }

  componentDidUpdate(prevProps,prevState) {
    if(prevProps.value !== this.props.value)
    {
      this.setState({ value: this.props.value });
    }
    else if(prevProps.options !== this.props.options)
    {
      //console.log(prevProps.options, "!!!!!!!!!!!!===============", this.props.options);
      this.setState({ options: this.props.options });
    } 
  }

  handleChangeValue = (event) => {
    /*if(event.target && event.target.tagName === "INPUT") {
      // need to give this event at input tag, since it is required. But we are handling onInput event for that.
      return;
    }*/
   
    //console.log("--handleChangeValue--", event.currentTarget.value);
    this.setState({ value: event.currentTarget.value });
    this.setState({ showOptions: false});

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.onValueChange(event.currentTarget.value, this.state.actions);
  };

  handleInputValue = (event) => {
    //this.setState({ value: event.currentTarget.value });
    //this.props.onValueChange(event.currentTarget.value, this.state.actions);
  }

  handleFocus = () => {
    //this.setState({ showOptions: false});
    /* if(this.state.value === "" && this.state.placeholder !== "") {
      this.setState({ value: this.state.placeholder });
    } */

    //console.log("--handleFocus--", this.state.value);
    if(this.state.options && this.state.options.length > 0){
      let optionList = (this.props.text && this.props.field) ? setOptions(this.state.options, this.props.text, this.props.field) : (this.state.options ? this.state.options : []);
      const value = validateValue(this.state.value, optionList);
      this.props.onValueChange(value, this.state.actions);
    }
  };

  handleMouseDown = () => {
    if(this.state.options && this.state.options.length > 0){
      this.setState({ showOptions: true});
      this.setState({ placeholder: this.state.value });
      this.setState({ value: "" });
    }
  };

  render() {
    //const { value, options } = this.state;
    //const showOptions = this.state.showOptions;
    const { text, field } = this.props;
    const options = this.state.options;
    let optionList = (text && field) ? setOptions(options, text, field) : (options ? options.sort() : []);
    optionList = optionList.sort();
    let value = (this.state.value) ? this.state.value : '';    

    //console.log(value, "********", text, field, options, "...cmb....", optionList);

    return (
        <FormGroup style={{height:32, marginTop:4 }}>   
          {/* {!showOptions &&
            <input name="editable" list="combobox" autoComplete="off"
                  style={{width:133, minHeight:22}} className="ComboBox"
                  value={value} onChange={this.handleChangeValue} 
                  onMouseDown={this.handleMouseDown.bind(this)} onBlur={this.handleFocus.bind(this)}/> 
          }
            <datalist id="combobox" style={{visibilty:'visible'}}>
              {optionList.map((option,id) =>
                <option key={id} value={option}>{option}</option>
              )}
            </datalist>
          {showOptions && 
            <Select open={true} variant="outlined" style={{position:'absolute', height:24, width:143, fontSize:14 }}
                    value={value} onChange={this.handleChangeValue} >
              {optionList.map((option,id) =>
                <option key={id} value={option}>{option}</option>
              )}
            </Select>
          } */}

          <div id="ComboBox" className="select-editable" style={{width:'100%', maxWidth:143, minHeight:22}} >
            <select value={value} onChange={(event) => this.handleChangeValue(event)}>
              <option value=""></option>
              {optionList.map((option,id) =>
                <option key={id} value={option}>{option}</option>
              )}
            </select>
            <TextInput type="text" value={value} autoComplete="off"
                      style={{minWidth:133, minHeight:22}}
                      onChange={(event) => this.handleChangeValue(event)} onInput={(event) => this.handleInputValue(event)} onBlur={() => this.handleFocus()} />
          </div>

        </FormGroup>
    );
  }
}

const TextInput = withStyles(theme => ({
  root: {},
  input: {
    width: 125,
    height: '100%',
    padding: '3px 8px',
    position: 'absolute', top: -1, left: -1,
    background: theme.palette.background.default,
    border: '1px solid #ced4da',
    borderRadius: 2,
    boxSizing: 'border-box',
    fontSize: 14,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.1rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

function setOptions(options, text, field) {
  if(options === undefined){
    return [];
  }

  if(text === "" && field === ""){
    return options.sort();
  }else {
    let arrOptions = [];
    for (let i = 0; i < options.length; i++) {
      const element = options[i];
      arrOptions.push(element[text]);  
    }
    return arrOptions;
  }
}

function validateValue(val, options) {
  if(val.indexOf('[') < 0 && val.indexOf(']') < 0) {
    let optionStr = options.join(",");
    if(optionStr.indexOf(val) < 0) {
      return "";
    }
  }
  return val;
}

export default ComboBoxForm;