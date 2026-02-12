import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, IconButton, Fab } from '@material-ui/core';
import { List, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';


class ListForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      key: this.props.text,
      field: this.props.field,

      selectedIndex: (this.props.selectedIndex) ? this.props.selectedIndex : 0,
    };

    //console.log("ListForm >>>>>", this.props.value, this.props.text, this.props.field);
    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {      
    if(prevProps.value !== this.props.value)
    {
      this.setState({ value: this.props.value });
      if(this.props.value) {
        if(this.state.selectedIndex > (this.props.value.length-1)){
          const _id = this.props.value.length-1;
          this.setState({ selectedIndex: _id });
          this.props.onItemChange(this.props.value[_id],"itemclick");
        }
      }
    }   
  }
  
  handleChangeValue = (event) => {
    this.setState({ value: event.currentTarget.value });    
  };
  
  handleDeleteValue = (event) => {
    let resetData = false;
    let arrData = this.state.value;
    //console.log(event.currentTarget.dataset, "*** handleDeleteValue ***", arrData);
    if(arrData.length > 1) {
      let selectedIndex = event.currentTarget.dataset['index'];
      arrData.splice(selectedIndex, 1);

      if(this.props.path === "panelItems" || this.props.path === "swipeableItems" || this.props.path === "menuItems"
          || this.props.path === "dataFields" || this.props.path === "dataCols"
           || (this.props.path === "dataarray" &&  this.props.source === "Dialog")){
        for (let i = 0; i < arrData.length; i++) {
          const element = arrData[i];
          element['id'] = i;        
        }
      }

    }else {
      resetData = true;
      if(this.props.path === "params.otherBtnTitles"){
        arrData = [];
        const btnObj = {id:"ButtonName-0", title:"", actions: {"clicked":[]}};
        arrData.push(btnObj);
      }
      else if(this.props.path === "segmentItems"){
        arrData = [];
        const segmentObj = {
                  "type":"TextItem", 
                  "text":"", 
                  "imageDic":{"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""}, 
                  "font":{"fontName": "system", "fontSize": 14, "fontWeightNum": 400, "fontWeight": false, "fontStyle": false, "textAlignment": "left", "textColor": {"red": 0, "blue": 0, "green": 0, "alpha": 1, "colorName": ""}, "lineBreakMode": "TailTruncation" }, 
                  "actions":{"clicked":[]}, 
                  "onTapTintColor":{"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""}, 
                  "onTapTextColor":{"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""} 
                };  
        arrData.push(segmentObj);
      }
      else if(this.props.path === "actionButtons"){
        arrData = [];
        const actionButtonObj = { "title":"", "actions":{"clicked":[]}, };  
        arrData.push(actionButtonObj);
      }
      else if(this.props.path === "tabItems"){
        arrData = [];
        const tabObj = {
                  "type":"TextItem", 
                  "text":"", 
                  "imageDic":{"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""}, 
                  "font":{"fontName": "system", "fontSize": 14, "fontWeightNum": 400, "fontWeight": false, "fontStyle": false, "textAlignment": "left", "textColor": {"red": 0, "blue": 0, "green": 0, "alpha": 1, "colorName": ""}, "lineBreakMode": "TailTruncation" }, 
                  "actions":{"clicked":[]}, 
                  "onTapTintColor":{"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""}, 
                  "onTapTextColor":{"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""},
                  "onTapFontWeightNum":600 
                };  
        arrData.push(tabObj);
      }
      else if(this.props.path === "panelItems"){
        arrData = [];
        const panelitemObj = 
              {
                "id": 0,
                "height": 160,                 
                "expanded": true,
                "showheader": true,
                "heading": "Heading",
                "subheading": "",
                "Fields":[],
                "actions":{"onExpand":[]}
              };
        arrData.push(panelitemObj);
      }
      else if(this.props.path === "swipeableItems"){
        arrData = [];
        const swipeableObj = { "id": 0, "Fields":[] };
        arrData.push(swipeableObj);
      }
      else if(this.props.path === "dataCols"){
        arrData = [];
        const datacolsObj = 
              {
                "id":0,
                "fieldname": "",
                "heading": "",
                "width": 100,
                "isSortable": false,
                "isCollapsible": false,
                "isCustom": false,
                "Fields": [],
                "isCustomHeader": false,
                "headerFields": [],
                "isInclude": true                  
              };
        arrData.push(datacolsObj);
      }
      else if(this.props.path === "dataFields"){
        arrData = [];
        const datafieldsObj = 
              {
                "id":0,
                "fieldname": "",
                "displaytext": "",
                "seriescolor": {"alpha": 1, "red": 0.2, "green": 0.4, "blue": 0.6, "colorName": ""},
                "pointShape": "circle",
                "fillpoints": true
              };
        arrData.push(datafieldsObj);
      }
      else if(this.props.path === "menuItems"){
        arrData = [];
        const menuitemsObj = 
              {
                "id": 0,
                "text": "item 0",
                "lineBreak": true,
                "height": 40,
                "actions": {"clicked":[]}
              };
        arrData.push(menuitemsObj);
      }
      else if(this.props.path === "formItems"){
        arrData = [];
        const formitemObj = {
                              "width": 300,
                              "height": 80,
                              "gap": 5, 
                              "label": "",
                              "Fields":[],
                              "itemAlignment": "middle",
                              "required": false
                            };  
        arrData.push(formitemObj);
      }
      else if(this.props.path === "columns"){
        arrData = [];
        const columnsObj = {"width":"1"};
        arrData.push(columnsObj);
      }
      else if(this.props.path === "Containers"){
        arrData = [];
        const containerObj = { "name":"container1", "title":"container1" };  
        arrData.push(containerObj);
      }
      else if(this.props.path === "params.uipartList"){
        arrData = [];
        const uipartObj = { "name":"", "frameX":"", "frameY":"" };  
        arrData.push(uipartObj);
      }
      else {
        if(this.props.path === "dataarray" && this.props['source'] === "Dialog"){
          arrData = [];
          const uipartObj = {"id":0, "name":"Dialog-1", "columns": 1, "rows":1, "gap":1, "height":400, "CellStyle": "custom", "Fields":[]};  
          arrData.push(uipartObj);
        }else {
          let objData = Object.assign({}, arrData[0]);
          for (const key in objData) {
            if (objData.hasOwnProperty(key)) {
              objData[key] = "";        
            }
          }
          arrData = [];
          arrData.push(objData);
        }
      }
    }
    
    this.setState({ value: arrData });
    let _selIndex = arrData.length - 1;
    _selIndex = (_selIndex < 0) ? 0 : _selIndex;
    this.setState({ selectedIndex: _selIndex });  
    //console.log(resetData, _selIndex, "... Delete >>>", arrData);
    if(resetData) {
      this.props.onValueChange(arrData, this.props.dependentActions);
    }
    this.props.onItemChange(arrData[_selIndex],"delete");
  };

  handleAddValue = (event) => {
    let arrData = this.state.value;
    let objData = Object.assign({}, arrData[0]);
    if(this.props.path === "params.otherBtnTitles"){
      const _lastObj = arrData[arrData.length - 1];
      let _lastBtnIndex = (_lastObj) ? (parseInt(_lastObj["id"].replace("ButtonName-", "")) +1 ) : arrData.length;
      objData = {id:"ButtonName-"+_lastBtnIndex, title:"", actions: {"clicked":[]}};
      arrData.push(objData);
    }
    else if(this.props.path === "segmentItems"){
      const segmentObj = {
                "type":"TextItem", 
                "text":"", 
                "imageDic":{"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""}, 
                "font":{"fontName": "system", "fontSize": 14, "fontWeightNum": 400, "fontWeight": false, "fontStyle": false, "textAlignment": "left", "textColor": {"red": 0, "blue": 0, "green": 0, "alpha": 1, "colorName": ""}, "lineBreakMode": "TailTruncation" }, 
                "actions":{"clicked":[]}, 
                "onTapTintColor":{"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""}, 
                "onTapTextColor":{"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""} 
              };  
      arrData.push(segmentObj);
    }
    else if(this.props.path === "actionButtons"){
      const actionButtonObj = { "title":"", "actions":{"clicked":[]}, };  
      arrData.push(actionButtonObj);
    }
    else if(this.props.path === "tabItems"){
      const tabObj = {
                "type":"TextItem", 
                "text":"", 
                "imageDic":{"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""}, 
                "font":{"fontName": "system", "fontSize": 14, "fontWeightNum": 400, "fontWeight": false, "fontStyle": false, "textAlignment": "left", "textColor": {"red": 0, "blue": 0, "green": 0, "alpha": 1, "colorName": ""}, "lineBreakMode": "TailTruncation" }, 
                "actions":{"clicked":[]}, 
                "onTapTintColor":{"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""}, 
                "onTapTextColor":{"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""},
                "onTapFontWeightNum":600 
              };  
      arrData.push(tabObj);
    }
    else if(this.props.path === "panelItems"){
      const _limit = parseInt(this.props.limit);
      if(_limit > -1 && arrData.length === _limit){
        return;
      }
      for (let i = 0; i < arrData.length; i++) {
        const element = arrData[i];
        element['id'] = i;        
      }
      const panelitemObj = 
              {
                "id": arrData.length,
                "height": 160,                    
                "expanded": true,
                "showheader": true,
                "heading": "Heading",
                "subheading": "",
                "Fields":[],
                "actions":{"onExpand":[]}
              };
      arrData.push(panelitemObj);
    }
    else if(this.props.path === "swipeableItems"){
      const _limit = parseInt(this.props.limit);
      if(_limit > -1 && arrData.length === _limit){
        return;
      }
      for (let j = 0; j < arrData.length; j++) {
        const element = arrData[j];
        element['id'] = j;        
      }
      const swipeableObj = { "id": arrData.length, "Fields":[] };
      arrData.push(swipeableObj);
    }
    else if(this.props.path === "dataCols"){
      const _limit = parseInt(this.props.limit);
      if(_limit > -1 && arrData.length === _limit){
        return;
      }
      for (let k = 0; k < arrData.length; k++) {
        const element = arrData[k];
        element['id'] = k;        
      }
      const datacolsObj = 
            {
              "id": arrData.length,
              "fieldname": "",
              "heading": "",
              "width": 100,
              "isSortable": false,
              "isCollapsible": false,
              "isCustom": false,
              "Fields": [],
              "isCustomHeader": false,
              "headerFields": [],
              "isInclude": true                  
            };
      arrData.push(datacolsObj);
    }
    else if(this.props.path === "dataFields"){
      const _limit = parseInt(this.props.limit);
      if(_limit > -1 && arrData.length === _limit){
        return;
      }
      for (let l = 0; l < arrData.length; l++) {
        const element = arrData[l];
        element['id'] = l;        
      }
      const datafieldsObj = 
            {
              "id": arrData.length,
              "fieldname": "",
              "displaytext": "",
              "seriescolor": {"alpha": 1, "red": 0.2, "green": 0.4, "blue": 0.6, "colorName": ""},
              "pointShape": "circle",
              "fillpoints": true
            };
      arrData.push(datafieldsObj);
    }
    else if(this.props.path === "menuItems"){
      const _limit = parseInt(this.props.limit);
      if(_limit > -1 && arrData.length === _limit){
        return;
      }
      for (let m = 0;  m< arrData.length; m++) {
        const element = arrData[m];
        element['id'] = m;        
      }
      const menuitemsObj = 
            {
              "id": arrData.length,
              "text": "item " + arrData.length,
              "lineBreak": true,
              "height": 40,
              "actions": {"clicked":[]}
            };
      arrData.push(menuitemsObj);
    }
    else if(this.props.path === "formItems"){
      const formitemObj = {
                            "width": 300,
                            "height": 80,
                            "gap": 5, 
                            "label": "",
                            "Fields": [],
                            "itemAlignment": "middle",
                            "required": false
                          };
      arrData.push(formitemObj);
    }
    else if(this.props.path === "columns"){
      const _limit = parseInt(this.props.limit);
      if(_limit > -1 &&  arrData.length === _limit){
        return;
      }
      const columnsObj = {"width":"1"};
      arrData.push(columnsObj);
    }
    else if(this.props.path === "Containers"){
      const _name = "container" + (arrData.length +1);
      const containerObj = { "name":_name, "title":"" };  
      arrData.push(containerObj);
    }
    else if(this.props.path === "params.uipartList"){
      const uipartObj = { "name":"", "frameX":"", "frameY":"" };  
      arrData.push(uipartObj);
    }
    else {
      if(this.props.path === "dataarray" && this.props['source'] === "Dialog"){
        const _limit = parseInt(this.props.limit);
        if(_limit > -1 && arrData.length === _limit){
          return;
        }
        for (let d = 0; d < arrData.length; d++) {
          const element = arrData[d];
          element['id'] = d;        
        }
        const uipartObj = {"id":arrData.length, "name":"Dialog-"+(arrData.length+1), "columns": 1, "rows":1, "gap":1, "height":400, "CellStyle": "custom", "Fields":[]};  
        arrData.push(uipartObj);
      }else{
        for (const key in objData) {
          if (objData.hasOwnProperty(key)) {        
            if(Array.isArray(objData[key])) {
              objData[key] = [];
            }else {
              objData[key] = "";        
            }
          }
        }
        arrData.push(objData);
      }
    }
    //console.log(this.props, "... Add >>>", arrData);
    this.setState({ value: arrData });
    const _selIndex = arrData.length - 1;
    this.setState({ selectedIndex: _selIndex });  
    this.props.onItemChange(this.state.value[_selIndex],"add");  
  };

  handleListItemClick = (event) => {
    let selectedIndex = event.currentTarget.dataset['index'];
    selectedIndex = (selectedIndex === -1) ? 0 : selectedIndex;
    this.setState({ selectedIndex: parseInt(selectedIndex) });
    this.props.onItemChange(this.state.value[selectedIndex],"itemclick");
  }

  render() {
    const showIndex = this.props.showIndex;
    const key = this.state.key;
    let value = (this.state.value) ? this.state.value : [];
    value = filterNullKeys(value);
    //console.log(key, "----ListForm >>>", value);

    return (
      <FormGroup style={{width:'100%', height:125, flexDirection:'row', alignItems:'flex-end', justifyContent:'space-around', border: '1px solid #ced4da', borderRadius: 4, }}>
        <FormList component="nav">
          {value.map((item, index) => (
            <ListFormItem key={index} button selected={(index === this.state.selectedIndex)}
                          data-index={index} onClick={this.handleListItemClick.bind(this)}>          
              <FormListText primary={(showIndex) ? index+': '+item[key] : item[key]} />
              <FormListAction >                        
                <IconButton style={{padding:0}} data-index={index}
                            onClick={this.handleDeleteValue.bind(this)} >
                  <DeleteIcon/>
                </IconButton>           
              </FormListAction>
            </ListFormItem>          
          ))}        
        </FormList>
        <Fab color="default" style={{width:24, height:24, minHeight:24, padding:0, marginRight:4, marginBottom:6}}>
          <AddIcon onClick={this.handleAddValue.bind(this)}/>
        </Fab>
      </FormGroup>
    );
  }
}

function filterNullKeys(values) {
  const filterArr = [];

  for (let index = 0; index < values.length; index++) {
    const element = values[index];
    if(element) {
      /* for (const key in element) {
        if (element.hasOwnProperty(key)) {
          if(element[key] === null) {
            filterArr.push(element);
          }        
        }
      } */

      filterArr.push(element);
    }    
  }

  return filterArr;
}

const FormList = withStyles(theme => ({
  root: {
    position: 'relative',
    overflow: 'auto',
    height: 110,    
    width: `calc(100% - 40px)`,
    minWidth: 96,
    padding: 3,
    margin: '4px 0px',
    background: theme.palette.background.default,
    borderRight: '1px solid #ced4da',
    //borderRadius: 4,
    '&:focus': {
      borderColor: theme.palette.primary.main,
    },
  },
}))(List);

const ListFormItem = withStyles(theme => ({
  root: {
    height: 24,
    maxHeight: 24,
    padding: 2,
    fontSize: 14,
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
        //backgroundColor: "#65bc45",
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
            color: theme.palette.common.black,
        },
    },
    '&:hover': {
        background: theme.palette.background.hover,
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
          color: theme.palette.common.black,
        },
    },
    "&$selected": {
      background: theme.palette.background.hover,
    }        
  },
  selected: {}
}))(ListItem);

const FormListText = withStyles(theme => ({
  root: {
    width: '96%',
  },  
  primary: {
    lineHeight: 0.7,
    fontSize: theme.typography.pxToRem(14)  
  },
}))(ListItemText);

const FormListAction = withStyles(theme => ({
  root: {
    right: 0,
  },
}))(ListItemSecondaryAction);

export default ListForm;