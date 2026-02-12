import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, Chip } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';

import { setEditorParent, setPreviousEditorParent } from '../ServiceActions';
import UIContainer from '../editors/UIContainer';


const StyledBadge = withStyles(theme => ({
  badge: {
    top: '50%',    
    right: 16,
    zIndex: 0,  
    // The border color match the background color.
    border: `1px solid ${
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
    }`,
  },
}))(Badge);


class EditorButtonForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        uichildren: getUIChildren(this.props.value, this.props.config, this.props.currentScreenIndex),
        label: 'Count',
        popup: false,
    };

    this.openUIContainer = this.openUIContainer.bind(this);
    this.closeUIContainer = this.closeUIContainer.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {      
    if(prevProps.value !== this.props.value)
    {
      this.setState({ uichildren: this.props.value });
    }   
  }
  
  openUIContainer() {
    if(this.props.contentEditorParent && this.props.contentEditorParent['source']){
      let prevEditorParent = this.props.previousEditorParent;
      prevEditorParent.push(this.props.contentEditorParent);
      this.props.dispatch(setPreviousEditorParent(prevEditorParent));
    }

    let source;
    if(this.props.config.hasOwnProperty('source')) {
      source = this.props.config['source'];
    }   
    if(source) {
      let _editorObj = {page: this.props.currentPage, ui: {}, source: source};
      if(source === "TileList" || source === "DataGrid" || source === "overlay" || source === "Dialog" || source === "Drawer"
             || source === "Popover" || source === "ExpansionPanel" || source === "SwipeableView" || source === "Form" || source === "ScrollableView"
             || source === "NestedList" || source === "SubNestedList") {

        _editorObj['ui'] = this.props.currentUI;

        if(source === "Dialog" || source === "DataGrid" || source === "ExpansionPanel" || source === "SwipeableView" || source === "Form"){
          if(this.props.value && this.props.value['id']){
            _editorObj['index'] = parseInt(this.props.value['id']);
          }else if(this.props.selectedItem && this.props.selectedItem['index']){
            _editorObj['index'] = parseInt(this.props.selectedItem['index']);
          }else{
            _editorObj['index'] = 0;
          }
        } 

        if(this.props.currentUI['viewType'] === "Dialog" && this.props.currentUI['_selectedIndex']){
          _editorObj['index'] = this.props.currentUI['_selectedIndex'];
        }

        if(this.props.config['fieldname']){
          _editorObj['fieldContainer'] = this.props.config['fieldname'];
        }
        
        sessionStorage.setItem("editor", source);
        this.props.dispatch(setEditorParent(_editorObj));
      }
      //console.log(this.props.config, ".... EditorButtonForm ....", _editorObj);
    }
  }

  closeUIContainer() {
    this.setState({ popup: false });
  }

  render() {
    const {label, popup} = this.state;    
    let uichildren = (this.state.uichildren) ? this.state.uichildren : [];
    if(!Array.isArray(uichildren)){
      if(this.props.config['fieldname']){
        const _fieldaname = this.props.config['fieldname'];
        uichildren = uichildren[_fieldaname];
      }
    }
    //console.log(this.props.config['fieldname'], "<<<< EditorButtonForm >>>>", uichildren, this.props.value);
    
    return (
      <div id="uieditor">
        <FormGroup>
          <StyledBadge color="primary"
                  invisible={false} badgeContent={uichildren.length}>            
            <Chip clickable={false} color="default" size="small" style={{width:143}}
                  label={label}
                  onClick={this.openUIContainer}
            />
          </StyledBadge>
        </FormGroup>
        {popup && 
          <UIContainer data={uichildren} show={popup} onCloseEditor={this.closeUIContainer} />
        }
        
      </div>
    );
  }
}

function getUIChildren(uiData, configObj, scrIndex) {
  const popup = configObj['popup'];
  let uiChildren = [];
  if(!uiData || uiData.length === 0) {
    return uiChildren;
  }
    
  switch (popup) {
    case "ToolBarEditor":
      uiChildren = uiData;
      break;
    case "CellEditor":
      uiChildren = uiData['Fields'];
      if(configObj['fieldname'] && configObj['fieldname'] === "headerFields"){
        if(uiChildren){
          uiChildren.concat(uiData['headerFields']);
        }else{
          uiChildren = uiData['headerFields'];
        } 
      }
      break;
    case "FormEditor":
      uiChildren = uiData['formField'];
      break;    
    case "TableViewEditor":
      uiChildren = uiData[0].Group[0].rowarray[0]['Fields'];
      break;
    default:
      uiChildren = uiData;
      break;
  }
  
  let _uiChildren =  uiChildren.filter(function(uichilds) {
    let scrid = 0;
    if(popup === "CellEditor") {
      scrid = (scrIndex) ? scrIndex : 0;
    }
    if(uichilds.uiParts[scrid]['_enabledOnScreen']){
      return true;
    }
    return false;
  });

  return _uiChildren;
}



function mapStateToProps(state) {  
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    contentEditorParent: state.selectedData.editorParent,
    previousEditorParent: state.selectedData.prevEditorParent,
  };
}
export default connect(mapStateToProps)(EditorButtonForm);