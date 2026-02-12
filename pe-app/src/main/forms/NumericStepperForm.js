import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


class NumericStepperForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        value: this.props.value,
        //min: this.props.min,
        //max: this.props.max,
        //step: this.props.step,

        showError: false,
        errorString: "",
        errorBoundary: "",
        isfocused: false,
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
    this.setState({ showError: false });
    this.setState({ errorString: "" });
    this.setState({ errorBoundary: "" });

    let _val = parseFloat(event.currentTarget.value);
   
    const rangeObj = {min: parseFloat(this.props.min), max: parseFloat(this.props.max) };  //getFormRange(this.props);
    //console.log(this.props, "..handleChangeValue >>>>", rangeObj, _val);

    if(isNaN(_val)) {
      _val = parseFloat(this.props.min);
    }
    //console.log(this.props.value, "..handleChangeValue >>>>", _val);

    if(this.props.path === "Children[0].Group.length"){
      const _currentPage = this.props.currentPage;
      if(_currentPage){
        let currGroup = _currentPage.Children[0].Group;
        let groupLen = currGroup.length;
        if(groupLen < _val){
          const groupObj = {  
            "_uid" : "",
            "grouptype": "default","recordListFormat": "","editable": false,"flexibleHeight": false,"caching": false,"cachingmode": "",
            "Title": "","Footer": "","ServiceName": "","tablename": "","where": "","sort": "","Groupby": "",
            "idFieldName": "group 0", "dataFieldName": "",                
            "RecordCells": [],
            "rowarray": [{  
              "name":  "",
              "Title": "",
              "CellStyle": "default",
              "accessoryType": "indicator",
              "editingAccessoryType": "indicator",
              "selectionStyle": "blue",
              "editable": true,
              "movable": true,                
              "height": 50,
              "backgroundColor": {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""},
              "wireframeUnvisible": false,          
              "wireframe": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },
              "rowBGImageRepeat": false,
              "alternatingRowStyle": false,
              "alternatingRowColors1": {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""},
              "alternatingRowColors2": {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""},
              "alternatingRowImages1": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },
              "alternatingRowImages2": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },
              "fieldname": "",
              "mainText": "",
              "detailText": "",
              "mainImage": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },      
              "Fields": [],
              "gridFields": [],
              "tabularGridFields": [],      
              "actions": {"didUpdateValue":[], "accessoryButtonTappedForRowWithIndexPath":[], "didSelectRowAtIndexPath":[], "flickRL":[], "flickLR":[] }
            }],
            "RecordCellDef": {  
              "name":  "",
              "Title": "",
              "CellStyle": "default",
              "accessoryType": "indicator",
              "editingAccessoryType": "indicator",
              "selectionStyle": "blue",
              "editable": true,
              "movable": true,                
              "height": 50,
              "backgroundColor": {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""},
              "wireframeUnvisible": false,          
              "wireframe": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },
              "rowBGImageRepeat": false,
              "alternatingRowStyle": false,
              "alternatingRowColors1": {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""},
              "alternatingRowColors2": {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""},
              "alternatingRowImages1": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },
              "alternatingRowImages2": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },
              "fieldname": "",
              "mainText": "",
              "detailText": "",
              "mainImage": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" },      
              "Fields": [],
              "gridFields": [],
              "tabularGridFields": [],      
              "actions": {"didUpdateValue":[], "accessoryButtonTappedForRowWithIndexPath":[], "didSelectRowAtIndexPath":[], "flickRL":[], "flickLR":[] }
            }
          };  
          currGroup.push(groupObj);
        }else{
          currGroup.splice(0,1);
        }

      }      
    }else if(this.props.path === "panelItems[*].id"){
      const _currentUI = this.props.currentUI;
      if(_currentUI && _currentUI.hasOwnProperty('panelItems')){
        let arrPanels = JSON.parse(JSON.stringify(_currentUI['panelItems']));
        if(arrPanels.length > _val) {
          let oldPanelObj = arrPanels[this.props.value];
          let newPanelObj = arrPanels[_val];
          
          //console.log(oldPanelObj, "**********", newPanelObj);
          if(oldPanelObj && newPanelObj){
            oldPanelObj['id'] = _val;
            newPanelObj['id'] = this.props.value;
            
            arrPanels[_val] = oldPanelObj;
            arrPanels[this.props.value] = newPanelObj;
          }
        }
        //console.log("**********", _currentUI['panelItems']);
        _currentUI['panelItems'] = arrPanels;
      }
    }else if(this.props.path === "dataCols[*].id"){
      const _currentUI = this.props.currentUI;
      if(_currentUI && _currentUI.hasOwnProperty('dataCols')){
        let arrCols = JSON.parse(JSON.stringify(_currentUI['dataCols']));
        if(arrCols.length > _val) {
          let oldColObj = arrCols[this.props.value];
          let newColObj = arrCols[_val];
          
          if(oldColObj && newColObj){
            oldColObj['id'] = _val;
            newColObj['id'] = this.props.value;            
            arrCols[_val] = oldColObj;
            arrCols[this.props.value] = newColObj;
          }
        }       
        _currentUI['dataCols'] = arrCols;
      }
    }
    else if(this.props.path === "menuItems[*].id"){
      const _currentUI = this.props.currentUI;
      if(_currentUI && _currentUI.hasOwnProperty('menuItems')){
        let arrCols = JSON.parse(JSON.stringify(_currentUI['menuItems']));
        if(arrCols.length > _val) {
          let oldColObj = arrCols[this.props.value];
          let newColObj = arrCols[_val];
          
          if(oldColObj && newColObj){
            oldColObj['id'] = _val;
            newColObj['id'] = this.props.value;            
            arrCols[_val] = oldColObj;
            arrCols[this.props.value] = newColObj;
          }
        }       
        _currentUI['dataCols'] = arrCols;
      }
    }

    if(_val > parseFloat(rangeObj.max)){
      _val = parseFloat(rangeObj.max);
    }else if(_val < parseFloat(this.props.min)){
      //_val = parseFloat(this.props.min);
      this.setState({ showError: true });
      this.setState({ errorString: "Input is less than allowed minimum value." });
      this.setState({ errorBoundary: "1px solid red" });
    }else {
      _val = parseFloat(_val);
    }
    
    if(_val.length === 0){
      this.setState({ showError: true });
      this.setState({ errorString: "Invalid input" });
      this.setState({ errorBoundary: "1px solid red" });
    }
    /* else {
     this.setState({ showError: false });
      this.setState({ errorString: "" });
      this.setState({ errorBoundary: "" });
    } */

    this.setState({ value: _val });    
    if(this.props['propkey']) {
      this.props.onValueChange(_val, this.props['propkey']);
    }else {
      this.props.onValueChange(_val);
    }
  };

  handleFocusOut = (event) => {
    if(this.state.showError){
      this.setState({ showError: false });
      this.setState({ errorString: "" });
      this.setState({ errorBoundary: "" });
    }    
    
    //const rangeObj = getFormRange(this.props);
    //console.log(this.state.value, "..handleFocusOut >>>>", rangeObj);    
    
    let wasInvalid = false;
    let _val = this.state.value;
    if(_val === ""){
      _val = this.props.min;
      wasInvalid = true;
    }else {
      if(_val > parseFloat(this.props.max)){
        _val = this.props.max;
        wasInvalid = true;
      }else if(_val < parseFloat(this.props.min)){
        _val = this.props.min;
        wasInvalid = true;
      }  
    }

    if(wasInvalid) {
      this.setState({ value: _val });
    
      //console.log(" ..num.. handleFocusOut ...", _val);
      if(_val.toString().indexOf("-") > -1){
        _val = _val.replace("-","");
        this.setState({ value: _val });
      }
  
      if(this.props['propkey']) {
        this.props.onValueChange(_val, this.props['propkey']);
      }else {
        this.props.onValueChange(_val);
      }
    }
  }
  

  render() {
    const {min, max, step } = this.props;
    const {errorString, showError, errorBoundary} = this.state;
    let value = (this.state.value) ? parseFloat(this.state.value) : 0;
    value = isNaN(value) ? 0 : value;

    let textcolor = '#000';
    const getCurrentTheme = localStorage.getItem("themetype");
    if(getCurrentTheme === "dark"){
      textcolor = '#fff';
    }

    return (
      <ErrorTooltip title={errorString} open={showError} placement="left-start">
        <FormGroup style={{height:32, marginTop:4, }}>          
          <input className="numinput" style={{width:133, minHeight:22, border:errorBoundary, color:textcolor}}
                 name="numstepper" type="number" value={value}
                 min={min} max={max} step={step}
                 onChange={this.handleChangeValue} onBlur={this.handleFocusOut.bind(this)}
          />         
        </FormGroup>
      </ErrorTooltip>
    );
  } 
}

const ErrorTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);


/* function getFormRange(formProps) {
  const formPage = formProps.currentPage;
  if(formProps.source === "page") {
    if(formProps.path.indexOf('toolBar') > -1 && formProps.path.indexOf('frame.height') > -1) {
      const pageFrame = formPage['frame'];
      let pageHeight = parseInt(pageFrame['height']);
      if(!formPage.StatusBarHidden){
        pageHeight = pageHeight - 20;
      }
      if(!formPage.NavigationBarHidden){
        pageHeight = pageHeight - 44;
      }
      if(!formPage._tabBarHiddens[0]){
        pageHeight = pageHeight - 49;
      }
      if(formProps.path.indexOf('toolBarBottom') > -1) {
        if(!formPage._toolBarTop[0].hidden){
          pageHeight = pageHeight - parseInt(formPage._toolBarTop[0].frame.height);
        }
      }
      if(formProps.path.indexOf('toolBarTop') > -1) {
        if(!formPage._toolBarBottom[0].hidden){
          pageHeight = pageHeight - parseInt(formPage._toolBarBottom[0].frame.height);
        }
      }

      return {"min": parseFloat(formProps.min), "max": pageHeight};
    }


  }else if(formProps.source === "uipart") {

    //console.log("uipart >>>> ", formProps.currentUI);

    let _max = parseFloat(formProps.max);
    if(formProps.path.indexOf('frame.x') > -1){
      _max = _max - parseInt(formProps.currentUI.frame.width);
    }else if(formProps.path.indexOf('frame.y') > -1){
      _max = _max - parseInt(formProps.currentUI.frame.height);
    }

    return {"min": parseFloat(formProps.min), "max": _max};
  }
  
  return {"min": parseFloat(formProps.min), "max": parseFloat(formProps.max)};
  
} */

function mapStateToProps(state) {  
  return {
    //appData: state.appData.data,
    //pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    targetEditor: state.selectedData.editor,
  };
}
export default connect(mapStateToProps)(NumericStepperForm);