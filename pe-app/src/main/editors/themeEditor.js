import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Dialog, DialogContent, Grid, GridList, GridListTile, List, ListItem, ListItemText, ListItemSecondaryAction, Select, TextField, SvgIcon, Fab, FormControlLabel } from '@material-ui/core';
import { AppBar, Tab, Tabs, IconButton, Box, Button, Paper, Slide, Typography, Snackbar, Container, Checkbox, Tooltip, Popover } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import HelpIcon from '@material-ui/icons/Help';
import CloseIcon from '@material-ui/icons/Close';
import AlertWindow from '../../components/AlertWindow';

import { setAllPageChanged } from '../ServiceActions';

class ThemeEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show: true,
        width: 375,
        height: 667,        

        disableUpdate: this.props.isContributorWorking || !this.props.isProjectRoleOwner,

        pageCSSConfig: [],
        uiCSSConfig: [],
        uiStyleList: [],
      };
      
      this.handleSettingClose = this.handleSettingClose.bind(this);        
    }
  
    componentDidMount() {
      let fetchVal = "";
      const appPageStyle = this.props.appData['AppStyle']['PageStyle'];
      if(appPageStyle && appPageStyle.length > 0){
        this.setState({pageCSSConfig: appPageStyle});
      }else {
        fetchVal = "pageCSS";       
      }
      
      const appUIStyle = this.props.appData['AppStyle']['UIpartStyle'];
      if(appUIStyle && appUIStyle.length > 0){
        //this.setState({uiCSSConfig: appUIStyle});
        this.setState({uiStyleList: appUIStyle});
      }else {
        fetchVal = (fetchVal.length === 0) ? "uiCSS" : fetchVal +",uiCSS";
      }
      
      if(fetchVal.length > 0) {
        this.fetchAppexeCSS(fetchVal);
      }
    }

    fetchAppexeCSS(fetchval){
      fetch("././config/AppexeCSS.json")
      .then(res => res.json())
      .then(
        (result) => {          
          //console.log(fetchval, "...AppexeCSS >>>", result);
          result.forEach((_obj, i) => {
            if(_obj.hasOwnProperty('pageCSS') && fetchval.indexOf('pageCSS') > -1) {
              this.setState({pageCSSConfig: _obj['pageCSS']});
            }
            if(_obj.hasOwnProperty('uiCSS') && fetchval.indexOf('uiCSS') > -1) {
              this.updateFontfamily(_obj['uiCSS']);  // in reference of bug #18121

              this.setState({uiCSSConfig: _obj['uiCSS']});              
              this.setUIDefaultStyle(_obj['uiCSS']);
            }
          });
        },        
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error
          });
        }
      )
    }
    updateFontfamily(uiObjCSS){
      let fontObj =  uiObjCSS.filter(function(node) {
        if(node['name'] === "font"){
          return true;
        }
        return false;
      });
      
      if(fontObj.length > 0) {
        const fontData = fontObj[0];
        fontData['children'].forEach(element => {
          if(element['name'] === "family"){
            let preDefined_Fonts = [{label: 'Helvetica Neue'}];
            preDefined_Fonts.unshift({label: 'system'});
            element['options'] = preDefined_Fonts;
          }
        });
      }
    }

    setUIDefaultStyle(uiCSSConfig) {
      const appUIStyle = this.props.appData['AppStyle']['UIpartStyle'];
      if(appUIStyle && appUIStyle.length === 0){
        this.fetchUIPartsDic().then(
          result => { 
            //console.log(this.props.uiList, ".... setUIDefaultStyle >>>>", uiCSSConfig);
            let uiParts = result['UIParts'];
            if(uiParts) {
              let uiStyleList = [];
              const uilist = this.props.uiList;
              uilist.forEach(category => {
                for(let i=0; i< category['items'].length; i++){
                  let uiitem = category['items'][i];
                  let uiname = (uiitem.type) ? (uiitem.name + uiitem.type) : uiitem.name;
                  let styleItems = generateStyleChildren(uiname, uiCSSConfig, uiParts);
                  styleItems = JSON.parse(JSON.stringify(styleItems));
                  uiStyleList.push({name:uiname, text:uiitem['text'], style:[{name:'default', children:styleItems}]});
                }
              });
              //console.log(uiCSSConfig, ".... setUIDefaultStyle >>>>", uiStyleList);
              this.setState({uiStyleList: uiStyleList});
            }
          }
        );  
      }
    }
    fetchUIPartsDic(){
      return fetch("././config/UIPartDic.json")
        .then(res => res.json())
        .then(
          (result) => { 
            return result;          
          },        
          (error) => {
            console.log("UI-parts fetching error >>>", error);
            this.setState({ error });
            return error;
          }
        )  
    }
    
    
    ///////////////////////////////////////////////////////////////

    handleSettingClose() {
      this.setState({show: false});
      this.props.onCloseEditor();
    }

    handleUpdatePageStyle(styledata) {
      //console.log("UpdatePageStyle done >>>>>>", styledata);
      this.setState({pageCSSConfig: styledata});
    }
    handleApplyPageStyle(styledata, param) {
      console.log(param, "..SetPageStyle done >>>>>>", styledata);
      this.props.appData['AppStyle']['PageStyle'] = styledata;
      if(param === "applysave") {
        this.props.dispatch(setAllPageChanged(true));
      }
      this.props.onCloseEditor(param);
    }

    handleUpdateUIStyle(styledata) {
      //console.log("UpdateUIStyle done >>>>>>", styledata);
      this.setState({uiStyleList: styledata});
    }
    handleApplyUIStyle(styledata) {
      this.props.appData['AppStyle']['UIpartStyle'] = styledata;
      this.props.onCloseEditor('apply');
    }

    handleSetRememberMe(rmval){
      this.props.appData['AppStyle']['rememberMe'] = rmval;
    }

    
    render() {
      const { show } = this.state;
      if(!show) {
        return null;
      }
      const remMe = true;//this.props.appData['AppStyle']['rememberMe'];
      return ( 
        <div className="vertical-align" style={{width:'initial'}}>  
          {(this.state.pageCSSConfig.length > 0 && this.state.uiStyleList.length > 0) && 
            <ThemeView pageStyleConfig={this.state.pageCSSConfig} uiStyleConfig={this.state.uiCSSConfig}
                       uiPartList={this.props.uiList} uiStyleList={this.state.uiStyleList}
                       pageList={this.props.pagelist} onCloseSetting={this.handleSettingClose}
                       onUpdatePageStyle={this.handleUpdatePageStyle.bind(this)} onApplyPageStyle={this.handleApplyPageStyle.bind(this)}
                       onUpdateUIStyle={this.handleUpdateUIStyle.bind(this)} onApplyUIStyle={this.handleApplyUIStyle.bind(this)}
                       rememberMe={remMe} onSetRememberMe={this.handleSetRememberMe.bind(this)}
            />
          }
        </div>       
      );
      
    }
  }
  

  function ThemeView(props) {

    const [pageStyle, setPageStyle] = React.useState(props.pageStyleConfig);

    const uiPartList = props.uiPartList;
    //const uiStyleList = props.uiStyleList;
    const [uiStyleList, setUIStyleList] = React.useState(props.uiStyleList);
    //console.log(pageStyle, "...... ThemeView .....", uiPartList, uiStyleList); 
    
    const displayApplySave = (props.pageList.length === 0) ? 'none' : '';

    const useStyles = makeStyles(theme => ({
      root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      title: {
        padding: '8px 16px',
        width: 240
      },
      content: {
        //height: `calc(100% - 60px)`, 
        padding: '4px',
        display: 'flex',
        position: 'absolute',
        top: 42, left: 300,
        height: '100%', width: `calc(100% - 324px)`, 
      },
      infodiv: {
        position: 'absolute',
        left: 0,
        height: '100%', 
        width: '100%',
        backgroundColor:'rgba(0,0,0,0.8)',
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      infocontainer: {
        height: '40vh', 
        width: '64vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        padding: 16,
      },
      infonotes: {
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
      },
      templatecontainer: {
        height: `calc(100% - 72px)`,
        width: '100%',
        padding: 8
      },
      templatediv: {
        height: '100%', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      adownload:{
        height: 100,
        //width:'100%', 
        margin: '8px',
        color: theme.palette.common.white,
        textDecoration: 'none'  
      },
      btndownload:{
        width: '100%',
        height: 100,
        fontWeight: 'bold',
        color: theme.palette.common.white,
        textTransform: 'none',
      },
      validerror: {
        height:'100%', 
        overflow:'auto', 
        textAlign:'start', 
        fontSize:'1rem'
      },
      btnupload:{
        width: '100%',
        height: 60,
        fontWeight: 'bold',
        color: theme.palette.common.white,
        textTransform: 'none',
        margin: '8px'
      },
      fileinput: {
        height: 60, width: '100%', 
        opacity: 0.01,
        position: 'absolute',
        //top: '-70px',            
        cursor: 'pointer',
        margin: '8px'
      },
      btnapplycss:{
        width: '100%',
        height: 60,
        fontWeight: 'bold',
        color: theme.palette.common.white,
        textTransform: 'none',
        margin: '8px'
      },
      pcontainer1: {
        width: '100%',
        height: '80vh',
        minHeight: 667,
        //display: 'flex',
        justifyContent: 'center'
      },
      propertydiv: {
        //width: '100%',
        minWidth: 320,
        padding:  theme.spacing(0.25, 1), 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      propertybtn: {
        width: 48,
        height: 18,
        padding: 2,
        borderRadius: 2,
        borderWidth: 2,
        borderStyle: 'solid',
      },
      pagegrid: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      pcontainer2: {
        width: 375,
        height: 667,
      },
      pagelayout: {
        width: 375,
        height: 667,
        border: '1px solid rgb(7,7,7)',
        borderRadius: 2,
      },
      container: {
        //position: 'absolute',
        width: 375,
        height: '100%',
        padding: 0,
        margin: 0,
        backgroundColor: '#cccccc',
      },
      pagecontainer: {
        width: 375,
        height: getPageContainerHeight(pageStyle),
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'body', 'background-color'),
      },
      cell1: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'table', 'cell-color'),
      },
      cell2: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'table', 'alternate-cell-color'),
      },
      navbar: {
        width: '100%',
        height: 44,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'navbar', 'background-color'),
        display: getStylePropVisibility(pageStyle, 'navbar'),
      },
      topbar: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'topnav', 'background-color'),
        display: getStylePropVisibility(pageStyle, 'topnav'),
      },
      bottombar: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'bottomnav', 'background-color'),
        display: getStylePropVisibility(pageStyle, 'bottomnav'),
      },      
      leftbar: {
        position: 'absolute',
        left: 0,
        width: '40%',
        height: 'inherit',
        border: '1px solid rgb(27,27,27)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'leftnav', 'background-color'),
        display: getStylePropVisibility(pageStyle, 'leftnav'),
      },
      rightbar: {
        position: 'absolute',
        right: 0,
        width: '40%',
        height: 'inherit',
        border: '1px solid rgb(27,27,27)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'rightnav', 'background-color'),
        display: getStylePropVisibility(pageStyle, 'rightnav'),
      },
      tabsbar: {        
        width: '100%',
        height: 49,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'tabbar', 'background-color'),
        display: getStylePropVisibility(pageStyle, 'tabbar'),
      },      
      gridbox: {
        width: '100%',
        display: 'flex',
        //flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'space-around',
        border: '2px solid rgb(227,227,227)',
        borderRadius: 8,
        //margin: 4,
        padding: '4px 8px',        
      },      
      btnapply: {
        width: '100%',
        minWidth: 200,
        maxWidth: 560,
        marginRight: 8,
        fontWeight: 'bold',
        textTransform: "none",
      },
      btnapplysave: {
        width: '100%',
        minWidth: 200,
        maxWidth: 560,
        marginRight: 8,
        fontWeight: 'bold',
        backgroundColor: theme.palette.grey[500],
        color: theme.palette.common.white,
        textTransform: "none",
        display: displayApplySave
      },      
      iconbtn: {
        //position: 'absolute',
        //right: 30,
        padding:4
      },
      popover: {
        marginTop: theme.spacing(0.5),
      },
      paper: {
        padding: theme.spacing(0.5),
        backgroundColor: theme.palette.grey[300],
      },
      pophelp:{
        paddingLeft: theme.spacing(1),
        maxWidth: 440,
      },
      pcontainer3: {
        height: '92vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      griduilist: {
        display: 'flex',
        //flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxHeight: 54,
        border: '1px solid rgb(227,227,227)',
        borderRadius: 8,
      },
      uipartname: {
        margin: theme.spacing(0.5, 2),
        fontSize:'0.875em', 
      },
      stylelistdiv: {
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: '1px solid rgb(227,227,227)',
      },
      fabadd: {
        marginRight: theme.spacing(1),
      },
      stylenamediv: {
        width: 960, 
        height: 64,
        padding: theme.spacing(2),
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.palette.grey[100],
        borderRadius: 8,
      },
      uistylename: {
        width:320
      },
      gridlist: {
        //width: '100%',
        padding: theme.spacing(1),
      },
      heading: {
        backgroundColor: theme.palette.grey[500],
        color: theme.palette.common.white,
        textAlign: 'start',
        fontWeight: 'bold',
        paddingLeft: theme.spacing(1),
      },
      propselect: {        
        height: 24,
        minWidth: 104,
        //margin: '0px 4px',
        paddingLeft: 4,
        border: '1px solid',
        borderRadius: 2,
        fontSize:'0.875em',
      },
      griduilist2: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxHeight: 64,
        border: '1px solid rgb(227,227,227)',
        borderRadius: 8,
      },
      gridbox2: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        //border: '2px solid rgb(227,227,227)',
        borderRadius: 8,
        //margin: 4,
        //padding: 8,        
      }, 
      btnaddcancel: {
        width: '100%',
        minWidth: 200,
        maxWidth: 560,
        marginRight: 8,
        fontWeight: 'bold',
        backgroundColor: theme.palette.grey[500],
        color: theme.palette.common.white,
        textTransform: "none",
      },
    }));

    const classes = useStyles();
    
    
    ////////////////////////////////////////////////////////
    
    const [tabvalue, setTabValue] = React.useState(0);

    function handlePopupClose() {
      props.onCloseSetting();
    }    

    function handleTabChange(event, newValue) {
      setTabValue(newValue);
    }

    ////////////////////////////////////////////////////////

    const [showInfo, setShowInfo] = React.useState(!props.rememberMe);
    function handleInfoClose() {
      setShowInfo(false);
      props.onSetRememberMe(showRemember);
    }

    const [showRemember, setRemember] = React.useState(false);
    function handleRememberMe() {
      //console.log(props);      
      setRemember(!showRemember);
    }

    ////////////////////////////////////////////////////////

    const [anchorEl, setAnchorEl] = React.useState(null);
    const showhelp = Boolean(anchorEl);
    function handleHelpText(event) {
      setAnchorEl(event.currentTarget);
    }
    function handleHelpClose() {
      setAnchorEl(null);
    }


    ////////////////////////////////////////////////////////
    // Page Style functionalities
    ////////////////////////////////////////////////////////

    /////// CSS Template ///////

    const [isvalidfile, setFileValid] = React.useState(false);
    const [validerror, setValidError] = React.useState("");

    function handleUploadCSS(event) {      
      if(event.target.files.length === 0){
        console.log(" ---------- selection cancel ---------- ");
        return;
      }

      let cssfile = event.target.files[0];
      var reader  = new FileReader();
      reader.readAsText(cssfile);
      reader.addEventListener("load", function () {  
        console.log("reader load >>", reader.result); 
        setValidError(reader.result);      
      }, false);

      //need to validate css

      setFileValid(true);
    }

    function handleApplyCSS() {
      setFileValid(false);
      setValidError("");

      //setApplyParam('apply');      
      //setOpenConfirm(true);
    }

    ////////////////////////////

    function handlePropValueChange(event) {
      const _dataset = event.currentTarget.dataset;
      const newobj = {stylename:_dataset['stylename'], propname:_dataset['propname'], newval:event.currentTarget.value};
      updatePageStyle(newobj);      
    }

    function handlePropValueChecked(event) {
      const updateval = Boolean(event.currentTarget.checked);
      const strname = event.currentTarget.name;
      //console.log(strname,".....PropValueChecked >>>>>>", updateval);
      const _stylename = strname.split('_')[0];
      const _propname = strname.split('_')[1];
      const newobj = {stylename:_stylename, propname:_propname, newval:updateval};
      updatePageStyle(newobj);
    }

    function updatePageStyle(updateval) {
      //console.log("updatePageStyle >>>>>>", updateval);

      let pageStyleData = pageStyle;
      let styleObj =  pageStyleData.filter(function(node) {
        if(node['name'] === updateval['stylename']){
          return true;
        }
        return false;
      });
      
      if(styleObj.length > 0) {
        const styleData = styleObj[0];
        styleData['children'].forEach(element => {
          if(element['name'] === updateval['propname']){
            element['value'] = updateval['newval'];
          }
        });
      }
      
      setPageStyle(pageStyleData);
      props.onUpdatePageStyle(pageStyleData);
    }

    ////////////////////////////////////////////////////////
   
    const [openconfirm, setOpenConfirm] = React.useState(false);
    const [applyparam, setApplyParam] = React.useState('');

    function handleSetPageStyle() {
      setApplyParam('apply');      
      setOpenConfirm(true);
    }

    function handleApplyPageStyle() {
      setApplyParam('applysave');      
      setOpenConfirm(true);
    }

    function handleConfirmOk() {
      //console.log("... handleSetPageStyle >>>", pageStyle);
      setOpenConfirm(false);
      props.onApplyPageStyle(pageStyle, applyparam);
    }

    function handleConfirmCancel() {
      setOpenConfirm(false);
    }
    

    ////////////////////////////////////////////////////////
    // UI Style functionalities
    ////////////////////////////////////////////////////////


    const [openalert, setOpenalert] = React.useState(false);
    const [alertmsg, setAlertMessage] = React.useState('');
    const handleCloseMessage = () => {
      setOpenalert(false);
      setAlertMessage('');
    };

    const [selectedUIpart, setSelectedUIpart] = React.useState('Label');
    const handleSelectUIpart = (event) => {
      //console.log("selectedUIpart >>>", event.target.value);
      setSelectedUIpart(event.target.value);
    };

    const [selectedUIStyle, setSelectedUIStyle] = React.useState('default');
    const handleSelectUIStyle = (event) => {
      //console.log("handleSelectUIStyle >>>", event.target.value);
      setSelectedUIStyle(event.target.value);
    };    

    const [addstyle, setAddStyle] = React.useState(false);
    function handleAddUIStyle() {
      setAddStyle(!addstyle);
    }
    
    const [newstylename, setStyleName] = React.useState('');
    function handleSetStyleName(event) {
      const val = event.target.value;
      if(val.length > 0) {
        if(val === "custom" || val === "default") {
          setAlertMessage("'custom' or 'default' is reserved name.");
          setOpenalert(true);
          return;
        }
        const allowedChars = /[a-z]/g;
        let allowedTitle = val.match(allowedChars);
        if(!allowedTitle) {
          setAlertMessage("Only small-case letters allowed.");
          setOpenalert(true);
          return;
        }
        if(allowedTitle && (val.length !== allowedTitle.length)) {
          setAlertMessage("Only small-case letters allowed.");
          setOpenalert(true);
          return;
        }
      }

      setStyleName(val);
    }

    function validateStyleName(stylename) {
      let uiStyleData = uiStyleList;
      let uiStyleObj = uiStyleData.filter(function(node) {
        if(node['name'] === selectedUIpart){
          return true;
        }
        return false;
      });
      
      if(uiStyleObj.length > 0) {
        const styleData = uiStyleObj[0]['style'];
        const styleObj = styleData.find(x => x['name'] === stylename);
        if(styleObj) {
          return true;
        }
      }
      return false;
    }
    function handleOkAddUIStyle() {
      if(newstylename.length > 0) { 
        const isNameExist = validateStyleName(newstylename);
        if(isNameExist){
          setAlertMessage("Style-name already exist for the UI-part");
          setOpenalert(true);
          return;
        }

        let uiStyleObj = getSelectedUI_styleList(uiStyleList, selectedUIpart);
        //console.log(uiStyleList, "OKApply... >>", selectedUIpart, newstylename, uiStyleObj);
        const stylechildren = JSON.parse(JSON.stringify(uiStyleObj[0]['children']));
        uiStyleObj.push({name:newstylename, children:stylechildren});
        
        setStyleName('');
        setAddStyle(false);
      }else {
        
        setAlertMessage('Value cannot be empty');
        setOpenalert(true);
      }
    }
    function handleCancelAddUIStyle() {
      setStyleName('');        
      setAddStyle(false);
    }

    function handleUIPropValueChange(event) {
      const _dataset = event.currentTarget.dataset;
      const newobj = {stylename:_dataset['stylename'], propname:_dataset['propname'], newval:event.currentTarget.value};
      //console.log(selectedUIpart, selectedUIStyle, "....UIPropValue Change >>>", newobj);
      updateUIStyle(newobj);
    }
    
    function handleUIPropValueSelect(event) {
      const selectedval = event.currentTarget.value;
      const strname = event.currentTarget.name;
      const _stylename = strname.split('_')[0];
      const _propname = strname.split('_')[1];
      const newobj = {stylename:_stylename, propname:_propname, newval:selectedval};
      //console.log(event.currentTarget.name, "....UIPropValue Select >>>", newobj);
      updateUIStyle(newobj);
    }

    function handleUIPropValueChecked(event) {
      const updateval = Boolean(event.currentTarget.checked);
      const strname = event.currentTarget.name;
      const _stylename = strname.split('_')[0];
      const _propname = strname.split('_')[1];
      const newobj = {stylename:_stylename, propname:_propname, newval:updateval};
      //console.log(selectedUIpart, selectedUIStyle, "....UIPropValue Checked >>>", newobj);
      updateUIStyle(newobj);
    }

    function updateUIStyle(updateval) {
      let uiStyleData = uiStyleList;
      let uiStyleObj = uiStyleData.filter(function(node) {
        if(node['name'] === selectedUIpart){
          return true;
        }
        return false;
      });
      
      if(uiStyleObj.length > 0) {
        const styleData = uiStyleObj[0]['style'];
        const styleObj = styleData.find(x => x['name'] === selectedUIStyle);
        const styleChildren = styleObj['children'];
        const styleItem = styleChildren.find(x => x['name'] === updateval['stylename']);
        styleItem['children'].forEach(element => {
          if(element['name'] === updateval['propname']){
            element['value'] = updateval['newval'];
          }
        });
      }

      setUIStyleList(uiStyleData);
      console.log(updateval, "....updateUIStyle >>>", uiStyleData);
      props.onUpdateUIStyle(uiStyleData);
    }

    function handleSetUIStyle() {
      props.onApplyUIStyle(uiStyleList);
    }

    return (      
      <Dialog id="themesetting" PaperComponent={PaperComponent} TransitionComponent={Transition}
              scroll="paper" open={true} fullWidth={true} maxWidth="lg" >
        <DialogTitle className={classes.title} onClose={handlePopupClose} tabvalue={tabvalue} onTabChange={handleTabChange} >Style Editor</DialogTitle>
        <DialogContent dividers className={classes.content}>
          {showInfo && 
            <div className={classes.infodiv}>
              <PaperContainer elevation={9} className={classes.infocontainer}>
                <div className={classes.infonotes}>
                  <Typography variant="h6" color="textPrimary" gutterBottom style={{textAlign:'start',marginBottom:8}} >
                    With this functionality user can set color-scheme & other style properties to be used within the app.
                    Since those styles also applicable for mobile apps. So, we cannot set general CSS.
                  </Typography>
                  <Typography variant="h6" color="textPrimary" gutterBottom style={{textAlign:'start'}} >
                    Here we are providing 2 options : either set style values in predefined CSS Template 
                    or via given user interface i.e. Page Style & UI-part style.            
                  </Typography>
                </div>
                <FormControlLabel label="Don't show me it again." style={{padding:'0px 0px 8px 16px'}}
                  control={ <Checkbox color="default" checked={showRemember} onChange={handleRememberMe} /> }                    
                />
                <Button variant="contained" disableElevation color="primary" style={{width:'calc(100% - 48px)', margin:'0px 24px'}} 
                        onClick={handleInfoClose}> OK </Button>                  
              </PaperContainer>
            </div>
          }          
          {tabvalue === 0 && 
            <PaperContainer elevation={9} className={classes.pcontainer3}>
              <Grid container spacing={2} style={{height:'100%', width:'100%', margin:4}}>
                <Grid item xs={12} md={6} style={{padding:4, border:'1px solid'}}>                
                  <Typography variant="h6" className={classes.heading} style={{height:36, padding:4}} >Page Components</Typography>
                  <List component="nav" dense={true} style={{width:'100%'}} >
                    {pageStyle.map((styles, index) => (
                      <StyledListItem key={styles.name+'_'+index}>
                        <ListItemText primary={styles.label} style={{fontWeight:'bold', fontSize:'1rem'}} />
                        <ListItemSecondaryAction>
                          {styles.children.map((child, i) => (
                            <div key={child.name+'_'+i} className={classes.propertydiv}>
                              <Typography variant="subtitle2">{child.label}</Typography>
                              {child.type === "color" && 
                                <div className={classes.pagegrid}>
                                  <input type="color" value={child.value} data-stylename={styles.name} data-propname={child.name}
                                        onChange={handlePropValueChange} />
                                  <Typography variant="caption" className={classes.propertybtn} style={{borderColor:child.value}}>{child.value}</Typography>
                                </div>                            
                              }
                              {child.type === "boolean" && 
                                <Checkbox color="default" disableRipple style={{padding:4}} checked={child.value} name={styles.name+'_'+child.name} 
                                          onChange={handlePropValueChecked} />
                              }
                            </div>
                          ))}
                        </ListItemSecondaryAction>
                      </StyledListItem>
                    ))} 
                  </List>                             
                </Grid>
                <Grid item xs={12} md={6} className={classes.pagegrid}>
                  <PaperContainer elevation={4} className={classes.pcontainer2}>
                    <Box className={classes.pagelayout}>
                      <Box id="leftbar" className={classes.leftbar} />
                      <Box id="rightbar" className={classes.rightbar} />
                      <Container id="container" fixed className={classes.container}>
                        <Box id="navbar" className={classes.navbar} />
                        <Box id="topbar" className={classes.topbar}/>
                        <Box id="pagecontainer" className={classes.pagecontainer}>
                          <Box id="cell1" className={classes.cell1}/>
                          <Box id="cell2" className={classes.cell2}/>
                        </Box>
                        <Box id="bottombar" className={classes.bottombar} />
                        <Box id="tabsbar" className={classes.tabsbar} />                  
                      </Container>
                    </Box>
                  </PaperContainer>
                </Grid>
                <Grid item xs={12} md={12} style={{display:'flex', alignItems:'end'}}>
                  <Box className={classes.gridbox} style={{width:'100%'}}>                     
                    <div style={{width:'100%', display:'flex', justifyContent:'space-around'}}>
                      <Button variant="contained" disableElevation color="primary" className={classes.btnapply} onClick={handleSetPageStyle}> Apply </Button>
                      <Button variant="contained" disableElevation className={classes.btnapplysave} onClick={handleApplyPageStyle}> Apply & Save </Button>
                    </div>
                    <Tooltip title="Help" placement="left-start">
                      <IconButton color="inherit" className={classes.iconbtn} onClick={handleHelpText}>
                        <HelpIcon />                  
                      </IconButton>
                    </Tooltip>
                    <Popover className={classes.popover} classes={{paper: classes.paper}}
                            open={showhelp} anchorEl={anchorEl} onClose={handleHelpClose}
                            anchorOrigin={{vertical: 'top', horizontal: 'left',}}
                            transformOrigin={{vertical: 'top', horizontal: 'right',}}
                    >
                      <div >
                        <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                          1. On click 'Apply' button will set above style on new created pages.
                        </Typography>
                        <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                          2. On click 'Apply & Save' button will set above style on existing & new created pages.                        
                        </Typography>
                        <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                          3. Only colors will apply on existing pages, not any bar visibility.
                        </Typography>
                      </div>
                    </Popover>   
                  </Box>
                </Grid>
                {openconfirm && 
                  <AlertWindow open={true} title="Are you sure to apply this style ?" message="Once style set, it cannot be revert."
                              ok="Yes" okclick={handleConfirmOk}
                              cancel="No" cancelclick={handleConfirmCancel}
                  />
                }
              </Grid>
            </PaperContainer>
          }
          {tabvalue === 1 && 
            <PaperContainer elevation={9} className={classes.pcontainer3}>
              <GridList className={classes.griduilist} cellHeight={44} style={{margin:8, marginBottom:0}}>
                <Select native value={selectedUIpart} className={classes.uipartname} style={{width:'inherit', height:36, minWidth:320}}
                        onChange={handleSelectUIpart} >
                  {uiPartList.map(category =>
                    <optgroup key={category.name} label={category.text}>
                    {category.items.map((uipart,id) => (
                      <option key={id} value={(uipart.type) ? uipart.name+uipart.type : uipart.name}>{uipart.text}</option>
                    ))}
                    </optgroup>
                  )}
                </Select>
                <div className={classes.stylelistdiv} style={{width:'inherit', padding:'2px 8px'}}>
                  <Typography variant="body1" style={{width:120}} >Style Name: </Typography>
                  <Select native value={selectedUIStyle} className={classes.uipartname} style={{width:'inherit', minWidth:320}}
                          onChange={handleSelectUIStyle} >
                    {getSelectedUI_styleList(uiStyleList, selectedUIpart).map((style,id) => (
                      <option key={id} value={style.name}>{style.name}</option>
                    ))}
                  </Select>
                </div>
                <Fab edge="end" size="small" aria-label="add" className={classes.fabadd} style={{width:36, height:36, padding:4}}>
                  <SvgIcon onClick={handleAddUIStyle} >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/>
                  </SvgIcon>
                </Fab>
              </GridList>              
              <GridList className={classes.gridlist} cellHeight={220} style={{margin:0, height:'calc(100% - 144px)'}}>                
                {getStyleData(uiStyleList, selectedUIpart, selectedUIStyle).map((uistyle, j) => (
                  <GridListTile key={uistyle.name+'_'+j} cols={1} style={{width:'100%', height:'auto', minHeight:100, border:'1px solid'}}>
                    <Typography variant="subtitle2" className={classes.heading} >{uistyle.label}</Typography>
                    {uistyle.children.map((child, i) => (
                      <div key={child.name+'_'+i} className={classes.propertydiv}>
                        <Typography variant="subtitle2">{child.label}</Typography>
                        {child.type === "color" && 
                          <div className={classes.pagegrid}>
                            <input type="color" value={child.value} data-stylename={uistyle.name} data-propname={child.name}
                                  onChange={handleUIPropValueChange} />
                            <Typography variant="caption" className={classes.propertybtn} style={{borderColor:child.value}}>{child.value}</Typography>
                          </div>                            
                        }
                        {child.type === "number" && 
                          <input type="number" style={{width:96}} value={child.value} data-stylename={uistyle.name} data-propname={child.name}
                                 min={child.properties[0].min} max={child.properties[0].max} step={child.properties[0].step}                                 
                                 onChange={handleUIPropValueChange} />
                        }
                        {(child.type === "options") && 
                          <Select native className={classes.propselect} style={{width:'inherit'}} value={child.value} name={uistyle.name+'_'+child.name} 
                                  onChange={handleUIPropValueSelect} >
                            {child.options.map((option,id) => (
                              <option key={id} value={option.label}>{option.label}</option>
                            ))}
                          </Select>
                        }
                        {child.type === "boolean" && 
                          <Checkbox color="default" disableRipple style={{padding:4}} checked={child.value} name={uistyle.name+'_'+child.name} 
                                    onChange={handleUIPropValueChecked} />
                        }                        
                      </div>
                    ))}
                  </GridListTile>
                ))}
              </GridList>
              <GridList className={classes.griduilist2} cellHeight={44} style={{margin:8}}>
                <Box className={classes.gridbox2} style={{width:'100%', padding:'0px 8px'}}> 
                  <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                    <Button variant="contained" disableElevation color="primary" autoFocus className={classes.btnapply} onClick={handleSetUIStyle}> Apply </Button>
                  </div>                    
                  <Tooltip title="Help" placement="left-start">
                    <IconButton color="inherit" className={classes.iconbtn} onClick={handleHelpText}>
                      <HelpIcon />                  
                    </IconButton>
                  </Tooltip>
                  <Popover className={classes.popover} classes={{paper: classes.paper}}
                          open={showhelp} anchorEl={anchorEl} onClose={handleHelpClose}
                          anchorOrigin={{vertical: 'top', horizontal: 'left',}}
                          transformOrigin={{vertical: 'top', horizontal: 'right',}}
                  >
                    <div >
                      <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                        1. On click 'Apply' button will set "default" style on newly added UI-parts.
                      </Typography>
                      <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                        2. To apply other style for any UI-part, select that at "style" property from UI-part setting window.
                      </Typography>
                      <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                        3. Already applied 'custom' style will be override when choose any other style from UI-part setting window.
                      </Typography>
                    </div>
                  </Popover>   
                </Box>
              </GridList>
              {addstyle && 
                <div className="backdropStyle">
                  <div className={classes.stylenamediv}>
                    <Typography variant="body1" style={{width:120}} >Set Style Name: </Typography>
                    <TextField name="uistylename" value={newstylename} onChange={handleSetStyleName} helperText="Only small-case letters allowed"
                               className={classes.uistylename} required variant="standard" margin="dense" size="small"/>
                    <Button variant="contained" color="primary" autoFocus className={classes.btnapply} style={{width:225}} onClick={handleOkAddUIStyle}> OK </Button>
                    <Button variant="contained" disableElevation className={classes.btnaddcancel} style={{width:225}} onClick={handleCancelAddUIStyle}> Cancel </Button>
                  </div>
                </div>
              }
              <Snackbar open={openalert} message={alertmsg}
                        anchorOrigin={{ vertical: 'bottom',  horizontal: 'center' }}
                        autoHideDuration={3000} onClose={handleCloseMessage}
              />
            </PaperContainer>
          }
          {tabvalue === 2 && 
            <PaperContainer elevation={9} className={classes.templatecontainer}>
              <Typography variant="h6" className={classes.heading} style={{height:36, padding:4, display: 'none'}}>CSS Template</Typography>
              <div className={classes.templatediv}>
                <a className={classes.adownload} href={process.env.PUBLIC_URL + "././config/CSSTemplate.css"} 
                    download={"template.css"} >
                  <Button variant="contained" color="primary" className={classes.btndownload} > Download Template </Button>
                </a>
                <pre className={classes.validerror}>{validerror}</pre>
                <div style={{height:'auto', display:'flex', justifyContent:'space-around'}}>
                  <Button variant="contained" color="primary" disabled={isvalidfile} className={classes.btnupload}> Upload CSS </Button>
                  {!isvalidfile && 
                    <input id="cssfile" className={classes.fileinput} type="file" accept=".css" onChange={handleUploadCSS} />
                  }
                  {isvalidfile && 
                    <Button variant="contained" color="primary" className={classes.btnapplycss} onClick={handleApplyCSS}> Apply </Button>
                  }
                </div>
              </div>
            </PaperContainer>
          }
        </DialogContent>
      </Dialog>       
    );
  }

  function getPageContainerHeight(pageStyleData) {
    let cheight = 667;
    const navObj = getStyleObject(pageStyleData, 'navbar');
    const navVisibleObj = getStyleObject(navObj[0]['children'], 'visible');
    if(navVisibleObj[0] && navVisibleObj[0]['value']) {
      cheight = cheight - 44;
    }
    const topObj = getStyleObject(pageStyleData, 'topnav');
    const topVisibleObj = getStyleObject(topObj[0]['children'], 'visible');
    if(topVisibleObj[0] && topVisibleObj[0]['value']) {
      cheight = cheight - 50;
    }
    const bottomObj = getStyleObject(pageStyleData, 'bottomnav');
    const bottomVisibleObj = getStyleObject(bottomObj[0]['children'], 'visible');
    if(bottomVisibleObj[0] && bottomVisibleObj[0]['value']) {
      cheight = cheight - 50;
    }
    const tabsObj = getStyleObject(pageStyleData, 'tabbar');
    const tabsVisibleObj = getStyleObject(tabsObj[0]['children'], 'visible');
    if(tabsVisibleObj[0] && tabsVisibleObj[0]['value']) {
      cheight = cheight - 49;
    }
    //console.log(pageStyleData, "***********", navVisibleObj, topVisibleObj, bottomVisibleObj, tabsVisibleObj);

    return cheight;
  }
  function getStyleObject(pageStyleData, stylename) {
    let styleObj =  pageStyleData.filter(function(node) {
      if(node['name'] === stylename){
        return true;
      }
      return false;
    });

    return styleObj;
  }

  function getStylePropValue(pageStyleData, stylename, propname) {
    let propval = '#ffffff';
    let styleObj = getStyleObject(pageStyleData, stylename);    
    if(styleObj.length > 0) {
      const styleData = styleObj[0];
      styleData['children'].forEach(element => {
        if(element['name'] === propname){
          propval = element['value'];
        }
      });
    }

    return propval;
  }
  function getStylePropVisibility(pageStyleData, stylename) {
    let propval = false;
    let styleObj = getStyleObject(pageStyleData, stylename);    
    if(styleObj.length > 0) {
      const styleData = styleObj[0];
      styleData['children'].forEach(element => {
        if(element['name'] === 'visible'){
          propval = element['value'];
        }
      });
    }

    return (!propval) ? 'none' : '';
  }

  function generateStyleChildren(uiname, uiCSSConfig, uiParts) {
    let uipartObj = uiParts.filter(function(node) {
      if(node['name'] === uiname){
        return true;
      }
      return false;
    });
    
    let children = [];
    if(uipartObj.length > 0){
      children.push(uiCSSConfig[0]);

      const uidic = uipartObj[0]['dic'];      
      /*if(uidic.hasOwnProperty('backgroundColor')) {
        const backgroundObj = uiCSSConfig.find(x => x['name'] === 'background');
        children.push(backgroundObj);
      }*/
      if(uidic.hasOwnProperty('borderColor')) {
        const borderObj = uiCSSConfig.find(x => x['name'] === 'border');
        let filteredBorderChildren = filterChildren(uidic, JSON.parse(JSON.stringify(borderObj['children'])), 'border');
        let filteredBorderObj = {name:borderObj['name'], label:borderObj['label'], children:filteredBorderChildren};
        children.push(filteredBorderObj);
      }
      if(uidic.hasOwnProperty('font') || uidic.hasOwnProperty('normalFont')) {
        const fontObj = uiCSSConfig.find(x => x['name'] === 'font');
        children.push(fontObj);

        const textObj = uiCSSConfig.find(x => x['name'] === 'text');
        let filteredTextChildren = filterChildren(uidic, JSON.parse(JSON.stringify(textObj['children'])), 'text');
        let filteredTextObj = {name:textObj['name'], label:textObj['label'], children:filteredTextChildren};
        children.push(filteredTextObj);
      }

    }
    return children;
  }

  function filterChildren(uipartDic, styleChildren, type) {
    if(type === 'border'){
      if(!uipartDic.hasOwnProperty("borderWeight")) {
        const borderWeightObj = styleChildren.find(x => x['name'] === 'width');
        var bw = styleChildren.indexOf(borderWeightObj);
        if (bw !== -1) {
          styleChildren.splice(bw, 1);
        }
      }
      if(!uipartDic.hasOwnProperty("cornerRadius")) {
        const cornerRadiusObj = styleChildren.find(x => x['name'] === 'radius');
        var br = styleChildren.indexOf(cornerRadiusObj);
        if (br !== -1) {
          styleChildren.splice(br, 1);
        }
      }
    }else if(type === 'text'){
      if(!uipartDic.hasOwnProperty("underline")) {
        const underlineObj = styleChildren.find(x => x['name'] === 'underline');
        var ul = styleChildren.indexOf(underlineObj);
        if (ul !== -1) {
          styleChildren.splice(ul, 1);
        }
      }
      if(!uipartDic.hasOwnProperty("strikeout")) {
        const strikeoutObj = styleChildren.find(x => x['name'] === 'line-through');
        var so = styleChildren.indexOf(strikeoutObj);
        if (so !== -1) {
          styleChildren.splice(so, 1);
        }
      }
      if(!uipartDic.hasOwnProperty("textShadow")) {
        const shadowObj = styleChildren.find(x => x['name'] === 'shadow');
        var ts = styleChildren.indexOf(shadowObj);
        if (ts !== -1) {
          styleChildren.splice(ts, 1);
        }
      }
    }

    return styleChildren;
  }

  function getSelectedUI_styleList(uiStyleList, selectedUIpart) {
    //console.log(uiStyleList, "... getSelectedUI_styleList....", selectedUIpart);
    let uipartObj =  uiStyleList.filter(function(node) {
      if(node['name'] === selectedUIpart){
        return true;
      }
      return false;
    });
    
    if(uipartObj.length > 0){
      return uipartObj[0]['style'];
    }else {
      return [{name:'default123', children:[]}];
    }
  }
  function getStyleData(uiStyleList, selectedUIpart, selectedUIStyle) {
    let uipartObj =  uiStyleList.filter(function(node) {
      if(node['name'] === selectedUIpart){
        return true;
      }
      return false;
    });
    
    if(uipartObj.length > 0){
      let styleData = uipartObj[0]['style'];
      const styleObj = styleData.find(x => x['name'] === selectedUIStyle);
      if(styleObj) {
        return styleObj.children;
      }else {
        return (styleData.length > 0) ? styleData[0].children : [];
      }

    }else {
      return [];
    }
  }

  ////////////////////////////////////////////////////////
  
  function PaperComponent(props){
    const useStyles = makeStyles(theme => ({
      pagelist: {
        width: '100%',
        minWidth: 720, //maxWidth: 1280,
        height: '100%',
        minHeight: 720, 
        margin: 8,
        backgroundColor: theme.palette.grey[100],
        border: '2px double darkgrey',
      },    
    }));
    const classes = useStyles();
    return (   
        <Paper {...props} square className={classes.pagelist} />  
    );
  }
  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
  });

  const styles = theme => ({
    root: {
      display: 'flex',
      margin: 0,
      padding: 2,
      //alignItems: 'center',
      //backgroundColor: theme.palette.grey[500],
      height: '100%',
      flexDirection: 'column'
    },
    headerdiv : {
      height: 40,
      display: 'flex',
      margin: '2px',
      alignItems: 'center',
      backgroundColor: theme.palette.grey[500],
    },
    closeButton: {
      position: 'relative',
      //top: theme.spacing(0),
      //right: theme.spacing(1),
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(1), 
    },
    heading: {
      minWidth: 250, 
      fontWeight: 'bold',
    },
    appbar: {
      //width: `calc(100% - 288px)`,
      backgroundColor: theme.palette.grey[500],
      width: 280, height: `calc(100% - 48px)`,
      padding: 2, margin: '0px 2px',
    },
    tab: {
      width: '100%',
      //minWidth:110,
      textTransform:'none',
      backgroundColor: theme.palette.grey[100],
      fontSize: theme.typography.pxToRem(16),
      fontWeight: theme.typography.fontWeightBold,
    },
    
  });
  const DialogTitle = withStyles(styles)(props => {
    const { children, classes, onClose, tabvalue, onTabChange } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root}>
        <div className={classes.headerdiv}>
          {onClose ? (
            <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          ) : null}
          <Typography variant="h6" className={classes.heading}>{children}</Typography>
        </div>
        <AppBar position="static" color="default" className={classes.appbar}>
            <Tabs variant="fullWidth" value={tabvalue} onChange={onTabChange} indicatorColor="primary" orientation='vertical'>
              <Tab label="Page Style" wrapped className={classes.tab} />
              <Tab label="UI-part Style" wrapped className={classes.tab} />
              <Tab label="CSS Template" wrapped className={classes.tab} style={{display:'none'}} />
            </Tabs>
          </AppBar>
      </MuiDialogTitle>
    );
  });

  const PaperContainer = withStyles(theme => ({
    root: {
      position: 'relative',
      //height: '100%',   
      padding: theme.spacing(0.25),
      textAlign: 'center',
      color: theme.palette.text.default, 
      border: "1px solid rgb(212, 212, 212)",
      backgroundColor: theme.palette.grey[50],
    },
  }))(Paper);  

  const StyledListItem = withStyles(theme => ({
    root: {
        borderBottom: `2px inset ${theme.palette.grey[300]}`,
        height: '100%',
        minHeight: 72,
        padding: theme.spacing(0,1),        
        '&:focus': {
            backgroundColor: "#65bc45",
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
        '&:hover': {
            background: theme.palette.background.hover,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.common.white,
            },
        },        
    },
    selected: {},
    secondaryAction: {}
  }))(ListItem);
  

  ThemeEditor.propTypes = {
    //onClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
  };

  function mapStateToProps(state) {
    return {
      apiParam: state.appParam.params,
      uiList : state.appParam.uilist,
      appData: state.appData.data,
      openedPages: state.selectedData.pages,
      currentPage: state.selectedData.pagedata,
      currentUI: state.selectedData.uidata,
    };
  }
  export default connect(mapStateToProps)(ThemeEditor);
  