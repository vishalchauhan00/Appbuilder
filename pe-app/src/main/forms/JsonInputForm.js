import React, { useState, useEffect, useRef } from 'react';
import { fade, withStyles } from '@material-ui/core/styles';
import { FormGroup, InputBase, Tooltip, makeStyles } from '@material-ui/core';

// Custom Tooltip with red background
const RedTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#f44336',
    color: '#fff',
    fontSize: 12,
    fontWeight: 400,
  },
  arrow: {
    color: '#f44336',
  },
}))(Tooltip);

// Custom TextInput with error border override
const useErrorInputStyles = makeStyles((theme) => ({
  root: {},
  input: (props) => ({
    position: 'relative',
    height: '100%',
    width: 125,
    fontSize: 14,
    border: props.isValid
      ? '1px solid #ced4da'
      : '2px solid #f44336', // thicker red border for error
    borderRadius: 4,
    padding: '3px 8px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
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
    background: theme.palette.background.default,
    '&:focus': {
      boxShadow: props.isValid
        ? `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.1rem`
        : `0 0 0 2px #f44336`, // red shadow for error
      borderColor: props.isValid
        ? theme.palette.primary.main
        : '#f44336',
    },
  }),
}));

const TextInput = withStyles((theme) => ({
  root: {},
  input: {},
}))(InputBase);

const JsonInputForm = (props) => {
  const [value, setValue] = useState(
    typeof props.value === 'string'
      ? props.value
      : JSON.stringify(props.value, null, 2)
  );
  const [isfocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const timeoutRef = useRef(null);

  const classes = useErrorInputStyles({ isValid });

  useEffect(() => {
    setValue(
      typeof props.value === 'string'
        ? props.value
        : JSON.stringify(props.value, null, 2)
    );
  }, [props.value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = (event) => {
    if (props.source === "uipart") {
      setIsFocused(false);
    }
  };

  const handleKeypress = (event) => {
    if (props.source === "uipart" && !isfocused) {
      setIsFocused(true);
    }
  };

  const handleChangeValue = (event) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let _val = event.currentTarget.value;
    setValue(_val);

    // Validate JSON immediately for border/tooltip
    try {
      JSON.parse(_val);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }

    timeoutRef.current = setTimeout(() => {
      doneTyping(_val, props);
    }, 400);
  };

  const doneTyping = (val, props) => {
    try {
      const parsed = JSON.parse(val);
      setIsValid(true);
      props.onValueChange(parsed);
    } catch (e) {
      setIsValid(false);
    }
  };

  const lineHeight = props.lineHeight ? props.lineHeight : 4;

  return (
    <FormGroup style={{ height: '100%', marginTop: 4 }}>
      <RedTooltip
        title={isValid ? '' : 'Please enter valid JSON'}
        open={!isValid}
        placement="top"
        arrow
      >
        <TextInput
          value={value}
          multiline
          rows={lineHeight}
          margin="dense"
          variant="outlined"
          onChange={handleChangeValue}
          onClick={handleClick}
          onKeyPress={handleKeypress}
          classes={{ input: classes.input }}
        />
      </RedTooltip>
    </FormGroup>
  );
};

export default JsonInputForm;