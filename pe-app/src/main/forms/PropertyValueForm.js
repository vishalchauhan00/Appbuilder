import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Typography, Button, Tooltip } from '@material-ui/core';
import TextInputForm from './TextInputForm';
import TextAreaForm from './TextAreaForm';
import ColorPickerForm from './ColorPickerForm';
import CheckBoxForm from './CheckBoxForm';
import RadioForm from './RadioForm';
import FileSelectorForm from './FileSelectorForm';
import ActionButtonForm from './ActionButtonForm';
import NumericStepperForm from './NumericStepperForm';
import ComboBoxForm from './ComboBoxForm';
import DropDownForm from './DropDownForm';
import ListForm from './ListForm';
import ListCheckBoxForm from './ListCheckBoxForm';
import SplitViewForm from './SplitViewForm';
import EditorButtonForm from './EditorButtonForm';
import DisplayFormatForm from './DisplayFormatForm';

import { setValidationErrors } from '../ServiceActions';
import JsonInputForm from './JsonInputForm';


class PropertyValueForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isloaded: false,
      formtype: this.props.formtype,
      data: this.props.data,
      property: this.props.property,
      locale: this.props.locale,
      dictionary: this.props.dicObj,
      screenIndex: this.props.screenIndex,

      dependentActions: this.props.dependentActions,
      display: this.props.show,
      option: this.props.options,
      targetVal: [],
    };
  }

  componentDidMount() {
    //console.log(this.props.selectedItem, "...... PropertyValueForm componentDidMount ......", this.state.property);
    this.setInitState();
  }

  componentDidUpdate(prevProps,prevState) {
    if(prevProps.data !== this.props.data)
    {
      //console.log(this.props.selectedItem, "....PropertyValueForm componentDidUpdate ....", this.state.property);      
      this.setState({ data: this.props.data });
      this.setState({ property: this.props.property });
      //console.log(this.props.selectedItem, ".... ################################## ....", this.state.display, this.props.show);
      this.setInitState();
    }
    else if(prevProps.screenIndex !== this.props.screenIndex)
    {
      this.setInitState();
    }
    /* else if(prevProps.show !== this.props.show) {      
      this.setState({ display: this.props.show });
    } */
  }

  setInitState() {
    /* if(this.state.formtype === "action") {
      console.log(this.state.property, " ....selectedActionData >>>> ", this.state.data);
    } */

    let _baseData = this.state.data;
    if(this.props.formtype === "page"){
      _baseData = this.props.currentPage;
    }else if(this.props.formtype === "uipart"){
      _baseData = this.props.currentUI;
    }

    let dataObj = {
                    dictionary: this.state.dictionary,
                    base: _baseData,
                    project: this.props.appData,
                    pagelist: this.props.pageList,
                    page: this.props.currentPage,
                    screenIndex: this.props.screenIndex
                  };
                  
    const _property = this.props.property;//this.state.property;
    //console.log(" ....setInitState >>>> ", _property);
    if(_property.hasOwnProperty('dataSource')) {
      const _dataSrc = _property['dataSource'];
      if(_dataSrc.length === 1 && typeof _dataSrc[0] === "string" && _dataSrc[0].includes('func_')) {
        let dataSrcFunc =  _dataSrc[0].replace("func_", "");
        _property['dataSourceFunction'] = dataSrcFunc;
        if(dataSrcFunc.indexOf("(") > -1) {
          let _funcName =  dataSrcFunc.split("(")[0];
          let _funcArgs =  dataSrcFunc.split("(")[1].replace(")", "");

          let _options = generateDataSource(_funcName, _funcArgs, dataObj);
          //console.log(this.state.property, " ....dataSource >>>> ", _options);
          _property['dataSource'] = _options;
        }
      }
    }
    /* else {
      const _propertyInput = _property['input'];
      if(_propertyInput.indexOf('ComboBox') > -1 || _propertyInput.indexOf('DropDownList') > -1) {
        let _dso = this.state.dataSourceObj;
        _dso.push({path:_property.path, input:_propertyInput});
        //console.log(_propertyInput, "......", _property, "...... _propertyInput ......", _dso);
        this.setState({ dataSourceObj: _dso });
      }
    } */

    if(_property.hasOwnProperty('dependentActions')) {      
      const _actions = _property['dependentActions'];
      if(_actions && _actions.length > 0) { 
        let _key = getKey_forPropertyPath(_property.path, this.props.screenIndex);
        let _value = getPropertyValue(_property.path, this.state.data, this.props.screenIndex);       //(_property.value) ? _property.value : _property.init;
        
        //console.log(this.state.property, "...... setInitState ......", _key, _value);
        //this.props.doDependentActions(_key, _value, _actions, "initForm");
        
        //if(this.state.formtype !== "action") {
          this.props.setDependentActions(_key, _actions);
        //}
        this.handleDependentActions(_key, _value, _actions, "initForm");
      }   
    }

    this.setState({isloaded: true});
  }

  handleSelectedItem = (newvalue, activity) => {
    //console.log(this.props.property, "..... handleSelectedItem newvalue >>>> ", newvalue);
    const inputType = getPropertyInput(this.props.property.input);
    if(inputType === "List" || inputType === "SplitViewForm" || inputType === "ListWithMultipleReference") {
      //const _field = this.props.property['labelField'];
      //const _newIndex = newvalue[_field];
      //console.log(newvalue, "..... newvalue >>>> ", _field, _newIndex);
      let _key = getKey_forPropertyPath(this.props.property.path, this.props.screenIndex);
      if(this.props.formtype === "action") {      
        if(_key.indexOf("params") > -1) {
          _key = _key.replace("params.","");
        }
      }

      let itemArray;
      if(_key.indexOf('.') > -1) {   
        const _arrKey = _key.split('.');
        itemArray = this.props.data[_arrKey[0]][_arrKey[1]];
      }else {
        itemArray = this.props.data[_key];
      }
      let itemIndex = (itemArray) ? itemArray.findIndex(item => item === newvalue) : 0;
      //console.log(newvalue, this.props.data, _key, "..... itemIndex >>>> ", itemIndex, itemArray);
      itemIndex = (itemIndex === -1) ? 0 : itemIndex;

      if(this.props.data['viewType'] === "Dialog"){
        this.props.data['_selectedIndex'] = itemIndex;
      }

      this.props.onUpdateIndex(_key, parseInt(itemIndex)); 
      const _propPath = this.props.property.path;
      // for now putting this check, since below line was commented. Date:03-10-2023
      if(_propPath === "panelItems" || _propPath === "swipeableItems" || _propPath === "dataCols" || (_propPath === "dataarray" && this.props.property['source'] === "Dialog")
          || _propPath === "formItems" || _propPath === "columns") {
        this.props.onUpdateValue(_key, this.props.data);
        if(activity !== "itemclick")   this.handleUpdateValue(newvalue);
      } 
    }
  }

  updateTableRowActions(confPath, actionKey) {    
    if(confPath.indexOf("RecordCellDef") > -1) {
      const tableGroupArr = this.props.data.Children[0].Group;
      for (let i = 0; i < tableGroupArr.length; i++) {
        const tableGroupDic = tableGroupArr[i];
        const recordCellAction = tableGroupDic["RecordCellDef"]['actions'];        
        tableGroupDic["rowarray"][0]['actions'] = JSON.parse(JSON.stringify(recordCellAction));
      }
    }
    //console.log(confPath, actionKey, "... handleActionApply >>>", this.props.data);
  }

  handleActionApply = (source, config, actions) => {
    //console.log(source, this.props['targetEditor'], "******* handleActionApply *********", actions);
    if(source === "page") {
      const propKey = getPropertyKey(config.path);      
      this.updateTableRowActions(config['path'], propKey);
    }
    
    const screensArr = this.props.appData['availableScreens'];
    if(screensArr.length > 1) {
      const currentScreenIndex = this.props.screenIndex;
      const isMasterSlave = this.props.appData['isMasterScreenSet'];

      let masterScreenIndex = 0;
      screensArr.forEach((element, i) => {
        if(element['embed']) {
          masterScreenIndex = i;          
        }
      });
      let changeforAllScreen = false;
      if(isMasterSlave && currentScreenIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }

      if(changeforAllScreen) {
        //console.log(source, config, "... handleActionApply >>>", this.props.data);
        if(source === "page") {
          const propObj = getPropertyObj(config.path);
          if(propObj === "navigationBar") {
            //console.log(source, config, this.props.data, "... handleActionApply >>>", propObj);
            const mainNavdic = JSON.parse(JSON.stringify(this.props.data['_navigationBars'][currentScreenIndex]));
            for (let i = 0; i < screensArr.length; i++) {
              if(i !== currentScreenIndex) {
                this.props.data['_navigationBars'][i] = mainNavdic;
              }        
            }
          }

        }else if(source === "uipart") {
          const propKey = getPropertyKey(config.path);
          const propObj = getPropertyObj(config.path);
          //const uiActions = this.props.data['actions'];
          //const actionArr = uiActions[propKey];
          //console.log(config, this.props, this.props.data, "... handleActionApply >>>", propKey, actionArr);
  
          let updatedUIDef;
          let sourceChildrenArr = getChildrenArray(this.props['currentPage'], this.props['targetEditor'], currentScreenIndex, this.props);
          sourceChildrenArr.forEach(uiContainerDef => {
            let _uiParts = uiContainerDef.uiParts;
            if(_uiParts[currentScreenIndex]['name'] === this.props.data['name']) {
              updatedUIDef = _uiParts;
              for (let index = 0; index < _uiParts.length; index++) {                
                const element = _uiParts[index];
                /*if(index !== currentScreenIndex) {
                  if(this.props['targetEditor'] === "tablecell" && element['name'] !== this.props.data['name']) {
                    continue;
                  }
                }*/

                let actionData = JSON.parse(JSON.stringify(actions));
                if(propObj === "segmentItems" || propObj === "actionButtons" || propObj === "tabItems" || propObj === "menuItems" || propObj === "panelItems") {
                  let items = element[propObj];
                  let itemfound = false;
                  if(this.props['selectedItem']){
                    if(_uiParts[currentScreenIndex]['name'] === this.props['selectedItem']['id']) {
                      const _sIndex = this.props['selectedItem']['index'];
                      if(items[_sIndex]){
                        if(!items[_sIndex]['actions']){
                          items[_sIndex]['actions'] = {};
                          items[_sIndex]['actions'][propKey] = [];
                        }
                        items[_sIndex]['actions'][propKey] = actionData;
                        itemfound = true;
                      }
                    }
                  }
                  if(!itemfound){
                    for(let i=0; i<items.length; i++){
                      items[i]['actions'][propKey] = actionData;
                    }
                  }    
                }else {
                  element['actions'][propKey] = actionData;//actionArr;
                }
                              
              }
            }
            //console.log(this.props['targetEditor'], ".... uipart >>>> ", updatedUIDef); 
            if(!updatedUIDef) {
              let getAllChildrenArr = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              updatedUIDef = getUIpart_forUpdate(getAllChildrenArr, this.props.data, currentScreenIndex, true);
            }     
          });          
          //console.log(propKey, this.props, this.props['targetEditor'], ".... uipart >>>> ", updatedUIDef);
          if(this.props['targetEditor']) {
            if(this.props['targetEditor'] === "tablecell") {
              const _pageObj  = this.props['currentPage'];
              if(_pageObj.Children[0].Group[0]['RecordCellDef']['CellStyle'] === "custom") { 
                _pageObj.Children[0].Group[0]['rowarray'][0]['Fields'] = _pageObj.Children[0].Group[0]['RecordCellDef']['Fields'];          
              }
            
            }else if(this.props['targetEditor'].indexOf("Toolbar") > -1) {
              
              let barType;
              if(this.props['targetEditor'] === "topToolbar")           barType = "_toolBarTop";
              else if(this.props['targetEditor'] === "bottomToolbar")   barType = "_toolBarBottom";
              else if(this.props['targetEditor'] === "leftToolbar")     barType = "_toolBarLeft";
              else if(this.props['targetEditor'] === "rightToolbar")    barType = "_toolBarRight";
    
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              //const toolbarChildren = JSON.parse(JSON.stringify(sourceChildrenArr));
              for (let j = 0; j < screensArr.length; j++) {
                if(j === currentScreenIndex)  continue;            
                //this.props['currentPage'][barType][j]['Children'] = toolbarChildren; 

                let _slaveScreen_toolbarChildren = this.props['currentPage'][barType][j]['Children'];
                for (let index = 0; index < _slaveScreen_toolbarChildren.length; index++) {
                  const uidef = _slaveScreen_toolbarChildren[index];
                  let uidefparts = uidef['uiParts'];
                  if(uidefparts && (uidefparts[j]['name'] === this.props.data['name'])) {
                    //console.log(index, j, this.props.data['name'], "====**====", uidefparts, _updatedUIDef);
                    uidef['uiParts'] = _updatedUIDef;
                    /* if(uidef['uiParts'][j] && uidef['uiParts'][j]['frame']) {
                      uidef['uiParts'][j]['frame'] = uidefparts[j]['frame'];
                    } */
                    if(uidef['uiParts'][j]) {
                      const _uipart = uidef['uiParts'][j];
                      this.resetUIEnableFrameFont(_uipart, uidefparts[j]);                        
                    }
                    break;
                  }                
                }
              }

            }else if(this.props['targetEditor'] === "TileList") {

              const sourceUI = this.props.editorParent['ui'];
              let tilelistUI;
              let _pageUIs = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              _pageUIs.forEach(uipart => {
                if(uipart['viewType'] === "TileList" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
                  tilelistUI = uipart;
                }
              });

              //console.log(this.props, this.props.data, updatedUIDef, "....TileList.... in Dialog >>>>", _pageUIs, tilelistUI);

              /* const tilelistChildren = JSON.parse(JSON.stringify(sourceChildrenArr));
              for (let k = 0; k < screensArr.length; k++) {
                if(k === currentScreenIndex)  continue;            
                tilelistUI['uiParts'][k]['dataarray'][0]['Fields'] = tilelistChildren; 
              } */

              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              if(_updatedUIDef && _updatedUIDef.length > 0) {
                for (let k = 0; k < screensArr.length; k++) {
                  if(k === currentScreenIndex) {
                    _updatedUIDef[1]['actions'] = _updatedUIDef[k]['actions'];
                    continue;
                  }
                  
                  let _slaveScreen_tilelistChildren = tilelistUI['uiParts'][k]['dataarray'][0]['Fields'];
                  for (let index = 0; index < _slaveScreen_tilelistChildren.length; index++) {
                    const uidef = _slaveScreen_tilelistChildren[index];
                    let uidefparts = uidef['uiParts'];
                    /* if(uidefparts && (uidefparts[k]['name'] === this.props.data['name'])) {              
                      uidef['uiParts'] = _updatedUIDef;
                      break;
                    } */
                    if(uidefparts) {
                      //console.log(_updatedUIDef, "updateAllScreensData.... TileList >>>> ", index, uidefparts);
                      if((uidefparts[k]['name'] === this.props.data['name']) && (uidefparts[k]['viewType'] === this.props.data['viewType'])) {              
                        uidef['uiParts'] = _updatedUIDef;
                        if(uidef['uiParts'][k]) {
                          const _uipart = uidef['uiParts'][k];
                          resetUIEnableFrameFont(_uipart, uidefparts[k]);                        
                        }
                        break;
                      }
                    }

                  }
                }
              }

              if(tilelistUI['parent'] === "Dialog") {
                const _dialogUI = this.props['currentPage']['pageOverlay']['Children'][0];
                for (let l = 0; l < screensArr.length; l++) {
                  if(l === currentScreenIndex)  continue;
                  
                  let _slaveScreen_dialogChildren = _dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
                  for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
                    const uidef = _slaveScreen_dialogChildren[index];
                    let uidefparts = uidef['uiParts'];
                    if(uidefparts[l]['name'] === tilelistUI['uiParts'][l]['name']) {             
                      //console.log(propsData, dataObj, tilelistUI, "....TileList.... in Dialog >>>>", l, uidef);
                      uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']));                      
                      break;
                    }                
                  }
                }
              }else if(tilelistUI['parent'] === "topToolbar"){
                for (let t = 0; t < screensArr.length; t++) {
                  if(t === currentScreenIndex)  continue;
                  let _slaveScreen_topBarChildren = this.props['currentPage']["_toolBarTop"][t]['Children'];
                  for (let index = 0; index < _slaveScreen_topBarChildren.length; index++) {
                    const uidef = _slaveScreen_topBarChildren[index];
                    let uidefparts = uidef['uiParts'];
                    if(uidef['viewType'] === "TileList" && (uidefparts[t]['name'] === tilelistUI['uiParts'][t]['name'])) {             
                      uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']))
                      break;
                    }                
                  }
                }
              }else {
                if(tilelistUI && tilelistUI['parent'] === "ExpansionPanel"){
                  for (let e = 0; e < screensArr.length; e++) {
                    if(e === currentScreenIndex)  continue;
  
                    const tileUIParentName = tilelistUI['parentUIName'];  
                    let expansionUI = _pageUIs.filter(function(uipart) {
                      if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][0]['name'] === tileUIParentName)) {
                        return true;
                      }
                      return false;
                    });
  
                    let _slaveScreen_ExpPanelItems = expansionUI[0]['uiParts'][e]['panelItems'];
                    let isfound = false;
                    for (let index = 0; index < _slaveScreen_ExpPanelItems.length; index++) {
                      const element = _slaveScreen_ExpPanelItems[index];
                      if(element.hasOwnProperty('Fields')) {
                        for (let id = 0; id < element['Fields'].length; id++) {
                          const uidef = element['Fields'][id];
                          let uidefparts = uidef['uiParts'];
                          if(uidef['viewType'] === "TileList" && (uidefparts[e]['name'] === tilelistUI['uiParts'][e]['name'])) {             
                            uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']));
                            isfound = true;
                            break;
                          }
                        }
                        if(isfound) break;
                      }                                 
                    }
                  }
                }
              }

            }else if(this.props['targetEditor'] === "Dialog") {

              let dialogUI;
              const overlayChildren = this.props['currentPage']['pageOverlay']['Children'];
              if(overlayChildren.length > 1) {
                const sourceUI = this.props['editorParent']['ui']; 
                let overlayUI = overlayChildren.filter(function(uipart) {
                  if(uipart['viewType'] === "Dialog" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
                    return uipart;
                  }
                  return uipart;
                });  
                if(overlayUI.length > 0) {
                  dialogUI = overlayUI[0];
                }
              }else {
                dialogUI = overlayChildren[0];
              }

              /* const dialogChildren = JSON.parse(JSON.stringify(sourceChildrenArr));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;            
                dialogUI['uiParts'][l]['dataarray'][0]['Fields'] = dialogChildren; 
              } */
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                let _slaveScreen_dialogChildren = dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
                for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
                  const uidef = _slaveScreen_dialogChildren[index];
                  let uidefparts = uidef['uiParts'];
                  if(uidefparts && (uidefparts[l]['name'] === this.props.data['name'])) { 
                    //console.log(this.props.data['name'], overlayChildren, "====* Dialog *====", uidefparts, _updatedUIDef);             
                    uidef['uiParts'] = _updatedUIDef;
                    /* if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    } */
                    if(uidef['uiParts'][l]) {
                      const _uipart = uidef['uiParts'][l];
                      this.resetUIEnableFrameFont(_uipart, uidefparts[l]);                        
                    }
                    break;
                  }                
                }
              }
            }else if(this.props['targetEditor'] === "Drawer") {

              let drawerUI;
              const overlayChildren = this.props['currentPage']['pageOverlay']['Children'];
              if(overlayChildren.length > 1) {
                const sourceUI = this.props['editorParent']['ui']; 
                let overlayUI = overlayChildren.filter(function(uipart) {
                  if(uipart['viewType'] === "Drawer" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
                    return true;
                  }
                  return false;
                });  
                if(overlayUI.length > 0) {
                  drawerUI = overlayUI[0];
                }
              }else {
                drawerUI = overlayChildren[0];
              }
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                let _slaveScreen_drawerChildren = drawerUI['uiParts'][l]['dataarray'][0]['Fields'];
                for (let index = 0; index < _slaveScreen_drawerChildren.length; index++) {
                  const uidef = _slaveScreen_drawerChildren[index];
                  let uidefparts = uidef['uiParts'];
                  if(uidefparts && (uidefparts[l]['name'] === this.props.data['name'])) { 
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l]) {
                      const _uipart = uidef['uiParts'][l];
                      this.resetUIEnableFrameFont(_uipart, uidefparts[l]);                        
                    }
                    break;
                  }                
                }
              }
            }else if(this.props['targetEditor'] === "ExpansionPanel") {
              const exuidata = this.props.editorParent['ui'];
              let exPanelUI;
              let _pageUIs = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              _pageUIs.forEach(uipart => {
                if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][0]['name'] === exuidata['name'])) {
                  exPanelUI = uipart;
                }
              });
  
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let e = 0; e < screensArr.length; e++) {
                if(e === currentScreenIndex)  continue;
                
                const panelIndex = this.props.editorParent['index'];
                if(exPanelUI['uiParts'][e]['panelItems'][panelIndex]) {
                  let _slaveScreen_panelChildren = exPanelUI['uiParts'][e]['panelItems'][panelIndex]['Fields'];
                  for (let pc = 0; pc < _slaveScreen_panelChildren.length; pc++) {
                    const uidef = _slaveScreen_panelChildren[pc];
                    let uidefparts = uidef['uiParts'];                
                    if(!uidefparts[e]['_enabledOnScreen']) {
                      continue;
                    }
                    
                    if((uidefparts[e]['name'] === this.props.data['name']) && (uidefparts[e]['viewType'] === this.props.data['viewType'])) {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][e]) {
                        const _uipart = uidef['uiParts'][e];
                        this.resetUIEnableFrameFont(_uipart, uidefparts[e]);                        
                      }
                    }                
                  }
                }
              }
            }else if(this.props.targetEditor === "SwipeableView") {
              const swipeviewdata = this.props.editorParent['ui'];
              let swipeViewUI;
              let _pageUIs = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              _pageUIs.forEach(uipart => {
                if(uipart['viewType'] === "SwipeableView" && (uipart['uiParts'][0]['name'] === swipeviewdata['name'])) {
                  swipeViewUI = uipart;
                }
              });
  
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                const viewIndex = this.props.editorParent['index'];
                if(swipeViewUI['uiParts'][l]['swipeableItems'][viewIndex]){
                  let _slaveScreen_swipeChildren = swipeViewUI['uiParts'][l]['swipeableItems'][viewIndex]['Fields'];
                  for (let index = 0; index < _slaveScreen_swipeChildren.length; index++) {
                    const uidef = _slaveScreen_swipeChildren[index];
                    let uidefparts = uidef['uiParts'];                
                    if(!uidefparts[l]['_enabledOnScreen']) {
                      continue;
                    }
                    
                    if((uidefparts[l]['name'] === this.props.data['name']) && (uidefparts[l]['viewType'] === this.props.data['viewType'])) {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        this.resetUIEnableFrameFont(_uipart, uidefparts[l]);                        
                      }
                    }                
                  }
                }
              }
            }else if(this.props.targetEditor === "DataGrid") {
              let _editorParent = this.props.editorParent['ui'];
              if(_editorParent && _editorParent['viewType'] !== "DataGrid"){
                _editorParent = this.props.currentUI;
              }
              let dataGridUI;
              let _pageUIs = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              _pageUIs.forEach(uipart => {
                //console.info(_editorParent['name'], "&&&&&&&&&&&&", uipart['uiParts'][0]['name'], "********* DataGrid **********", uipart['uiParts'][1]['name']);
                if(uipart['viewType'] === "DataGrid" && (uipart['uiParts'][currentScreenIndex]['name'] === _editorParent['name'])) {
                  dataGridUI = uipart;
                }
              });
  
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                const fieldIndex = this.props.editorParent['index'];
                if(dataGridUI['uiParts'][l]['dataCols'][fieldIndex]){

                  let _slaveScreen_gridFields = dataGridUI['uiParts'][l]['dataCols'][fieldIndex]['Fields'];
                  let _slaveScreen_gridHeader = dataGridUI['uiParts'][l]['dataCols'][fieldIndex]['headerFields'];
                  let _slaveScreen_gridChildren = (_slaveScreen_gridHeader) ? _slaveScreen_gridFields.concat(_slaveScreen_gridHeader) : _slaveScreen_gridFields;
                  for (let index = 0; index < _slaveScreen_gridChildren.length; index++) {
                    const uidef = _slaveScreen_gridChildren[index];
                    let uidefparts = uidef['uiParts'];  
                    if(uidefparts.length === 0)   continue;              
                    if(!uidefparts[l]['_enabledOnScreen']) {
                      continue;
                    }
                    
                    if((uidefparts[l]['name'] === this.props.data['name']) && (uidefparts[l]['viewType'] === this.props.data['viewType'])) {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        this.resetUIEnableFrameFont(_uipart, uidefparts[l]);                        
                      }
                    }                
                  }
                }
              }
            }else if(this.props.targetEditor === "Popover") {
              const popoverdata = this.props.editorParent['ui'];
              let popoverUI;
              let _pageUIs = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              _pageUIs.forEach(uipart => {
                if(uipart['viewType'] === "Popover" && (uipart['uiParts'][0]['name'] === popoverdata['name'])) {
                  popoverUI = uipart;
                }
              });
  
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                let _slaveScreen_popoverChildren = popoverUI['uiParts'][l]['dataarray'][0]['Fields'];
                for (let index = 0; index < _slaveScreen_popoverChildren.length; index++) {
                  const uidef = _slaveScreen_popoverChildren[index];
                  let uidefparts = uidef['uiParts'];
                  if(uidefparts && (uidefparts[l]['name'] === this.props.data['name'])) { 
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l]) {
                      const _uipart = uidef['uiParts'][l];
                      this.resetUIEnableFrameFont(_uipart, uidefparts[l]);                        
                    }
                    break;
                  }                
                }
              }
            }else if(this.props.targetEditor === "NestedList") {
              let _editorParent = this.props.editorParent['ui'];
              if(_editorParent && _editorParent['viewType'] !== "NestedList"){
                _editorParent = this.props.currentUI;
              }
              let nestedlistUI;
              let _pageUIs = getAllChildrenOnPage(this.props['currentPage'], currentScreenIndex);
              _pageUIs.forEach(uipart => {
                if(uipart['viewType'] === "NestedList" && (uipart['uiParts'][currentScreenIndex]['name'] === _editorParent['name'])) {
                  nestedlistUI = uipart;
                }
              });
  
              const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
              for (let l = 0; l < screensArr.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                let _slaveScreen_mainFields = nestedlistUI['uiParts'][l]['mainCellDef']['Fields'];
                let _slaveScreen_subFields = nestedlistUI['uiParts'][l]['subCellDef']['Fields'];
                let _slaveScreen_nestedChildren = _slaveScreen_mainFields.concat(_slaveScreen_subFields);
            
                for (let index = 0; index < _slaveScreen_nestedChildren.length; index++) {
                  const uidef = _slaveScreen_nestedChildren[index];
                  let uidefparts = uidef['uiParts'];  
                  if(uidefparts.length === 0)   continue;              
                  if(!uidefparts[l]['_enabledOnScreen']) {
                    continue;
                  }
                  
                  if((uidefparts[l]['_uid'] === this.props.data['_uid']) && (uidefparts[l]['viewType'] === this.props.data['viewType'])) {
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l]) {
                      const _uipart = uidef['uiParts'][l];
                      this.resetUIEnableFrameFont(_uipart, uidefparts[l]);                        
                    }
                  }                
                }
              }
            }

          }

          this.props.onUpdateValue("actions", this.props.data['actions']);
        }          
      }else {
    
        /* if(this.props['formtype'] === "uipart" && currentScreenIndex !== masterScreenIndex) {
          
          if(this.props.targetEditor) {
            let sourceChildrenArr = getChildrenArray(this.props['currentPage'], this.props['targetEditor'], masterScreenIndex, this.props);
            if(this.props.targetEditor.indexOf("Toolbar") > -1) {
              sourceChildrenArr.forEach(uiContainerDef => {
                let _uiParts = uiContainerDef.uiParts;
                if(_uiParts && (_uiParts[currentScreenIndex]['name'] === this.props['data']['name'])) {
                  _uiParts[currentScreenIndex] = JSON.parse(JSON.stringify(this.props['data']));
                }
              });          
              console.log(this.props.targetEditor, "......###..", sourceChildrenArr, this.props['data'], "  >>>>", this.props['currentPage']);
            }    
          }
        } */
      }      
    }    
  }

  resetUIEnableFrameFont(uipart, uidef) {
    uipart['_enabledOnScreen'] = uidef['_enabledOnScreen'];
    if(uipart['displayOrderOnScreen']) {
      uipart['displayOrderOnScreen'] = uidef['displayOrderOnScreen'];
    }        
    if(uipart['frame']) {
      uipart['frame'] = uidef['frame'];
    }
    if(uipart.hasOwnProperty('font')) {
      uipart['font']['fontSize'] = uidef['font']['fontSize'];
    }
    if(uipart.hasOwnProperty('normalFont')) {
      uipart['normalFont']['fontSize'] = uidef['normalFont']['fontSize'];
    }

    this.checkImageExist(uipart, uidef);
  }

  checkImageExist(uipart, uidef) {
    const imageUIs = [
      {type:'TextField', obj:'customIcon'}, {type:'NumericField', obj:'customIcon'}, 
      {type:'Image', obj:'image'},
      {type:'Avatar', obj:'avatarSrc'}, {type:'Avatar', obj:'avatarImg'},
      {type:'TextButton', obj:'normalBackgroundImage'}, {type:'TextButton', obj:'selectedBackgroundImage'},
      {type:'ImageButton', obj:'normalImage'}, {type:'ImageButton', obj:'normalBackgroundImage'}, {type:'ImageButton', obj:'selectedImage'}, {type:'ImageButton', obj:'selectedBackgroundImage'},
      {type:'IconButton', obj:'iconImage'}, {type:'IconButton', obj:'iconSelectedImage'},
      {type:'ToggleButton', obj:'normalImage'}, {type:'ToggleButton', obj:'selectedImage'},
      {type:'CheckBox', obj:'normalImage'}, {type:'CheckBox', obj:'selectedImage'},
      {type:'RadioButton', obj:'normalImage'}, {type:'RadioButton', obj:'selectedImage'},
      {type:'ActionButton', obj:'customImage'}, {type:'ComboBox', obj:'customIcon'}, {type:'AutoComplete', obj:'customIcon'},
      {type:'TileList', obj:'accHeaderIconOpen'}, {type:'TileList', obj:'accHeaderIconClose'},
      {type:'Chip', obj:'iconImage'}, {type:'Chip', obj:'deleteImage'},
      {type:'Dialog', obj:'closeIcon'}, {type:'ExpansionPanel', obj:'headerIconClose'}, {type:'ExpansionPanel', obj:'headerIconOpen'}
    ];

    let viewType = uipart['viewType'];
    if(viewType === "Button"){
      viewType = (uipart['buttonType'] === "CheckBox") ? uipart['buttonType'] : uipart['buttonType'] + viewType;
    }
    
    let selectedUI = imageUIs.filter(function(node) {
      if(node['type'] === viewType){
        return true;
      }   
      return false;
    });

    for (let i = 0; i < selectedUI.length; i++) {
      const imageRef = selectedUI[i]['obj'];
      if(uipart[imageRef]['filename'] !== ""){
        uipart[imageRef] = uidef[imageRef];
      }      
    }  
  }
  
  handleUpdateValue = (newvalue, actions) => {    
    const currentScreenIndex = this.props.screenIndex;
    const screensArr = this.props.appData['availableScreens'];
    const isMasterScreenSet = this.props.appData['isMasterScreenSet'];
    const screenObj = {current:currentScreenIndex, isMasterSlave:isMasterScreenSet, screens:screensArr };

    let propPath = (this.props.property.path) ? this.props.property.path : this.props.property.formKey;
    let _key = getKey_forPropertyPath(propPath, currentScreenIndex);
    let _value = getValue_asInputForm(this.props.property.input, newvalue);

    //console.log(currentScreenIndex, this.state.formtype, this.props.property, this.props.data, "..... handleUpdateValue >>>> ", _key, _value, newvalue);
    
    if(_key.indexOf("params") > -1) {
      _key = _key.replace('params.', '');
    }

    let selectedIndex = -1;
    if(_key.indexOf('*') > -1) {
      selectedIndex = this.getSelectedItemIndex(this.props.selectedItem);
      //console.log(this.props.selectedItem, "..... handleDependentActions selectedIndex >>>> ", selectedIndex);
      if(_key === "panelItems[*].id" || _key === "dataCols[*].id"){
        //Date: 24-11-2023. Exclusion for now, need to do proper solution. Also refer NumericStepperForm.js  
      }else{
        let key = _key.replace('*', selectedIndex);
        setValue_forProperty(this.props.data, key, _value, currentScreenIndex);
      }
    }else {
      if(_key === "panelItems" || _key === "swipeableItems" || _key === "dataCols" || _key === "dataFields" || _key === "dataarray" || _key === "formItems" || _key === "columns"){
        //Date: 07-02-2024. Exclusion for now, need to do proper solution.
      }else{
        setValue_forProperty(this.props.data, _key, _value, currentScreenIndex);
      }
    }
    
    if(this.state.formtype === "page") {
      update_relatedPageProperty(this.props.data, _key, _value, currentScreenIndex);
    }else if(this.state.formtype === "uipart") {
      update_relatedUIpartProperty(this.props, _key, _value, currentScreenIndex);
    }

    updateAllScreensData(this.props, _key, screenObj);

    this.props.onUpdateValue(_key, _value);
    //console.log(_key, _value, "..... handleDependentActions >>>> ", this.state.option);

    if(this.state.formtype === "action") {
      this.props.doDependentActions();
    }
    if(actions) {      
      //console.log(this.props.data, _key, _value, "..... handleDependentActions >>>> ", actions);
      if(selectedIndex > -1){
        this.handleDependentActions(_key, _value, actions, "postCommit", selectedIndex);
      }else{
        this.handleDependentActions(_key, _value, actions, "postCommit");
      }
      
      if(this.state.formtype === "action") {
        this.props.doDependentActions(_key, _value, actions, "postCommit");
      }
    }
  };

  handleDependentActions(property, propval, actions, actionType, selectedIndex) {
    const baseData = this.props.data;
    const scrIndex = (this.props.screenIndex) ? this.props.screenIndex : 0;

    let chainedEvents = [];
    //console.log(actionType, ">>>>", property, propval, ".. handleDependentActions >>", actions);
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const attribute = action['attributes'];
      const actionItems = action['children'];
      
      let condResult = false;
      if(attribute.at.indexOf(actionType) > -1){
        //console.log(actionType, action,".. handleDependentActions >>", attribute);

        if(attribute.condition === "compare"){
          const source = attribute['compareTarget'];
          const compareBy = attribute['compareBy'];
          const compareWith = attribute['compareWith'];
          let compareVal;
          if(selectedIndex){
            compareVal = getPropertyValue(getPathValue(attribute['compareTarget']), baseData, scrIndex, selectedIndex);
          }else{
            compareVal = getPropertyValue(getPathValue(attribute['compareTarget']), baseData, scrIndex);
          }
           
          if(source.indexOf("@project") > -1){
            let _valObject = parseTargetValue(source);
            if(_valObject && _valObject.hasOwnProperty('arguments')) {
              const _valArgs = _valObject['arguments'];
              if(_valArgs.indexOf("@page") > -1){
                const pqr123 = getPathValue(_valArgs);
                const xyz123 = this.props['currentPage'][pqr123];
                compareVal = this.compareTargetValue(_valObject['functionName'], xyz123);
                //console.log(property, "..... handleDependentActions >>>> ", _valObject, compareVal);              
              }
            }
          }
                  
          if(this.state.formtype === "action") {
            //console.log(actionType, property, propval, "..... action >>>> ",this.props.data);
            let valObject = parseTargetValue(source);
            if(valObject && valObject['functionName'] !== ""){        
              compareVal = this.getCompareTargetValue(valObject['functionName'], valObject['arguments'], baseData);
            }            
          }
          condResult = getConditionResult(compareVal, compareBy, compareWith);
          //console.log(actionType, property, attribute, "..... handleDependentActions >>>> ", compareWith, ".....", compareVal, condResult);
        }else {
          //console.log(actionType, action,".. handleDependentActions >>", attribute);
          condResult = false;
        }
      }
  
      //console.log(baseData, action, "..... ", property, condResult, "..... handleDependentActions >>>> ", this.state.display);
      
      for (let j = 0; j < actionItems.length; j++) {
        const actionItem = actionItems[j]['attributes'];
        const itemChildren = actionItems[j]['children'];
        const caseof = (actionItem['caseOf'] === "true") ? true : false;          
        //console.log(actionType, property, condResult, caseof, "..... handleDependentActions >>>> ", actionItems, itemChildren);
        if(condResult === caseof){
          this.parseDependentAction(baseData, actionItem, itemChildren, actionType);
          if(itemChildren.length > 0) {
            //console.log(property, propval, actions, "..... handleDependentActions >>>> ", itemChildren);
            this.handleDependentActions(property, propval, itemChildren, actionType);
          }
          if(actionType !== "initForm") {
            let _dependentActions = this.props.dependentActions;
            let _dependentTarget = getPathValue(actionItem.target);
            //console.log(j, actionItem, "....."  ,_dependentTarget, "..... ", _dependentActions);
            if(_dependentTarget) {
              let _action =  _dependentActions.filter(function(node) {
                if(node['key']) {
                  if(node['key'].indexOf('[0]') > -1){
                    node['key'] = node['key'].replace("[0]","[*]");
                  }
                  if(node['key'] === getKey_forPropertyPath(_dependentTarget, scrIndex))   
                    return true;
                }
                return false;
              });

              if(_action.length > 0) {
                let _actionItems = _action[0]['actions'];
                let _dkey = getKey_forPropertyPath(_dependentTarget, scrIndex);
                let _dvalue = getPropertyValue(_dependentTarget, baseData, scrIndex);
                chainedEvents.push({key: _dkey, value: _dvalue, actions: _actionItems});
              }
            }
          }

        }       
      }  
      //}      
    }    

    /*if(baseData['viewType'].indexOf('View') > -1 && chainedEvents.length > 0) {
      chainedEvents.forEach(element => {
        this.handleDependentActions(element['key'], element['value'], element['actions'], actionType);
      });
    } */
  };

  getCompareTargetValue(funcName, argStr, baseData) {
    let _args  = [];
    if(argStr !== ""){
      _args = parseArguments(argStr, baseData, this.props.screenIndex);      
    } 
  
    let _targetValue = this.compareTargetValue(funcName, _args[0]);
    return _targetValue;
  };
  compareTargetValue(funcName, argVal) {
    let _targetValue = "";
    switch(funcName) 
    {
      case "getPageViewType":
        _targetValue = getPageViewType(this.props.pageList, argVal);
        if(_targetValue.indexOf('TableViewNested') > -1){
          _targetValue = 'TableViewNested';
        }else if(_targetValue.indexOf('TableView') > -1){
          _targetValue = 'TableView';
        }        
        break;
      case "getPageViewType2":
        _targetValue = getPageViewType(this.props.pageList, argVal);
        if(_targetValue.indexOf('TableViewList') > -1 || _targetValue.indexOf('TableViewNested') > -1){
          _targetValue = 'TableViewList';
        }else if(_targetValue.indexOf('TableView') > -1){
          _targetValue = 'TableView';
        }        
        break;
      case "getUIpartViewType":
        if(argVal && argVal.length > 0){
          const _scrIndex = this.props.screenIndex;
          let pageUIs = getAllChildrenOnPage(this.props.currentPage, _scrIndex);
          let uiArr =  pageUIs.filter(function(element) {
            const uiPart = (element.uiParts[_scrIndex]) ? element.uiParts[_scrIndex] : element.uiParts[0];
            return (uiPart['name'] === argVal);
          });
  
          if(uiArr.length > 0){
            _targetValue = uiArr[0]['viewType'];
          }else{
            _targetValue = "";
          }          
        }else{
          _targetValue = "";
        }

        break;
      case "getDbFields":
      case "getBracedDbFields":
        
        break;
      case "getTableViewCellStyle":
        _targetValue = getTableViewCellStyle(this.props.pageList, argVal);        
        break;
      default :
      _targetValue = "";
    }  
    return _targetValue;
  };
  
  parseDependentAction(data, action, actionChild, actionType) { 
    const appData = this.props.appData;
    const pageList = this.props.pageList;

    const method = action['method'];
    const target = action['target'];    
    const value = action['value'];
    //console.log(target, method, value, "****** doDependentAction >>>> ", this.state.display); 
    
    //const pathValue = (target) ? getPathValue(target) : "";
    //let property = (action.hasOwnProperty("property")) ? String(action.property) : null;
    //let stopCommit = (String(action.stopCommit) === "true") ? true : false;
    //let chainedEvent = (action.hasOwnProperty("chainedEvent")) ? String(action.chainedEvent) : null;
  
    switch (method)
    {
      case "folded":
      {
        if(target) {
          let foldedVal = (value === "true") ? "false" : "true";            
          let showArr = this.getTargetDisplay(data, target, foldedVal, this.state.display, this.props.selectedItem);  
          //console.log(action, target, foldedVal, " ....do folded Action >>>> ", showArr[showArr.length-1], showArr); 
          this.setState({display: showArr});
        }
        break;
      }
      case "hide":
      {
        if(target){
          let showArr = this.getTargetDisplay(data, target, value, this.state.display, this.props.selectedItem);  
          //console.log(target, value, " ....do hide Action >>>> ", showArr); 
          //console.log(target, value, " ....do hide Action >>>> ", showArr[showArr.length-1]); 
          this.setState({display: showArr});
        }
        break;
      }    
      case "setValue":
      {        
          /* if(target){
            target.value = value;

            let valueArr = this.setTargetValue(data, target, value, this.state.targetVal);
            console.log(data, target, value, " setValue >>>> ", valueArr); 
          } */
        break;
      }
      case "setPath":
      {
        /* if(target)
          target.path = value.toString(); */
          //console.log(target, " setPath >>>> ", value); 
        break;
      }
      case "setProperty":
      {
        //console.log(pathValue, " ....setProperty >>>> ", property, "...", value);
        break;
      }
      case "setOptions":
      {         
        //console.log(value, " ....setOptions >>>> ", this.state.option);
        if(target){
          let options = this.getTargetOption(value, data, appData, pageList);  
          let optionsObj = {target: target, options: options, labelField:action['labelField'], valueField:action['valueField']};
          //console.log(options, " ....setOptions >>>> ", optionsObj);
          
          let optionsArr = this.state.option;

          const findItem = (element) => element['target'] === optionsObj['target'];
          const itemIndex = optionsArr.findIndex(findItem);
          if(itemIndex > -1){
            optionsArr.splice(itemIndex,1,optionsObj);
          }else{
            optionsArr.push(optionsObj);
          }

          this.setState({option: optionsArr});
          if(this.props.formtype === "uipart"){
            data['optionsArr'] = optionsArr;
          }else{
            if(data['optionsArr'])
              delete data['optionsArr'];
          }
          //console.log(optionsArr.length, " ....optionsArr >>>> ", this.state.option);
        }

        /* if(target)
        {
          if(value is Array && value.length > 0)
            value.sort();	
          target.setOptions(value, String(action.@labelField), String(action.@valueField));
        } */
        break;
      }
      case "setConfig":
      {
        /* if(target)
        {
          var _blnValue:Boolean = (value == "true") ? true : false;
          target.setConfigValue(_blnValue, String(action.@config));
        } */
        break;
      }
      case "init":
        {
          /* if(target)
            NumericStepperForm(target).value = value; */
          break;
        }
      case "setMax":
      {
       /*  if(target)
          NumericStepperForm(target).maximum = value; */
        break;
      }
      case "setMin":
      {
        /* if(target)
          NumericStepperForm(target).maximum = value; */
        break;
      }
      case "stopCommit":
      {
        //stopCommit = true;
        break;
      }    
      case "keyValuePair":
      {	
       /*  var str:String = String(action.@target);
        var targetPath:String = str.substring(str.indexOf("@")+1,str.indexOf(":"));
        var str1:String = str.substring(str.indexOf(":")+1,str.indexOf("."));
        var str2:String = str.substring(str.indexOf(".")+1,str.indexOf("}"));
        base[targetPath][str1][str2] = convertToKeyValue(value as Array); */
        
        break;
      }						
      case "keyValueList":
      {	
        /* var temp_str:String = String(action.@target);
        var temp_targetPath:String = temp_str.substring(temp_str.indexOf("@")+1,temp_str.indexOf(":"));
        var temp_str1:String = temp_str.substring(temp_str.indexOf(":")+1,temp_str.indexOf("."));
        var temp_str2:String = temp_str.substring(temp_str.indexOf(".")+1,temp_str.indexOf("}"));
        base[temp_targetPath][temp_str1][temp_str2] = convertToArray(value as Array); */
        
        break;
      }
      case "dependentConditions":
      {
        //console.log(action, " ....dependentConditions >>>> ", actionChild);
        this.handleDependentActions(target, action['caseOf'], actionChild, actionType);

        /* var xListDependentWhen:XMLList = action.descendants( "when" );
        var xmlDependentActions:XML = xListDependentWhen[0];
        if (xmlDependentActions)
        {
          dispatchActionsToGo(inputForm, xmlDependentActions);
        } */
        break;
      }
      default:
      {
        if (action.hasOwnProperty("args"))
          doMethodByPath(method, action['args']);
        else
          doMethodByPath(method);
      }
    }
    
  };

  getTargetDisplay(data, target, displayVal, displayArr, selectedData) {
    const targetObj = getPathValue(target, data);
    //console.log(target, displayVal, "..... getTargetDisplay >>>> ", data, targetObj, displayArr);
    let _displayArr =  displayArr.filter(function(node) {
      if(node[targetObj]){
        node[targetObj] = displayVal;
        return true;
      }   
      return false;
    });
    
    let showObj = {};
    showObj[targetObj] = displayVal;
    showObj['targetValue'] = getPropertyValue(targetObj, data, this.props.screenIndex);
    if(_displayArr.length === 0) {
      displayArr.push(showObj);
    }
    //console.log(data, "..... getTargetDisplay >>>> ", targetObj, displayArr);
    return displayArr;
    //return {targetId: selectedData['id'], targetDisplay: displayArr};
  };

  getTargetOption(valFunc, data, appData, pagelist) {
    let valObject = parseTargetValue(valFunc);
    
    let baseData = this.state.data;
    if(this.props.formtype === "page"){
      baseData = this.props.currentPage;
    }else if(this.props.formtype === "uipart"){
      baseData = this.props.currentUI;
    }

    let dataObj = {
      dictionary: this.state.dictionary,
      base: baseData,
      project: this.props.appData,
      pagelist: this.props.pageList,
      page: this.props.currentPage,
      screenIndex: this.props.screenIndex
    };
    
    let _options = generateDataSource(valObject['functionName'], valObject['arguments'], dataObj);
    return _options;  
  };

  setTargetValue(data, target, val, valArr) {
    valArr.push({target:target, value:val});
    return valArr;
  }

  getSelectedItemIndex(selectedItem) {
    if(selectedItem && selectedItem.hasOwnProperty('editor')){
      if(selectedItem['editor'] === "uipart") {
        if(selectedItem['id'] === this.props.currentUI['name']) {
          return selectedItem['index'];
        }
      }else if(selectedItem['editor'] === "page") {
        if(selectedItem['id'] === this.props.currentPage['pageid']) {
          return selectedItem['index'];
        }
      }else if(selectedItem['editor'] === "action") {
        return selectedItem['index'];
      }
    }
    
    return 0;  
  };

  handleValidationError = (type, message) => {
    //console.log(this.props, "handleValidationError ... >>", type, message);

    const verrorArr = this.setValidationErrorArray(message);
    this.props.dispatch(setValidationErrors(verrorArr));
  }
  setValidationErrorArray(msg) {
    const _arr = this.props.validationErrors;

    /* let errorexist = false;
    _arr.forEach(item => {
        if(item['pageid'] === this.props.currentPage['pageid'] && item['name'] === this.props.data['name']) {
          errorexist = true;
          //item['conditions'] = condData;
        }            
    });
    if(!errorexist) {
      const errorObj = {pageid: this.props.currentPage['pageid'], name: this.props.data['name'], type: getUIViewtype(this.props.data), message: msg};
      _arr.push(errorObj);
    } */
    
    return _arr;
  }
  

  render() {
    const {isloaded, formtype} = this.state;
    if(!isloaded) {
      return null;
    }

    const data = this.props.data;
    const locale = this.props.locale;
    const property = this.props.property;
    
    /* const isAction = (formtype === "action") ? true : false;
    if(isAction){
      if(property.hasOwnProperty('formKey')){
        property.path = property.formKey;
      }else if(property.hasOwnProperty('path')){
        //property.path = property.path.replace("params.", "");
      }
    } */
    
    const inputType = getPropertyInput(property.input);
    //const inputId = inputType.toString().toLowerCase() + property.path;    
    const selectedIndex = this.getSelectedItemIndex(this.props.selectedItem);
    const propPath = (property.path) ? property.path : property.formKey;
    const pathvalue = getPropertyValue(propPath, data, this.props.screenIndex, selectedIndex);
    //console.log(this.props.screenIndex, property.path, ".... pathvalue >>>>>>>", pathvalue);
    const propertyPath = (property.hasOwnProperty('formKey')) ? property.formKey : property.path;  
    const propertyLocale = getPropertyLocale(propertyPath, locale);  
    const inputLocale = propertyLocale['text'];
    const inputTtip = propertyLocale['tooltip'];
    //console.log(propertyPath, " .... inputLocale >>>>>>>", inputLocale, " ......", inputTtip);
    //console.log(this.state.dictionary, " .... inputLocale >>>>>>>", locale);
    let inputDisplay = '';
    if(this.state.display.length > 0) {
      inputDisplay = getInputVisibility(propertyPath, this.state.display);
      //console.log(data, this.state.display,".... input render >>>>", propertyPath, inputDisplay);
    }
    if(property.hasOwnProperty('disable') && property['disable'] === "true") {
      inputDisplay = 'none';
    }
    //console.log(this.state.display, property.path, " .... input render >>>>>", inputDisplay);

    let inputOptions = '';
    let dataoptionsArr = (this.props.data.hasOwnProperty('optionsArr')) ? this.props.data['optionsArr'] : this.state.option;
    if(dataoptionsArr.length > 0) {
      //console.log(propertyPath, ".... this.state.option >>>>>>>", this.state.option.length);
      inputOptions = getInputOptions(propertyPath, dataoptionsArr);
      if(property.hasOwnProperty('dataSource')) {
        //console.log(property, propertyPath, this.state.option, ".... inputOptions >>>>>>>", inputOptions);
        if(inputOptions.hasOwnProperty('options')) {
          property.dataSource = inputOptions['options'];
        }
      }
    }

    let formheight = (formtype === "action") ? 48 : 32;

    let formMockup;
    switch (inputType) {
      case "TextInput":
        formMockup = <TextInputForm source={formtype} value={pathvalue} config={property} pageChildren={getAllChildrenOnPage(this.props['currentPage'], this.props.screenIndex, true)}
                                    onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} onValidationError={(...args) => this.handleValidationError(args[0])} />;
        break;
      case "TextArea": 
      {
        formheight = (property.heightInLines) ? 'fit-content' : 100;
        formMockup = <TextAreaForm source={formtype} lineHeight={property.heightInLines} value={pathvalue} onValueChange={this.handleUpdateValue} />;
        break;
      }
      case "NumericStepper": 
      {
         //console.log(propertyPath, "<<?. NS .?>>>", pathvalue);
        const step = (property.inc) ? property.inc : 1;
        let numval = (pathvalue === undefined) ? 0 : pathvalue;
        let maxVal = property.max;
        const screenArr = this.props.appData['availableScreens']
        const editorFrame = getTargetEditorFrame(this.props, screenArr);
        if(formtype === "uipart" && editorFrame) {
          //console.log(propertyPath, "<<?. NS .?>>>", property.max, editorFrame);
          if(propertyPath.indexOf('frame') > -1) {
            if(propertyPath.indexOf('y') > -1 || propertyPath.indexOf('height') > -1) {
              maxVal =  (maxVal < editorFrame['height']) ? maxVal : editorFrame['height'];
            }else if(propertyPath.indexOf('x') > -1 || propertyPath.indexOf('width') > -1) {
              maxVal =  (maxVal < editorFrame['width']) ? maxVal : editorFrame['width'];
            }
          }
        } 
        formMockup = <NumericStepperForm path={propertyPath} source={formtype} editorFrame={editorFrame} min={property.min} max={maxVal} step={step}
                                         value={numval} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      }
      case "ColorPicker":
        formMockup = <ColorPickerForm value={pathvalue} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      case "CheckBox":
        formMockup = <CheckBoxForm source={formtype} path={propertyPath} data={data} value={pathvalue} label="" dependentActions={property.dependentActions} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      case "RadioButton":
      {    
        formheight = 100;
        formMockup = <RadioForm groupname={property.path} value={pathvalue} options={property.dataSource} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      }
      case "ComboBox":
      {
        //console.log(property, "<<<< ComboBox >>>>", inputOptions);
        let dataoptions = (property.dataSource) ?  property.dataSource : inputOptions['options'];
        let datatext = (property.labelField) ?  property.labelField : inputOptions['labelField'];
        let datafield = (property.valueField) ?  property.valueField : inputOptions['valueField'];
        formMockup = <ComboBoxForm value={pathvalue} options={dataoptions} text={datatext} field={datafield} dependentActions={property.dependentActions} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      }
      case "ComboBox1":
      case "DropDownList":
      {
        let dataoptions = (property.dataSource) ?  property.dataSource : inputOptions['options'];
        let datatext = (property.labelField) ?  property.labelField : inputOptions['labelField'];
        let datafield = (property.valueField) ?  property.valueField : inputOptions['valueField'];
        let sortable = (property.sortable) ? property.sortable : "true";
        let datatype = (property.dataType) ? property.dataType : "";
        //console.log(propertyPath, "<<<<", inputType, ".....", datatext, datafield, ">>>>",  inputOptions, dataoptions);
        formMockup = <DropDownForm value={pathvalue} options={dataoptions} text={datatext} field={datafield} sortable={sortable} datatype={datatype} dependentActions={property.dependentActions} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      }
      case "List":
      {
        formheight = 150;
        //console.log(pathvalue, "<<<< List >>>>", property);
        const _selectedIndex = (data['viewType'] === "Dialog" && data['_selectedIndex']) ? data['_selectedIndex'] : 0;
        const _showIndex = (property['showIndex'] && property['showIndex'] === "true") ? true : false;
        formMockup = <ListForm path={propertyPath} value={pathvalue} text={property.labelField} field={property.valueField} limit={property.limit} source={property.source} selectedIndex={_selectedIndex} showIndex={_showIndex}
                               dependentActions={property.dependentActions} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} onItemChange={(...args) => this.handleSelectedItem(args[0],args[1])} />;
        break;
      }
      case "ListWithMultipleReference":
      {
        formheight = 150;
        //console.log(pathvalue, "<<<< ListWithMultipleReference >>>>", property);
        formMockup = <ListForm path={propertyPath} value={pathvalue} text={property.labelField} field={property.valueField} dependentActions={property.dependentActions} 
                               onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} onItemChange={(...args) => this.handleSelectedItem(args[0],args[1])} />;
        break;
      }
      case "ListWithCheckBox":
      {
        formheight = (property.formheight) ?  parseInt(property.formheight) : 120;
        //console.log(property, "<<<< ListWithCheckBox >>>>", inputOptions);
        let dataoptions = (property.dataSource) ?  property.dataSource : inputOptions['options'];
        let datatext = (property.labelField) ?  property.labelField : inputOptions['labelField'];
        let datafield = (property.valueField) ?  property.valueField : inputOptions['valueField'];
        let mandatoryCount = (property.mandatoryCount) ?  property.mandatoryCount : 0;
        const sortableList = (property.sortable) ? property.sortable : "true";
        formMockup = <ListCheckBoxForm value={pathvalue} options={dataoptions} text={datatext} field={datafield} count={mandatoryCount} formheight={formheight} sortable={sortableList}
                                       onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} dependentActions={property.dependentActions}  />;
        break;
      }
      case "SplitViewForm":
      {
        formheight = 180;
        formMockup = <SplitViewForm value={pathvalue} text={property.labelField} selectedIndex={selectedIndex} data={this.props.currentPage}
                                    dependentActions={property.dependentActions} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} onItemChange={(...args) => this.handleSelectedItem(args[0],args[1])} />;
        break;
      }
      case "TextInputWithButton":       
        formMockup = <FileSelectorForm source={formtype} init={property.init} type={property.dataType} value={pathvalue} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      case "LabelWithButton": 
      {
        if(property['popup'] === undefined) {
          //console.log(this.props, property, "<<<< LabelWithButton >>>>", pathvalue);
          formMockup = <ActionButtonForm source={formtype} value={pathvalue} config={property} currentScreenIndex={this.props.screenIndex} 
                                         onActionApply={(...args) => this.handleActionApply(args[0],args[1],args[2])} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        }else if(property['popup'].indexOf("Editor") !== -1) {
          formMockup = <EditorButtonForm value={pathvalue} config={property} selectedItem={this.props.selectedItem} currentScreenIndex={this.props.screenIndex} />;
        }else
          formMockup = <Button disableRipple variant="contained" style={{textTransform:'none', width:142, height:24, padding:0}}>{property.popup}</Button>;
        break;      
      }
      case "InputFormatForm":
        let dataoptions = (property.dataSource) ?  property.dataSource : inputOptions['options'];
        //console.log(property, "<<<< InputFormatForm >>>>", inputOptions, dataoptions);
        if(!dataoptions)  dataoptions = []; 
        formMockup = <DisplayFormatForm source={formtype} value={pathvalue} options={dataoptions} config={property} dependentActions={property.dependentActions} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      case "DateFieldEditor":
        formMockup = <TextInputForm source={formtype} value={pathvalue} config={property} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      case "JsonInput":
        formheight = (property.heightInLines) ? 'fit-content' : 100;
        formMockup = <JsonInputForm source={formtype} value={pathvalue} config={property} onValueChange={(...args) => this.handleUpdateValue(args[0],args[1])} />;
        break;
      default:
        inputDisplay = 'none';
        formMockup = <Typography style={{width:140, height:24, backgroundColor:'#e5e7e8', border:'1px solid #ced4da', borderRadius: 4}}></Typography>;
        break;
    }

    return (
      <>
        {formtype === "action" && 
          <FormGroup name={propPath} 
                    style={{display:inputDisplay, flexDirection:'row', alignItems:'center', justifyContent:'start', 
                              height:formheight, width:'100%', maxWidth:240, padding:2,
                              border:'1px solid lightgrey', borderRadius:8 }}>
            <Tooltip title={inputTtip}>
              <Typography variant="caption" style={{minWidth:175, maxHeight:24}}>{inputLocale} :</Typography>
            </Tooltip>
            <div style={{width:'100%', height:'100%', margin:'0px 6px'}}>
              {formMockup}
            </div>
          </FormGroup>
        }
        {formtype !== "action" && 
          <FormGroup name={propPath} style={{display:inputDisplay, height:formheight, flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'start', maxWidth:300 }}>
            <Tooltip title={inputTtip}>
              <Typography variant="caption" style={{minWidth:150, maxHeight:24}}>{inputLocale} :</Typography>
            </Tooltip>
            {formMockup}
          </FormGroup>
        }
      </>
    );
  }
}

function getTargetEditorFrame(propsObj, scrArr) {      
  const editor = propsObj['targetEditor'];
  const pageData = propsObj['currentPage'];
  const scrId = propsObj['screenIndex'];
  
  let frameObj;
  let frameWid;
  let frameHei;
  if(pageData.viewType === "ScrollView") {
    frameObj = pageData.Children[0]._frames[scrId];
    frameWid = frameObj.width;
    frameHei = frameObj.height;
  }else {
    frameObj = (scrArr[scrId]) ? scrArr[scrId] : pageData.frame;
    frameWid = frameObj.width;
    frameHei = frameObj.height;
    if(!pageData.StatusBarHidden) {
      frameHei = frameHei - 20;
    }
    if(!pageData.NavigationBarHidden) {
      frameHei = frameHei - 44;
    }
    if(!pageData._tabBarHiddens[scrId]) {
      frameHei = frameHei - 49;
    }
    if(!pageData['_toolBarTop'][scrId].hidden) {
      frameHei = frameHei - parseInt(pageData['_toolBarTop'][scrId]['frame']['height']);
    }
    if(!pageData['_toolBarBottom'][scrId].hidden) {
      frameHei = frameHei - parseInt(pageData['_toolBarBottom'][scrId]['frame']['height']);
    }
  }
  
  if(editor) {
    const editorName = editor.toLowerCase();
    if(editorName.indexOf('toolbar') > -1) {
      if(editorName === "toptoolbar") {
        frameHei = pageData['_toolBarTop'][scrId]['frame']['height'];
      }else if(editorName === "bottomtoolbar") {
        frameHei = pageData['_toolBarBottom'][scrId]['frame']['height'];
      }else if(editorName === "lefttoolbar") {
        frameWid = pageData['_toolBarLeft'][scrId]['frame']['width'];
        if(pageData['_toolBarLeft'][scrId]['view'] === "FreeScroll") {
          frameHei = pageData['_toolBarLeft'][scrId]['frame']['height'];
        }else {
          frameHei = (scrArr[scrId]) ? scrArr[scrId]['height'] : pageData['_toolBarLeft'][scrId]['frame']['height'];
        }
      }else {
        frameWid = pageData['_toolBarRight'][scrId]['frame']['width'];
        if(pageData['_toolBarRight'][scrId]['view'] === "FreeScroll") {
          frameHei = pageData['_toolBarRight'][scrId]['frame']['height'];
        }else {
          frameHei = (scrArr[scrId]) ? scrArr[scrId]['height'] : pageData['_toolBarRight'][scrId]['frame']['height'];
        }
      }
      //console.log(scrId, editor, "getTargetEditorFrame ****", frameWid, frameHei, pageData);

    }else if(editorName === "tablecell"){
      if(pageData.Children[0] && pageData.Children[0].Group){
        frameHei = pageData.Children[0].Group[0]['RecordCellDef']['height'];
      }
    }else if(editorName === "subtablecell" && pageData.viewType === "DbTableViewNestedList"){
      if(pageData.Children[0] && pageData.Children[0].Group){
        frameHei = pageData.Children[0].Group[0]['SubRecordCellDef']['height'];
      }
    }
    else if(editorName === "dialog" || editorName === "pageoverlay") {
      frameObj = pageData.frame;
      const scrObj = scrArr[scrId];
      frameWid = (scrObj) ? scrObj.width : frameObj.width;

      let overlayChildren = pageData['pageOverlay']['Children'];
      let dialogUI;
      if(overlayChildren.length > 1) {
        let overlayUI = overlayChildren.filter(function(uipart) {
          if(uipart['viewType'] === "Dialog") {
            return true;
          }
          return false;
        });  
        if(overlayUI.length > 0) {
          dialogUI = overlayUI[0];
        }
      }else {
        dialogUI = overlayChildren[0];
      }      
      const dialogIndex = (propsObj['editorParent']['index']) ? propsObj['editorParent']['index'] : 0;
      frameHei = (dialogUI) ? parseInt(dialogUI['uiParts'][scrId].dataarray[dialogIndex].height) : ((scrObj) ? scrObj.height : frameObj.height); 

    }else if(editorName === "drawer") {
      frameObj = pageData.frame;
      const scrObj = scrArr[scrId];
      frameWid = (scrObj) ? scrObj.width : frameObj.width;

      let overlayChildren = pageData['pageOverlay']['Children'];
      let drawerUI;
      if(overlayChildren.length > 1) {
        let overlayUI = overlayChildren.filter(function(uipart) {
          if(uipart['viewType'] === "Drawer") {
            return true;
          }
          return false;
        });  
        if(overlayUI.length > 0) {
          drawerUI = overlayUI[0];
        }
      }else {
        drawerUI = overlayChildren[0];
      }      
      frameHei = (drawerUI) ? parseInt(drawerUI['uiParts'][scrId].dataarray[0].height) : ((scrObj) ? scrObj.height : frameObj.height);
            
    }
  }

  return {width: frameWid, height: frameHei};
}


function getPropertyInput(input) {   
  if(input.indexOf('.') > -1)
  {   
    let _arrInput = input.split('.');
    return _arrInput[(_arrInput.length - 1)];
  }else {
    return input;
  }
}

function getPropertyValue(key, data, screenIndex, selectedIndex) {
  let val = data;
  //console.log(val, "key >>>>>>>", key);
  if(key === undefined)   return val;
  
  key = getKey_forPropertyPath(key, screenIndex); 
  if(key.indexOf('.') > -1 || key.indexOf('['))
  {
    key = key.toString().replace(/\[/g,'.').replace(/\]/g,'');
    let _arrKey = key.split('.');

    if(_arrKey.length > 1){
      for (let index = 0; index < _arrKey.length; index++) {
        let element = _arrKey[index];
        if(element === "params")  continue;
        /* if(!isNaN(element)) {
          if(screenIndex > 0  && screenIndex !== parseInt(element)) {
            if(typeof val === 'object' && val[screenIndex]) {
              element = screenIndex;
            }
          }
        } */  
        if(element === "*") {
          //console.log(key, "...getPropertyValue selectedIndex >>>", selectedIndex);
          element = (selectedIndex) ? selectedIndex : 0;
        }
        //console.log(val, key, "key >>>>>>>", element);
        val = (val) ? val[element] : "";      
      }
    }else {
      val = (val) ? val[key] : "";
    }
  }
  //console.log(data, "PropertyValue  ############", key, val);
  /* if(key === 'wireframeUnvisible') {
    val = !val;
  } */

  if(typeof val === "string" && val.indexOf('page_') > -1){
    val = val.replace("page_","");

    //console.log(key, "..... getPropertyValue ....", val);
  }

  return val;
}

function getPropertyLocale(propertyPath, arrLocale) {
  let localeText;
  let localeTtip;

  if(propertyPath) {
    propertyPath = propertyPath.replace("params.", "");
  }
  
  if(arrLocale && arrLocale.length > 0) {
    let objLocale = arrLocale[0];
    if(objLocale.hasOwnProperty(propertyPath)){
      localeText = objLocale[propertyPath];
      
      const propertyTtip = propertyPath + "._toolTip";
      localeTtip = (objLocale.hasOwnProperty(propertyTtip)) ? objLocale[propertyTtip] : localeText;
  
      //console.log(propertyPath, objLocale, " .... getPropertyLocale >>>>>>>", localeText, localeTtip);
      return {text: localeText, tooltip: localeTtip};
    }
  }
  
  localeText = getPropertyKey(propertyPath);  
  return {text: localeText, tooltip: localeText};  
}

function getPropertyKey(key) {
  if(key === undefined)   return;
  if(key.indexOf('.') > -1 || key.indexOf('['))
  {
    key = key.toString().replace(/\[/g,'.').replace(/\]/g,'');
    let _arrKey = key.split('.');
    if(_arrKey.length > 1){
      return _arrKey[_arrKey.length -1];
    }
  }
  return key;
}
function getPropertyObj(key) {
  if(key === undefined)   return;
  if(key.indexOf('.') > -1 || key.indexOf('['))
  {
    key = key.toString().replace(/\[/g,'.').replace(/\]/g,'');
    let _arrKey = key.split('.');
    return _arrKey[0];
  }
  return key;
}
function getPropertyArray(key) {
  if(key === undefined)   return;
  if(key.indexOf('.') > -1 || key.indexOf('['))
  {
    key = key.toString().replace(/\[/g,'.').replace(/\]/g,'');
    let _arrKey = key.split('.');
    return _arrKey;
  }
  return [key];
}

function getKey_forPropertyPath(key, screenIndex) {
  if(!key) return key;
  if(!screenIndex)  screenIndex = 0;

  if(key.indexOf('navigationBar') !== -1){
    key = key.toString().replace('navigationBar','_navigationBars['+screenIndex+']');
  }
  if(key.indexOf('toolBarTop') !== -1){
    key = key.toString().replace('toolBarTop','_toolBarTop['+screenIndex+']');
  }
  if(key.indexOf('toolBarBottom') !== -1){
    key = key.toString().replace('toolBarBottom','_toolBarBottom['+screenIndex+']');
  }
  if(key.indexOf('toolBarLeft') !== -1){
    key = key.toString().replace('toolBarLeft','_toolBarLeft['+screenIndex+']');
  }if(key.indexOf('toolBarRight') !== -1){
    key = key.toString().replace('toolBarRight','_toolBarRight['+screenIndex+']');
  }
  if(key.indexOf('TabBarHidden') !== -1){
    key = key.toString().replace('TabBarHidden','_tabBarHiddens['+screenIndex+']');
  }

  return key;
}


function getValue_asInputForm(type, value) {
  let propVal= "";

  type = getPropertyKey(type);

  if(type !== undefined){
    switch (type){
        case "ColorPicker":
            propVal = setColorDic(value);
            break;        
        case "TextInputWithButton":
            propVal = value;
            break;                    
        case "LabelWithButton":
            propVal = value;
            break;        
        default:
          propVal = value;
    }
  }
  return propVal;
}

function setColorDic(colorValue) {
  let hex = parseInt(colorValue.substring(1), 16);
  let numRed = (hex & 0xff0000) >> 16;
  let numGreen = (hex & 0x00ff00) >> 8;
  let numBlue = hex & 0x0000ff;
  
  let objColor = { 
                    alpha: 1,
                    red: numRed/255,
                    green: numGreen/255,
                    blue: numBlue/255,
                    colorName: '',
                  };

  return objColor;
}

function setValue_forProperty(data, property, value, scrIndex) {
  if(property.toString().toLowerCase().indexOf('page') > -1) {
    value = "page_"+value;
  }

  //console.log("...setValue_forProperty >>>>", data, property, value);
  if(property.indexOf('.') > -1 || property.indexOf('['))
  {
    property = property.toString().replace(/\[/g,'.').replace(/\]/g,'');
    let arrProps = property.split('.');
    let propsLen = arrProps.length;
    let mainprop = arrProps[propsLen-1];
    for (let index = 0; index < propsLen-1; index++) {
      let prop = arrProps[index];
      /* if(!isNaN(prop)) {
        if(scrIndex !== parseInt(prop)) {
          if(typeof data === 'object' && data[scrIndex]) {
            prop = scrIndex;
          }
        }
      } */
      if( !data[prop] ) {
        data[prop] = {};          
      }
      data = data[prop];        
      //console.log(index, prop, "...setValue_forProperty >>>>", data);
    }      
    data[mainprop] = value;
    
  }else {
    data[property] = value;
  }  
}

function update_relatedPageProperty(pagedata, property, value, screenIndex) {
  if(pagedata.viewType.indexOf("TableViewList") > -1) {
    const tabledata = pagedata.Children[0];
    const groupdata = pagedata.Children[0].Group;
    const groupObj = groupdata[0];

    if(property.indexOf("ServiceName") > -1) {
      tabledata['ServiceName'] = groupObj['ServiceName'];
      if(groupObj['ServiceName'] === "" || groupObj['ServiceName'] === "LocalDB") {
        tabledata['viewType'] = replaceViewType("Db", tabledata['viewType']);
      }else {
        tabledata['viewType'] = replaceViewType("Remote", tabledata['viewType']);
      }
      pagedata['viewType'] = tabledata['viewType'];

      groupObj['tablename'] = "";
      tabledata['tablename'] = "";

    }else if(property.indexOf("tablename") > -1) {
      tabledata['tablename'] = groupObj['tablename'];

    }else if(property.indexOf("_tmpCellStyle") > -1) {
      tabledata['tmpCellStyle'] = value;
      groupObj['RecordCellDef']['CellStyle'] = value;
      groupObj['rowarray'][0]['CellStyle'] = value;

    }else if(property.indexOf("RecordCellDef") > -1) {
      if(property.indexOf("mainImage") > -1) {
        //console.log(pagedata, "TableView group >>>> ", groupdata);
        groupObj['RecordCellDef']['mainImage'] = {"srcLocation": "bundle", "filename": value, "fileext": "", "url": "", "imageName": "", "author": "", "copyright": "" };
      }
      groupObj['rowarray'][0] = groupObj['RecordCellDef'];

      /* if(groupObj.hasOwnProperty("RecordCells") > -1) {
        groupObj['RecordCells'][screenIndex] = JSON.parse(JSON.stringify(groupObj['RecordCellDef']));
      }
      console.log(pagedata, "TableView group >>>> ", tabledata, groupdata); */
    }
    
  }
}
function replaceViewType(type, viewType) {
  const regExp = /(Db|Remote)\W*/;
  if(viewType) {
    viewType = viewType.replace(regExp, type);
  }
  return viewType;
}

function update_relatedUIpartProperty(propObj, property, value, screenIndex) {
  const uidata = propObj['data'];
  if(uidata['viewType'] === "ComboBox" || uidata['viewType'] === "AutoComplete") {
    if(property === "fieldname") {
      uidata['displayText'] = uidata['fieldname'];
    }
  }

  if(property === "stylename"){

    if(value !== "custom"){
      setUICustomStyle(uidata);   //need to save custom style values

      const uitype = getUIViewtype(uidata);
      const uistyle = propObj.appData['AppStyle']['UIpartStyle'];
      let options = [];
      const uipartStyle = uistyle.find(x => x['name'] === uitype)['style'];
      for (let i= 0; i< uipartStyle.length; i++) {
        if(uipartStyle[i]['name'] === value){
          options = uipartStyle[i]['children'];
        }
      }
  
      updateUIpartStyle(uidata, options);

    }else{
      applyUICustomStyle(uidata);
    }

  }
  /*else if(property === "panelItems" || property === "swipeableItems" || property === "dataCols" || property === "dataFields") {
    uidata[property] = value;
  }*/
}

function setUICustomStyle(uidata) {
  if(!uidata['customstyle']){
    uidata['customstyle'] = {'background': {}, 'border': {}, 'font': {}, 'text': {}};
  }

  setStylePropValue(uidata);
  //console.log(">>>>>>", uidata['customstyle']);
}
function setStylePropValue(uipartDic) {
    const styleChildren = uipartDic['customstyle'];

    if(uipartDic.hasOwnProperty("backgroundGradient")) {
      styleChildren['background']['gradient'] = uipartDic['backgroundGradient'];
    }
    if(uipartDic.hasOwnProperty("backgroundColor")) {
      styleChildren['background']['color'] = uipartDic['backgroundColor'];
      styleChildren['background']['alpha']= uipartDic['backgroundColor']['alpha'];
    }
    if(uipartDic.hasOwnProperty("borderColor")) {
      styleChildren['border']['color'] = uipartDic['borderColor'];
      styleChildren['border']['alpha'] = uipartDic['borderColor']['alpha'];
    }
    if(uipartDic.hasOwnProperty("borderWeight")) {
      styleChildren['border']['width'] = uipartDic['borderWeight'];
    }
    if(uipartDic.hasOwnProperty("cornerRadius")) {
      styleChildren['border']['radius'] = uipartDic['cornerRadius'];
    }
    if(uipartDic.hasOwnProperty("font") || uipartDic.hasOwnProperty("normalFont")) {
      const uiFont = (uipartDic.hasOwnProperty("font")) ? uipartDic['font'] : uipartDic['normalFont'];
      styleChildren['font']['family'] = uiFont['fontName'];
      styleChildren['font']['size'] = uiFont['fontSize'];
      styleChildren['font']['style'] = uiFont['fontStyle'];
      styleChildren['font']['weight'] = uiFont['fontWeightNum'];
      styleChildren['text']['align'] = uiFont['textAlignment'];
      styleChildren['text']['color'] = uiFont['textColor'];
    }
    if(uipartDic.hasOwnProperty("verticalAlignment")) {
      styleChildren['text']['valign'] = uipartDic['verticalAlignment'];
    }
    if(uipartDic.hasOwnProperty("underline")) {
      styleChildren['text']['underline'] = uipartDic['underline'];
    }
    if(uipartDic.hasOwnProperty("strikeout")) {
      styleChildren['text']['line-through'] = uipartDic['strikeout'];
    }
    if(uipartDic.hasOwnProperty("textShadow")) {
      styleChildren['text']['shadow'] = uipartDic['textShadow'];
    }
}

function applyUICustomStyle(uipartDic) {
  if(!uipartDic['customstyle']){
    return;
  }
  
  const styleChildren = uipartDic['customstyle'];

  if(uipartDic.hasOwnProperty("backgroundGradient")) {
    uipartDic['backgroundGradient'] = styleChildren['background']['gradient'];
  }
  if(uipartDic.hasOwnProperty("backgroundColor")) {
    uipartDic['backgroundColor'] = styleChildren['background']['color'];
    uipartDic['backgroundColor']['alpha'] = styleChildren['background']['alpha'];
  }
  if(uipartDic.hasOwnProperty("borderColor")) {
    uipartDic['borderColor'] = styleChildren['border']['color'];
    uipartDic['borderColor']['alpha'] = styleChildren['border']['alpha'];
  }
  if(uipartDic.hasOwnProperty("borderWeight")) {
    uipartDic['borderWeight'] = styleChildren['border']['width'];
  }
  if(uipartDic.hasOwnProperty("cornerRadius")) {
    uipartDic['cornerRadius'] = styleChildren['border']['radius'];
  }
  if(uipartDic.hasOwnProperty("font") || uipartDic.hasOwnProperty("normalFont")) {
    const uiFont = (uipartDic.hasOwnProperty("font")) ? uipartDic['font'] : uipartDic['normalFont'];
    uiFont['fontName'] = styleChildren['font']['family'];
    uiFont['fontSize'] = styleChildren['font']['size'];
    uiFont['fontStyle'] = styleChildren['font']['style'];
    uiFont['fontWeightNum'] = styleChildren['font']['weight'];
    uiFont['textAlignment'] = styleChildren['text']['align'];
    uiFont['textColor'] = styleChildren['text']['color'];
  }
  if(uipartDic.hasOwnProperty("verticalAlignment")) {
    uipartDic['verticalAlignment'] = styleChildren['text']['valign'];
  }
  if(uipartDic.hasOwnProperty("underline")) {
    uipartDic['underline'] = styleChildren['text']['underline'];
  }
  if(uipartDic.hasOwnProperty("strikeout")) {
    uipartDic['strikeout'] = styleChildren['text']['line-through'];
  }
  if(uipartDic.hasOwnProperty("textShadow")) {
    uipartDic['textShadow'] = styleChildren['text']['shadow'];
  }
}

function updateAllScreensData(propsData, property, screenObj) {
  const isMasterSlave = screenObj['isMasterSlave'];
  const currentScreenIndex = screenObj['current'];
  let masterScreenIndex = 0;
  let screens = screenObj['screens'];
  screens.forEach((element, i) => {
    if(element['embed']) {
      masterScreenIndex = i;          
    }
  });

  let changeforAllScreen = false;
  if(isMasterSlave && currentScreenIndex === masterScreenIndex) {
    changeforAllScreen = true;
  }

  const formtype = propsData['formtype'];
  if(changeforAllScreen) {   

    let dataObj = propsData['data'];
    if(formtype === "page") {
      dataObj = propsData['currentPage'];

      if(property.indexOf("_navigationBars") > -1) {
        const mainNavdic = JSON.parse(JSON.stringify(dataObj['_navigationBars'][currentScreenIndex]));
        for (let n = 0; n < screens.length; n++) {
          if(n !== currentScreenIndex) {
            dataObj['_navigationBars'][n] = mainNavdic;
          }        
        }
      
      }else if(property.indexOf("toolBar") > -1) {
        const barType = getPropertyObj(property);
        const propKey = getPropertyKey(property);
        const propDic = dataObj[barType][currentScreenIndex];
        const propVal = (property.indexOf('frame') > -1) ? propDic['frame'][propKey] : propDic[propKey];
        
        for (let t = 0; t < screens.length; t++) {
          if(t !== currentScreenIndex) {
            if(property.indexOf('frame') > -1) {
              //dataObj[barType][t]['frame'][propKey] = propVal;
            }else {
              dataObj[barType][t][propKey] = propVal;
            }          
          }        
        }
       
      }else if(property.indexOf("RecordCellDef") > -1) {
        const propDic = dataObj.Children[0].Group[0].RecordCellDef;
        const propKey = getPropertyKey(property);
        const propVal = propDic[propKey];
        console.log(property, dataObj, "........ updateAllScreensData >>>>", propDic, propKey, propVal);
      }

    }else if(formtype === "uipart") {
      //dataObj = propsData['currentUI'];

      const _property = property.toLowerCase();
      if(_property.indexOf('frame') > -1 || _property.indexOf('fontsize') > -1 || _property.indexOf('.height') > -1) {
        //console.log(propsData, property, "......uipart.. no-update >>>>", dataObj, propsData['currentPage']);

        let uiChildrenArr = getChildrenArray(propsData['currentPage'], propsData['targetEditor'], currentScreenIndex, propsData);
        uiChildrenArr.forEach(uiContainerDef => {
          let _uiParts = uiContainerDef.uiParts;
          if(_uiParts && (_uiParts[currentScreenIndex]['name'] === dataObj['name'])) {
            _uiParts[currentScreenIndex] = dataObj;            
          }
        });
        
      }else {

        let sourceChildrenArr = getChildrenArray(propsData['currentPage'], propsData['targetEditor'], currentScreenIndex, propsData);
        let _uiParts = getUIpart_forUpdate(sourceChildrenArr, dataObj, currentScreenIndex);
        if(_uiParts.length === 0) {
          let getAllChildrenArr = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
          _uiParts = getUIpart_forUpdate(getAllChildrenArr, dataObj, currentScreenIndex, true);
        }
        //console.log(propsData.targetEditor, dataObj, sourceChildrenArr, "updateAllScreensData.... _uiParts >>>> ", _uiParts);
                
        for (let index = 0; index < _uiParts.length; index++) {
          const element = _uiParts[index];
          /*if(index !== currentScreenIndex) {
            if(propsData.targetEditor === "tablecell" && element['name'] !== dataObj['name']) {
              continue;
            }
          }*/
          
          //element[property] = dataObj[property];
          if(getPropertyArray(property).length > 1) {
            const propObj = getPropertyObj(property);
            const propKey = getPropertyKey(property);

            let propVal;

            let propDic = dataObj[propObj];
            if(propObj === 'dataarray') {
              //propDic = dataObj.dataarray[0];
              propDic = JSON.parse(JSON.stringify(dataObj.dataarray));
              propDic[0]['Fields'] = element.dataarray[0]['Fields'];
              //propVal = propDic[propKey];
              //element.dataarray[0][propKey] = propVal;
              element.dataarray = propDic;

            }else if(propObj === 'actionButtons') {
              propDic = dataObj.actionButtons[0];
              propVal = propDic[propKey];
              element.actionButtons[0][propKey] = propVal;

            }else if(propObj === "segmentItems" || propObj === "tabItems" || propObj === "menuItems" || propObj === "toolbar.fontfamily" || propObj === "marks" || propObj === "formitems" || propObj === "columns") {
              propDic = JSON.parse(JSON.stringify(dataObj[propObj]));
              element[propObj] = propDic;

            }else if(propObj === "panelItems" || propObj === "swipeableItems" || propObj === "dataCols" || propObj === "dataFields") {
              const itemIndex = propsData['selectedItem']['index'];
              if(itemIndex !== undefined){
                propDic = JSON.parse(JSON.stringify(dataObj[propObj]));
                const itemObj = propDic[itemIndex];
                if(itemObj){
                  if(!element[propObj][itemIndex]){
                    element[propObj].push(itemObj);
                  }
                  element[propObj][itemIndex][propKey] = itemObj[propKey];
                }
              }

            }else {
              propVal = propDic[propKey];
              element[propObj][propKey] = propVal;
            }

            /*const propKey = getPropertyKey(property);
            const propVal = propDic[propKey];
            if(propObj === 'dataarray') {
              //element.dataarray[0][propKey] = propVal;
              element.dataarray = propDic;
            }else if(propObj === 'actionButtons') {
              element.actionButtons[0][propKey] = propVal;
            }else {
              element[propObj][propKey] = propVal;
            }*/                
            //console.log(property, dataObj, propVal, "........ updateAllScreensData >>>>", updatedUIDef);
          }else {
            if(property === "panelItems" || property === "swipeableItems" || property === "dataarray" || property === "dataCols"){
              //console.log(currentScreenIndex, "........", property, propsData['targetEditor'], "........ updateAllScreensData >>>>", propsData, element);
              const _propDataObj = dataObj[property];
              const _propElemObj = element[property];
              if(_propElemObj.length < _propDataObj.length){
                _propElemObj.push(_propDataObj[_propDataObj.length-1])
              }
            }else{
              element[property] = dataObj[property];
            }
          } 
          
          if(element['viewType'] === "ComboBox") {
            if(property === "fieldname") {
              element['displayText'] = element[property];
            }
          }
        }

        let updatedUIDef = _uiParts;
        if(propsData.targetEditor) {
          
          if(propsData.targetEditor === "tablecell") {
            const _pageObj  = propsData['currentPage'];
            if(_pageObj.Children[0].Group[0]['RecordCellDef']['CellStyle'] === "custom") { 
              _pageObj.Children[0].Group[0]['rowarray'][0]['Fields'] = _pageObj.Children[0].Group[0]['RecordCellDef']['Fields'];          
            }
          
          }else if(propsData.targetEditor.indexOf("Toolbar") > -1) {
            let barType;
            if(propsData.targetEditor === "topToolbar")           barType = "_toolBarTop";
            else if(propsData.targetEditor === "bottomToolbar")   barType = "_toolBarBottom";
            else if(propsData.targetEditor === "leftToolbar")     barType = "_toolBarLeft";
            else if(propsData.targetEditor === "rightToolbar")    barType = "_toolBarRight";
  
            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            //const toolbarChildren = JSON.parse(JSON.stringify(sourceChildrenArr));
            for (let i = 0; i < screens.length; i++) {
              if(i === currentScreenIndex)  continue;            
              //propsData['currentPage'][barType][i]['Children'] = toolbarChildren;
              
              let _slaveScreen_toolbarChildren = propsData['currentPage'][barType][i]['Children'];
              for (let index = 0; index < _slaveScreen_toolbarChildren.length; index++) {
                const uidef = _slaveScreen_toolbarChildren[index];
                let uidefparts = uidef['uiParts'];
                //if(uidefparts && (uidefparts[i]['name'] === dataObj['name'])) {  
                if(uidef['selected'] && (uidefparts[i]['viewType'] === dataObj['viewType'])) {            
                  //console.log(_updatedUIDef, index, uidef, "........ _slaveScreen_toolbarChildren >>>>", uidefparts, _slaveScreen_toolbarChildren);
                  uidef['uiParts'] = _updatedUIDef;
                  /* if(uidef['uiParts'][i] && uidef['uiParts'][i]['frame']) {
                    uidef['uiParts'][i]['frame'] = uidefparts[i]['frame'];
                  } */
                  if(uidef['uiParts'][i]) {
                    const _uipart = uidef['uiParts'][i];
                    resetUIEnableFrameFont(_uipart, uidefparts[i]);                        
                  }
                  break;
                }                
              }
            }      
  
            //console.log(propsData['currentPage'], currentScreenIndex, barType, "........ updateAllScreensData >>>>", sourceChildrenArr, _updatedUIDef);
          }else if(propsData.targetEditor === "TileList") {

            const sourceUI = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let tilelistUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "TileList" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
                tilelistUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            if(_updatedUIDef && _updatedUIDef.length > 0) {
              for (let k = 0; k < screens.length; k++) {
                if(k === currentScreenIndex)  continue;
                
                let istileUIfound = false;
                let _slaveScreen_tilelistChildren = tilelistUI['uiParts'][k]['dataarray'][0]['Fields'];              
                for (let index = 0; index < _slaveScreen_tilelistChildren.length; index++) {
                  const uidef = _slaveScreen_tilelistChildren[index];
                  let uidefparts = uidef['uiParts'];
                  
                  if(uidefparts) {
                    //console.log(_updatedUIDef, "updateAllScreensData.... TileList >>>> ", index, uidefparts);
                    /*if((uidefparts[k]['name'] === dataObj['name']) && (uidefparts[k]['viewType'] === dataObj['viewType'])) {              
                      istileUIfound = true;
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][k]) {
                        const _uipart = uidef['uiParts'][k];
                        resetUIEnableFrameFont(_uipart, uidefparts[k]);                        
                      }
                      break;
                    }*/


                    if(uidef['selected'] && (uidefparts[k]['viewType'] === dataObj['viewType'])) {
                      if(_property === "name") {  
                        uidef['uiParts'] = _updatedUIDef;
                        istileUIfound = true;
                        if(uidef['uiParts'][k] && uidef['uiParts'][k]['frame']) {
                          uidef['uiParts'][k]['frame'] = uidefparts[k]['frame'];
                        }
                        break;
                      }else {
                        if(uidefparts[k]['name'] !== dataObj['name']){
                          istileUIfound = false;
                          delete uidef['selected'];
                        }else {
                          uidef['uiParts'] = _updatedUIDef;
                          istileUIfound = true;
                          if(uidef['uiParts'][k]) {
                            const _uipart = uidef['uiParts'][k];
                            if(_uipart['displayOrderOnScreen']) {
                              _uipart['displayOrderOnScreen'] = uidefparts[k]['displayOrderOnScreen'];
                            }
                            if(_uipart['frame']) {
                              _uipart['frame'] = uidefparts[k]['frame'];
                            }
                            if(_uipart.hasOwnProperty('font')) {
                              _uipart['font']['fontSize'] = uidefparts[k]['font']['fontSize'] ;
                            }
                            if(_uipart.hasOwnProperty('normalFont')) {
                              _uipart['normalFont']['fontSize'] = uidefparts[k]['normalFont']['fontSize'] ;
                            }                            
                          }
                          break;
                        }
                      }
                    }


                  }
                }

                if(!istileUIfound && _property === "name") {                
                  let missingTileChild  = {_uid:"", viewType:dataObj['viewType'], uiParts:_updatedUIDef, selected:true};
                  resetUIEnableFrameFont(missingTileChild['uiParts'][k], dataObj);
                  _slaveScreen_tilelistChildren.push(missingTileChild);
                }
              }
            }

            if(tilelistUI['parent'] === "Dialog") {
              const _dialogUI = propsData['currentPage']['pageOverlay']['Children'][0];
              for (let l = 0; l < screens.length; l++) {
                if(l === currentScreenIndex)  continue;
                
                let _slaveScreen_dialogChildren = _dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
                for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
                  const uidef = _slaveScreen_dialogChildren[index];
                  let uidefparts = uidef['uiParts'];
                  if(uidefparts[l]['name'] === tilelistUI['uiParts'][l]['name']) {             
                    //console.log(propsData, dataObj, tilelistUI, "....TileList.... in Dialog >>>>", l, uidef);
                    uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']))
                    break;
                  }                
                }
              }
            }else if(tilelistUI['parent'] === "topToolbar"){
              for (let t = 0; t < screens.length; t++) {
                if(t === currentScreenIndex)  continue;
                let _slaveScreen_topBarChildren = propsData['currentPage']["_toolBarTop"][t]['Children'];
                for (let index = 0; index < _slaveScreen_topBarChildren.length; index++) {
                  const uidef = _slaveScreen_topBarChildren[index];
                  let uidefparts = uidef['uiParts'];
                  if(uidef['viewType'] === "TileList" && (uidefparts[t]['name'] === tilelistUI['uiParts'][t]['name'])) {             
                    uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']))
                    break;
                  }                
                }
              }
            }
            else {
              if(tilelistUI && tilelistUI['parent'] === "ExpansionPanel"){
                for (let t = 0; t < screens.length; t++) {
                  if(t === currentScreenIndex)  continue;

                  const tileUIParentName = tilelistUI['parentUIName'];  
                  let expansionUI = _pageUIs.filter(function(uipart) {
                    if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][0]['name'] === tileUIParentName)) {
                      return true;
                    }
                    return false;
                  });

                  let _slaveScreen_ExpPanelItems = expansionUI[0]['uiParts'][t]['panelItems'];
                  console.log(_slaveScreen_ExpPanelItems.length);
                  let isfound = false;
                  for (let index = 0; index < _slaveScreen_ExpPanelItems.length; index++) {
                    const element = _slaveScreen_ExpPanelItems[index];
                    if(element.hasOwnProperty('Fields')) {
                      for (let id = 0; id < element['Fields'].length; id++) {
                        const uidef = element['Fields'][id];
                        let uidefparts = uidef['uiParts'];
                        if(uidef['viewType'] === "TileList" && (uidefparts[t]['name'] === tilelistUI['uiParts'][t]['name'])) { 
                          let _tileframe;
                          if(uidef['uiParts'][t])   _tileframe = uidef['uiParts'][t]['frame'];           
                          uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']));
                          if(_tileframe){
                            uidef['uiParts'][t]['frame'] = _tileframe;
                            tilelistUI['uiParts'][t]['frame'] = _tileframe;
                          }    
                          isfound = true;
                          break;
                        }
                      }
                      if(isfound) break;
                    }                                 
                  }
                }
              }
            }
            

          }else if(propsData.targetEditor === "Dialog") {

            let dialogUI;
            const overlayChildren = propsData['currentPage']['pageOverlay']['Children'];
            if(overlayChildren.length > 1) {
              const sourceUI =  (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI; 
              let overlayUI = overlayChildren.filter(function(uipart) {
                if(uipart['viewType'] === "Dialog" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
                  return uipart;
                }
                return uipart;
              });  
              if(overlayUI.length > 0) {
                dialogUI = overlayUI[0];
              }
            }else {
              dialogUI = overlayChildren[0];
            }

            /* const dialogChildren = JSON.parse(JSON.stringify(sourceChildrenArr));
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;            
              dialogUI['uiParts'][l]['dataarray'][0]['Fields'] = dialogChildren; 
            } */
            //console.log(propsData, sourceChildrenArr, dialogUI, "........ updateAllScreensData >>>>", updatedUIDef);

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            let isfound = false;
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              const containerIndex = (propsData['editorParent']['index']) ? propsData['editorParent']['index'] : 0;
              let _slaveScreen_dialogChildren = dialogUI['uiParts'][l]['dataarray'][containerIndex]['Fields'];
              for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
                const uidef = _slaveScreen_dialogChildren[index];
                let uidefparts = uidef['uiParts'];                
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                //if(uidefparts && (uidefparts[l]['name'] === dataObj['name'])) { 
                if(uidef['selected'] && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    isfound = true;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      isfound = false;
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      isfound = true;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('dataCols')) {
                          _uipart['dataCols'] = uidefparts[l]['dataCols'];
                        } 
                      }
                      break;
                    }
                  }
                }                
              }

              if(!isfound && _property !== "name") {                
                let missingChild  = {_uid:"", viewType:dataObj['viewType'], uiParts:_updatedUIDef, selected:true};
                _slaveScreen_dialogChildren.push(missingChild);
              }
            } 

          }else if(propsData.targetEditor === "Drawer") {
            let drawerUI;
            const overlayChildren = propsData['currentPage']['pageOverlay']['Children'];
            if(overlayChildren.length > 1) {
              const sourceUI =  (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
              let overlayUI = overlayChildren.filter(function(uipart) {
                if(uipart['viewType'] === "Drawer" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
                  return true;
                }
                return false;
              });  
              if(overlayUI.length > 0) {
                drawerUI = overlayUI[0];
              }
            }else {
              drawerUI = overlayChildren[0];
            }

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            let isfound = false;
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              let _slaveScreen_drawerChildren = drawerUI['uiParts'][l]['dataarray'][0]['Fields'];
              for (let index = 0; index < _slaveScreen_drawerChildren.length; index++) {
                const uidef = _slaveScreen_drawerChildren[index];
                let uidefparts = uidef['uiParts'];                
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                
                if(uidef['selected'] && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    isfound = true;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      isfound = false;
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      isfound = true;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                      }
                      break;
                    }
                  }
                }                
              }

              if(!isfound && _property !== "name") {                
                let missingChild  = {_uid:"", viewType:dataObj['viewType'], uiParts:_updatedUIDef, selected:true};
                _slaveScreen_drawerChildren.push(missingChild);
              }
            } 

          }else if(propsData.targetEditor === "ExpansionPanel") {
            const exuidata = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let exPanelUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][0]['name'] === exuidata['name'])) {
                exPanelUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              const panelIndex = propsData.editorParent['index'];
              if(!exPanelUI['uiParts'][l]['panelItems'][panelIndex]){
                continue;
              }
              let _slaveScreen_panelChildren = exPanelUI['uiParts'][l]['panelItems'][panelIndex]['Fields'];
              for (let index = 0; index < _slaveScreen_panelChildren.length; index++) {
                const uidef = _slaveScreen_panelChildren[index];
                let uidefparts = uidef['uiParts'];                
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                
                if(uidef['selected'] && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('dataCols')) {
                          _uipart['dataCols'] = uidefparts[l]['dataCols'];
                        } 
                      }
                      break;
                    }
                  }
                }                
              }
            }

          }else if(propsData.targetEditor === "SwipeableView") {
            const swipeviewdata = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let swipeViewUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "SwipeableView" && (uipart['uiParts'][0]['name'] === swipeviewdata['name'])) {
                swipeViewUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              const viewIndex = propsData.editorParent['index'];
              if(!swipeViewUI['uiParts'][l]['swipeableItems'][viewIndex]){
                continue;
              }
              let _slaveScreen_swipeChildren = swipeViewUI['uiParts'][l]['swipeableItems'][viewIndex]['Fields'];
              for (let index = 0; index < _slaveScreen_swipeChildren.length; index++) {
                const uidef = _slaveScreen_swipeChildren[index];
                let uidefparts = uidef['uiParts'];                
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                
                if(uidef['selected'] && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                      }
                      break;
                    }
                  }
                }                
              }
            }

          }else if(propsData.targetEditor === "DataGrid") {
            const _editorParent = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let dataGridUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "DataGrid" && (uipart['uiParts'][0]['name'] === _editorParent['name'])) {
                dataGridUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              const fieldIndex = propsData.editorParent['index'];
              if(!dataGridUI['uiParts'][l]['dataCols'][fieldIndex]){
                continue;
              }
              
              let _slaveScreen_gridFields = dataGridUI['uiParts'][l]['dataCols'][fieldIndex]['Fields'];
              let _slaveScreen_gridHeader = dataGridUI['uiParts'][l]['dataCols'][fieldIndex]['headerFields'];
              let _slaveScreen_gridChildren = (_slaveScreen_gridHeader) ? _slaveScreen_gridFields.concat(_slaveScreen_gridHeader) : _slaveScreen_gridFields;
              for (let index = 0; index < _slaveScreen_gridChildren.length; index++) {
                const uidef = _slaveScreen_gridChildren[index];
                let uidefparts = uidef['uiParts'];
                if(uidefparts.length === 0)   continue;
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                
                if(uidef['selected'] && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                      }
                      break;
                    }
                  }
                }               
              }
            }

            if(dataGridUI && dataGridUI['parent'] === "ExpansionPanel"){
              for (let t = 0; t < screens.length; t++) {
                if(t === currentScreenIndex)  continue;

                const dgUIParentName = dataGridUI['parentUIName'];  
                let expansionUI = _pageUIs.filter(function(uipart) {
                  if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][0]['name'] === dgUIParentName)) {
                    return true;
                  }
                  return false;
                });

                let _slaveScreen_ExpPanelItems = expansionUI[0]['uiParts'][t]['panelItems'];
                console.log(_slaveScreen_ExpPanelItems.length);
                let isfound = false;
                for (let index = 0; index < _slaveScreen_ExpPanelItems.length; index++) {
                  const element = _slaveScreen_ExpPanelItems[index];
                  if(element.hasOwnProperty('Fields')) {
                    for (let id = 0; id < element['Fields'].length; id++) {
                      const uidef = element['Fields'][id];
                      let uidefparts = uidef['uiParts'];
                      if(uidef['viewType'] === "DataGrid" && (uidefparts[t]['name'] === dataGridUI['uiParts'][t]['name'])) {             
                        uidef['uiParts'] = JSON.parse(JSON.stringify(dataGridUI['uiParts']));
                        isfound = true;
                        break;
                      }
                    }
                    if(isfound) break;
                  }                                 
                }
              }
            }

          }else if(propsData.targetEditor === "Popover") {
            const popoverdata = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let popoverUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "Popover" && (uipart['uiParts'][0]['name'] === popoverdata['name'])) {
                popoverUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            let isfound = false;
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              let _slaveScreen_popoverChildren = popoverUI['uiParts'][l]['dataarray'][0]['Fields'];
              for (let index = 0; index < _slaveScreen_popoverChildren.length; index++) {
                const uidef = _slaveScreen_popoverChildren[index];
                let uidefparts = uidef['uiParts'];                
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }

                let selectedUI = (uidef['selected']) ? true : false;
                if(!selectedUI && (dataObj['_uid'] && dataObj['_uid'] !== "")){
                  selectedUI = (uidefparts[l]['_uid'] === dataObj['_uid']) ? true : false;
                }
                
                if(selectedUI && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    isfound = true;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      isfound = false;
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      isfound = true;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                      }
                      break;
                    }
                  }
                }                
              }

              if(!isfound && _property !== "name") {                
                let missingChild  = {_uid:"", viewType:dataObj['viewType'], uiParts:_updatedUIDef, selected:true};
                _slaveScreen_popoverChildren.push(missingChild);
              }
            }

          }else if(propsData.targetEditor === "Form" || propsData.targetEditor === "FormView") {
            const formviewdata = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let formviewUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "FormView" && (uipart['uiParts'][0]['name'] === formviewdata['name'])) {
                formviewUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            let isfound = false;
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              const itemIndex = propsData.editorParent['index'];
              if(!formviewUI['uiParts'][l]['formItems'][itemIndex]){
                continue;
              }
              let _slaveScreen_formviewChildren = formviewUI['uiParts'][l]['formItems'][itemIndex]['Fields'];
              for (let index = 0; index < _slaveScreen_formviewChildren.length; index++) {
                const uidef = _slaveScreen_formviewChildren[index];
                let uidefparts = uidef['uiParts'];                
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                
                if((uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    isfound = true;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      isfound = false;
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      isfound = true;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                      }
                      break;
                    }
                  }
                }                
              }

              if(!isfound && _property !== "name") {                
                let missingChild  = {_uid:"", viewType:dataObj['viewType'], uiParts:_updatedUIDef, selected:true};
                _slaveScreen_formviewChildren.push(missingChild);
              }
            }

          }else if(propsData.targetEditor === "NestedList") {
            const _editorParent = (propsData.editorParent && propsData.editorParent.hasOwnProperty('ui')) ? propsData.editorParent['ui'] : propsData.currentUI;
            let nestedlistUI;
            let _pageUIs = getAllChildrenOnPage(propsData['currentPage'], currentScreenIndex);
            _pageUIs.forEach(uipart => {
              if(uipart['viewType'] === "NestedList" && (uipart['uiParts'][0]['name'] === _editorParent['name'])) {
                nestedlistUI = uipart;
              }
            });

            const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
            for (let l = 0; l < screens.length; l++) {
              if(l === currentScreenIndex)  continue;
              
              let _slaveScreen_mainFields = nestedlistUI['uiParts'][l]['mainCellDef']['Fields'];
              let _slaveScreen_subFields = nestedlistUI['uiParts'][l]['subCellDef']['Fields'];
              let _slaveScreen_nestedChildren = _slaveScreen_mainFields.concat(_slaveScreen_subFields);
              for (let index = 0; index < _slaveScreen_nestedChildren.length; index++) {
                const uidef = _slaveScreen_nestedChildren[index];
                let uidefparts = uidef['uiParts'];
                if(uidefparts.length === 0)   continue;
                if(!uidefparts[l]['_enabledOnScreen']) {
                  continue;
                }
                
                if((uidefparts[l]['_uid'] === dataObj['_uid']) && (uidefparts[l]['viewType'] === dataObj['viewType'])) {
                  if(_property === "name") {  
                    uidef['uiParts'] = _updatedUIDef;
                    if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                      uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
                    }
                    break;
                  }else {
                    if(uidefparts[l]['name'] !== dataObj['name']){
                      delete uidef['selected'];
                    }else {
                      uidef['uiParts'] = _updatedUIDef;
                      if(uidef['uiParts'][l]) {
                        const _uipart = uidef['uiParts'][l];
                        if(_uipart['displayOrderOnScreen']) {
                          _uipart['displayOrderOnScreen'] = uidefparts[l]['displayOrderOnScreen'];
                        }
                        if(_uipart['frame']) {
                          _uipart['frame'] = uidefparts[l]['frame'];
                        }
                        if(_uipart.hasOwnProperty('font')) {
                          _uipart['font']['fontSize'] = uidefparts[l]['font']['fontSize'] ;
                        }
                        if(_uipart.hasOwnProperty('normalFont')) {
                          _uipart['normalFont']['fontSize'] = uidefparts[l]['normalFont']['fontSize'] ;
                        }
                      }
                      break;
                    }
                  }
                }               
              }
            }

            if(nestedlistUI && nestedlistUI['parent'] === "ExpansionPanel"){
              for (let t = 0; t < screens.length; t++) {
                if(t === currentScreenIndex)  continue;

                const dgUIParentName = nestedlistUI['parentUIName'];  
                let expansionUI = _pageUIs.filter(function(uipart) {
                  if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][0]['name'] === dgUIParentName)) {
                    return true;
                  }
                  return false;
                });

                let _slaveScreen_ExpPanelItems = expansionUI[0]['uiParts'][t]['panelItems'];
                console.log(_slaveScreen_ExpPanelItems.length);
                let isfound = false;
                for (let index = 0; index < _slaveScreen_ExpPanelItems.length; index++) {
                  const element = _slaveScreen_ExpPanelItems[index];
                  if(element.hasOwnProperty('Fields')) {
                    for (let id = 0; id < element['Fields'].length; id++) {
                      const uidef = element['Fields'][id];
                      let uidefparts = uidef['uiParts'];
                      if(uidef['viewType'] === "NestedList" && (uidefparts[t]['name'] === nestedlistUI['uiParts'][t]['name'])) {             
                        uidef['uiParts'] = JSON.parse(JSON.stringify(nestedlistUI['uiParts']));
                        isfound = true;
                        break;
                      }
                    }
                    if(isfound) break;
                  }                                 
                }
              }
            }

          }
        }        
      }
    }    
    //console.log(propsData, currentScreenIndex, "......uipart.. updateAllScreensData >>>>", propsData['currentPage']);
  }else {
    //console.log(currentScreenIndex, "......else.. updateAllScreensData >>>>", propsData['currentPage']);
    /* if(propsData['formtype'] === "uipart" && currentScreenIndex !== masterScreenIndex) {
      const _property = property.toLowerCase();
      if(_property.indexOf('frame') > -1 || _property.indexOf('fontsize') > -1) {
        if(propsData.targetEditor) {
          let sourceChildrenArr = getChildrenArray(propsData['currentPage'], propsData['targetEditor'], masterScreenIndex, propsData);
          if(propsData.targetEditor.indexOf("Toolbar") > -1) {
            sourceChildrenArr.forEach(uiContainerDef => {
              let _uiParts = uiContainerDef.uiParts;
              if(_uiParts && (_uiParts[currentScreenIndex]['name'] === propsData['data']['name'])) {
                _uiParts[currentScreenIndex] = JSON.parse(JSON.stringify(propsData['data']));
              }
            });          
            //console.log(propsData.targetEditor, "......###..", sourceChildrenArr, propsData['data'], "  >>>>", propsData['currentPage']);
            return propsData['currentPage'];
          }
          else if(propsData.targetEditor === "Dialog") { 
            
            const _dialogUI = propsData['currentPage']['pageOverlay']['Children'][0];
            console.log(_dialogUI, "......uipart.. updateAllScreensData >>>>", sourceChildrenArr);
          }

        }      
      }
    } */

  }
}

function resetUIEnableFrameFont(uipart, uidef) {
  uipart['_enabledOnScreen'] = uidef['_enabledOnScreen'];
                        
  if(uipart['frame']) {
    uipart['frame'] = uidef['frame'];
  }
  if(uipart.hasOwnProperty('font')) {
    uipart['font']['fontSize'] = uidef['font']['fontSize'] ;
  }
  if(uipart.hasOwnProperty('normalFont')) {
    uipart['normalFont']['fontSize'] = uidef['normalFont']['fontSize'] ;
  }
}

function getChildrenArray(pagedata, targetEditor, scrIndex, props) {  
  const scrId = (scrIndex)  ? scrIndex : 0;

  let _data = (pagedata) ? pagedata : props.data;
  switch (targetEditor) {
    case "page":
      if(_data.viewType === "BaseView") {
        return _data.Children;
      }else if(_data.viewType === "ScrollView") {
        return _data.Children[0].Children;
      }else if(_data['viewType'].indexOf('TableViewList') > -1) {
        if(_data.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = _data.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }else if(_data['viewType'].indexOf('TableViewNestedList') > -1) {
        if(_data.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = _data.Children[0].Group;
          const mainFields = tableGroup[0].RecordCellDef.Fields;
          const subFields = tableGroup[0].SubRecordCellDef.Fields;
          return mainFields.concat(subFields);
        }
      }
      return _data.Children;
      
    case "topToolbar":
      return _data._toolBarTop[scrId].Children;
    
    case "bottomToolbar":
      return _data._toolBarBottom[scrId].Children;
    
    case "leftToolbar":
      return _data._toolBarLeft[scrId].Children;

    case "rightToolbar":
      return _data._toolBarRight[scrId].Children;

    case "tablecell":
      if(_data['viewType'].indexOf('TableViewList') > -1) {
        if(_data.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = _data.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      else if(_data['viewType'].indexOf('TableViewNestedList') > -1) {
        if(_data.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = _data.Children[0].Group;
          const _mainFields = tableGroup[0].RecordCellDef.Fields;
          const _subFields = tableGroup[0].SubRecordCellDef.Fields;
          return _mainFields.concat(_subFields);
        }
      }
      return _data.Children; 
    case "subtablecell":
      if(_data['viewType'].indexOf('TableViewNestedList') > -1) {
        if(_data.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = _data.Children[0].Group;
          return tableGroup[0].SubRecordCellDef.Fields;
        }
      }
      return _data.Children; 
      
    case "overlay":
    case "pageOverlay":
      if(_data['pageOverlay']) {
        return _data['pageOverlay'].Children
      }
      return _data.Children;

    case "Dialog":
    case "Drawer":
      if(_data['pageOverlay'] && _data['pageOverlay'].Children) {
        let overlayChildren = _data['pageOverlay'].Children;
        for (let index = 0; index < overlayChildren.length; index++) {
          const overlayChild = overlayChildren[index];
          if(overlayChild && overlayChild['viewType'] === targetEditor) {
            if(overlayChild.uiParts[scrId]) {
              const containerIndex = (props['editorParent']['index']) ? props['editorParent']['index'] : 0;
              return overlayChild.uiParts[scrId].dataarray[containerIndex].Fields;
            }            
          }            
        }
      }
      return _data['pageOverlay'].Children;

    case "TileList":
      /* console.log(props, "...TileList ..", props.editorParent);
      if(_uidata !== "" && _uidata['viewType'] === "TileList"){
        return _uidata.dataarray[0].Fields;
      }
      return _data.Children; */

      const _uidata = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      const pageChildren = getChildrenArray(pagedata, "page", scrIndex, props);
      const dialogChildren = getChildrenArray(pagedata, "Dialog", scrIndex, props);
      const topbarChildren = getChildrenArray(pagedata, "topToolbar", scrIndex, props);
      let tileChildren = pageChildren.concat(dialogChildren).concat(topbarChildren);
      let tilelistChild;
      tileChildren.forEach(uipart => {
        if(uipart['viewType'] === "TileList" && (uipart['uiParts'][scrIndex]['name'] === _uidata['name'])) {
          tilelistChild = uipart['uiParts'][scrIndex];
        }
      });
      //console.log(pageChildren, dialogChildren, tileChildren, "...TileList ..", _uidata, tilelistChild);
      if(tilelistChild) {
        return tilelistChild.dataarray[0].Fields;
      }
      return pageChildren;

    case "ExpansionPanel":
      const exuidata = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      let exPanelUI = exuidata;
      let arrEPChildren = [];
      let arrlPanelItems = exPanelUI.panelItems;
      for (let e = 0; e < arrlPanelItems.length; e++) {
        let panelItemsField = arrlPanelItems[e]['Fields'];
        for (let ep = 0; ep < panelItemsField.length; ep++) {
          arrEPChildren.push(panelItemsField[ep]);								
        }                
      }
      return arrEPChildren;
        
    case "SwipeableView":
      const swipeViewUI = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      const arrSwipeItems = swipeViewUI.swipeableItems;
      let arrSVChildren = [];
      for (let s = 0; s < arrSwipeItems.length; s++) {
        let swipeItemsField = arrSwipeItems[s]['Fields'];
        for (let sv = 0; sv < swipeItemsField.length; sv++) {
          arrSVChildren.push(swipeItemsField[sv]);								
        }                
      }
      return arrSVChildren;

    case "DataGrid":
      let dataGridUI = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      if(dataGridUI && dataGridUI['viewType'] !== "DataGrid"){
        dataGridUI = props.currentUI;
      }
      const arrDataCols = dataGridUI.dataCols;
      let arrColChildren = [];
      for (let dg = 0; dg < arrDataCols.length; dg++) {
        let datacolField = (arrDataCols[dg]['isCustom']) ? arrDataCols[dg]['Fields'] : [];
        for (let dc = 0; dc < datacolField.length; dc++) {
          arrColChildren.push(datacolField[dc]);								
        }
        let dataheaderField = (arrDataCols[dg]['isCustomHeader']) ? arrDataCols[dg]['headerFields'] : [];
        if(dataheaderField){
          for (let dh = 0; dh < dataheaderField.length; dh++) {
            arrColChildren.push(dataheaderField[dh]);								
          }
        }
      }
      return arrColChildren;

    case "Popover":
      const popoverUI = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      return popoverUI.dataarray[0].Fields;

    case "FormView":
    case "Form":
      const formViewUI = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      const arrFormItems = formViewUI.formItems;
      let arrItemChildren = [];
      for (let dg = 0; dg < arrFormItems.length; dg++) {
        let datacolField = arrFormItems[dg]['Fields'];
        for (let dc = 0; dc < datacolField.length; dc++) {
          arrItemChildren.push(datacolField[dc]);								
        }
      }
      return arrItemChildren;

    case "NestedList":
      const nestedlistUI = (props.editorParent && props.editorParent['ui']) ? props.editorParent['ui'] : props.currentUI;
      const maincellFields = nestedlistUI.mainCellDef.Fields;
      const subcellFields = nestedlistUI.subCellDef.Fields;
      return maincellFields.concat(subcellFields);
   
    default:
      return _data.Children;
  }
}

function getUIpart_forUpdate(childArr, childObj, currentScreenIndex, allFlag) {
  //console.log(currentScreenIndex, allFlag, ".... getUIpart_forUpdate >>>> ", childArr, childObj);
  let _uiParts = childArr.filter(function(uiContainerDef) {
    const isViewTypeMatched = (uiContainerDef.uiParts[currentScreenIndex]['viewType'] === childObj['viewType']);
    const isNameMatched = (uiContainerDef.uiParts[currentScreenIndex]['name'] === childObj['name']);

    //console.log(allFlag, uiContainerDef, ".... getUIpart_forUpdate >> uiContainerDef >> ", isViewTypeMatched, isNameMatched);

    if(uiContainerDef['selected']) {
      if(isViewTypeMatched) {
        return true;
      }
    }else if(allFlag) {
      if(isViewTypeMatched && isNameMatched) {
        return true;
      }
    }
    return false;
  });
  if(_uiParts.length > 0){
    return _uiParts[0]['uiParts'];
  }
  return [];
}

function getInputVisibility(inputpath, showarr) {
  let _showArr =  showarr.filter(function(node) {
    //console.log(node, "**** getInputVisibility ****", inputpath);
    if(node[inputpath])   return true;
    return false;
  });

  let visibility = '';
  if(_showArr.length > 0) {
    let showObj = _showArr[0];
    let showValue = showObj[inputpath];
    //console.log(showarr, " ....>>>> ", inputpath, showValue); 
    visibility = (showValue === "false") ? 'none' : '';
  }
  
  return visibility;
}

function getInputOptions(inputpath, optionarr) {
  //console.log(inputpath, ".... getInputOptions >>>>>>>", optionarr);
  let _optionArr =  optionarr.filter(function(node) {
    //if(node.target.indexOf(inputpath) > -1)   return true;
    const n = node.target.indexOf("[");
    const m = node.target.lastIndexOf("]");
    const _nodeTarget = node.target.substring(n+1, m);
    if(_nodeTarget === inputpath)
       return true;
    
    return false;
  });
    
  let dataOption = {};
  if(_optionArr.length > 0) {
    let optionObj = _optionArr[_optionArr.length - 1];
    dataOption = optionObj;
  }
  
  return dataOption;
}

function getConditionResult(propval, operator, compareval) {
 
  let condparse = parseCondition(operator, propval, compareval);
  //console.log(propval, operator, compareval, "****** >>>>", condparse);
  let caseResult = condparse;

  return caseResult;
}

function parseCondition(operator, compareTarget, compareValue) {
  let val = false;
  //console.log(compareTarget, compareValue, "parseCondition >>>>", operator);
  switch(operator)
  {
    case "EQ" :
      if ((Number(compareTarget) === parseInt(compareValue)) || compareTarget === compareValue) {
        val = true;
      }
      break;
    case "NE" :
      if ((Number(compareTarget) !== parseInt(compareValue)) || compareTarget !== compareValue) {
        val = true;
      }
      break;
    case "GT" :
      if (Number(compareTarget) > Number(compareValue)) {
        val = true;
      }
      break;
    case "GE" :
      if (Number(compareTarget) >= Number(compareValue)) {
        val = true;
      }
      break;
    case "LT" :
      if (Number(compareTarget) < Number(compareValue)) {
        val = true;
      }
      break;
    case "LE" :
      if (Number(compareTarget) <= Number(compareValue)) {
        val = true;
      }
      break;
    case "IS_NULL_OR_EMPTY":
        val = (!compareTarget) ? true : false;
        break;
    default :
      val = false;
  }
  return val;
}
  
function parseTargetValue(path) {
  let targetObj;
  if(path) {      
    if(path.indexOf("(") > -1 && path.indexOf(")") > -1) {
      let valfunction = path.replace("{","").replace("}","").split("(");
      let funcName = valfunction[0].split(":")[1];
      let argStr = (valfunction[1]) ? valfunction[1].replace(")", "") : "";  
  
      targetObj = {functionName: funcName, arguments: argStr};
    }else {
     
      targetObj = {functionName: "", arguments: path.replace("{","").replace("}","")};
    }
  }
  
  return targetObj;
}

function parseArguments(argStr, baseData, screenIndex) {
  let argsArr = [];
  if(argStr.indexOf(",") > -1) {

  }else{
    let argVal = getPropertyValue(getPathValue(argStr), baseData, screenIndex);
    argsArr.push(argVal);
  }

  return argsArr;
}

function getPathValue(path, base) {
  if(path) {
    path = path.substring(path.indexOf("[")+1, path.lastIndexOf("]"));
  }
  return path;
}
function getValueByPath(path, base) {
  if(path) {
    path = path.substring(path.indexOf("[")+1, path.lastIndexOf("]"));
  }

  let _value = "";
  if(path === ""){
    return _value;
  }
  
  let arrPath = path.split(".");
  for (let i = 0; i < arrPath.length; i++) {
    const element = arrPath[i];
    if(element === "params")  continue;
    if(element.indexOf("[") > -1) {
      //console.log(base, "element >>>>", element);
      let elemKey = element.split("[")[0];
      if(base && base.hasOwnProperty(elemKey)) {
        base = base[elemKey];
      }
      let elemIndex = getPathValue(element);      
      if(base) {
        base = base[elemIndex];
      }
      /* else {
        console.log(path, "element >>>>", elemIndex);
      } */

    }else {
      if(base && base.hasOwnProperty(element)) {
        base = base[element];
      }      
    }    
  }

  _value = base;
  return _value;
}

function getPageViewType(pageList, selectedPageId) {
  //console.log(pageList, "..... getPageViewType >>>> ", selectedPageId);

  let pageObjArr =  pageList.filter(function(page) {
    return page['pageid'] === selectedPageId;
  });
  if(pageObjArr.length > 0) {
    return pageObjArr[0]['viewType'];
  }
  return "";
}

function getTableViewCellStyle(pageList, selectedPageId) {
  let pageObjArr =  pageList.filter(function(page) {
    return page['pageid'] === selectedPageId;
  });
  if(pageObjArr.length > 0) {
    if(pageObjArr[0]['viewType'].indexOf('TableViewList') > -1){
      return pageObjArr[0].Children[0]._tmpCellStyle;
    }
  }
  return "";
}

function generateDataSource(funcName, argStr, dataObj) {
  //console.log(funcName, argStr, "......... generateDataSource ..........", dataObj);

  const data = dataObj['base'];
  const appData = dataObj['project'];
  const pageList = dataObj['pagelist'];
  const currentPage = dataObj['page'];

  let currentScrIndex = (dataObj['screenIndex']) ? dataObj['screenIndex'] : 0;
  
  let _dataOptions = [];
  switch(funcName) 
  {
    case "getServices":
      _dataOptions = getServices(appData, argStr);
      break;

    case "getDbTableDicsByServiceName":
    case "getDbTableDics_notViews_ByServiceName":
      let serviceName = getValueByPath(argStr, data);
      /* console.log(argStr, data, "......... getDbTableDicsByServiceName ..........", serviceName);
      if(typeof(serviceName) === "object") {
        serviceName = "";
      } */
      _dataOptions = getDbTableDicsByServiceName(appData, serviceName);      
      break;

    case "getDbFields":
    case "getBracedDbFields":
      let argService = argStr.split(",")[0];
      let argTable = argStr.split(",")[1];
      let servicename = getValueByPath(argService, data);
      let tablename = getValueByPath(argTable, data);
      let dbTableDic = getDbTableDicByName(appData, servicename, tablename);
      //console.log(data, "......... ", funcName, " ..........", servicename, tablename, dbTableDic);

      if(funcName === "getDbFields") {
        _dataOptions = (dbTableDic) ?  (dbTableDic.fields) : [];
      }else if(funcName === "getBracedDbFields") {
        if(dbTableDic) {
          //_dataOptions.push({fieldname : "[]"});
          dbTableDic.fields.forEach(field => {
            _dataOptions.push({fieldname : "[" + field.fieldname + "]"});
          });
        }
      }else {
        _dataOptions = [];
      }      
      break;

    case "toServiceforSyncDB":      
      let fromService = getValueByPath(argStr, data);
      //console.log(argStr, "......... toServiceforSyncDB ..........", fromService);
			
			if(fromService === "LocalDB" || fromService === "" ) {
				_dataOptions.push({"label" : "Mobilous", "value": "Mobilous"});
			}else if(fromService === "Mobilous") {
				_dataOptions.push({"label" : "LocalDB", "value": ""});
			}else {
				_dataOptions.push({"label" : "LocalDB", "value": ""});
				_dataOptions.push({"label" : "Mobilous", "value": "Mobilous"});
			}
			break;

    case "getTabPageList":
      pageList.forEach(page => {
        if(page['parentid'] === "App") {
          _dataOptions.push({Title: page.Title, pageid: page.pageid});
        }
      });
      break;

    case "getChildPageList":
      let pagename;
      if(argStr.indexOf('@page') > -1) {
        //getChildPageList @page:pageid
        pagename = currentPage['pageid'];
      }else {
        //getChildPageList @form[params.pageName]:value
        pagename = getValueByPath(argStr, data);
      }
      pagename = pagename.replace("page_","");
      pageList.forEach(page => {
        if(page['parentid'] === pagename) {
          _dataOptions.push({Title: page.Title, pageid: page.pageid});
        }
      });
      break;

    case "getParentPageList":
      //getParentPageList @page:pageid
      _dataOptions = getParentPageList(currentPage, pageList);
      break;

    case "getSiblingPageList": 
      //getSiblingPageList @page:pageid
      _dataOptions = getSiblingPageList(currentPage, pageList);
      break;

    case "getTransitionList": 
      let parentId = currentPage['parentid'];
      if(parentId.toLowerCase() !== "app")
			{
        let parentObjArr = pageList.filter(function(_page) {
          return _page['pageid'] === parentId;
        });
        let _parentpage = parentObjArr[0];
				if(_parentpage.viewType === "SplitView")
				{
					_dataOptions.push({name:"Transit in the view", type:'transitView'});
					_dataOptions.push({name:"Transit in the screen", type:'transitScreen'});
				}
			}
      break;

    case "getGroupList":
      _dataOptions = [];
      //@form[params.targetPage]:value
      let pgid = getValueByPath(argStr.split(",")[0], data);
      pgid = pgid.replace("page_","");
      let pgContainerDic=  pageList.filter(function(page) {
        return page['pageid'] === pgid;
      });
      
      const pgDic = pgContainerDic[0];
      if(pgDic) {
        for(let i = 0; i< pgDic.Children[0].Group.length; i++)
        {
          if(pgDic.Children[0].Group[i].idFieldName === '') {
            pgDic.Children[0].Group[i].idFieldName = "group "+i;
          }
          _dataOptions.push({"idFieldName": pgDic.Children[0].Group[i].idFieldName, "rowarray": (pgDic.pageid +'_'+pgDic.Children[0].Group[i].idFieldName)});
        }
      }
      //_dataOptions = pgDic.Children[0].Group;
      break;

    case "setValueTableList":
      _dataOptions = [];
      break;

    case "getUiElementList":      
      let isCurrentPage = false;  
      let _pageid;

      if(argStr.indexOf('@page') > -1) {
        const fArg = argStr.split(",")[0];
        if(fArg && fArg.indexOf('parentid') > -1){
          _pageid = currentPage['parentid'];
          if(_pageid === "App"){
            _dataOptions = [];
            return;
          }
        }else{
          isCurrentPage = true;
        }
      }else {
        _pageid = getPropertyValue(getPathValue(argStr.split(",")[0]), data, currentScrIndex);
        _pageid = _pageid.replace("page_","");
        if(_pageid === currentPage['pageid']) {
          isCurrentPage = true;
        }
      }

      //console.log(isCurrentPage, dataObj, "......... generateDataSource ..........", _pageid, currentPage);
      let selectedPageUIs;
      if(isCurrentPage) {
        let _currentpageUIs = getAllChildrenOnPage(currentPage, currentScrIndex);
        /* _currentpageUIs.forEach(uipart => {
          _dataOptions.push(uipart.uiParts[currentScrIndex].name);
        }); */

        selectedPageUIs = _currentpageUIs;
      }else {

        let pageObjArr =  pageList.filter(function(page) {
          return page['pageid'] === _pageid;
        });
        if(pageObjArr.length > 0) {
          let pageObj = pageObjArr[0];
          let _pageUIs = getAllChildrenOnPage(pageObj, currentScrIndex);
          /* _pageUIs.forEach(uipart => {
            _dataOptions.push(uipart.uiParts[currentScrIndex].name);
          }); */

          selectedPageUIs = _pageUIs;
        }
      }

      if(selectedPageUIs) {
        selectedPageUIs.forEach(uipart => {
          let uipartDic = uipart.uiParts[currentScrIndex];
          if(uipartDic && uipartDic._enabledOnScreen) {
            if(getUIViewtype(uipartDic).toLowerCase() === "radiobutton") {
              _dataOptions.push(uipartDic['groupname']);
              _dataOptions = [...new Set(_dataOptions)];
            }
            /* else {
              _dataOptions.push(uipartDic.name);
            } */
            _dataOptions.push(uipartDic.name);
          }
        });
      }else {
        _dataOptions = [];
      }
      break;

    case "getSpecificTargetUIParts":

      if(argStr.indexOf('@page') > -1) {
        //@page:pageid
        _dataOptions = getSpecificTargetUIParts(dataObj['dictionary'], data, currentPage, currentScrIndex);
      }else {
        //@form[params.targetPage]:value,
        let pageid = getValueByPath(argStr.split(",")[0], data);
        pageid = pageid.replace("page_", "");
        if(pageid !== "") {
          let pagObjArr =  pageList.filter(function(page) {
            return page['pageid'] === pageid;
          });
          if(pagObjArr.length > 0) {
            _dataOptions = getSpecificTargetUIParts(dataObj['dictionary'], data, pagObjArr[0], currentScrIndex);
          }
        }
      }      
      break;
      
    case "getTargetCameraUIParts":
      let pageObj;
      if(argStr.indexOf('@page') > -1) {
        pageObj = currentPage;
      }else{
        let pageid = getValueByPath(argStr.split(",")[0], data);
        if(pageid !== "") {
          pageid = pageid.replace("page_", "");
          let pagObjArr =  pageList.filter(function(page) {
            return page['pageid'] === pageid;
          });
          
          if(pagObjArr.length > 0) {
            pageObj = pagObjArr[0];
          }
        }
      }

      if(pageObj) {
        let _arrUIparts = [];
        let _pageUIs = getAllChildrenOnPage(pageObj, currentScrIndex);
        _pageUIs.forEach(uipart => {
          _arrUIparts.push(uipart.uiParts[currentScrIndex]);
        });            
        for (let m = 0; m < _arrUIparts.length; m++) {
          if(_arrUIparts[m].viewType.toString().toLowerCase() === "camera") {
            let uiPart = _arrUIparts[m];	//.uiParts[screenIndex];
            _dataOptions.push( {page:pageObj, uiname:uiPart.name} );
          }
        }
      }
            
      break;

    case "getUIpartsDbFields":
      let uiref = getValueByPath(argStr.split(",")[0], data);
      let pageid;
      if(argStr.indexOf('@page') > -1) {
        pageid = currentPage['pageid'];
      }else {
        pageid = getValueByPath(argStr.split(",")[1], data);
      }
      
      if(pageid !== "") {
        pageid = pageid.replace("page_", "");
        let _pagObjArr =  pageList.filter(function(page) {
          return page['pageid'] === pageid;
        });
        
        if(_pagObjArr.length > 0) {
          let _pageUIs = getAllChildrenOnPage(_pagObjArr[0], currentScrIndex);
          let _uiArr =  _pageUIs.filter(function(element) {
            return (element.uiParts[0]['name'] === uiref);
          });

          if(_uiArr.length > 0){
            const _uipartsArr = _uiArr[0].uiParts;
            const _servicename = (_uipartsArr[currentScrIndex]) ? _uipartsArr[currentScrIndex].ServiceName : _uipartsArr[0].ServiceName;
            const _tablename = (_uipartsArr[currentScrIndex]) ? _uipartsArr[currentScrIndex].tablename : _uipartsArr[0].tablename;
            const _dataobjBase = JSON.parse(JSON.stringify(dataObj['base']));
            _dataobjBase['servicename'] = _servicename;
            _dataobjBase['tablename'] = _tablename;
            dataObj['base'] = _dataobjBase;
            _dataOptions = generateDataSource("getBracedDbFields", "@form[params.servicename]:value, @form[params.tablename]:value", dataObj);
          }else{
            _dataOptions = []; 
          }
        }
      }
      break;

    case "getUIpartsPropertiesList":
      //@form[params.sourceUIPart]:value, @form[params.targetPage]:value @form[base.currentSettings]:value
      let _uiname = getValueByPath(argStr.split(",")[0], data);
      let pgeid = getValueByPath(argStr.split(",")[1], data);
      if(pgeid !== "") {
        pgeid = pgeid.replace("page_", "");
        let _pagObjArr =  pageList.filter(function(page) {
          return page['pageid'] === pgeid;
        });
        
        if(_pagObjArr.length > 0) {
          let _pageUIs = getAllChildrenOnPage(_pagObjArr[0], currentScrIndex);
          let _uiArr =  _pageUIs.filter(function(element) {
            return (element.uiParts[0]['name'] === _uiname);
          });

          let _viewType = "";
          if(_uiArr.length > 0){
            _viewType = _uiArr[0].viewType;
            if(_viewType && _viewType.toLowerCase() === "button") {
              _viewType = _uiArr[0].type + _uiArr[0].viewType;
            }
          }

          _dataOptions = getUIpartsPropertiesbyViewType(_viewType);          
        }
      }
      break;

    case "getNumberFormatValue":
      const _numberDataType = getValueByPath(argStr, data);
      _dataOptions = getNumberFormatValue(_numberDataType);
      break;

    case "setCellTextNameList" :
      _dataOptions = [];
      const spageId = dataObj['base']['targetPage'];
      if(spageId !== "") {
        const _cellStyle = getTableViewCellStyle(pageList, spageId);
        if(_cellStyle === "default") {
          _dataOptions = ['mainText'];
        }
        else if(_cellStyle === "subtitle") {
          _dataOptions = ['mainText', 'detailText'];
        }
        else if(_cellStyle === "right-aligned") {
          _dataOptions = ['mainText', 'detailText'];
        }
        else if(_cellStyle === "contact-form") {
          _dataOptions = ['mainText', 'detailText'];
        }
      }      
      break;

    case "getAppVariableList":
      _dataOptions = [];
      const prjData = dataObj['project'];
      if(prjData.hasOwnProperty('appVariables')) {
        _dataOptions = prjData['appVariables'];
      }
      break;  

    case "getUIItemList":
      _dataOptions = [];

      let panelpageid;
      if(argStr.indexOf('@page') > -1) {
        panelpageid = currentPage['pageid'];
      }else {
        panelpageid = getValueByPath(argStr.split(",")[0], data);
      } 
      if(panelpageid !== "") {
        panelpageid = panelpageid.replace("page_", "");
        let _pagObjArr =  pageList.filter(function(page) {
          return page['pageid'] === panelpageid;
        });
        
        const _uiname = getValueByPath(argStr.split(",")[1], data);
        if(_pagObjArr.length > 0) {
          let _pageUIs = getAllChildrenOnPage(_pagObjArr[0], currentScrIndex);
          let _uiArr =  _pageUIs.filter(function(element) {
            return (element.uiParts[0]['name'] === _uiname);
          });

          let _viewType = "";
          if(_uiArr.length > 0){
            _viewType = _uiArr[0].viewType;
            if(_viewType){
              const selectedUI = _uiArr[0];
              const uiObj = selectedUI['uiParts'][currentScrIndex];
              if(_viewType.toLowerCase() === "expansionpanel" || _viewType.toLowerCase() === "swipeableview") {
                if(_viewType.toLowerCase() === "expansionpanel") {
                  const uiPanels = uiObj['panelItems'];
                  uiPanels.forEach(panels => {
                    _dataOptions.push(panels['id'] + ": " + panels['heading']);
                  });
                }else if(_viewType.toLowerCase() === "swipeableview") {
                  const uiViews = uiObj['swipeableItems'];
                  uiViews.forEach(views => {
                    _dataOptions.push(views['id']);
                  });
                }
              }else if(_viewType.toLowerCase() === "datagrid"){
                const dataCols = uiObj['dataCols'];
                dataCols.forEach(col => {
                  if(col.hasOwnProperty('id'))
                    _dataOptions.push(col['id'] + ": " + col['fieldname']);
                });
              }else if(_viewType.toLowerCase() === "dialog"){
                const dContainers = uiObj['dataarray'];
                dContainers.forEach(containers => {
                  if(containers.hasOwnProperty('id'))
                    _dataOptions.push(containers['id'].toString());
                });
              }                
            }
          }  
        }
      }      
      break;      

    case "getJapaneseYears":
      //_dataOptions = [];
      _dataOptions = [
        {'jp':'明治', 'en':'Meiji', 'min':'1900', 'max':'1912'},
        {'jp':'大正', 'en':'Taisho', 'min':'1912', 'max':'1926'},
        {'jp':'昭和', 'en':'Showa', 'min':'1926', 'max':'1989'},
        {'jp':'平成', 'en':'Heisei', 'min':'1989', 'max':'2019'},
        {'jp':'令和', 'en':'Reiwa', 'min':'2019', 'max':'__NOW__'},
        {'jp':'西暦', 'en':'Custom', 'min':'', 'max':''}
      ];
      break;

    case "getStyleNames":
      const uitype = getUIViewtype(data);
      const uistyle = appData['AppStyle']['UIpartStyle'];
      _dataOptions = getStyleNames(uitype, uistyle);
    break;

    case "" :
      _dataOptions = [];
      if(argStr.indexOf("GroupList") > -1) {
        let selectedVal = dataObj['base']['GroupList'].replace("group ", "");
        const spageId = selectedVal.split('_')[0];
        let groupIndex = selectedVal.split('_')[1];
        if(spageId !== "") {
          let _spagObjArr =  pageList.filter(function(page) {
            return page['pageid'] === spageId;
          });
          if(_spagObjArr.length > 0) {
            const rowArr = _spagObjArr[0].Children[0].Group[groupIndex]['rowarray'];
            let _arrrr = [];
            for(let r = 0; r< rowArr.length; r++)
            {
              if(rowArr[r].name === '') {
                rowArr[r].name = "new Row "+r;
              }
              _arrrr.push({"name": rowArr[r].name, "value": (_spagObjArr[0].pageid +'_'+rowArr[r].name)});
              _dataOptions.push(rowArr[r].name);
            }            
          }
        }
      }
      break;

    default :
      _dataOptions = [];
  }  

  //console.log(funcName, "......... ..........", _dataOptions);
  return _dataOptions;
}

function getServices(baseData, dbType="")
{
  let TableDefs = baseData['TableDefs'];
  let RemoteTableDefs = baseData['RemoteTableDefs'];

  var services = [];
  var uniqServices = [];
  if(dbType !== "remote")
  {
    if(TableDefs.length > 0)
      services.push({"label" : "LocalDB", "value": ""});
    
    if(dbType.length > 0)
      return services;
  }
  
  for (var j = 0; j < RemoteTableDefs.length; j++)
  {
    var dbTableDic = RemoteTableDefs[j];
    var key = dbTableDic.servicename;
    if (uniqServices.indexOf(dbTableDic.servicename) < 0)
    {
      uniqServices.push(dbTableDic.servicename);
      var service = {"label" : key, "value" : key};
      services.push(service);
    }
  }
  return services;
}

function getDbTableDicsByServiceName(appData, serviceName) {

  let TableDefs = appData['TableDefs'];
  let RemoteTableDefs = appData['RemoteTableDefs'];
  //console.log(appData, ".... getDbTableDicsByServiceName >>>", serviceName);
  let services = [];
  let dbTableDic;
  if (!serviceName || serviceName === "LocalDB")
  {
    for (let i = 0; i < TableDefs.length; i++)
    {
      dbTableDic = TableDefs[i];
      if(dbTableDic.hasOwnProperty("trigger"))
      {
        if(dbTableDic.trigger)		continue;
      }
      if(dbTableDic.hasOwnProperty("procedure"))
      {
        if(dbTableDic.procedure)		continue;
      }
      services.push(dbTableDic);
    }
  }
  else
  {
    for (let j = 0; j < RemoteTableDefs.length; j++)
    {
      dbTableDic = RemoteTableDefs[j];
      if (dbTableDic.servicename === serviceName)
      {
        if(dbTableDic.hasOwnProperty("trigger"))
        {
          if(dbTableDic.trigger)		continue;
        }
        if(dbTableDic.hasOwnProperty("procedure"))
        {
          if(dbTableDic.procedure)		continue;
        }
        services.push(dbTableDic);
      }
    }
  }
  return services;
}

function getDbTableDicByName(appData, servicename, tablename) {
  let TableDefs = appData['TableDefs'];
  let RemoteTableDefs = appData['RemoteTableDefs'];

  let dbTableDic;
  if ((!servicename) || (servicename === 'LocalDB'))
  {
    for (let i = 0; i < TableDefs.length; i++)
    {
      dbTableDic = TableDefs[i];
      if (dbTableDic.tablename === tablename)
        return dbTableDic;
    }
  }
  else
  {
    for (let j = 0; j < RemoteTableDefs.length; j++)
    {
      dbTableDic = RemoteTableDefs[j];
      if ((dbTableDic.servicename === servicename) && (dbTableDic.tablename === tablename))
        return dbTableDic;
    }
  }
  return null;
}

function getParentPageList(page, pagelist)
{
  let arr = [];
  let pageid = page['pageid'];
  if(pageid.length === 0)	return arr;
			
  let _parentId = page['parentid'];
  _parentId = _parentId.replace("page_","");
  while(_parentId !== "App")
  {    
    let _parentpage = getParantPage(_parentId, pagelist)
    if(_parentpage) {
      arr.push(_parentpage);
      _parentId = _parentpage.parentid;
    }
  }
  
  if(arr.length > 0)
  {
    let arrParent = [];
    arr.forEach(parent => {
      arrParent.push(parent);
    });
    return arrParent;
  }
  
  return arr;
}
function getParantPage(_parentId, pagelist) {
  let parentObjArr =  pagelist.filter(function(_page) {
    return (_page['pageid'] === _parentId);
  });
  let _parentpage = parentObjArr[0];
  return _parentpage;
}

function getSiblingPageList(page, pagelist)
{
  let arr = [];
  let pageid = page['pageid'];
  if(pageid.length === 0)	return arr;  
  
  let _parentId = page['parentid'];
  _parentId = _parentId.replace("page_","");
  if(_parentId !== "App") {  
    let parentObjArr =  pagelist.filter(function(_page) {
      return _page['pageid'] === _parentId;
    });
    let _parentpage = parentObjArr[0];
    if(_parentpage) {

      let _childPages;		
      if(_parentpage.viewType === "SplitView") {
        _childPages = _parentpage['pages'];					
        for (let i = 0; i < _childPages.length; i++) 
        {
          let childpage = _childPages[i]['pagedef']['filename'];
          if(childpage.indexOf(pageid) === -1)
          {
            let childpageid = childpage.replace("page_", "");
            let childObjArr =  pagelist.filter(function(_page) {
              return _page['pageid'] === childpageid;
            });
            arr.push(childObjArr[0]);
          }
        }
      }else if(_parentpage.viewType === "PageScrollView") {
        _childPages = _parentpage.Children[0]['pages'];
        for (let j = 0; j < _childPages.length; j++) 
        {
          let pschildpage = _childPages[j]['filename'];
          if(pschildpage.indexOf(pageid) === -1)
          {
            let pschildpageid = pschildpage.replace("page_", "");
            let pschildObjArr =  pagelist.filter(function(_page) {
              return _page['pageid'] === pschildpageid;
            });
            arr.push(pschildObjArr[0]);
          }
        }
      }else {
        pagelist.forEach(page => {
          if(page['parentid'] === _parentId) {
            if(page.pageid !== pageid){
              arr.push({Title: page.Title, pageid: page.pageid});
            }
          }
        });
      }
    }
  }else {
    pagelist.forEach(page => {
      if(page['parentid'] === _parentId) {
        if(page.pageid !== pageid){
          arr.push({Title: page.Title, pageid: page.pageid});
        }
      }
    });
  }
  return arr;
}

function getUIpartsPropertiesbyViewType(_viewType) {
  let arrProperties = [];
  switch(_viewType)
  {
    case "Label":
      arrProperties = ["text","textalignment","borderwidth","hidden"];					
      break;
    case "TextField":
    case "NumericField":
    case "TextArea":
      arrProperties = ["text","textalignment","borderwidth","placeholder","editable","hidden"];
      break;
    case "Image":
      arrProperties = ["borderwidth","hidden"];
      break;
    case "RoundButton":
    case "TextButton":
    case "CheckBox":
      arrProperties = ["text","textalignment","hidden","enable"];
      break;
    case "SystemButton":
      arrProperties = ["style","hidden","enable"];
      break;
    case "ToggleButton":
      arrProperties = ["value","ontext","offtext","hidden","enable"];
      break;
    case "Segment":
      arrProperties = ["state","hidden","enable"];
      break;
    case "GoogleMap":
      arrProperties = ["currentposition","scale","hidden"];
      break;
    case "Picker":
      arrProperties = ["value","hidden","enable"];
      break;
    case "Indicator":
      arrProperties = ["startindicator","stopindicator","hidewhenstopped","hidden"];
      break;
    case "Radio":
      arrProperties = ["hidden"];
      break;
    case "WebView":
    case "SearchBar":
    case "ImageButton":
    case "SwitchBar":
    case "VideoBox":
    case "SoundBox":
    case "Camera":
    case "ComboBox":
    case "Slider":
    case "DatePicker":
    case "TileList":
    case "ProgressBar":
      arrProperties = ["hidden","enable"];
      break;
    default:
      arrProperties = [];
      break;
  }			
  return arrProperties;
}

function getNumberFormatValue(dataType) {
  var dataArray = [];
  switch (dataType)
  {
    case "boolean":
    {
      dataArray = ['','1 or 0','true or false','yes or no'];
      break;
    }
    case "integer":
    {
      dataArray = ['','integer','binary','octal','hexadecimal'];
      break;
    }
    case "double":
    {
      dataArray = ['','float','exponential'];
      break;
    }	
    default :
      dataArray = [];		
  }
  return dataArray;
}

function getStyleNames(uiViewType, appUIStyle) {
    let dataArr = ['custom'];
    //console.log(uiViewType, "...getStyleNames >>>>>>>", appUIStyle);
    if(appUIStyle.length > 0) {
      //dataArr.push('default');
      const uipartStyle = appUIStyle.find(x => x['name'] === uiViewType)['style'];
      for (let i= 0; i< uipartStyle.length; i++) {
        dataArr.push(uipartStyle[i]['name']);
      }
    }
    
    return dataArr;
  }

function getAllChildrenOnPage(_page, scrIndex, includeDisableUI)
{
  let arrChildren = [];
  if(_page.viewType.indexOf("TableView") > -1)
  {
    if(_page.viewType === "DbTableViewList" || _page.viewType === "RemoteTableViewList" || _page.viewType === "DbTableViewNestedList") {
      let arrFields0 = _page.Children[0].Group[0].RecordCellDef.Fields;
      for (let i0 = 0; i0 < arrFields0.length; i0++) {
        arrChildren.push(arrFields0[i0]);								
      }
      if(_page.viewType === "DbTableViewNestedList"){
        let arrSubFields0 = _page.Children[0].Group[0].SubRecordCellDef.Fields;
        for (let i1 = 0; i1 < arrSubFields0.length; i1++) {
          arrChildren.push(arrSubFields0[i1]);								
        }
      }
    }
    else {
      let arrGroup = _page.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) {
        if(arrGroup[i]){
          let arrRow = arrGroup[i].rowarray;
          for (let j = 0; j < arrRow.length; j++) {
            if(arrRow[j])
            {
              let arrFields = arrRow[j].Fields;
              for (let k = 0; k < arrFields.length; k++) 
              {
                arrChildren.push(arrFields[k]);								
              }
            }
          }
        }
      }
    }
  }
  else
  {
    let pageChildren;
    if(_page.viewType === "ScrollView" || _page.viewType === "PageScrollView")
      pageChildren = _page.Children[0].Children;
    else
      pageChildren = _page.Children;
    
    pageChildren.forEach(uiContainerDic => {
      arrChildren.push(uiContainerDic);
      if(uiContainerDic['viewType'] === "TileList") {
        let arrTileItems = uiContainerDic['uiParts'][scrIndex].dataarray[0]['Fields'];
        for (let u = 0; u < arrTileItems.length; u++) {
          arrChildren.push(arrTileItems[u]);								
        }
      }else if(uiContainerDic['viewType'] === "ExpansionPanel" || uiContainerDic['viewType'] === "SwipeableView") {
       if(uiContainerDic['uiParts'][scrIndex]['_enabledOnScreen']){
          const itemFieldName = (uiContainerDic['viewType'] === "ExpansionPanel") ? 'panelItems' : 'swipeableItems';
          let arrPanelItems = uiContainerDic['uiParts'][scrIndex][itemFieldName];
          for (let e = 0; e < arrPanelItems.length; e++) {
            let panelItemsField = arrPanelItems[e]['Fields'];
            for (let ep = 0; ep < panelItemsField.length; ep++) {
              if(panelItemsField[ep]['uiParts'][scrIndex]) {
                if(!panelItemsField[ep]['uiParts'][scrIndex]['_enabledOnScreen'] && !includeDisableUI){
                  continue;	
                }                						
              }

              if(panelItemsField[ep]['viewType'] === "TileList") {
                panelItemsField[ep]['parent'] = uiContainerDic['viewType'];
                panelItemsField[ep]['parentUIName'] = uiContainerDic['uiParts'][scrIndex]['name'];
                let arrTileItems = panelItemsField[ep]['uiParts'][scrIndex].dataarray[0]['Fields'];
                for (let u = 0; u < arrTileItems.length; u++) {
                  arrChildren.push(arrTileItems[u]);								
                }
              }else if(panelItemsField[ep]['viewType'] === "DataGrid") {
                panelItemsField[ep]['parent'] = uiContainerDic['viewType'];
                panelItemsField[ep]['parentUIName'] = uiContainerDic['uiParts'][scrIndex]['name'];
                let arrDataCols = panelItemsField[ep]['uiParts'][scrIndex].dataCols;
                for (let dg = 0; dg < arrDataCols.length; dg++) {
                  let datacolField = (arrDataCols[dg]['isCustom']) ? arrDataCols[dg]['Fields'] : [];
                  for (let dc = 0; dc < datacolField.length; dc++) {
                    arrChildren.push(datacolField[dc]);								
                  }
                  let dataheaderField = (arrDataCols[dg]['isCustomHeader']) ? arrDataCols[dg]['headerFields'] : [];
                  if(dataheaderField){
                    for (let dh = 0; dh < dataheaderField.length; dh++) {
                      arrChildren.push(dataheaderField[dh]);								
                    }
                  }
                }
              }              
              arrChildren.push(panelItemsField[ep]);								
            }                
          }
        }
      }else if(uiContainerDic['viewType'] === "DataGrid"){        
        const dataGridUI = uiContainerDic['uiParts'][scrIndex];
        const arrDataCols = dataGridUI.dataCols;
        for (let dg = 0; dg < arrDataCols.length; dg++) {
          let datacolField = (arrDataCols[dg]['isCustom']) ? arrDataCols[dg]['Fields'] : [];
          for (let dc = 0; dc < datacolField.length; dc++) {
            arrChildren.push(datacolField[dc]);								
          }
          let dataheaderField = (arrDataCols[dg]['isCustomHeader']) ? arrDataCols[dg]['headerFields'] : [];
          if(dataheaderField){
            for (let dh = 0; dh < dataheaderField.length; dh++) {
              arrChildren.push(dataheaderField[dh]);								
            }                
          }                    
        }       
      }else if(uiContainerDic['viewType'] === "Popover") {
        let arrPopoverItems = uiContainerDic['uiParts'][scrIndex].dataarray[0]['Fields'];
        for (let p = 0; p < arrPopoverItems.length; p++) {
          arrChildren.push(arrPopoverItems[p]);								
        }

      }else if(uiContainerDic['viewType'] === "NestedList"){   
        const nestedlistUI = uiContainerDic['uiParts'][scrIndex];
        const maincellFields = nestedlistUI.mainCellDef.Fields;
        const subcellFields = nestedlistUI.subCellDef.Fields;
        const nestedlistFields = maincellFields.concat(subcellFields); 
        arrChildren = arrChildren.concat(nestedlistFields); 
      }
    });
  }
    
  let cntTop = -1;
  if(_page._toolBarTop.length > 0) {		
    _page._toolBarTop.forEach(_topToolbar => {
      cntTop++;
      if(cntTop === scrIndex) {
        if(!_topToolbar['hidden']) {
          for (let t = 0; t < _topToolbar.Children.length; t++) {
            let _topToolbarUIContainerDic = _topToolbar.Children[t];
            let _topToolbarChildPartDic = _topToolbarUIContainerDic['uiParts'][scrIndex];
            if(_topToolbarChildPartDic) {
              if(!_topToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }
            arrChildren.push(_topToolbar.Children[t]);
            if(_topToolbar.Children[t]['viewType'] === "TileList") {
              _topToolbar.Children[t]['parent'] = "topToolbar";
              let arrtTileItems = _topToolbar.Children[t]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let t0 = 0; t0 < arrtTileItems.length; t0++) 
              {
                arrChildren.push(arrtTileItems[t0]);								
              }
            }
          }
        }
      }
    });    
  }

  let cntBottom = -1;
  if(_page._toolBarBottom.length > 0) {				
    _page._toolBarBottom.forEach(_bottomToolbar => {
      cntBottom++;
      if(cntBottom === scrIndex) {
        if(!_bottomToolbar['hidden']) {
          for (let b = 0; b < _bottomToolbar.Children.length; b++) {
            let _bottomToolbarUIContainerDic = _bottomToolbar.Children[b];
            let _bottomToolbarChildPartDic = _bottomToolbarUIContainerDic['uiParts'][scrIndex];
            if(_bottomToolbarChildPartDic) {
              if(!_bottomToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }
            arrChildren.push(_bottomToolbar.Children[b]);
            if(_bottomToolbar.Children[b]['viewType'] === "TileList") {
              let arrbTileItems = _bottomToolbar.Children[b]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let b0 = 0; b0 < arrbTileItems.length; b0++) 
              {
                arrChildren.push(arrbTileItems[b0]);								
              }
            }
          }
        }
      }
    });
  }

  let cntLeft = -1;
  if(_page.hasOwnProperty("_toolBarLeft") && _page._toolBarLeft.length > 0)
  {
    _page._toolBarLeft.forEach(_leftToolbar => {
      cntLeft++;
      if(cntLeft === scrIndex) {
        if(!_leftToolbar['hidden']) {
          for (let l = 0; l < _leftToolbar.Children.length; l++) {
            let _leftToolbarUIContainerDic = _leftToolbar.Children[l];
            let _leftToolbarChildPartDic = _leftToolbarUIContainerDic['uiParts'][scrIndex];
            if(_leftToolbarChildPartDic) {
              if(!_leftToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }

            let leftToolbarUI = _leftToolbar.Children[l];
            arrChildren.push(leftToolbarUI);
            if(leftToolbarUI['viewType'] === "TileList") {
              let arrlTileItems = leftToolbarUI['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let l0 = 0; l0 < arrlTileItems.length; l0++) {
                arrChildren.push(arrlTileItems[l0]);								
              }
            }else if(leftToolbarUI['viewType'] === "ExpansionPanel" || leftToolbarUI['viewType'] === "SwipeableView") {
              const itemFieldName = (leftToolbarUI['viewType'] === "ExpansionPanel") ? 'panelItems' : 'swipeableItems';
              let arrlPanelItems = leftToolbarUI['uiParts'][scrIndex][itemFieldName];
              for (let l1 = 0; l1 < arrlPanelItems.length; l1++) {
                let panelItemsField = arrlPanelItems[l1]['Fields'];
                for (let l10 = 0; l10 < panelItemsField.length; l10++) {
                  arrChildren.push(panelItemsField[l10]);								
                }                
              }          
            }
          }
        }
      }
    });
  }

  let cntRight = -1;
  if(_page.hasOwnProperty("_toolBarRight") && _page._toolBarRight.length > 0)
  {				
    _page._toolBarRight.forEach(_rightToolbar => {
      cntRight++;
      if(cntRight === scrIndex) {
        if(!_rightToolbar['hidden']) {
          for (let r = 0; r < _rightToolbar.Children.length; r++) {
            let _rightToolbarUIContainerDic = _rightToolbar.Children[r];
            let _rightToolbarChildPartDic = _rightToolbarUIContainerDic['uiParts'][scrIndex];
            if(_rightToolbarChildPartDic) {
              if(!_rightToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }

            let rightToolbarUI = _rightToolbar.Children[r];
            arrChildren.push(rightToolbarUI);
            if(rightToolbarUI['viewType'] === "TileList") {
              let arrrTileItems = rightToolbarUI['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let r0 = 0; r0 < arrrTileItems.length; r0++) {
                arrChildren.push(arrrTileItems[r0]);								
              }
            }else if(rightToolbarUI['viewType'] === "ExpansionPanel" || rightToolbarUI['viewType'] === "SwipeableView") {
              const itemFieldName = (rightToolbarUI['viewType'] === "ExpansionPanel") ? 'panelItems' : 'swipeableItems';
              let arrrPanelItems = rightToolbarUI['uiParts'][scrIndex][itemFieldName];
              for (let r1 = 0; r1 < arrrPanelItems.length; r1++) {
                let panerItemsField = arrrPanelItems[r1]['Fields'];
                for (let r10 = 0; r10 < panerItemsField.length; r10++) {
                  arrChildren.push(panerItemsField[r10]);								
                }                
              }          
            }
          }
        }
      }
    });
  }
  
  if(_page.hasOwnProperty('pageOverlay')) {
    let _objOverlay = _page.pageOverlay;
    let overlayChildren = _objOverlay.Children;
    if(overlayChildren) {
      for (let o = 0; o < overlayChildren.length; o++) 
      {
        arrChildren.push(overlayChildren[o]);
        if(overlayChildren[o]['viewType'] === "Dialog") {
          let childData = [];							
          for(var i=0; i< overlayChildren[o]['uiParts'][scrIndex]['dataarray'].length; i++){
            const dataObj = overlayChildren[o]['uiParts'][scrIndex]['dataarray'][i];
            childData = childData.concat(dataObj['Fields']);			
          }

          let arrDialogItems = childData; //overlayChildren[o]['uiParts'][scrIndex].dataarray[0]['Fields']
          for (let o0 = 0; o0 < arrDialogItems.length; o0++) 
          {
            if(arrDialogItems[o0]['viewType'] === "TileList") {
              arrDialogItems[o0]['parent'] = "Dialog";
              let arrTileItems = arrDialogItems[o0]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let u = 0; u < arrTileItems.length; u++) {
                arrChildren.push(arrTileItems[u]);								
              }
            }else if(arrDialogItems[o0]['viewType'] === "DataGrid"){
              arrDialogItems[o0]['parent'] = "Dialog";        
              const dataGridUI = arrDialogItems[o0]['uiParts'][scrIndex];
              const arrDataCols = dataGridUI.dataCols;
              for (let dg = 0; dg < arrDataCols.length; dg++) {
                let datacolField = (arrDataCols[dg]['isCustom']) ? arrDataCols[dg]['Fields'] : [];
                for (let dc = 0; dc < datacolField.length; dc++) {
                  arrChildren.push(datacolField[dc]);								
                }
                let dataheaderField = (arrDataCols[dg]['isCustomHeader']) ? arrDataCols[dg]['headerFields'] : [];
                if(dataheaderField){
                  for (let dh = 0; dh < dataheaderField.length; dh++) {
                    arrChildren.push(dataheaderField[dh]);								
                  } 
                }   
              }       
            }							
            arrChildren.push(arrDialogItems[o0]);	
          }
        }else if(overlayChildren[o]['viewType'] === "Drawer") {
          let arrDrawerItems = overlayChildren[o]['uiParts'][scrIndex].dataarray[0]['Fields'];
          for (let w0 = 0; w0 < arrDrawerItems.length; w0++) 
          {
            if(arrDrawerItems[w0]['viewType'] === "TileList") {
              arrDrawerItems[w0]['parent'] = "Drawer";
              let arrTileItems = arrDrawerItems[w0]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let u = 0; u < arrTileItems.length; u++) {
                arrChildren.push(arrTileItems[u]);								
              }
            }							
            arrChildren.push(arrDrawerItems[w0]);						
          }
        }
      }
    }
  }
    
  return arrChildren;
}

function getSpecificTargetUIParts(data, params, _page, scrIndex)
{
  let targetUIParts = [];
      
  let _uiType = "";
  let uiProps = [];

  if(!data){
    _uiType = "label";

  }else{

    if(data.category.toLowerCase() === "googlemapaction" || data.category.toLowerCase() === "mapcontrol") {
      _uiType = "googlemap";
      if(data.method.toLowerCase() === "showlocationinfo") {
        _uiType = "googlemap, heatmap";
      }
    }
    else if(data.category.toLowerCase() === "googlechartaction") {
      _uiType = "chart";
    }
    else if(data.category.toLowerCase() === "gadgetaction") {
      _uiType = "gadgetui";
    }
    else if(data.method.toLowerCase().indexOf("dialog") > -1)
    {
      _uiType = "dialog";
    }
    else if(data.method.toLowerCase().indexOf("drawer") > -1)
    {
      _uiType = "drawer";
    }
    else if(data.method.toLowerCase().indexOf("popover") > -1)
    {
      _uiType = "popover";
    }
    else if(data.method.toLowerCase().indexOf("tilelist") > -1)
    {
      _uiType = "tilelist";
      uiProps = [{"direction":"Vertical"}];
    }
    else if(data.method.toLowerCase().indexOf("datagrid") > -1)
    {
      _uiType = "datagrid";
    }
    else if(data.method.toLowerCase().indexOf("uiitem") > -1)
    {
      if(data.method.toLowerCase() === "setuiitemvisible"){
        _uiType = "expansionpanel, scrollableview, datagrid";
      }else{
        _uiType = "expansionpanel, scrollableview";//, swipeableview";
      }
    }
    else if(data.method.toLowerCase() === "play" || data.method.toLowerCase() === "pause" || data.method.toLowerCase() === "stopplay") {
      _uiType = "soundbox, videobox";
    }
    else if(data.method.toLowerCase() === "record" || data.method.toLowerCase() === "stoprecord") {
      _uiType = "soundbox";	//"soundbox, camera";
    }
    else if(data.method.toLowerCase() === "qrgenerate") {
      _uiType = "image";
    }
    else if(data.method.toLowerCase() === "changecondition" || data.method.toLowerCase() === "changeremotecondition") {
      _uiType = "combobox, tilelist, datagrid, chart, heatmap, autocomplete, timelinechart, nestedlist";
    }
    else if(data.method.toLowerCase() === "movingfocus" || data.method.toLowerCase() === "setfocusoff") {
      _uiType = "textfield, numericfield, textview, texteditor, searchbar";
    }
    else if(data.method.toLowerCase() === "clearstring" || data.method.toLowerCase() === "copytoclipboard") {
      _uiType = "label, textfield, numericfield, textview, texteditor, combobox, autocomplete";
    
      if(data.method.toLowerCase() === "copytoclipboard"){
        _uiType = _uiType +", datagrid";
  
        if(params.hasOwnProperty('contenttype') && params['contenttype'] === "image"){
          _uiType = _uiType +", image, imagebutton, textbutton, avatar";
        }
      }    
    }
    else if(data.method.toLowerCase() === "startstepcounter") {
      _uiType = "label";
    }
    else if(data.method.toLowerCase() === "showplacesdata") {
      _uiType = "autocomplete, searchbar";
    }
    else if(data.method.toLowerCase() === "takephoto") {
      _uiType = "camera, workflow";
    }
    else if(data.method.toLowerCase() === "resetcontainerui") {
      _uiType = "dynamicui";
    }
    else if(data.method.toLowerCase() === "updatetabitemtext") {
      _uiType = "tabs";
    }
    else {
      if(params.hasOwnProperty('mediatype') || params.hasOwnProperty('contenttype'))
      {
        var _type = '';
        if(params.hasOwnProperty('contenttype'))
          _type = 'contenttype';
        else
          _type = 'mediatype';
          
        if(params[_type] === "image")
          _uiType = "image, imagebutton";
        else if(params[_type] === "sound")
          _uiType = "soundbox";
        else if(params[_type] === "video")
          _uiType = "videobox, label";
        else if(params[_type] === "file"){
          _uiType = "label, textfield, textview";
          if(params.hasOwnProperty('filetype') && params['filetype'] === "image"){
            _uiType = "image, imagebutton";
          }
        }
        else if(params[_type] === "text")
          _uiType = "textfield, numericfield, textview, label, linklabel";
      }
    }
  }
  if(_uiType.length === 0)	
    return targetUIParts;
  
  
  let _arrUITypes = [];
  if(_uiType.indexOf(", ") > -1)
    _arrUITypes = _uiType.split(", ");
  
  let _arrUIparts = [];
  /* if(User.isGadgetEditor)
  {
    if(pageId.length == 0)	 pageId = "gadget_"+User.gadgetname;
    _arrUIparts = User.currentProjectDic.getGadgetChildrenList(pageId);
  }
  else 
    _arrUIparts = User.currentProjectDic.getPageChildrenList(pageId, screenIndex, tableViewCellDic);*/

  let _pageUIs = getAllChildrenOnPage(_page, scrIndex);
  _pageUIs.forEach(uipart => {
    _arrUIparts.push(uipart.uiParts[scrIndex]);
  });

  //console.log(_page, _arrUIparts, "**** getSpecificTargetUIParts ***", _arrUITypes);
    
  for (let m = 0; m < _arrUIparts.length; m++) {
    if(_arrUITypes.length === 0) {
      if(_arrUIparts[m].viewType.toString().toLowerCase() === _uiType)
      {
        let uiPart = _arrUIparts[m];	//.uiParts[screenIndex];
        if(uiProps.length > 0){
          const uiprop = uiProps[0];
          for (const [key, value] of Object.entries(uiprop)) {
            if(uiPart[key] === value){
              targetUIParts.push( {page:_page, uiname:uiPart.name} );
            }
          }
          
        }else{
          targetUIParts.push( {page:_page, uiname:uiPart.name} );
        }
      }
    }else {
      let filterUIparts = _arrUITypes.filter(search_UItypes);
      function search_UItypes(_viewtype, index, arr) 
      {
        if(_arrUIparts[m].viewType.toString().toLowerCase() === "button")
        {
          let displayName = _arrUIparts[m].type + _arrUIparts[m].viewType;
          if(displayName.toLowerCase() === _viewtype)
            return true;
          return false;
        }
        else if(_arrUIparts[m].viewType.toString().toLowerCase() === _viewtype)
          return true;
        else
          return false;
      }

     /*  let filterUIparts =  _arrUITypes.filter(function(uitype) {
        if(node['key'] === getKey_forPropertyPath(_dependentTarget))   
          return true;
        return false;
      }); */
      
      if(filterUIparts.length > 0)
      {
        let _uiParts = _arrUIparts[m];
        targetUIParts.push( {page:_page, uiname:_uiParts.name} );
      }
    }
  }
  
  return targetUIParts;
}

function getUIViewtype(uichild) {
  let uitype = uichild['viewType'];
  if(uitype === 'Button'){
    if(uichild.type === "System"){
      uitype = "SystemButton";
    }else if(uichild.type === "CheckBox"){
      uitype = "CheckBox";
    }else {
      uitype = getButtontype(uichild.buttonType) + 'Button';
    }
  }
  return uitype;
}
function getButtontype(btnType) {
  return btnType.charAt(0).toUpperCase() + btnType.substr(1).toLowerCase();
}

function doMethodByPath(path, args)
{  
  if (path.search("showAlert") === 0)
  {
    //Alert.show(args);
    return;
  }
  return;
      /* let matches:Array = parseBindings(path);
      let actualPath:String = matches[1].replace("()", "");
      
      if (actualPath.indexOf("@base:") == 0)
      {
        let methodPath:String = actualPath.replace("@base:", "");
        BaseDic(value).doMethod(methodPath, currentSettings.screenIndex);
      } */
}


function updateUIpartStyle(uidata, styleChildren){
  console.log(uidata, "------ updateUIpartStyle >>>>", styleChildren);
  if(styleChildren.length === 0){
    return;
  }

  if(uidata.hasOwnProperty("backgroundColor")) {
    uidata['backgroundGradient'] = getStylePropValue(styleChildren, 'background', 'gradient');
    uidata['backgroundColor'] = getStylePropValue(styleChildren, 'background', 'color');
    uidata['backgroundColor']['alpha'] = getStylePropValue(styleChildren, 'background', 'alpha');
  }
  if(uidata.hasOwnProperty("borderColor")) {
    uidata['borderColor'] = getStylePropValue(styleChildren, 'border', 'color');
    uidata['borderColor']['alpha'] = getStylePropValue(styleChildren, 'border', 'alpha');
  }
  if(uidata.hasOwnProperty("borderWeight")) {
    uidata['borderWeight'] = getStylePropValue(styleChildren, 'border', 'width');
  }
  if(uidata.hasOwnProperty("cornerRadius")) {
    uidata['cornerRadius'] = getStylePropValue(styleChildren, 'border', 'radius');
  }
  if(uidata.hasOwnProperty("font") || uidata.hasOwnProperty("normalFont")) {
    const uiFont = (uidata.hasOwnProperty("font")) ? uidata['font'] : uidata['normalFont'];
    uiFont['fontName'] = getStylePropValue(styleChildren, 'font', 'family');
    uiFont['fontSize'] = parseInt(getStylePropValue(styleChildren, 'font', 'size'));
    uiFont['fontStyle'] = getStylePropValue(styleChildren, 'font', 'style');
    const fontweightVal = getStylePropValue(styleChildren, 'font', 'weight');
    if(isNaN(uiFont['fontWeight'])){
      uiFont['fontWeightNum'] = fontweightVal;
    }else{
      uiFont['fontWeight'] = fontweightVal;
    }    
    uiFont['textAlignment'] = getStylePropValue(styleChildren, 'text', 'align');
    uiFont['textColor'] = getStylePropValue(styleChildren, 'text', 'color');
  }
  if(uidata.hasOwnProperty("verticalAlignment")) {
    uidata['verticalAlignment'] = getStylePropValue(styleChildren, 'text', 'valign');
  }
  if(uidata.hasOwnProperty("underline")) {
    uidata['underline'] = getStylePropValue(styleChildren, 'text', 'underline');
  }
  if(uidata.hasOwnProperty("strikeout")) {
    uidata['strikeout'] = getStylePropValue(styleChildren, 'text', 'line-through');
  }
  if(uidata.hasOwnProperty("textShadow")) {
    uidata['textShadow'] = getStylePropValue(styleChildren, 'text', 'shadow');
  }
}
function getStylePropValue(styleChildren, stylename, propname) {
  let propval = '';
  let styleObj = styleChildren.find(x => x['name'] === stylename);  
  if(styleObj) {
    styleObj['children'].forEach(element => {
      if(element['name'] === propname){
        if(propname === "style") {
          propval = (element['value'] === "normal") ? 0 : 1;
        }else if(propname === "weight") {
          //propval = (element['value'] === "normal") ? 0 : 1; 
          propval = Number(element['value']);           
        }else{
          if(element['type'] === "color") {
              propval = hextoRGB(element['value']);
          }else{
              propval = element['value'];
          }
        }
      }
    });
  }    
  return propval;
}
function hextoRGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: parseInt(result[1], 16)/255,
    green: parseInt(result[2], 16)/255,
    blue: parseInt(result[3], 16)/255,
    alpha: 1,
    colorName: ""
  } : null;
}


function mapStateToProps(state) {   
  //console.log("SettingWindow mapStateToProps >>>>>", state); 
  return {
    apiParam: state.appParam.params,
    pageLocale: state.appParam.pagelocale,
    pageContainer: state.appParam.pagecontainer,
    pageConfig: state.appParam.pageconfig,
    uiLocale: state.appParam.uilocale,
    uiList: state.appParam.uilist,
    uiConfig: state.appParam.uiconfig,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    editorParent: state.selectedData.editorParent,
    validationErrors: state.selectedData.validationErrors,
  };
}
export default connect(mapStateToProps)(PropertyValueForm);