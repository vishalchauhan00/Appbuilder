import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Dialog, DialogContent, Grid, GridList, GridListTile, List, ListItem, ListItemText, ListItemSecondaryAction, Select, TextField, SvgIcon, Fab, FormControlLabel, ListSubheader } from '@material-ui/core';
import { AppBar, Tab, Tabs, IconButton, Box, Button, Paper, Slide, Typography, Snackbar, Container, Checkbox } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import AlertWindow from '../../components/AlertWindow';

import { setAllPageChanged } from '../ServiceActions';

class StyleEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show: true,
        width: 320,
        height: 480, 
        
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
                  uiStyleList.push({name:uiname, text:uiitem['text'], style:[{name:'default', children:styleItems}], selectedstyle:'default'});
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

    handleApplyAlertStyle(msg){
      console.log("ApplyAlertStyle done >>>>>>", msg);
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
            <ThemeView appData={this.props.appData} appconfig={this.props.appconfig}
                       pageStyleConfig={this.state.pageCSSConfig} uiStyleConfig={this.state.uiCSSConfig}
                       uiPartList={this.props.uiList} uiStyleList={this.state.uiStyleList}
                       pageList={this.props.pagelist} onCloseSetting={this.handleSettingClose}
                       onUpdatePageStyle={this.handleUpdatePageStyle.bind(this)} onApplyPageStyle={this.handleApplyPageStyle.bind(this)}
                       onUpdateUIStyle={this.handleUpdateUIStyle.bind(this)} onApplyUIStyle={this.handleApplyUIStyle.bind(this)}
                       onApplyAlertStyle={this.handleApplyAlertStyle.bind(this)}
                       rememberMe={remMe} onSetRememberMe={this.handleSetRememberMe.bind(this)}
            />
          }
        </div>       
      );
      
    }
  }
  

  function ThemeView(props) {

    const useStyles = makeStyles(theme => ({
     
      title: {
        padding: '8px 16px',
        width: 240
      },
      content: {
        //height: `calc(100% - 60px)`, 
        padding: '4px',
        display: 'flex',
        position: 'absolute',
        top: 56, left: 0,
        height: '100%', width: '100%', 
        border: 0, marginLeft: 2
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
      boxprogress: {
        width: '100%',
        height: '100%',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        color: '#808080',
        backgroundColor: '#ffffff',
        position:'absolute', 
        top:0
      },

    }));

    const classes = useStyles();
    
    const [tabvalue, setTabValue] = React.useState(1);
    
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
            <div style={{width:'99%'}} >
              <PageStyleEditor appconfig={props.appconfig} appData={props.appData} pageList={props.pageList} pageStyle={props.pageStyleConfig}
                              onUpdatePageStyle={props.onUpdatePageStyle} onApplyPageStyle={props.onApplyPageStyle} />
              <Box className={classes.boxprogress}>Module is in progress..</Box>
            </div>
          }
          {tabvalue === 1 && 
            <div style={{width:'99%'}} >
              <UIStyleEditor appconfig={props.appconfig} appData={props.appData} uiPartList={props.uiPartList} uiStyleList={props.uiStyleList}
                            onUpdateUIStyle={props.onUpdateUIStyle} onApplyUIStyle={props.onApplyUIStyle} />
              <Box className={classes.boxprogress}>Module is in progress..</Box>
            </div>
          }
          {tabvalue === 2 && 
            <AlertStyleEditor appconfig={props.appconfig} appData={props.appData} onApplyAlertStyle={props.onApplyAlertStyle} />
          }
          {tabvalue === 3 && 
            <CSSTemplateEditor appconfig={props.appconfig} appData={props.appData} />
          }
        </DialogContent>
      </Dialog>       
    );
  }

  ////////////////// Page Style Editor ///////////////////

  function PageStyleEditor(props) {

    const displayApplySave = (props.pageList.length === 0) ? 'none' : 'block';
    const [pageStyle, setPageStyle] = React.useState(props.pageStyle);

    const useStyles = makeStyles(theme => ({
      container: {
        height: '92vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      pagestyleform:{
        height:'inherit', 
        minWidth:450, 
        padding:4, 
        border:'1px solid', 
        overflow:'auto',
        background: theme.palette.background.default
      },      
      heading: {
        backgroundColor: theme.palette.grey[500],
        //color: theme.palette.common.white,
        textAlign: 'start',
        fontWeight: 'bold',
        fontSize: 18,
        height: 28, 
        paddingLeft: theme.spacing(1),
        padding: 4
      },
      pagepropslist: {
        minHeight: 92,
        margin: '8px 0px',
        '&:hover': {
          backgroundColor: theme.palette.background.hover,
        }
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
      propdiv: {
        display: 'flex',
        //alignItems: 'center',
        justifyContent: 'center'
      },
      pagegrid: {
        height:`calc(100% - 16px)`, 
        display: 'flex',
        flexDirection:'column', 
        alignItems: 'center',
        justifyContent: 'center',
      },
      pcontainer2: {
        width: 320,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      },      
      pagelayout: {
        width: 320,
        height: 480,
        border: '1px solid rgb(7,7,7)',
        borderRadius: 2,
      },
      pagecontainer: {
        //position: 'absolute',
        width: 320,
        height: '100%',
        padding: 0,
        margin: 0,
        backgroundColor: '#cccccc',
      },
      pagearea: {
        width: 320,
        height: getPageContainerHeight(pageStyle),
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'body', 'background-color'),
        background: getStylePropValue(pageStyle, 'body', 'background-gradient') 
      },
      cell1: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'table', 'cell-color'),
        background: getStylePropValue(pageStyle, 'table', 'background-gradient') 
      },
      cell2: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        backgroundColor: getStylePropValue(pageStyle, 'table', 'alternate-cell-color')
      },
      navbar: {
        width: '100%',
        height: 44,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        display: getStylePropVisibility(pageStyle, 'navbar'),
        backgroundColor: getStylePropValue(pageStyle, 'navbar', 'background-color'),
        background: getStylePropValue(pageStyle, 'navbar', 'background-gradient') 
      },
      topbar: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        display: getStylePropVisibility(pageStyle, 'topnav'),
        backgroundColor: getStylePropValue(pageStyle, 'topnav', 'background-color'),
        background: getStylePropValue(pageStyle, 'topnav', 'background-gradient') 
      },
      bottombar: {
        width: '100%',
        height: 50,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        display: getStylePropVisibility(pageStyle, 'bottomnav'),
        backgroundColor: getStylePropValue(pageStyle, 'bottomnav', 'background-color'),
        background: getStylePropValue(pageStyle, 'bottomnav', 'background-gradient') 
      },      
      leftbar: {
        position: 'absolute',
        left: 0,
        width: '40%',
        height: 'inherit',
        border: '1px solid rgb(27,27,27)',
        boxSizing: 'border-box',
        display: getStylePropVisibility(pageStyle, 'leftnav'),
        backgroundColor: getStylePropValue(pageStyle, 'leftnav', 'background-color'),
        background: getStylePropValue(pageStyle, 'leftnav', 'background-gradient') 
      },
      rightbar: {
        position: 'absolute',
        right: 0,
        width: '40%',
        height: 'inherit',
        border: '1px solid rgb(27,27,27)',
        boxSizing: 'border-box',
        display: getStylePropVisibility(pageStyle, 'rightnav'),
        backgroundColor: getStylePropValue(pageStyle, 'rightnav', 'background-color'),
        background: getStylePropValue(pageStyle, 'rightnav', 'background-gradient') 
      },
      tabsbar: {        
        width: '100%',
        height: 49,
        border: '1px solid rgb(127,127,127)',
        boxSizing: 'border-box',
        display: getStylePropVisibility(pageStyle, 'tabbar'),
        backgroundColor: getStylePropValue(pageStyle, 'tabbar', 'background-color'),
        background: getStylePropValue(pageStyle, 'tabbar', 'background-gradient') 
      },      
      gridbox: {
        width: '100%',
        display: 'flex',
        //flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '2px solid rgb(227,227,227)',
        borderRadius: 8,
        //margin: 4,
        padding: '4px 8px',        
      },      
      helpdiv: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'start',
        gap: 0,
        padding: theme.spacing(0.5, 1),
        backgroundColor: theme.palette.grey[700],
        borderRadius: 8
      },
      pophelp: {
        textAlign: 'justify',
        margin: 0,
        fontSize: 12,
        color: theme.palette.common.white
      },
      buttondiv: {
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 2
      },
      btnapply: {
        width: '100%',
        minWidth: 200,
        maxWidth: 320,
        fontWeight: 'bold',
        textTransform: "none",
      },
      btnapplysave: {
        width: '100%',
        minWidth: 200,
        maxWidth: 320,
        fontWeight: 'bold',
        backgroundColor: theme.palette.grey[500],
        color: theme.palette.common.white,
        textTransform: "none",
        display: displayApplySave,
        '&:hover': {
          backgroundColor: theme.palette.grey[400],
        }
      },

    }));
    const classes = useStyles();   

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

      uploadStyleFile(props, "pagestyles", pageStyle);
    }

    function handleConfirmCancel() {
      setOpenConfirm(false);
    }

    return (
      <PaperContainer elevation={9} className={classes.container}>
        <Grid container spacing={2} style={{height:'100%', width:'100%', margin:4, flexWrap:'nowrap'}}>
          <Grid item xs={12} md={7} style={{height:`calc(100% - 16px)`, display:'flex', flexDirection:'column', gap:8}}>
            <div className={classes.pagestyleform}>
              <Typography variant="h6" className={classes.heading} style={{height:28, padding:4}} >Page Components</Typography>
              <List component="nav" dense={true} style={{width:'100%'}} >
                {pageStyle.map((styles, index) => (
                  <ListItem key={styles.name+'_'+index} className={classes.pagepropslist}>
                    <ListItemText primary={styles.label} style={{fontWeight:'bold', fontSize:'1rem'}} />
                    <ListItemSecondaryAction style={{width:'67%', borderLeft:'1px solid'}}>
                      {styles.children.map((child, i) => (
                        <div key={child.name+'_'+i} className={classes.propertydiv}>
                          <Typography variant="subtitle2">{child.label}</Typography>
                          {child.type === "color" && 
                            <div className={classes.propdiv}>
                              <input type="color" value={child.value} data-stylename={styles.name} data-propname={child.name}
                                    onChange={handlePropValueChange} />
                              <Typography variant="caption" className={classes.propertybtn} style={{borderColor:child.value}}>{child.value}</Typography>
                            </div>                            
                          }
                          {child.type === "input" && 
                            <div className={classes.propdiv}>
                              <input type="text" value={child.value} data-stylename={styles.name} data-propname={child.name}
                                    onChange={handlePropValueChange} />
                            </div>                            
                          }
                          {child.type === "boolean" && 
                            <Checkbox color="default" disableRipple style={{padding:4}} checked={child.value} name={styles.name+'_'+child.name} 
                            onChange={handlePropValueChecked} />
                          }
                        </div>
                      ))}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))} 
              </List> 
            </div>                              
            <div className={classes.helpdiv}>
              <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                1. On click 'Apply' button will set above style on new created pages.
              </Typography>
              <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                2. On click 'Apply & Save' button will set above style on existing and new created pages.                        
              </Typography>
              <Typography variant="body2" color="textPrimary" gutterBottom className={classes.pophelp}>
                3. Only colors will apply on existing pages, not any bar visibility.
              </Typography>
            </div>                        
          </Grid>
          <Grid item xs={12} md={5} className={classes.pagegrid}>
            <Box className={classes.pcontainer2}>
              <PaperContainer elevation={4} className={classes.pagelayout}>
                <Box id="leftbar" className={classes.leftbar} />
                <Box id="rightbar" className={classes.rightbar} />
                <Container id="container" fixed className={classes.pagecontainer}>
                  <Box id="navbar" className={classes.navbar} />
                  <Box id="topbar" className={classes.topbar}/>
                  <Box id="pagearea" className={classes.pagearea}>
                    <Box id="cell1" className={classes.cell1}/>
                    <Box id="cell2" className={classes.cell2}/>
                  </Box>
                  <Box id="bottombar" className={classes.bottombar} />
                  <Box id="tabsbar" className={classes.tabsbar} />                  
                </Container>
              </PaperContainer>
            </Box>
            <div className={classes.buttondiv}>
              <Button variant="contained" disableElevation color="primary" className={classes.btnapply} onClick={handleSetPageStyle}> Apply </Button>
              <Button variant="contained" disableElevation className={classes.btnapplysave} onClick={handleApplyPageStyle}> Apply & Save </Button>
            </div>
          </Grid>
          
          {openconfirm && 
            <AlertWindow open={true} title="Are you sure to apply this style ?" message="Once style set, it cannot be revert."
                        ok="Yes" okclick={handleConfirmOk}
                        cancel="No" cancelclick={handleConfirmCancel}
            />
          }
        </Grid>
      </PaperContainer>
    );
  }


  ////////////////// UI Style Editor ///////////////////

  function UIStyleEditor(props) {
    const useStyles = makeStyles(theme => ({
      container: {
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
      uistylename: {
        width:320
      },
      gridlist: {
        //width: '100%',
        padding: theme.spacing(1),
        background: 'transparent',
        justifyContent: 'space-around',
        overflow: 'hidden'
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
      listSection:{
        background: theme.palette.background.default
      },
      listul:{
        background: theme.palette.background.default,
        padding: 0,
      },
      listheader:{
        textAlign: 'start',
        color: theme.palette.background.contrast,
        fontWeight: 700,
        fontSize: '16px'
      },
      uipropbox: {
        height: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
        overflow: 'hidden'
      },
      propdiv: {
        height: '100%', minWidth: 360,
        overflow: 'hidden auto', 
        background: theme.palette.background.default
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
      btnapply: {
        width: '100%',
        minWidth: 200,
        maxWidth: 360,
        fontWeight: 'bold',
        textTransform: "none",
      },
      stylenamediv: {
        width: 750, 
        height: 64,
        padding: theme.spacing(2),
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 8,
      },
      btnaddok: {
        width: 120,        
        fontWeight: 'bold',
        color: theme.palette.common.white,
        textTransform: "none",
      },
      btnaddcancel: {        
        width: 120,        
        marginRight: 8,
        fontWeight: 'bold',
        backgroundColor: theme.palette.grey[500],
        color: theme.palette.common.white,
        textTransform: "none",
        '&:hover': {
          backgroundColor: theme.palette.grey[400],
        }
      },            
      helpdiv: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'start',
        gap: 0,
        padding: theme.spacing(0.5, 1),
        backgroundColor: theme.palette.grey[700],
        borderRadius: 8,
        maxWidth: 600
      },
      pophelp: {
        margin: 0,
        fontSize: 12,
        color: theme.palette.common.white, 
        textAlign: 'justify'
      }

    }));

    const classes = useStyles();

    const [openalert, setOpenalert] = React.useState(false);
    const [alertmsg, setAlertMessage] = React.useState('');
    const handleCloseMessage = () => {
      setOpenalert(false);
      setAlertMessage('');
    };

    const [openconfirm, setOpenConfirm] = React.useState(false);
    const [confirmmsg, setConfirmMessage] = React.useState('');
    const [confirmact, setConfirmAction] = React.useState('');

    const uiPartList = props.uiPartList;
    const [uiStyleList, setUIStyleList] = React.useState(props.uiStyleList);    

    const [selectedUIpart, setSelectedUIpart] = React.useState('Label');
    const handleSelectUIpart = (event) => {
      const uidata = event.currentTarget.dataset;
      //console.log("handleSelectUIpart >>>", uidata);
      const uitype = (uidata.source) ? uidata.name + uidata.source : uidata.name;
      setSelectedUIpart(uitype);
    };

    const [selectedUIStyle, setSelectedUIStyle] = React.useState('default');
    const handleSelectUIStyle = (event) => {
      const selectedOption = event.target.selectedOptions[0];
      const name = selectedOption.getAttribute('data-name');
      const source = selectedOption.getAttribute('data-source');
      const uitype = (source) ? name + source : name;
      setSelectedUIpart(uitype);

      //console.log("handleSelectUIStyle >>>", event.target.value);
      let stylename = event.target.value;
      setSelectedUIStyle(stylename);

      setUIStyleList(prev =>
        prev.map(item => {
          if (item.name === uitype) {
            return {
              ...item,
              style: [...item.style],
              selectedstyle: stylename
            };
          }
          return item;
        })
      );
    };    

    const [addstyle, setAddStyle] = React.useState(false);
    function handleAddUIStyle(event) {
      const uidata = event.currentTarget.dataset;
      const uitype = (uidata.source) ? uidata.name + uidata.source : uidata.name;
      setSelectedUIpart(uitype);

      setAddStyle(!addstyle);
    }

    function handleDeleteUIStyle(selectedStyle, uiname, uitype) {      
      //console.log(uiname, "...... handleDeleteUIStyle >>>>>>>>", selectedStyle);
      if(selectedStyle === "default") {
        setAlertMessage("'default' style can't be deleted. You can edit it.");
        setOpenalert(true);
        return;
      }

      const uiViewtype = (uitype) ? uiname + uitype : uiname;
      setSelectedUIpart(uiViewtype);
      setSelectedUIStyle(selectedStyle);

      setConfirmAction("delete");
      setConfirmMessage("Are you sure to delete selected style ?");
      setOpenConfirm(true);
    }

    function deleteSelectedStyle() {
      const uiViewtype = selectedUIpart;
      const selectedStyle = selectedUIStyle;

      setUIStyleList(prev =>         
        prev.map(item => {
          if (item.name === uiViewtype) {
            const updatedStyles = item.style.filter(
              (style) => style.name !== selectedStyle
            );

            return {
              ...item,
              style: updatedStyles,
            };
          }

          return item;
        })        
      );
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

        setUIStyleList(prev =>
          prev.map(item => {
            if (item.name === selectedUIpart) {
              const stylechildren = JSON.parse(JSON.stringify(item.style[0]['children']));
              const newOption = {name:newstylename, children:stylechildren};
              return {
                ...item,
                style: [...item.style, newOption],
                selectedstyle: newstylename
              };
            }
            return item;
          })
        );
        
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
        const selectedstyle = (uiStyleObj[0]['selectedstyle']) ? uiStyleObj[0]['selectedstyle'] : selectedUIStyle;
        const styleData = uiStyleObj[0]['style'];
        const styleObj = styleData.find(x => x['name'] === selectedstyle);
        const styleChildren = styleObj['children'];
        const styleItem = styleChildren.find(x => x['name'] === updateval['stylename']);
        styleItem['children'].forEach(element => {
          if(element['name'] === updateval['propname']){
            element['value'] = updateval['newval'];
          }
        });
      }

      setUIStyleList(uiStyleData);
      //console.info(updateval, "....updateUIStyle >>>", uiStyleData);
      props.onUpdateUIStyle(uiStyleData);
    }

    function handleSetUIStyle() {
      setConfirmAction("apply");
      setConfirmMessage("Are you sure to apply these changes ?");
      setOpenConfirm(true);
    }

    function applyUIStyle() {
      props.onApplyUIStyle(uiStyleList);

      uploadStyleFile(props, "uistyles", uiStyleList);
    }

    /////////////// Confirm handler ///////

    const handleConfirmCancel = () => {
      setOpenConfirm(false);
      setConfirmMessage('');
      setConfirmAction('');
    };

    const handleConfirmOk = () => {
      setOpenConfirm(false);
      setConfirmMessage('');
      setConfirmAction('');

      if(confirmact === "delete"){
        deleteSelectedStyle();

      }else if(confirmact === "apply"){
        applyUIStyle();
      }      
    }


    return (
      <PaperContainer elevation={9} className={classes.container}>             
        <GridList className={classes.gridlist} cellHeight={220} gap={12} style={{margin:'0px 8px', height:'calc(100% - 36px)', flexWrap:'nowrap'}}> 
          <Box style={{maxWidth:600, height:'100%',  display: 'flex', flexDirection: 'column', gap: 8}} >            
            <List component="nav" subheader={<li />}
                        aria-labelledby="nested-list-subheader"
                        style={{overflow:'hidden auto', height:'100%', border:'1px solid'}} >
              {uiPartList.map((category, id) => (
                <li key={`section-${id}`} className={classes.listSection}>
                  <ul className={classes.listul}>
                    <ListSubheader className={classes.listheader}>{category.text}</ListSubheader>
                    {category.items.map((uipart,id) => {
                      const uiname = (uipart.type) ? (uipart.name+uipart.type) : uipart.name;
                      const uistyle = uiStyleList.find(i => i.name === uiname);
                      const selectedStyle = uistyle?.selectedstyle || "";
                      return (
                        <StyledListItem button key={id} data-name={uipart.name} data-source={uipart.type} onClick={handleSelectUIpart}
                                        selected={uiname === selectedUIpart} >                    
                          <ListItemText primary={uipart.text} style={{fontSize:'0.75rem', overflow:'hidden', textOverflow:'ellipsis'}} /> 
                          <ListItemSecondaryAction >
                            <Select native value={selectedStyle}
                                    className={classes.uipartname} style={{ minWidth:100, fontSize:'0.75rem', textAlign:'start', paddingLeft:8, marginBottom:4 }}
                                    onChange={handleSelectUIStyle} >
                              {getSelectedUI_styleList(uiStyleList, uiname).map((style,id) => (
                                <option key={id} value={style.name} data-name={uipart.name} data-source={uipart.type}>{style.name}</option>
                              ))}
                            </Select>    
                            <Fab edge="end" size="small" aria-label="add" className={classes.fabadd} style={{width:24, height:24, minHeight:24, padding:4}}>
                              <SvgIcon onClick={handleAddUIStyle} data-name={uipart.name} data-source={uipart.type} >
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/>
                              </SvgIcon>
                            </Fab>    
                            <Fab edge="end" size="small" aria-label="delete" className={classes.fabdelete} style={{width:24, height:24, minHeight:24, padding:4, marginLeft:4}}>
                              <SvgIcon
                                onClick={() => handleDeleteUIStyle(selectedStyle, uipart.name, uipart.type)}
                                data-name={uipart.name}
                                data-source={uipart.type}
                              >
                                <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1z" />
                              </SvgIcon>
                            </Fab>
                          </ListItemSecondaryAction> 
                        </StyledListItem>
                      );
                    })}
                  </ul>
                </li>
              ))}            
            </List>
            <div className={classes.helpdiv}>
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
          </Box>    
          <Box className={classes.uipropbox} style={{height: '100%'}}>     
            <div className={classes.propdiv}>                 
              {getStyleData(uiStyleList, selectedUIpart, selectedUIStyle).map((uistyle, j) => (
                <GridListTile key={uistyle.name+'_'+j} cols={1} style={{width:'100%', height:'auto', minHeight:100, border:'1px solid'}}>
                  <Typography variant="subtitle2" className={classes.heading} >{uistyle.label}</Typography>
                  {uistyle.children.map((child, i) => (
                    <div key={child.name+'_'+i} className={classes.propertydiv}>
                      <Typography variant="caption">{child.label}</Typography>
                      {child.type === "input" && 
                        <div className={classes.pagegrid}>
                          <input type="text" value={child.value} data-stylename={uistyle.name} data-propname={child.name}
                                onChange={handleUIPropValueChange} />
                        </div>                            
                      }
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
            </div>
            <div style={{width:'360px', display:'flex', justifyContent:'center'}}>
              <Button variant="contained" disableElevation color="primary" autoFocus className={classes.btnapply} onClick={handleSetUIStyle}> Apply </Button>
            </div>           
          </Box> 
        </GridList>
        {addstyle && 
          <div className="backdropStyle" style={{zIndex:9999}}>
            <div className={classes.stylenamediv}>
              <Typography variant="body1" style={{width:120}} >Set Style Name: </Typography>
              <TextField name="uistylename" value={newstylename} onChange={handleSetStyleName} helperText="Only small-case letters allowed"
                          className={classes.uistylename} required variant="standard" margin="dense" size="small"/>
              <Button variant="contained" color="primary" autoFocus className={classes.btnaddok} onClick={handleOkAddUIStyle}> OK </Button>
              <Button variant="contained" disableElevation className={classes.btnaddcancel} onClick={handleCancelAddUIStyle}> Cancel </Button>
            </div>
          </div>
        }
        <Snackbar open={openalert} message={alertmsg}
                  anchorOrigin={{ vertical: 'bottom',  horizontal: 'center' }}
                  autoHideDuration={3000} onClose={handleCloseMessage}
        />
        {openconfirm && 
          <AlertWindow open={true} title="" message={confirmmsg}
                      ok="Yes" okclick={handleConfirmOk}
                      cancel="No" cancelclick={handleConfirmCancel}
          />
        }
      </PaperContainer>
    );
  }


  ////////////////// Alert Style Editor ///////////////////

  function AlertStyleEditor(props) {
    const useStyles = makeStyles(theme => ({
      container: {
        height: '92vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      editorheading: {
        backgroundColor: '#b2b2b2',
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: theme.palette.common.black,
        padding: theme.spacing(0.5),
        display: 'none'
      },
      editorform: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(0.5),
        margin: theme.spacing(0,2),
      },
      editorpaper: {
        width: '100%',
        height: '100%',
        minHeight: 280,
        maxHeight: 1080,
        padding: theme.spacing(1, 2),
        borderRadius: 8,
        background: theme.palette.background.default,
        overflow: 'hidden auto'
      },
      propdiv: {
        height: 48,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      proptext: {
        textAlign: 'start',
        fontWeight: 'bold'
      },
      propsubtext: {
        width: 120,
        textAlign: 'start'
      },
      numinput: {
        width: 50
      },
      previewdiv:{
        width: '100%',
        minHeight: 200,
        margin: '8px 0px',
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)'
      },
      msgbox: {
        height:88, 
        padding:'0px 8px', 
        textAlign:'center',
        display: 'flex',
        alignItems: 'center'
      },
      alertbtn: {
        width: 80,
        height: 32,
        margin: '0px 8px',
        textTransform: 'none'
      },
      divapply: {
        display: 'flex', 
        justifyContent: 'center',
        padding: '4px 8px',
        margin: 8,
        //border: '2px solid rgb(227,227,227)',
        borderRadius: 8
      },
      btnapply: {
        width: '100%',
        minWidth: 200,
        maxWidth: 560,
        marginRight: 8,
        fontWeight: 'bold',
        textTransform: "none",
      }
  
    }));
    const classes = useStyles();

    const [alertConfirm, setAlertConfirm] = React.useState(false);
    const defaultAlertStyle = {
          backgroundColor: "#FFFFFF",
          headerTextColor: "#000000",
          headerFontSize: 16,
          messageTextColor: "#000000",
          messageFontSize: 14,
          okbtnTextColor: "#FFFFFF",
          okbtnBGColor: "#0000FF",
          cancelTextColor: "#000000",
          cancelBGColor: "#DDDDDD"
    };

    const alertStyleDic = (props.appData['setAlertStyle']) ? props.appData['alertStyleDic'] : defaultAlertStyle;
    const [alertStyle, setAlertStyle] = React.useState(alertStyleDic);

    function handleCancelUpdate() {
      props.onCloseEditor();
    }  
    
    function handleAlertStyleChange(event, property) {
      const _alertStyle = JSON.parse(JSON.stringify(alertStyle));
      _alertStyle[property] = (property.indexOf('FontSize') > -1) ? parseInt(event.currentTarget['value']) : event.currentTarget['value'];
      
      setAlertStyle(_alertStyle);
    }

    function handleOkUpdate() {
      setAlertConfirm(true);
    }

    function confirmOKHandler() {
      setAlertConfirm(false);
      console.log(props, "*****", alertStyle);
      
      props['appData']['setAlertStyle'] = true;
      props['appData']['alertStyleDic'] = alertStyle;
      
      updateProjectData(props, "setAlertStyle,alertStyleDic", false).then(
        response => { 
          if(response !== "ACK"){
            const errmsg = "Something went wrong. Please Try again."
            props.onApplyAlertStyle(errmsg);
          }else{
            const ackmsg = "Alert style applied successfully."
            props.onApplyAlertStyle(ackmsg);
          }
        });
    }

    function confirmCloseHandler() {
      setAlertConfirm(false);
    }

    return (
      <PaperContainer elevation={9} className={classes.container}>
        <Typography component="div" className={classes.editorheading} >Alert Style Editor</Typography>
        <form className={classes.editorform} noValidate autoComplete="off">
          <Paper elevation={3} className={classes.editorpaper} >
            <div className={classes.propdiv}>
              <Typography variant="subtitle1" className={classes.proptext}>BackGround Color</Typography>
              <input type="color" value={alertStyle.backgroundColor} onChange={(event) => handleAlertStyleChange(event, 'backgroundColor')} />
            </div>
            <Typography variant="subtitle1" className={classes.proptext}>Header</Typography>
            <div className={classes.propdiv}>
              <Typography variant="subtitle2" className={classes.propsubtext}>Font Color</Typography>
              <input type="color" value={alertStyle.headerTextColor} onChange={(event) => handleAlertStyleChange(event, 'headerTextColor')} />
              <Typography variant="subtitle2" className={classes.propsubtext}>Font Size</Typography>
              <input type="number" className={classes.numinput} value={alertStyle.headerFontSize} min="10" max="20" 
                      onChange={(event) => handleAlertStyleChange(event, 'headerFontSize')} />
            </div>
            <Typography variant="subtitle1" className={classes.proptext}>Message</Typography>
            <div className={classes.propdiv}>
              <Typography variant="subtitle2" className={classes.propsubtext}>Font Color</Typography>
              <input type="color" value={alertStyle.messageTextColor} onChange={(event) => handleAlertStyleChange(event, 'messageTextColor')} />
              <Typography variant="subtitle2" className={classes.propsubtext}>Font Size</Typography>
              <input type="number" className={classes.numinput} value={alertStyle.messageFontSize} min="8" max="18" 
                      onChange={(event) => handleAlertStyleChange(event, 'messageFontSize')} />
            </div>
            <Typography variant="subtitle1" className={classes.proptext}>OK Button</Typography>
            <div className={classes.propdiv}>
              <Typography variant="subtitle2" className={classes.propsubtext}>Font Color</Typography>
              <input type="color" value={alertStyle.okbtnTextColor} onChange={(event) => handleAlertStyleChange(event, 'okbtnTextColor')} />
              <Typography variant="subtitle2" className={classes.propsubtext}>BackGround Color</Typography>
              <input type="color" value={alertStyle.okbtnBGColor} onChange={(event) => handleAlertStyleChange(event, 'okbtnBGColor')} />
            </div>
            <Typography variant="subtitle1" className={classes.proptext}>Cancel Button</Typography>
            <div className={classes.propdiv}>
              <Typography variant="subtitle2" className={classes.propsubtext}>Font Color</Typography>
              <input type="color" value={alertStyle.cancelTextColor} onChange={(event) => handleAlertStyleChange(event, 'cancelTextColor')} />
              <Typography variant="subtitle2" className={classes.propsubtext}>BackGround Color</Typography>
              <input type="color" value={alertStyle.cancelBGColor} onChange={(event) => handleAlertStyleChange(event, 'cancelBGColor')} />
            </div>
          </Paper>                    
          <div className={classes.previewdiv}>
            <Paper elevation={3} style={{height:160, width:320, backgroundColor:alertStyle.backgroundColor}} >
              <Box style={{height:32, padding:'0px 8px'}}>
                <Typography variant="subtitle2" style={{height:32, color:alertStyle.headerTextColor, fontSize:alertStyle.headerFontSize, fontWeight:'bold', textAlign:'center'}}>
                  Heading Text
                </Typography>
              </Box>
              <Box className={classes.msgbox}>
                <Typography variant="subtitle2" style={{height:40, color:alertStyle.messageTextColor, fontSize:alertStyle.messageFontSize}}>
                  This is sample text for alert message. Supporting multiline.
                </Typography>
              </Box>
              <Box style={{height:40, padding:'0px 60px'}}>
                <Button variant="contained" className={classes.alertbtn} style={{color:alertStyle.okbtnTextColor, backgroundColor:alertStyle.okbtnBGColor}}>
                  OK 
                </Button>
                <Button variant="contained" className={classes.alertbtn} style={{color:alertStyle.cancelTextColor, backgroundColor:alertStyle.cancelBGColor}}>
                  Cancel
                </Button>
              </Box>              
            </Paper>
          </div>
        </form>
        <div className={classes.divapply}>
          <Button variant="contained" disableElevation style={{display:'none'}} className={classes.btnapply} onClick={handleCancelUpdate}>
            Reset 
          </Button>
          <Button variant="contained" disableElevation color="primary" className={classes.btnapply} onClick={handleOkUpdate}>
            Apply
          </Button>
        </div>
        {alertConfirm === true && 
          <AlertWindow open={true} title="" message="This style will applicable on all Alerts in the app."
                      ok="OK" okclick={confirmOKHandler}
                      cancel="Cancel" cancelclick={confirmCloseHandler}
          />
        }
      </PaperContainer>
    );
  }


  ////////////////// CSS Template Editor ///////////////////

  function CSSTemplateEditor(props) {

    const useStyles = makeStyles(theme => ({
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
    }));
    const classes = useStyles();

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

    return (
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
    );
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
      height: 52,
      display: 'flex',
      margin: '2px',
      alignItems: 'center',
      background: theme.palette.background.paper,
      borderBottom: '1px solid grey'
    },
    closeButton: {
      position: 'relative',
      //top: theme.spacing(0),
      //right: theme.spacing(1),
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(1), 
    },
    heading: {
      width: '100%', 
      //fontWeight: 'bold',
      marginLeft: 8,
    },
    appbar: {
      width: `calc(100% - 288px)`,
      height: 48,
      padding: 2,
      background: theme.palette.background.default,
      position: 'fixed', top: 6, right: 60
    },
    tab: {
      width: '100%',
      //minWidth:110,
      textTransform:'none',
      background: theme.palette.background.paper,
      fontSize: theme.typography.pxToRem(14),
      fontWeight: theme.typography.fontWeightBold,
    },
    
  });
  const DialogTitle = withStyles(styles)(props => {
    const { children, classes, onClose, tabvalue, onTabChange } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root}>
        <div className={classes.headerdiv}>
          <Typography variant="h6" className={classes.heading}>{children}</Typography>
          {onClose ? (
            <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </div>
        <AppBar position="static" color="default" className={classes.appbar}>
          <Tabs variant="fullWidth" value={tabvalue} onChange={onTabChange} indicatorColor="primary" orientation='horizontal'>
            <Tab label="Page Style" wrapped className={classes.tab} style={{display:'block'}} />
            <Tab label="UI-part Style" wrapped className={classes.tab} style={{display:'block'}} />
            <Tab label="Alert Style" wrapped className={classes.tab} />
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
      background: theme.palette.background.paper,
    },
  }))(Paper);  

  const StyledListItem = withStyles(theme => ({
    root: {
        borderBottom: `2px inset ${theme.palette.grey[300]}`,
        height: '100%',
        padding: theme.spacing(0,1),   
        '&.Mui-selected': {
          backgroundColor: '#65bc45',  // ✅ selected background
          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
            color: theme.palette.common.white,
          },
        },
        '&.Mui-selected:hover': {
          backgroundColor: '#519837',  // ✅ optional darker shade on hover
        },     
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


  /////////////// helper functions /////////////////

  function getPageContainerHeight(pageStyleData) {
    let cheight = 480;
    const navObj = getStyleObject(pageStyleData, 'navbar');
    if(navObj && navObj.length > 0){
      const navVisibleObj = getStyleObject(navObj[0]['children'], 'visible');
      if(navVisibleObj[0] && navVisibleObj[0]['value']) {
        cheight = cheight - 44;
      }
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
    if(tabsObj && tabsObj.length > 0){
      const tabsVisibleObj = getStyleObject(tabsObj[0]['children'], 'visible');
      if(tabsVisibleObj[0] && tabsVisibleObj[0]['value']) {
        cheight = cheight - 49;
      }      
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
      const selectedstyle = (uipartObj[0]['selectedstyle']) ? uipartObj[0]['selectedstyle'] : selectedUIStyle;
      let styleData = uipartObj[0]['style'];
      const styleObj = styleData.find(x => x['name'] === selectedstyle);
      if(styleObj) {
        return styleObj.children;
      }else {
        return (styleData.length > 0) ? styleData[0].children : [];
      }

    }else {
      return [];
    }
  }


  function updateProjectData(propObj, keytoupdate, isStringType) {
    const projectdata = propObj['appData'];
    let apiurl = propObj.appconfig.apiURL;

    var formData = new FormData();
    if(isStringType){
      const updatedval = projectdata[keytoupdate];
      apiurl = apiurl+"service.json";

      formData.append("command", "projectkeyupdate");
      formData.append("projectid", propObj.appconfig['projectid']);
      formData.append("userid", propObj.appconfig['userid']);
      formData.append("sessionid", propObj.appconfig['sessionid']);
      formData.append("key", keytoupdate);
      formData.append("value", updatedval);
    }else{
      apiurl = apiurl+"multipartservice.json";

      formData.append("command", "projectupdate");
      formData.append("projectid", propObj.appconfig['projectid']);
      formData.append("userid", propObj.appconfig['userid']);
      formData.append("sessionid", propObj.appconfig['sessionid']);
    
      var keyObj = {};
      var arrKeys = keytoupdate.split(",");
      for (let index = 0; index < arrKeys.length; index++) {
        const elemKey = arrKeys[index];
        keyObj[elemKey] = projectdata[elemKey];    
      }  
      let text = new File([JSON.stringify(keyObj)], "updateProject.txt", {type: "text/plain"});
      formData.append("file", text);
    }

    return fetch(apiurl, {
      method: 'POST',
      body: formData
    })
    .then((response) => response.json())
    .then(
      (result) => {
        if(result.response === "NACK"){
          var _err = {message: result.error};
          console.log("projectkeyupdate NACK >>>", _err.message);
        }
        else{
          console.log("projectkeyupdate ACK >>> Success");
        }
        return result.response;
      },
      (error) => {
        console.log("projectkeyupdate Error >>> Fail");
      }
    )
  }

  const uploadStyleFile = async (props, type, styles) => {
    if(type === "uistyles"){
      await checkAndDeleteFile('uistyles.json', props);
    }else{
      await checkAndDeleteFile('pagestyles.json', props);
    }
              
    const file = (type === "uistyles") ? saveUIStyleasFile(styles) : savePageStyleasFile(styles);
    const formData = new FormData();
    formData.append("userid", props.appconfig.userid);
    formData.append("sessionid", props.appconfig.sessionid);
    formData.append("projectid", props.appconfig.projectid);
    formData.append("resourcetype", "others");
    formData.append("filename", file.name);
    formData.append("file", file);  

    try {                
      const response = await fetch(props.appconfig.apiURL+"upload.json", {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('Upload success:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const savePageStyleasFile = (dataArray, fileName = 'pagestyles.json') => {
    let pagestyleArr = [];
    for (let index = 0; index < dataArray.length; index++) {
      const styleObj = dataArray[index];
      const obj = removeKeys(styleObj, ["label", "type"]);

      pagestyleArr.push(obj);      
    }
    const jsonStr = JSON.stringify(pagestyleArr, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });
    return file;
  };

  const saveUIStyleasFile = (dataArray, fileName = 'uistyles.json') => {
    let uistyleArr = [];
    for (let index = 0; index < dataArray.length; index++) {
      const styleObj = dataArray[index];
      const obj = removeKeys(styleObj, ["text", "label", "type", "selectedstyle", "properties", "options"]);

      uistyleArr.push(obj);      
    }

    const jsonStr = JSON.stringify(uistyleArr, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });
    return file;
  };

  const checkAndDeleteFile = async (filename, props) => {
    const filepath = props.appconfig.apiURL+"download/others/" + props.appconfig.projectid +"/" + filename;
    await fileExists(filepath).then(exists => {
      if (exists) {
        fetch(props.appconfig.apiURL+'removeresource.json?command=removeresource'
            +'&userid='+props.appconfig.userid
            +'&project_id='+props.appconfig.projectid
            +'&resource_type=others'
            +'&filename='+filename, 
            { method: 'POST', }
        )
        .then(res => res.json())
        .then(
          (result) => {
            console.log('remove success:', result);
          },        
          (error) => {
            console.error('remove failed:', error);
          }
        )
      } else {
        console.log('File not found!');
      }
    });
  };

  async function fileExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok; // true if status is 200-299
    } catch (error) {
      console.error('Error checking file:', error);
      return false;
    }
  }

  function removeKeys(o, keysToRemove) {
    if (Array.isArray(o)) {
      return o.map(item => removeKeys(item, keysToRemove));
    } else if (typeof o === "object" && o !== null) {
      return Object.fromEntries(
        Object.entries(o)
          .filter(([key]) => !keysToRemove.includes(key))
          .map(([key, value]) => [key, removeKeys(value, keysToRemove)])
      );
    }
    return o;
  }

  

  ////////////////////////////////////////////////

  StyleEditor.propTypes = {
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
  export default connect(mapStateToProps)(StyleEditor);
  