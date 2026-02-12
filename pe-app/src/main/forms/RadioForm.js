import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormGroup, FormControlLabel, RadioGroup, Radio } from '@material-ui/core';


class RadioForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groupname: this.props.groupname,
      value: this.props.value,
      options: this.props.options,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {
    if(prevProps.value !== this.props.value)
    {
      this.setState({ value: this.props.value });
    }   
  }

  handleChangeValue = (event) => {
    this.setState({ value: event.currentTarget.value });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.onValueChange(event.currentTarget.value);
  };

  render() {
    const { groupname, value } = this.state;
    const options = this.props.options;

    return (
        <FormGroup style={{height:'100%', width:143, marginTop:4, marginBottom:4}}>
          <RadioGroup name={groupname} value={value}
            onChange={this.handleChangeValue}
            style={{border: '1px solid #ced4da', borderRadius:4, paddingLeft:4}}
          >
            {setOptions(options).map((option,id) =>
              <FormControlLabel key={id} value={option} label={option} control={<StyledRadio />} style={{height:32}}/>
            )}            
          </RadioGroup>
        </FormGroup>
    );
  }
}


const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
});

function StyledRadio(props) {
  const classes = useStyles();

  return (
    <Radio disableRipple
      className={classes.root}  
      color="default"      
      {...props}
    />
  );
}

function setOptions(options) {
  if(options === undefined){
    return [];
  }
  return options;
}

export default RadioForm;