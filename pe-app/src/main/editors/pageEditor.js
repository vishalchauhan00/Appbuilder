import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames/bind';
import { Box, Paper, IconButton, Tooltip, Fab, SvgIcon, Button, Select, Switch, DialogTitle } from '@material-ui/core';
import { Popover, List, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon, Checkbox, Backdrop, Snackbar, Slide, CircularProgress } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Help';

import toprulerImage from '../../assets/hScale.GIF';
import leftrulerImage from '../../assets/vScale.GIF';

import AlertWindow from '../../components/AlertWindow';
import ProjectValidation from '../helpers/projectValidation';
import PageLayoutEditor from './pageLayoutEditor';
import UIContainer from './UIContainer';
import { setCutCopyUIObj, getTabModuleAccess, getAllChildren_onPage } from '../helpers/Utility';


import { setEditorParent, setSelectedLayout, setEditorState, setSelectedPageData, setSelectedUI, setAllPageChanged, setChangedPageIds, changeScreenIndex, setPreviousEditorParent } from '../ServiceActions';


class PageEditor extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
        error: null,
        isLoaded: false,

        pageConfig: [],
        pageLocale: [],
        pages: [],
        pageCaches: [],

        pagelist: this.props.openedPageList,
        pageStates: this.props.pageState,
        selectedPage: this.props.selectedPage,        

        //showEditor: this.props.showContenteditor,
        currentScreenIndex: 0,
      };
  }

  componentDidMount() {   

    this.fetchPageLocale('en');

    fetch("././config/PageConfig.json")
      .then(res => res.json())
      .then(
        (result) => {          
          let pageContainers = result['container'];           
          pageContainers.forEach(element => {
            if(element.include === "true"){
              this.fetchPageConfig(element['targetClass']);
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

  fetchPageLocale(lang){
    let localefilePath;
    if(lang === "ja" || lang === "jp"){
      localefilePath = "././locale/ja_JP/pageproperties.json";
    }else{
      localefilePath = "././locale/en_US/pageproperties.json";
    }
    fetch(localefilePath)
      .then(res => res.json())
      .then(
        (result) => {
          //console.log("....Page-Locale fetching success >>>", result);
          let pageLocale = result['PageLocale'];
          this.setState({ pageLocale : pageLocale});            
        },        
        (error) => {
          console.log("Page-Locale fetching error >>>", error);
          this.setState({
            error
          });
        }
      )
  }

  fetchPageConfig(targetClass) {
    let _classpath = "././config/container/"+targetClass+".xml";
    //console.log("fetchPageConfig >>>", _classpath);
    fetch(_classpath)
    .then(res => res.text())
    .then(
      (result) => {
        //console.log("config >>>", result); 

        var XMLParser = require('react-xml-parser');
        var xml = new XMLParser().parseFromString(result);
        //console.log(xml);
        var pageitem = xml.getElementsByTagName('item');
        if(pageitem.length > 0){
          var pageproperties = xml.getElementsByTagName('type');
          this.setPageTemplate(pageitem[0], pageproperties);
        }
      },        
      (error) => {
        console.log("Page config error >>>", error);
        this.setState({
          error
        });
      }
    )
  }

  setPageTemplate(item, properties) {
    let _pageConfig = this.state.pageConfig;    

    let pageObj = item.attributes;
    let typeConfig = [];
    properties.forEach(element => {
      let propObj = element.attributes;      
      typeConfig.push({name: propObj.name, properties: this.populatePageConfig(element.children)});
    });
    pageObj.children = typeConfig;
    
    /* var bars= [];    
    let configChildren = pageObj.children;
    configChildren.forEach(element => {
      let configname = element.name.toString().toLowerCase();
      if(configname.indexOf('bar') > -1){          
       //bars = bars.concat(element.properties);
        bars.push.apply(bars, element.properties);
      }        
    });    
    console.log("bars >>>>", bars);
    let barsObj = {name:"Page Bars", properties:bars};    
    pageObj.children.push(barsObj); */

    _pageConfig.push(pageObj);
    this.setState({pageConfig: _pageConfig });

    //console.log("_pageConfig >>>>", this.state.pageConfig);
  }
  populatePageConfig(properties) {
    var _propConfig = [];
    if(properties.length === 0)
      return _propConfig;
    
    //console.log("properties >>>", properties);
    properties.forEach(element => {
      let propObj = element.attributes;
      if(element.children !== undefined && element.children.length > 0) {
        let otherObj = this.populatePropertyObjects(element.children);        
        for (let index = 0; index < otherObj.length; index++) {
          const item = otherObj[index];
          propObj[item.name] =  item.items;
        }        
      }

      _propConfig.push(propObj);
    });

    return _propConfig;
  }

  populatePropertyObjects(children) {
    
    var _propObj = [];
    children.forEach(element => {
      let _prop = [];
      for (let index = 0; index < element.children.length; index++) {
        const item = element.children[index];
        if(element.name === "validations") {
          _prop.push(item.attributes.validator);        
        }
        else if(element.name === "dataSource") {
          _prop.push(item.attributes.name);
        }
        else if(element.name === "dependentActions") {
          _prop.push(item);
        }        
      }

      _propObj.push({name:element.name, items:_prop});
    });
    
    return _propObj;
  }


  componentDidUpdate(prevProps,prevState) {
    if(prevProps.openedPageList !== this.props.openedPageList) {
      this.setState({ pagelist: this.props.openedPageList });  
    }
    /* if(prevProps.showContenteditor !== this.props.showContenteditor) {
      this.setState({ showEditor: this.props.showContenteditor });
    } */
  }

  ////////////////// Tool-box functionality ////////////////////////

  handlePageSave(pageid) {
    let isAccess = true;
    if(this.props.contributorTabs && this.props.contributorTabs.length > 0) {
      isAccess = getTabModuleAccess(this.props.selectedPage, this.props.contributorTabs, this.props.pageList, this.props.appData);
    }
    //console.log(this.props.selectedPage, isAccess, "....handlePageSave.....", pageid);
    if(isAccess) {
      this.props.onEditorClose(pageid, "save");
    }else {
      console.log("Not allowed to save changes");
    }
  }

  handlePageUndoRedo(updatedPage) {
    this.setState({selectedPage: updatedPage});
    this.props.onUndoRedo(updatedPage);
  }

  handlePageState(pageid, pstate, parameter) {
    let _pagestates = this.state.pageStates;    
    let updatePageState = filterState_byPageid(pageid, _pagestates);
    //console.log(pageid, pstate, parameter, "..... handlePageState >>>> ", _pagestates, updatePageState);

    updatePageState['params'] = pstate['params'];
    if(parameter === "screenIndex") {
      const _newIndex = parseInt(updatePageState['params']['screenIndex']);
      this.props.onScreenChange(_newIndex);
      this.setState({currentScreenIndex: _newIndex});
      this.props.dispatch(changeScreenIndex(_newIndex));      
      //console.log(this.props.selectedPage, "....screenIndex handlePageState >>>>", this.props.currentPage);

      this.props.dispatch(setEditorParent({}));
    }
    
    this.setState({pageStates: _pagestates});
    //console.log("....setOpenedPageList >>>>", _pagestates);
    this.props.dispatch(setEditorState({_pagestates}));
  }

  handleUpdatePage(pagedata) {
    //console.log("..... handleUpdatePage >>>> ", pagedata);
    this.setState({ selectedPage: pagedata });
    this.props.dispatch(setSelectedPageData(pagedata));
  }

  handleSelectUI(uidata) {
    //console.log("..... handleSelectUI >>>> ", uidata);
    this.props.dispatch(setSelectedUI(uidata));
  }

  handleUpdateUI(property, value){
    console.log(property, "..... handleUpdateUI >>>> ", value);
  }

  handleAllPagesChanges(flag, changedpages) {
    this.props.dispatch(setAllPageChanged(flag));
    if(!flag) {
      console.log(flag, "...OK...", changedpages); 
      this.props.dispatch(setChangedPageIds(changedpages));
    }
  }

  ////////////////// Setting-Window functionality -- not needed//////////////////

  /* handleUpdateValue(property, value){
    let _openedPages = this.state.pagelist;
    let _selectedPage = _openedPages[_openedPages.length-1];

    //console.log(property, " <<<< handleUpdateValue >>>> ", _selectedPage);
    this.setState({selectedPage: _selectedPage});

    this.props.onUpdatePage(_selectedPage);
  } */


  ////////////////// Layout-Window functionality ///////////////////  

  handleSelectEditor(_pageid) {
    //console.log(_pageid, "handleSelectEditor >>>>>>>>>>>>>>>>>", this.props, this.state.pagelist);
    /* if(this.props.currentPage.hasOwnProperty('viewType')) {
      this.setState({selectedPage: this.props.currentPage});  
      this.props.onClickEditor(this.props.currentPage);

    }else { */
      let _openedPages = this.state.pagelist;
      let _selectedPage =  _openedPages.filter(function(node, index) {
        if(node.pageid === _pageid){ 
          //_openedPages.splice(index,1);
          //_openedPages.splice(_openedPages.length,0,node);
          return node;
        }
        return node.pageid === _pageid;
      });
      if(_selectedPage.length > 0) {
        this.setState({selectedPage: _selectedPage[0]});
    
        this.props.onClickEditor(_selectedPage[0]);
      }
    //}
    
    //console.log("_openedPages >>>>>>>>>>>>>>>>>", _openedPages);
    //this.setState({pagelist: _openedPages});
  }

  handleCloseEditor(_pageid, _param) {    
    let _openedPages = this.state.pagelist;

    let _closedpage =  _openedPages.filter(function(node, index) {
      if(node.pageid === _pageid){ 
        _openedPages.splice(index,1);
        return node;
      }
      return node.pageid === _pageid;
    });
    console.log(this.state.selectedPage, "_closedpage >>>>>>>>>>>>>>>>>", _closedpage);
    
    this.setState({pagelist: _openedPages});
    this.props.onEditorClose(_pageid, _param);
  }


  ////////////////// Content-Window functionality ///////////////////  

  handleCloseContentEditor() {
    this.props.dispatch(setSelectedLayout("page"));
    this.props.dispatch(setEditorParent({}));

    this.handleResetContentUI();
    this.setPreviousContentEditor();
  }
  handleSelectContentEditor(target) {
    sessionStorage.setItem("editor", target);
    this.props.dispatch(setSelectedLayout(target));
    
    this.handleResetContentUI();    
  }
  handleResetContentUI() {
    //console.log(this.props, ".... handleRestContentUI >>>>>>>>>", this.props.contentEditorParent);
    const contentEditorUIpart = this.props.contentEditorParent['ui'];
    this.props.dispatch(setSelectedUI(contentEditorUIpart));
    if(contentEditorUIpart.hasOwnProperty('viewType')) {
      const _viewType = contentEditorUIpart['viewType'];
      let contentUIfields;
      if(_viewType === "Form" || _viewType === "FormView") {
        let index = (this.props.contentEditorParent["index"]) ? this.props.contentEditorParent["index"] : 0;
        contentUIfields = contentEditorUIpart.formItems[index].Fields;
      }else if(_viewType === "ExpansionPanel") {
        let indx = (this.props.contentEditorParent["index"]) ? this.props.contentEditorParent["index"] : 0;
        contentUIfields = contentEditorUIpart.panelItems[indx].Fields;
      }else if(_viewType === "SwipeableView") {
        let idx = (this.props.contentEditorParent["index"]) ? this.props.contentEditorParent["index"] : 0;
        contentUIfields = contentEditorUIpart.swipeableItems[idx].Fields;
      }else if(_viewType === "DataGrid") {
        let indx = (this.props.contentEditorParent["index"]) ? this.props.contentEditorParent["index"] : 0;
        if(this.props['contentEditorParent']['fieldContainer'] && this.props['contentEditorParent']['fieldContainer'] === "headerFields"){
          contentUIfields = contentEditorUIpart.dataCols[indx].headerFields;
        }else{
          contentUIfields = contentEditorUIpart.dataCols[indx].Fields;
        }        
      }else if(_viewType === "NestedList") {
        const _nestedListSource = this.props.contentEditorParent["source"];
        if(_nestedListSource === "NestedList") {
          contentUIfields = contentEditorUIpart.mainCellDef.Fields;
        }else{
          contentUIfields = contentEditorUIpart.subCellDef.Fields;
        }
      }else {
        contentUIfields = contentEditorUIpart.dataarray[0].Fields;
      }
      for (let i = 0; i < contentUIfields.length; i++) {
        const element = contentUIfields[i];
        delete element['selected'];
      }
    }
  }

  setPreviousContentEditor(){
    const prevEditorParent = this.props.previousEditorParent;
    if(prevEditorParent.length > 0){
      const prevEditorObj = prevEditorParent[prevEditorParent.length - 1];
      this.props.dispatch(setEditorParent(prevEditorObj));
      this.props.dispatch(setSelectedUI(prevEditorObj['ui']));
      prevEditorParent.pop();
      this.props.dispatch(setPreviousEditorParent(prevEditorParent));
    }
  }


  ///////////////////////////////////////////////////////////

  handleSaveWaitClose() {
    const _pageid = this.props.selectedPage['pageid'];
    this.props.onSaveWaitClose(_pageid);
  }

  handleCloseAler = () => {
    //this.setState({openCAlert: false});
  };


  render() {
    const { pageStates } = this.state;

    if(!this.props.show) {
      return null;
    } 

    const appConfig = {apiURL: this.props.apiParam.apiURL, userid: this.props.apiParam.userid, sessionid: this.props.apiParam.sessionid, projectid: this.props.apiParam.projectid};

    /* const openedpageCount = pagelist.length;
    const openedPage = pagelist[openedpageCount-1];    
    if(openedpageCount > 0)  console.log(openedPage.pageid, "***** page layout *****", pagelist); */
     
    let shiftW = (this.props.uilist === 'none') ? '67vw' : '50vw';
    const page = this.props.selectedPage;
    
    const waitPageid = this.props.showWait['pageid'];
    const showwait = (waitPageid === page.pageid) ? this.props.showWait['showwait'] : false;
    //const showwait = filterSaveWait_byPageid(page.pageid, this.props.showWait);
    //console.log(page.pageid, this.props.showWait, ".......... showWait .............", showwait);
    const defaultScrId = (this.props.defaultScreenId) ? parseInt(this.props.defaultScreenId) : 0;

    const editorSource = (sessionStorage.getItem("editor")) ? sessionStorage.getItem("editor") : this.props.targetEditor;
        
    return (
      <div id="pageeditor" style={{width:shiftW, display:'flex', flexGrow:1, padding:'0px 4px', border:'2px solid', borderRadius:4}}>
        <ToolWindow appData={this.props.appData} data={page} pagestate={filterState_byPageid(page.pageid, pageStates)}
                    allPages={this.props.pageList} pageHeirarchy={this.props.heirarchy} currentPage={this.props.currentPage} allChildren={this.props.pageChildren}
                    targetEditor={editorSource} layoutContainer={this.props.layoutContainer} editorParent={this.props.contentEditorParent}
                    selectedUI={this.props.currentUI} selectedUIparts={this.props.selectedUIs} defaultScreenId={defaultScrId}
                    onPageSave={(...args) => this.handlePageSave(args[0])} onUpdatePage={(...args) => this.handleUpdatePage(args[0])}
                    onAllPagesChanged={(...args) => this.handleAllPagesChanges(args[0], args[1])}
                    onUndoRedo={(...args) => this.handlePageUndoRedo(args[0])} onUpdatePageState={(...args) => this.handlePageState(args[0], args[1], args[2])}
                    onSelectUI={(...args) => this.handleSelectUI(args[0])} onUpdateUI={(...args) => this.handleUpdateUI(args[0], args[1])} />
        <div id="layoutbox" style={{width:'100%', padding:12, overflow:'auto'}}>
          <LayoutWindow appData={this.props.appData} appconfig={appConfig} allPages={this.props.pageList} data={page}
                        pagestate={filterState_byPageid(page.pageid, pageStates)} defaultScreenId={defaultScrId}
                        onWindowSelect={(...args) => this.handleSelectEditor(args[0])} onWindowClose={(...args) => this.handleCloseEditor(args[0], args[1])} />
          <ContentWindow appconfig={appConfig} appdata={this.props.appData} data={page} shiftlist={this.props.uilist}
                         targetEditor={editorSource} editorParent={this.props.contentEditorParent} currentPage={this.props.currentPage} currentUI={this.props.currentUI} screenIndex={this.props.currentScreenIndex}
                         onWindowClose={() => this.handleCloseContentEditor()} onWindowSelect={(...args) => this.handleSelectContentEditor(args[0])} /> 
          {showwait && 
            <div className="backdropStyle" style={{zIndex:9}}>
              <Typography variant="h6" color="textSecondary" className="waitlabel"><CircularProgress style={{marginRight:12}} />Saving in progress ...</Typography>
              <IconButton size="small" style={{top:-18, left:-28, color:'white'}} onClick={() => this.handleSaveWaitClose()} >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          }
          {!getTabModuleAccess(page, this.props.contributorTabs, this.props.pageList, this.props.appData) &&
            <Snackbar open={true} message="Not allowed to save any changes on this page"
                anchorOrigin={{ vertical: 'bottom',  horizontal: 'center' }} TransitionComponent={SlideTransition}
                autoHideDuration={8000} onClose={() => this.handleCloseAler()}
            />
          }
        </div>
      </div>      
    );
  }
}

/* function filterSaveWait_byPageid(pageid, waitPages) {
  //console.log(pageid, ".......... filterSaveWait_byPageid .............", waitPages);
  if(waitPages && waitPages !== -1) {
    let waitstates = waitPages.split(',');
    let waitpage = waitstates.filter(function(node) {
      if(parseInt(node) === parseInt(pageid)){
        return true;
      }
      return false;
    });  
    
    if(waitpage.length > 0) {
      return true;
    }
  }

  return false;
} */

function filterState_byPageid(openedpageid, pagestates) {
  let pagestate = pagestates.filter(function(node) {
    if(node[openedpageid]){
      return true;
    }
    return false;
  });  
  if(pagestate.length > 0) {
    return pagestate[0][openedpageid];
  }

  return null;
}


function ToolWindow(props) {

  const useStyles = makeStyles(theme => ({
                      root: {
                        display: 'flex',
                        flexDirection: 'column',
                        //justifyContent: 'space-between',
                        alignItems: 'center',
                        width: 36,
                        padding: theme.spacing(1, 0.25),
                        margin: theme.spacing(0.5),
                        marginBottom: theme.spacing(1),
                        backgroundColor: theme.palette.grey[400],
                        borderRadius: 8,
                        overflow: 'hidden auto',
                      },
                      toolbox: {
                        background: theme.palette.background.paper,
                      },
                      paperbox: {
                        width: 'inherit',
                        margin: theme.spacing(0.5, 0),
                        padding: theme.spacing(0.25, 0),
                        backgroundColor: 'rgba(189,189,189,0)',
                        paddingBottom: 8,
                        borderBottom: '2px solid',
                        borderBottomColor: theme.palette.grey[500],
                      },
                      griddiv: {
                        margin: theme.spacing(0, 0.25),
                      },
                      vdivider: {
                        width: 2,
                        height: '100%',
                        margin: theme.spacing(0, 1),
                        backgroundColor: theme.palette.grey[700],
                        display : 'none',
                      },
                      hdivider: {
                        display: 'none',
                        height: 2,
                        width: '100%',
                        minWidth: 36,
                        margin: theme.spacing(0.25, 0),
                        backgroundColor: theme.palette.grey[500],
                      },                                         
                      fab: {
                        maxWidth: 30,
                        minHeight: 28, maxHeight: 30,
                        margin: theme.spacing(0.125),
                        backgroundColor: theme.palette.grey[300],
                        textTransform: 'none'
                      },
                      aspect: {
                        height: 18,
                        objectFit:'scale-down',
                      },
                      formControl: {
                        margin: theme.spacing(0.5),
                        minWidth: 80,
                      },
                      popover: {
                        marginLeft: theme.spacing(1),
                      },
                      paper: {
                        padding: theme.spacing(0.5),
                        background: theme.palette.background.default,
                      },
                      menulist: {
                        maxHeight: 32,
                        paddingLeft: 8,
                        paddingRight: 56,
                        borderBottom: '1px solid',
                      },
                      gridgap: {
                        width: 40, 
                        height: 22,
                        backgroundColor: theme.palette.grey[300],
                      },
                      backdrop: {
                        zIndex: theme.zIndex.drawer + 1,
                        color: '#ff0000',
                      },
                      popbtn: {
                        width: '100%',
                        textTransform: 'none',
                        borderTop : '1px solid',
                        borderRadius: 'inherit',
                        padding: 2,
                      },
                      paperflexbox: {
                        width: 'inherit',
                        height: '100%',
                        display: 'none',  //'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        padding: theme.spacing(0.25, 0),
                        margin: theme.spacing(0.5, 0),
                      },
                      actionbtn: {
                        textTransform: 'none',
                      },
                      copypageparttitle: {
                        background: theme.palette.background.paper,
                        padding: theme.spacing(1)
                      },
                      copypagepartcontent: {
                        background: theme.palette.background.default,
                      },
                      formpageevents: {
                        width: 'inherit',
                        height: 32,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        padding: theme.spacing(0, 2),
                        margin: theme.spacing(0, 4),
                        border : '1px solid lightgrey',
                        borderRadius: theme.spacing(1),
                      },
                      divpageevents: {
                        width: 'inherit',
                        height: 'inherit',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      },
                      copypagebarpages: {
                        width: 'inherit',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: theme.spacing(0.5, 2),
                        marginTop: theme.spacing(1),
                        border : '1px solid',
                        borderRadius: theme.spacing(1),
                        background: theme.palette.background.paper,
                      },
                      pageidall: {
                        width: '100%',
                        maxHeight: 32,
                        paddingLeft: 8,
                        marginLeft: 0,
                        borderBottom: '1px solid',
                        background: theme.palette.background.default,
                        color: "rgb(0,0,255)"
                      },
                      pageidlist: {
                        maxHeight: 32,
                        paddingLeft: 8,
                        paddingRight: 56,
                        borderBottom: '1px solid',
                        background: theme.palette.background.default,
                      },
                      pageidbtn: {
                        textTransform: 'none',
                        minWidth: 80,
                        height: 32,
                        marginTop: theme.spacing(0.5),
                        padding: theme.spacing(0.5),
                      }
                    }));
  const classes = useStyles();   

  const pagedata = props.data;
  const pagestate = props.pagestate;
  //console.log(pagedata.pageid, "** ToolWindow **", pagestate);
  
  ////// Setting-menu functionality //////
  
  
  const [anchorSetting, setAnchorSetting] = React.useState(null);
  const settingopen = Boolean(anchorSetting);
  
  const [screens, setScreens] = React.useState([]);
  const [selectedScreen, setSelectedScreen] = React.useState(() => 0);  //React.useState(props.defaultScreenId);

  const initScreen = React.useCallback(() => {
    const screenParams = props.pagestate['params'];
    if (screenParams.hasOwnProperty('screenIndex')) {
      const scrIndex = parseInt(screenParams['screenIndex']);
      setSelectedScreen(scrIndex);
    } else {
      setSelectedScreen(0);
    }
  }, [props.pagestate]);

  React.useEffect(() => {
    initScreen();
  }, [initScreen]);

  function handleSettingOpen(event) {
    //console.log(props.pagestate, "** ToolWindow Setting Open**", props.appData);
    setAnchorSetting(event.currentTarget);
    initLayoutState();
    
    setScreens(props.appData.availableScreens);
    //setSelectedScreen(0);

    initScreen();
  }

  function handleSettingClose() {
    setAnchorSetting(null);
  }

  function handleChangeScreen(event) {
    let scrId = event.currentTarget.value;
    //console.log("handleChangeScreen >>>>>>>>>>>>", scrId);
    updatePagestateParam('screenIndex', scrId);
    updatePagestateParam('screen', props.appData.availableScreens[scrId]);

    setSelectedScreen(scrId);
    setAnchorSetting(null);
  }

  const [opencopybars, setOpenPagebarsDialog] = React.useState(false);
  const handleOpenCopyPagebars = () => {
    setOpenPagebarsDialog(true);
    setAnchorSetting(null);
  }

  const handleClearPageUIData = () => {
    setConfirmAction('clearpage');
    setPagebarsConfirm(true);
    setConfirmMessage('Are you sure to clear all UI-parts on the page ?');
  }

  const [openvalidation, setOpenValidationView] = React.useState(false);
  const handlePageValidation = () => {
    setOpenValidationView(true);
    setAnchorSetting(null);
  }

  function handleCloseValidations() {
    setOpenValidationView(false);
  }

  ///////////////////////////////

  function handlePageSave() {
    props.onPageSave(pagedata.pageid);
  }

  ////// Undo, Redo functionality //////

  //console.log("....PageMenubar selectedPage.....", props.selectedPage);

  function handlePageUndo() {
    //console.log(pagestate, "....PageMenubar handlePageUndo.....", props);
    let undoArr = pagestate['undo'];
    let redoArr = pagestate['redo'];
    if(undoArr.length > 0) {
      let __page = undoArr.pop();
      redoArr.push(__page);
    }else {
      // show alert
      setOpenalert(true);
      setAlertMsg("Nothing to do more 'undo'");
      return;
    }

    let undoPageData;
    if(undoArr.length > 0) {
      undoPageData = undoArr[undoArr.length - 1];
    }else {
      undoPageData = pagestate['init'][0];
    }
    //console.log(undoPageData.pageid, "....PageMenubar handlePageUndo.....", pagestate);
    props.onUndoRedo(undoPageData);    
  }

  function handlePageRedo() {
        
    let redoArr = pagestate['redo'];
    let undoArr = pagestate['undo'];
    if(redoArr.length > 0) {
      let __page = redoArr.pop();
      undoArr.push(__page);      
    }else {
      // show alert
      setOpenalert(true);
      setAlertMsg("Nothing to do more 'redo'");
      return;
    }

    let undoPageData;
    if(undoArr.length > 0) {
      undoPageData = undoArr[undoArr.length - 1];
    }else {
      undoPageData = pagestate['init'][0];
    }
    //console.log(undoPageData.pageid, "....PageMenubar handlePageRedo.....", pagestate);
    props.onUndoRedo(undoPageData);
  }

  ////// Zoom functionality //////

  const zoomItem =[50, 75, 100, 150, 200];
  //const [zoomvalue, setZoom] = React.useState(100);  

  function handlePageZoomin() {
    let _params = pagestate['params'];      
    let _zoomval = (_params['zoom']) ? (_params['zoom']) : 100;
    
    let zoomIndex = zoomItem.indexOf(_zoomval);
    let zoomVal = zoomItem[zoomIndex+1];    
    if(zoomVal) {
      //setZoom(zoomVal);
      updatePagestateParam('zoom', zoomVal);
    }
  }

  function handlePageZoomout() {
    let _params = pagestate['params'];      
    let _zoomval = (_params['zoom']) ? (_params['zoom']) : 100;
    
    let zoomIndex = zoomItem.indexOf(_zoomval);
    let zoomVal = zoomItem[zoomIndex-1];    
    if(zoomVal) {
      //setZoom(zoomVal);
      updatePagestateParam('zoom', zoomVal);      
    }
  }

  ////// View-menu functionality //////
  
  const viewItem = ['Show All', 'Show Ruler', 'Show Guide', 'Show Grid'];
  const [checked, setChecked] = React.useState([1]);
  const [snapguide, setSnapGuide] = React.useState(false);
  const [snapgrid, setSnapGrid] = React.useState(false);
  const [gridgap, setGridGap] = React.useState(10);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const viewopen = Boolean(anchorEl);

  function handleViewOpen(event) {
    initLayoutState();
    setAnchorEl(event.currentTarget);
  }

  function initLayoutState() {
    let _viewChecked = [1];
    let _gridgap = 10;
    let _snapguide = false;
    let _snapgrid = false;

    if(pagestate) {
      let _params = pagestate['params'];
      if(_params) {
        if(_params['showall'] && _params['showall'] === 'on') {
          _viewChecked = viewItem;
        }else {
          _viewChecked = [];
          if(_params['showruler'] && _params['showruler'] === 'on')   _viewChecked.push('Show Ruler');
          if(_params['showguide'] && _params['showguide'] === 'on')   _viewChecked.push('Show Guide');
          if(_params['showgrid'] && _params['showgrid'] === 'on')     _viewChecked.push('Show Grid');
        }
        setChecked(_viewChecked); 

        _snapguide = (_params['snapguide'] && _params['snapguide'] === 'on') ? true : false;
        setSnapGuide(_snapguide);

        _snapgrid = (_params['snapgrid'] && _params['snapgrid'] === 'on') ? true : false;
        setSnapGrid(_snapgrid);

        _gridgap = (_params['gridgap']) ? _params['gridgap'] : 10;
        setGridGap(_gridgap);
      }
    }else {
      setChecked([1]);
      setSnapGuide(false);
      setSnapGrid(false);
      setGridGap(10);
    }
  }

  function handleViewClose() {
    setAnchorEl(null);
  }  
  
  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      if(value === "Show All") {
        newChecked.push('Show All', 'Show Ruler', 'Show Guide', 'Show Grid');
      }else {
        newChecked.push(value);
        if(newChecked.indexOf('Show Ruler') > -1 && newChecked.indexOf('Show Guide') > -1 && newChecked.indexOf('Show Grid') > -1){
          newChecked.push('Show All');
        }
      }

    }else {
      if(value === "Show All") {
        newChecked.splice(0);
      }else {
        newChecked.splice(currentIndex, 1);        
        const showallIndex = newChecked.indexOf('Show All');
        if(showallIndex > -1){
          newChecked.splice(showallIndex, 1);
        }
      }           
    }

    setChecked(newChecked);
    
    let _param;
    if(value === 'Show All')  _param = 'showall';
    else if(value === 'Show Ruler')  _param = 'showruler';
    else if(value === 'Show Guide')  _param = 'showguide';
    else if(value === 'Show Grid')  _param = 'showgrid';

    let _val = (currentIndex > -1) ? 'off' : 'on';
    updatePagestateParam(_param, _val);
  };
  
  const handleSnapGuide = (event) => {
    setSnapGuide(event.target.checked);
    
    let _sguide = (event.target.checked) ? 'on' : 'off';
    updatePagestateParam('snapguide', _sguide);
  };
  
 
  const handleSnapGrid = (event) => {
    setSnapGrid(event.target.checked);
    
    let _sgrid = (event.target.checked) ? 'on' : 'off';
    updatePagestateParam('snapgrid', _sgrid);
    updatePagestateParam('gridgap', gridgap);
  };
  
  const handleGridGapValue = (event) => {
    setGridGap(event.currentTarget.value);  
    
    updatePagestateParam('gridgap', event.currentTarget.value);
  };

  function updatePagestateParam(parameter, value){
    let stateparams = pagestate['params'];
    stateparams[parameter] = value;

    //updatePageState(pagestate);
    props.onUpdatePageState(pagedata.pageid, pagestate, parameter);
  }

  //////////////////////////

  const [cutcopyUI, setCutCopyUI] = React.useState({});
  const [cutcopyMultiUI, setCutCopyMultiUI] = React.useState([]);
  const [mode, setMode] = React.useState("");
  const [sourceEditor, setSourceEditor] = React.useState("");

  function handleUICut() {
    let _cutUIArr = [];
    let cutUIObj = {mode: 'cut', sourceEditor:{page:props.currentPage, editor: props.targetEditor}};

    if(props.selectedUIparts.length > 0) {
      //console.log("....handle Multi-UI Cut >>>", props.selectedUIparts);
      //setOpenalert(true);
      //setAlertMsg("Cut-paste operation is not supported for multiple UIs yet.");
      //return;
      setCutCopyMultiUI(props.selectedUIparts);
      setMode('cut');
      setSourceEditor({page: props.data, editor: props.targetEditor});

      cutUIObj['cutcopyMultiUI'] = props.selectedUIparts;
      _cutUIArr.push(cutUIObj);

    }else {
      if(props.selectedUI && props.selectedUI.hasOwnProperty('viewType')){
        //console.log(props.data, props.targetEditor, "..handleUICut >>>", props.selectedUI);
        setCutCopyUI(props.selectedUI);
        setMode('cut');
        setSourceEditor({page: props.data, editor: props.targetEditor});

        cutUIObj['cutcopyMultiUI'] = props.selectedUI;
        _cutUIArr.push(cutUIObj);

      }else {
        setOpenalert(true);
        setAlertMsg("Select at-least one UI to cut.");
      }
    }

    if(_cutUIArr.length > 0){
      setCutCopyUIObj(_cutUIArr);
      navigator.clipboard.writeText("");
    }
  }

  function handleUICopy() {
    let _copiedUIArr = [];
    let copiedUIObj = {mode: 'copy', sourceEditor:{page:props.currentPage, editor: props.targetEditor}};          

    if(props.selectedUIparts.length > 0) {
      //console.log("....handle Multi-UI Copy >>>", props.selectedUIparts);
      //setOpenalert(true);
      //setAlertMsg("Copy-paste operation is not supported for multiple UIs yet.");
      //return;
      setCutCopyMultiUI(props.selectedUIparts);
      setMode('copy');
      setSourceEditor(props.targetEditor);

      copiedUIObj['cutcopyMultiUI'] = props.selectedUIparts;
      _copiedUIArr.push(copiedUIObj);

    }else {
      if(props.selectedUI && props.selectedUI.hasOwnProperty('viewType')){
        //console.log("handleUICopy >>>", props.selectedUI);
        setCutCopyUI(props.selectedUI);
        setMode('copy');
        setSourceEditor(props.targetEditor);

        copiedUIObj['cutcopyUI'] = props.selectedUI;
        _copiedUIArr.push(copiedUIObj);

      }else {
        setOpenalert(true);
        setAlertMsg("Select at-least one UI to copy.");
      }
    }    

    if(_copiedUIArr.length > 0){
      setCutCopyUIObj(_copiedUIArr);
      navigator.clipboard.writeText("");
    }
  }

  function handleUIPaste() {
    if(cutcopyMultiUI && cutcopyMultiUI.length > 0){
      //console.log("....handle Multi UI Paste >>>", cutcopyMultiUI);
      let multiFlag = true;
      for (let i = 0; i < cutcopyMultiUI.length; i++) {
        const cutcopyElem = cutcopyMultiUI[i]['UI'];
        if(i === cutcopyMultiUI.length-1) {
          multiFlag = false;
        }
        pasteUIHandler(cutcopyElem, multiFlag);
      }
      setCutCopyMultiUI([]);
    }else {
      pasteUIHandler(cutcopyUI, false);
    }
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
  function pasteUIHandler(cutcopyUIObj, isMulti) {
    
    const _scrIndex = parseInt(selectedScreen);
    if(cutcopyUIObj && cutcopyUIObj.hasOwnProperty('viewType')){
      //console.log(sourceEditor, mode, props.targetEditor, "....handleUIPaste >>>", cutcopyUIObj);

      let uiViewType = getUIViewtype(cutcopyUIObj);
      const validUIMsg = validateDroppedUI(uiViewType, props);
      if(validUIMsg.length > 0) {
        setOpenalert(true);
        setAlertMsg(validUIMsg);
        return;
      }

      let enableforAllScreen = false;
      let masterScreenIndex = 0;
      const screens = props.appData['availableScreens'];
      if(screens.length > 1) {        
        screens.forEach((element, i) => {
          if(element['embed']) {
            masterScreenIndex = i;          
          }
        });        
        
        const isMasterSlave = props.appData['isMasterScreenSet'];
        if(isMasterSlave && _scrIndex === masterScreenIndex) {
          enableforAllScreen = true;
        }        
      }
      
      if(mode === "cut") {
        if(sourceEditor['page']['pageid'] === props.data['pageid'] && sourceEditor['editor'] === props.targetEditor) {
          setOpenalert(true);
          setAlertMsg("On same editor, cut-paste operation is not allowed.");
          return;
        }
        let sourceChildrenArr = getChildrenArray(sourceEditor['editor'], _scrIndex, sourceEditor['page']);
        if(screens.length > 1) {  
          let cutUIdef;
          sourceChildrenArr.forEach((child, i) => {   
            const _childPart = child['uiParts'][_scrIndex];
            let _childViewType = getUIViewtype(_childPart);
            if(enableforAllScreen) {
              //console.log(_childViewType, _scrIndex, "....cutcopyUIObj #### >>>", i, uiViewType);
              //if(child['uiParts'][_scrIndex] === cutcopyUIObj) {
              if(_childViewType === uiViewType && _childPart['name'] === cutcopyUIObj['name']) {
                cutUIdef = sourceChildrenArr.splice(i,1);
              } 
            }else {
              if(_childPart['name'] === cutcopyUIObj['name']) {
                child['uiParts'][_scrIndex]['_enabledOnScreen'] = false;
              } 
            }        
          });
          setMultiToolbarsChildren(props, sourceEditor['editor'], screens, selectedScreen, "delete", cutUIdef, sourceChildrenArr);
        }
        else {
          sourceChildrenArr.forEach((child, i) => {          
            if(child['uiParts'][0] === cutcopyUIObj) {
              sourceChildrenArr.splice(i,1);
            }        
          });
        }
      }

      let _targetEditor = (uiViewType === "Dialog") ? "overlay" : props.targetEditor;
      if(_targetEditor === "NestedList") {
        _targetEditor = props.editorParent['source'];
      }

      if(_targetEditor === "Form" ||_targetEditor === "FormView") {
        if(uiViewType === "Dialog"){
          setOpenalert(true);
          setAlertMsg("'Dialog' UI not allowed here.");
          return false;
        }else{
          const formUI = props.editorParent['ui'];
          let index = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          let formItems = formUI['formItems'];
          if(formItems[index]['Fields'].length === 1){
            setOpenalert(true);
            setAlertMsg("Only one UI part allowed in one form item.");
            return false;
          }
        }          
      }

      let editorChildrenArr = getChildrenArray(_targetEditor, _scrIndex);
      let uiContainer = {_uid: "", uiParts:[], viewType:uiViewType};//, parent:props.layoutContainer};
      //console.log(props['targetEditor'], "*******************",props)

      let _uipart = JSON.parse(JSON.stringify(cutcopyUIObj));
      _uipart['name'] = setUIpartName(_uipart['name'], _scrIndex);
      if(mode === "copy") {
        const orderId = getUIpart_orderIndex(editorChildrenArr, _scrIndex);
        _uipart['displayOrderOnScreen'] = parseInt(orderId) + 1;
        if(sourceEditor === props.targetEditor) {
          _uipart['frame']['x'] = parseInt(_uipart['frame']['x']) + 5;
          _uipart['frame']['y'] = parseInt(_uipart['frame']['y']) + 5;
        }

        if(_uipart['viewType'] === "TileList") {
          const tileItems = _uipart.dataarray[0].Fields;          
          for (let t = 0; t < tileItems.length; t++) {
            const tileElem = tileItems[t]['uiParts'][_scrIndex];
            if(tileElem) {
              const elemName = setUIpartName(tileElem['name'], _scrIndex);
              tileElem['name'] = elemName;
            }            
          }
          //console.log(_scrIndex, "....copy Tilelist #### >>>", tileItems);
        }else if(_uipart['viewType'] === "Dialog") {
          const dialogItems = _uipart.dataarray[0].Fields;          
          for (let t = 0; t < dialogItems.length; t++) {
            const dialogElem = dialogItems[t]['uiParts'][_scrIndex];
            if(dialogElem) {
              const elemName = setUIpartName(dialogElem['name'], _scrIndex);
              dialogElem['name'] = elemName;
            }            
          }
          //console.log(_scrIndex, "....copy Dialog #### >>>", dialogItems);
        }else if(_uipart['viewType'] === "ExpansionPanel") {
          const panelItems = _uipart.panelItems;          
          for (let e = 0; e < panelItems.length; e++) {
            const panelObjFields = panelItems[e].Fields;          
            for (let p = 0; p < panelObjFields.length; p++) {
              const panelElem = panelObjFields[p]['uiParts'][_scrIndex];
              if(panelElem) {
                const elemName = setUIpartName(panelElem['name'], _scrIndex);
                panelElem['name'] = elemName;
              }            
            }            
          }
        }else if(_uipart['viewType'] === "SwipeableView") {
          const swipeableItems = _uipart.swipeableItems;          
          for (let s = 0; s < swipeableItems.length; s++) {
            const swipeObjFields = swipeableItems[s].Fields;          
            for (let v = 0; v < swipeObjFields.length; v++) {
              const swipeElem = swipeObjFields[v]['uiParts'][_scrIndex];
              if(swipeElem) {
                const elemName = setUIpartName(swipeElem['name'], _scrIndex);
                swipeElem['name'] = elemName;
              }            
            }            
          }
        }
      }
      _uipart['frame'] = setUIpartFrame(_uipart['frame'], props.targetEditor, _scrIndex);
      if(_uipart['taborder']) {
        _uipart.taborder = _uipart['displayOrderOnScreen'];
      }
      //uiContainer.uiParts.push(_uipart);
      //props.onSelectUI(_uipart);

      if(!_uipart["_uid"] || _uipart["_uid"] === "") {
        _uipart["_uid"] = _uipart['name'] + '_' + Date.now().toString(36);
      }

      if(screens.length > 1) {
        let scaleW = 1, scaleH = 1;
        for (let i = 0; i < screens.length; i++) {
          //if(i === _scrIndex) continue; 
          if(i !== _scrIndex) {

            let _suipart = JSON.parse(JSON.stringify(_uipart));
            _suipart['name'] = setUIpartName(_suipart['name'], i);
            scaleW = screens[i].width/screens[_scrIndex].width;
            scaleH = screens[i].height/screens[_scrIndex].height;
            _suipart.frame.x = _uipart.frame.x;//Math.floor(_uipart.frame.x * scaleW);
            _suipart.frame.y = _uipart.frame.y;//Math.floor(_uipart.frame.y * scaleH);
            _suipart.frame.width = Math.floor(_uipart.frame.width * scaleW);
            _suipart.frame.height = Math.floor(_uipart.frame.height * scaleH);
  
            if(!enableforAllScreen) {
              _suipart['_enabledOnScreen'] = false;
            }
  
            uiContainer.uiParts.push(_suipart);
          }else {
            if(!enableforAllScreen) {
              _uipart['_enabledOnScreen'] = true;
            }
            uiContainer.uiParts.push(_uipart);
          }
        }        
      }else {
        uiContainer.uiParts.push(_uipart);
      }
      props.onSelectUI(_uipart);
      //console.log(props, sourceEditor, mode, props.targetEditor, "....handleUIPaste >>>", cutcopyUIObj, "******", uiContainer, editorChildrenArr);

      resetSelection_UIContainers(editorChildrenArr);
      uiContainer['selected'] = true;
      editorChildrenArr.push(uiContainer); 
      
      if(screens.length > 1) {
        //console.log(props.data, "....handleUIPaste >>>", sourceEditor, mode, props.targetEditor, " >>>>>", cutcopyUIObj, "******", uiContainer, editorChildrenArr);
        setMultiToolbarsChildren(props, props.targetEditor, screens, selectedScreen, "add", uiContainer);
      }

      if(!isMulti) {     
        props.onUpdatePage(props.data);

        let _page = JSON.parse(JSON.stringify(props.data));
        const layoutState = props.pagestate;
        if(layoutState) {
          let undoState = layoutState['undo'];
          if(undoState) {
            if(undoState.length > 10) {
              undoState.shift();        
            }
            undoState.push(_page);
          }
        }
      }

    }else {      
      setOpenalert(true);
      setAlertMsg("Select at-least one UI to cut/copy & paste.");
    }
  }

  function validateDroppedUI(_viewType, _props) {
    let validationMsg = "";
    //console.log(_props.targetEditor, "... validateDroppedUI ....", _viewType, _props);

    //// container based validation

    if(_props.editorParent && _props.editorParent.hasOwnProperty("source")) {
      if(_props.editorParent['source'] === "overlay") {
        const allowedUI = (_viewType === "Dialog" || _viewType === "Drawer") ? true : false;
        if(!allowedUI){
          validationMsg = "Only 'Dialog' or 'Drawer' UI allowed on Page Overlay.";
          return validationMsg;
        }
      }else if(_props.editorParent.source === "Dialog" || _props.editorParent.source === "Drawer"){
        const notallowedUIparts = ['Dialog', 'Drawer', 'SoundBox', 'VideoBox', 'ExpansionPanel', 'SwipeableView'];
        const findUI = notallowedUIparts.find(element => element  === _viewType);
        const isNotAllowedUI = (findUI) ? true : false;
        if(isNotAllowedUI){          
          validationMsg = _viewType+" UI part not allowed here.";
          return validationMsg;
        }
      }else if(_props.editorParent['source'] === "ExpansionPanel" || _props.editorParent['source'] === "SwipeableView") {
        if(_viewType === "Dialog" || _viewType === "Drawer"){
          validationMsg = "'"+_viewType+"' UI not allowed here.";
          return validationMsg;
        }
      }else if(_props.editorParent['source'] === "DataGrid") {
        const datagridUI = _props.editorParent['ui'];
        let index = (_props.editorParent["index"]) ? _props.editorParent["index"] : 0;
        let dataCols = datagridUI['dataCols'];
        if(dataCols[index]['headerFields'] && dataCols[index]['headerFields'].length === 5){  // will make it 1 or 2 later
          validationMsg = "No more UI part(s) allowed in header field.";
          return validationMsg;
        }
      }else if(_props.editorParent['source'] === "Form") {
        if(_viewType === "Dialog" || _viewType === "Drawer"){          
          validationMsg = "'"+_viewType+"' UI not allowed here.";
          return validationMsg;
        }else{
          const formUI = _props.editorParent['ui'];
          let index = (_props.editorParent["index"]) ? _props.editorParent["index"] : 0;
          let formItems = formUI['formItems'];
          if(formItems[index]['Fields'].length === 1){            
            validationMsg = "Only one UI part allowed in one form item.";
            return validationMsg;
          }
        }
      }
    }else{
      
      if(_viewType === "Dialog" || _viewType === "Drawer"){
        validationMsg = _viewType+" UI allowed on 'Page Overlay' only";
        return validationMsg;
      } 
      
      if(_props.targetEditor){
        if(_props.targetEditor === "tablecell"){
          const allowedUIparts = ['Label','TextField','NumericField','TextView','Image','Avatar','LinkLabel','RoundButton','TextButton',
                                    'ImageButton','IconButton','Switch','ToggleButton','CheckBox','RadioButton','ActionButton',
                                    'ComboBox','Slider','ProgressBar'];
          const findUI = allowedUIparts.find(element => element  === _viewType);
          const isAllowedUI = (findUI) ? true : false;
          if(!isAllowedUI){
              validationMsg = _viewType+" UI part not allowed here.";
              return validationMsg;
          }
        }else if(_props.targetEditor.toLowerCase().indexOf('overlay') > -1) {
          const allowedUI = (_viewType === "Dialog" || _viewType === "Drawer") ? true : false;
          if(!allowedUI){
            validationMsg = "Only 'Dialog' or 'Drawer' UI allowed on Page Overlay.";
            return validationMsg;
          }
        }else if(_props.targetEditor === "Popover"){
          const allowedUIparts = ['Label','TextField','NumericField','TextView','Image','Avatar','LinkLabel','RoundButton','TextButton',
                                  'ImageButton','IconButton','CheckBox','RadioButton','ActionButton',
                                  'ComboBox','DataGrid','TileList'];
          const findUI = allowedUIparts.find(element => element  === _viewType);
          const isAllowedUI = (findUI) ? true : false;
          if(!isAllowedUI){
              validationMsg = _viewType+" UI part not allowed here.";
              return validationMsg;
          }
        }else if(_props.targetEditor === "NestedList" || _props.targetEditor === "SubNestedList"){
          const notallowedUIparts = ['Dialog','Drawer','SoundBox','VideoBox','ExpansionPanel','SwipeableView','Popover',
            'DataGrid','TileList','Carousel','ChatBot','DynamicUI','FormView','Form','NestedList'];
          const findUI = notallowedUIparts.find(element => element  === _viewType);
          const isNotAllowedUI = (findUI) ? true : false;
          if(isNotAllowedUI){
              validationMsg = _viewType+" UI part not allowed here.";
              return validationMsg;
          }
        }
      }
    }    

    //// UI-parts based validation
    
    if(_viewType === "TileList") {
      const allowedContainers = ['page','topToolbar','Dialog','Drawer','ExpansionPanel','SwipeableView'];
      const findContainer = allowedContainers.find(element => element === props.targetEditor);
      const isAllowedContainer = (findContainer) ? true : false;
      if(!isAllowedContainer){
        validationMsg = "TileList UI part not allowed here.";
        return validationMsg;
      }

    }else if(_viewType === "Dialog" || _viewType === "Drawer") {
      if(_props.targetEditor) {
        if(_props.targetEditor.toLowerCase().indexOf('overlay') === -1) {
          validationMsg = _viewType + " UI allowed on 'Page Overlay' only.";
          return validationMsg;
        }else {
          let overlayChildren = _props.currentPage['pageOverlay']['Children'];
          if(overlayChildren && overlayChildren.length > 0){
            const findDialogUI = overlayChildren.find(element => element['viewType']  === _viewType);
            if(findDialogUI) {
              validationMsg = "Only one "+ _viewType +" UI allowed.";
              return validationMsg;
            }
          }
        }
      }
    }else if(_viewType === "HeatMap" || _viewType === "Chart" || _viewType === "TimelineChart" || _viewType === "GaugeChart") {
      if(props.targetEditor === "tablecell" || props.targetEditor === "TileList") {
        validationMsg = _viewType + " UI part not allowed here.";
        return validationMsg;
      }

    }else if(_viewType === "ExpansionPanel" || _viewType === "SwipeableView") {
      const notAllowedContainers = ['tablecell','subtablecell','topToolbar','bottomToolbar','TileList','Dialog','Drawer','ExpansionPanel','SwipeableView'];
      const findContainer = notAllowedContainers.find(element => element === props.targetEditor);
      const isNotAllowedContainer = (findContainer) ? true : false;
      if(isNotAllowedContainer){
        const uiName = (_viewType === "ExpansionPanel") ?  "Expansion Panel" : "Swipeable View";
        validationMsg = uiName + " not allowed here.";
        return validationMsg;
      }

    }else if(_viewType === "DataGrid") {
      const notAllowedContainers = ['tablecell','subtablecell','topToolbar','bottomToolbar','leftToolbar','rightToolbar','TileList','SwipeableView'];
      const findContainer = notAllowedContainers.find(element => element === props.targetEditor);
      const isNotAllowedContainer = (findContainer) ? true : false;
      if(isNotAllowedContainer){
        validationMsg = "Data Grid UI part not allowed here.";
        return validationMsg;
      }
    }else if(_viewType === "GoogleSignIn") {
      const allowedContainers = ['page','topToolbar','bottomToolbar','leftToolbar','rightToolbar','Dialog','Drawer'];
      const findContainer = allowedContainers.find(element => element === props.targetEditor);
      const isAllowedContainer = (findContainer) ? true : false;
      if(!isAllowedContainer){
        validationMsg = "Google SignIn UI part not allowed here.";
        return validationMsg;
      }
    }else if(_viewType === "Popover") {
      const allowedContainers = ['page','tablecell'];
      const findContainer = allowedContainers.find(element => element === props.targetEditor);
      const isAllowedContainer = (findContainer) ? true : false;
      if(!isAllowedContainer){
        validationMsg = "Popover UI not allowed here.";
        return validationMsg;
      }
    }else if(_viewType === "Form" || _viewType === "FormView"){
      const allowedContainers = ['page','Dialog','Drawer','SwipeableView'];
      const findContainer = allowedContainers.find(element => element === props.targetEditor);
      const isAllowedContainer = (findContainer) ? true : false;
      if(!isAllowedContainer){
        validationMsg = "FormView UI part not allowed here.";
        return validationMsg;
      }
    }else if(_viewType === "NestedList") {
      const allowedContainers = ['page','ExpansionPanel','Dialog','Drawer'];
      const findContainer = allowedContainers.find(element => element === this.props.source);
      const isAllowedContainer = (findContainer) ? true : false;
      if(!isAllowedContainer){
        validationMsg = "Nested List UI part not allowed here.";
        return validationMsg;
      }
    }    
  
    const mediaUIparts =['Camera','SoundBox','VideoBox','GoogleMap','GoogleSignIn'];
    const findMediaUI = mediaUIparts.find(element => element  === _viewType);
    const isMediaUI = (findMediaUI) ? true : false;
    
    const _scrIndex = parseInt(selectedScreen);
    const pgChildren = getAllChildrenOnPage(props.data, _scrIndex);//_props['allChildren'];
    pgChildren.forEach(uipart => {    
      if(isMediaUI && uipart['viewType'] === _viewType) {
        validationMsg = "Only one same type of media UI supported on a page.";
      }    
    });
  
    return validationMsg;
  }

  function getChildrenArray(targetEditor, scrIndex, pagedata) {
    //console.log(targetEditor, "...getChildrenArray >>>>", props);
    const scrId = (scrIndex)  ? scrIndex : 0;

    let _data = (pagedata) ? pagedata : props.data;
    switch (targetEditor) {
      case "page":
        if(_data.viewType === "BaseView") {
          return _data.Children;
        }else if(_data.viewType === "ScrollView") {
          return _data.Children[0].Children;
        }else if(_data['viewType'].indexOf('TableView') > -1) {
          if(_data.Children[0]['_tmpCellStyle'] === "custom") {
            const tableGroup = _data.Children[0].Group;
            return tableGroup[0].RecordCellDef.Fields;
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
        if(_data['viewType'].indexOf('TableView') > -1) {
          if(_data.Children[0]['_tmpCellStyle'] === "custom") {
            const tableGroup = _data.Children[0].Group;
            return tableGroup[0].RecordCellDef.Fields;
          }
        }
        return _data.Children;
      case "subtablecell":
        if(_data['viewType'].indexOf('NestedList') > -1) {
          if(_data.Children[0]['_tmpCellStyle'] === "custom") {
            const tableGroup = _data.Children[0].Group;
            return tableGroup[0].SubRecordCellDef.Fields;
          }
        }
        return _data.Children; 
        
      case "overlay":
        if(_data['pageOverlay']) {
          return _data['pageOverlay'].Children
        }
        return _data.Children;

      case "pageOverlay":
      case "Dialog":
      case "Drawer":
        if(_data['pageOverlay'] && _data['pageOverlay'].Children[0]) {
          /*if(_data['pageOverlay'].Children[0].uiParts[scrId]) {
            return _data['pageOverlay'].Children[0].uiParts[scrId].dataarray[0].Fields;
          }*/

          let dialogUI;
          const overlayChildren = _data['pageOverlay']['Children'];
          if(overlayChildren.length > 1) {
            let overlayUI = overlayChildren.filter(function(uipart) {
              if(uipart['viewType'] === targetEditor) {
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

          if(dialogUI) {
            const dindx = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
            if(dialogUI.uiParts[scrId].dataarray[dindx]){
              return dialogUI.uiParts[scrId].dataarray[dindx].Fields;
            }else{
              return dialogUI.uiParts[scrId].dataarray[0].Fields;
            }
          }
        }
        return _data['pageOverlay'].Children;

      case "TileList":
        const _uidata = (props.editorParent) ? props.editorParent['ui'] : "";
        if(_uidata !== "" && _uidata['viewType'] === "TileList"){
          return _uidata.dataarray[0].Fields;
        }
        return _data.Children;

      case "ExpansionPanel":
        const expnPanelUI = props.editorParent['ui'];
        let indx = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
        let panelItems = expnPanelUI['panelItems'];
        return panelItems[indx]['Fields'];
        
      case "SwipeableView":
        const swipeViewUI = props.editorParent['ui'];
        let idx = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
        let swipeableItems = swipeViewUI['swipeableItems'];
        return swipeableItems[idx]['Fields'];
        
      case "Form":
      case "FormView":
        const formUI = props.editorParent['ui'];
        let index = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
        let formItems = formUI['formItems'];
        return formItems[index]['Fields'];

      case "DataGrid":
        const dataGridUI = props.editorParent['ui'];
        const colIndex = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
        const arrDataCols = dataGridUI.dataCols;        
        return arrDataCols[colIndex]['Fields'];
      
      case "ScrollableVIew":
        const scrollableUI = (props.editorParent) ? props.editorParent['ui'] : "";
        if(scrollableUI !== "" && scrollableUI['viewType'] === "ScrollableVIew"){
          return scrollableUI.dataarray[0].Fields;
        }
        return _data.Children;

      case "Popover":
        const popoverUI = (props.editorParent) ? props.editorParent['ui'] : "";
        return popoverUI.dataarray[0].Fields;

      case "NestedList":
        const nestedlistUI = (props.editorParent) ? props.editorParent['ui'] : "";
        const maincellFields = nestedlistUI.mainCellDef.Fields;
        //const subcellFields = nestedlistUI.subCellDef.Fields;
        //return maincellFields.concat(subcellFields);
        return maincellFields;

      case "SubNestedList":
        const subnestedlistUI = (props.editorParent) ? props.editorParent['ui'] : "";
        const subcellFields = subnestedlistUI.subCellDef.Fields;
        return subcellFields;
     
      default:
        return getChildrenArray("page", scrIndex, pagedata);
    }
  }

  function setUIpartName(uiname, scrIndex) {
    //console.log(mode, "setUIpartName >>>", uiname);
    let pastedUIname = uiname;
    //if(mode === "copy"){
      pastedUIname = validateUIname(pastedUIname, scrIndex);
    //}

    return pastedUIname;
  }
  function validateUIname(uiname, scrIndex) {
    let uiPartsName = [];
    
    const _allChildren = getAllChildrenOnPage(props.data, scrIndex);//props['allChildren'];
    _allChildren.forEach((element, i) => { 
      let uipart = element['uiParts'][scrIndex];
      if(uipart){
        let displayName = uipart.name;			
        uiPartsName.push(displayName);
      }else{
        console.log("...undefined Ui-part >>>", i);
      }
    });
    uiPartsName.sort();
    //console.log(uiname, "...validateUIname >>>", _allChildren.length, uiPartsName);

    let cnt = 0;
    let validname = uiname;// +"_"+ cnt;
    for(let i= 0; i< uiPartsName.length; i++)
		{
      if(validname === uiPartsName[i]) {
        cnt +=1;
        validname = uiname +"_"+ cnt
      }
		}
    
    return validname;
  }

  function getUIpart_orderIndex(uichildren, scrId) {
    const lastUIchildren = uichildren[uichildren.length -1];     
    if(lastUIchildren){
      return lastUIchildren.uiParts[scrId].displayOrderOnScreen;
    }
  
    return uichildren.length;
  }

  function setUIpartFrame(uiframe, targetEditor, scrIndex) {
    let _data = props.data;
    let pastedUIframe = uiframe;
    //console.log(targetEditor, props, "... setUIpartFrame ....", _data, pastedUIframe);

    let targetFrame = {};
    switch (targetEditor) {
      case "page":
        if(_data.viewType === "BaseView") {
          if(scrIndex > 0){
            const scrFrame = props.appData['availableScreens'][scrIndex];
            if(scrFrame) {
              targetFrame = {x:0, y:0, width:scrFrame['width'], height:scrFrame['height']};
            }else{
              targetFrame = _data.frame;
            }
          }else{
            targetFrame = _data.frame;
          }
        }else if(_data.viewType === "ScrollView") {
          targetFrame = _data.Children[0]._frames[scrIndex];
        }else if(_data.viewType.indexOf("TableViewList") > -1) {
          const _cellheight = (_data.Children[0].Group[0].RecordCellDef) ? _data.Children[0].Group[0].RecordCellDef['height'] : 50;
          targetFrame = {x:0, y:0, width:_data.frame['width'], height:_cellheight};
        }
        break;
      case "tablecell":
        const _cellheight = (_data.Children[0].Group[0].RecordCellDef) ? _data.Children[0].Group[0].RecordCellDef['height'] : 50;
        targetFrame = {x:0, y:0, width:_data.frame['width'], height:_cellheight};
        break;
      case "topToolbar":
        targetFrame = _data._toolBarTop[scrIndex].frame;
        targetFrame['width'] = _data.frame['width'];
        break;
      case "bottomToolbar":
        targetFrame = _data._toolBarBottom[scrIndex].frame;
        targetFrame['width'] = _data.frame['width'];
        break;
      case "leftToolbar":
        targetFrame = _data._toolBarLeft[scrIndex].frame;
        break;
      case "rightToolbar":
        targetFrame = _data._toolBarRight[scrIndex].frame;
        break;
      case "pageOverlay":
        targetFrame = _data.frame;
        break;
      case "TileList":
        if(props.editorParent && props.editorParent['ui']) {
          const tileUI = props.editorParent['ui'];
          targetFrame['width'] = parseInt(tileUI.dataarray[0]['width']);
          targetFrame['height'] = parseInt(tileUI.dataarray[0]['height']);
        }        
        break;
      case "Dialog":
        if(props.editorParent && props.editorParent['ui']) {
          const dialogUI = props.editorParent['ui'];
          const editorwidth = parseInt(dialogUI.dataarray[0].width) - parseInt(dialogUI.padding.left + dialogUI.padding.right);
          targetFrame['width'] = editorwidth;
          targetFrame['height'] = parseInt(dialogUI.dataarray[0]['height']);
        }        
        break;
      case "Drawer":
        if(props.editorParent && props.editorParent['ui']) {
          const drawerUI = props.editorParent['ui'];
          const scrFrame = props.appData['availableScreens'][scrIndex];
          const editorwidth = parseInt(scrFrame.width) - parseInt(drawerUI.padding.left + drawerUI.padding.right);
          targetFrame['width'] = editorwidth;
          targetFrame['height'] = parseInt(drawerUI.dataarray[0]['height']);
        }        
        break;
      case "ExpansionPanel":
        if(props.editorParent && props.editorParent['ui']) {
          const expnPanelUI = props.editorParent['ui'];
          let indx = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          let panelItems = expnPanelUI['panelItems'];
          //targetFrame['width'] = parseInt(panelItems[indx]['width']);
          targetFrame['height'] = parseInt(panelItems[indx]['height']);
        }        
        break;
      default:
        targetFrame = _data.frame;
        break;
    }

    //console.log(pastedUIframe, "***** setUIpartFrame *****", targetFrame);
    if(parseInt(pastedUIframe['x']) > parseInt(targetFrame['width'])) {
      pastedUIframe['x'] = parseInt(targetFrame['width']) - parseInt(pastedUIframe['width']);
    }
    else if(parseInt(pastedUIframe['x']) + parseInt(pastedUIframe['width']) > parseInt(targetFrame['width'])) {
      pastedUIframe['x'] = parseInt(targetFrame['width']) - parseInt(pastedUIframe['width']);
    }

    if(parseInt(pastedUIframe['y']) > parseInt(targetFrame['height'])) {
      pastedUIframe['y'] = parseInt(targetFrame['height']) - parseInt(pastedUIframe['height']);
    }
    else if(parseInt(pastedUIframe['y']) + parseInt(pastedUIframe['height']) > parseInt(targetFrame['height'])) {
      pastedUIframe['y'] = parseInt(targetFrame['height']) - parseInt(pastedUIframe['height']);
    }

    if(parseInt(pastedUIframe['x']) < 0) {
      pastedUIframe['x'] = 0;
    }
    if(parseInt(pastedUIframe['y']) < 0) {
      pastedUIframe['y'] = 0;
    }
    if(parseInt(pastedUIframe['width']) > parseInt(targetFrame['width'])) {
      pastedUIframe['width'] = parseInt(targetFrame['width']);
    }
    if(parseInt(pastedUIframe['height']) > parseInt(targetFrame['height'])) {
      pastedUIframe['height'] = parseInt(targetFrame['height']);
    }

    if(targetEditor && targetEditor.toLowerCase().indexOf('overlay') > -1) {
      pastedUIframe['x'] = pastedUIframe['y'] = 0;
    }

    return pastedUIframe;
  }
  
  function resetSelection_UIContainers(editorChildren) {
    editorChildren.forEach(container => {
      delete container['selected'];
    });
  }

  function setMultiToolbarsChildren(_props, targetEditor, screensArr, currentScreenIndex, type, cutUIdef, childrenArr) {
    const pageData = _props.data;
    currentScreenIndex = (currentScreenIndex) ? parseInt(currentScreenIndex) : 0;
    const pageChildren = getAllChildrenOnPage(pageData, currentScreenIndex);//getChildrenArray("page", this.props['pagedata']);
    //console.log(currentScreenIndex, type, cutUIdef, ".... paste uipart in toolbar >>>> ", targetEditor, pageData);

    if(targetEditor.toLowerCase().indexOf("toolbar") > -1) {
      let barType;
      if(targetEditor === "topToolbar")           barType = "_toolBarTop";
      else if(targetEditor === "bottomToolbar")   barType = "_toolBarBottom";
      else if(targetEditor === "leftToolbar")     barType = "_toolBarLeft";
      else if(targetEditor === "rightToolbar")    barType = "_toolBarRight";

      
      const toolbarChildren = JSON.parse(JSON.stringify(pageData[barType][currentScreenIndex]['Children']));
      for (let i = 0; i < screensArr.length; i++) {
        if(i !== currentScreenIndex) {         
          
          if(cutUIdef) {
            let _slaveScreen_toolbarChildren = pageData[barType][i]['Children'];
            if(type === "delete") {
              for (let index = 0; index < _slaveScreen_toolbarChildren.length; index++) {
                const uidef = _slaveScreen_toolbarChildren[index];
                let uidefparts = uidef['uiParts'];
                if(uidefparts && (uidefparts[i]['name'] === cutUIdef[0]['uiParts'][i]['name'])) {
                  _slaveScreen_toolbarChildren.splice(index, 1);
                  break;
                }                
              }
            }else {
              //console.log(barType, type, cutUIdef, i, ".... paste uipart in toolbar >>>> ", _slaveScreen_toolbarChildren);
              const pastedUI = JSON.parse(JSON.stringify(cutUIdef));
              pastedUI['selected'] = false;
              /*for(let aa=0; aa< pastedUI['uiParts'].length; aa++){
                if(aa !== i){
                  pastedUI['uiParts'][aa] = {};
                }else{
                  delete cutUIdef['selected'];
                  cutUIdef['uiParts'][aa] = {};
                }
              }*/
              _slaveScreen_toolbarChildren.push(pastedUI);
            }
          }else {
            pageData[barType][i]['Children'] = toolbarChildren;
          }
        }     
        

        /* if(i === currentScreenIndex)  continue;

        if(type === "delete") {
          if(cutUIdef) {
            let _slaveScreen_toolbarChildren = pageData[barType][i]['Children'];
            for (let index = 0; index < _slaveScreen_toolbarChildren.length; index++) {
              const uidef = _slaveScreen_toolbarChildren[index];
              let uidefparts = uidef['uiParts'];
              if(uidefparts && (uidefparts[i]['name'] === cutUIdef[0]['uiParts'][i]['name'])) {
                _slaveScreen_toolbarChildren.splice(index, 1);
                break;
              }                
            }
          }else {
            pageData[barType][i]['Children'] = toolbarChildren;
          }
        }else {
          pageData[barType][i]['Children'] = toolbarChildren;          
        } */

      }
    }
    else if(targetEditor === "TileList") {
          
      let tilelistUI;
      if(pageChildren.length > 1) {
        const sourceUI = _props['editorParent']['ui'];
        pageChildren.forEach(uipart => {
          if(uipart['viewType'] === "TileList" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
            tilelistUI = uipart;
          }
        });
      }else {
        tilelistUI = pageChildren[0];
      }
      
      if(tilelistUI) {
        const tilelistChildren = JSON.parse(JSON.stringify(tilelistUI['uiParts'][currentScreenIndex]['dataarray'][0]['Fields']));
        for (let i = 0; i < screensArr.length; i++) {
          if(i === currentScreenIndex)      continue;

          tilelistUI['uiParts'][i]['dataarray'][0]['Fields'].push(tilelistChildren[tilelistChildren.length -1]); 
        }

        if(tilelistUI['parent'] === "Dialog") {
          const _dialogUI = pageData['pageOverlay']['Children'][0];
          for (let l = 0; l < screensArr.length; l++) {
            if(l === currentScreenIndex)  continue;
            
            let _slaveScreen_dialogChildren = _dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
            for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
              const uidef = _slaveScreen_dialogChildren[index];
              let uidefparts = uidef['uiParts'];
              if(uidef['viewType'] === "TileList" && (uidefparts[l]['name'] === tilelistUI['uiParts'][l]['name'])) {             
                uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']))
                break;
              }                
            }
          }
        }else if(tilelistUI['parent'] === "topToolbar"){
          for (let t = 0; t < screensArr.length; t++) {
            if(t === currentScreenIndex)  continue;
            let _slaveScreen_topBarChildren = pageData["_toolBarTop"][t]['Children'];
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
      }
    }
    else if(targetEditor === "NestedList" || targetEditor === "SubNestedList") { 
      if(type === "delete") return;

      let nestedlistUI;
      if(pageChildren.length > 1) {
        const sourceUI = _props['editorParent']['ui'];
        pageChildren.forEach(uipart => {
          if(uipart['viewType'] === "NestedList" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
            nestedlistUI = uipart;
          }
        });
      }else {
        nestedlistUI = pageChildren[0];
      }
      
      if(nestedlistUI) {
        const sourceCell = _props['editorParent']['source']; 

        //const nesteduiContainer = (sourceCell === "NestedList") ? nestedlistUI['uiParts'][currentScreenIndex]['mainCellDef']['Fields'] : nestedlistUI['uiParts'][currentScreenIndex]['subCellDef']['Fields'];
        //const nestedlistChildren = JSON.parse(JSON.stringify(nesteduiContainer));
        for (let i = 0; i < screensArr.length; i++) {
          if(i === currentScreenIndex)      continue;

          const pastedUI = JSON.parse(JSON.stringify(cutUIdef));
          if(sourceCell === "NestedList") {
            nestedlistUI['uiParts'][i]['mainCellDef']['Fields'].push(pastedUI); 
          }else{
            nestedlistUI['uiParts'][i]['subCellDef']['Fields'].push(pastedUI); 
          }
        }

        if(nestedlistUI['parent'] === "Dialog") {
          const _dialogUI = pageData['pageOverlay']['Children'][0];
          for (let l = 0; l < screensArr.length; l++) {
            if(l === currentScreenIndex)  continue;
            
            let _slaveScreen_dialogChildren = _dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
            for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
              const uidef = _slaveScreen_dialogChildren[index];
              let uidefparts = uidef['uiParts'];
              if(uidef['viewType'] === "NestedList" && (uidefparts[l]['name'] === nestedlistUI['uiParts'][l]['name'])) {             
                uidef['uiParts'] = JSON.parse(JSON.stringify(nestedlistUI['uiParts']))
                break;
              }                
            }
          }
        }else if(nestedlistUI['parent'] === "ExpansionPanel" || nestedlistUI['parent'] === "SwipeableView"){
          let parentUIDef;
          //const pageChildren = getAllChildrenOnPage(pageData, currentScreenIndex);
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if((uipart['viewType'] === "ExpansionPanel" || uipart['viewType'] === "SwipeableView") && (uipart['uiParts'][0]['name'] === nestedlistUI['parentUIName'])) {
                parentUIDef = uipart;
              }
            });
          }
          if(parentUIDef){
            for (let p = 0; p < screensArr.length; p++) {
              if(p === currentScreenIndex)      continue;

              const itemFieldName = (nestedlistUI['parent'] === "ExpansionPanel") ? 'panelItems' : 'swipeableItems';
              let _slaveScreen_panelItems = parentUIDef['uiParts'][p][itemFieldName];
              for (let idx = 0; idx < _slaveScreen_panelItems.length; idx++) {
                const uidef = _slaveScreen_panelItems[idx];
                let panelItemsField = uidef['Fields'];
                for (let pc = 0; pc < panelItemsField.length; pc++) {
                  let uidefparts = panelItemsField[pc]['uiParts']; 
                  if(uidefparts && uidefparts.length > 0) {
                    if(panelItemsField[pc]['viewType'] === "NestedList" && (uidefparts[p]['name'] === nestedlistUI['uiParts'][p]['name'])) {
                      panelItemsField[pc]['uiParts'] = JSON.parse(JSON.stringify(nestedlistUI['uiParts']))
                      break;
                    }else {
                      delete panelItemsField[pc]['selected'];
                    }
                  }else {
                    delete uidef['selected'];
                  }								
                }            
              }
            }
          }
        }
      }
    }
    else if(targetEditor === "Dialog" || targetEditor === "Drawer") {

      let dialogUI;
      const overlayChildren = pageData['pageOverlay']['Children'];
      if(overlayChildren.length > 1) {
        const sourceUI = _props['editorParent']['ui'];  
        let overlayUI = overlayChildren.filter(function(uipart) {
          if(uipart['viewType'] === targetEditor && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
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

      if(dialogUI && (dialogUI['viewType'] === "Dialog" || dialogUI['viewType'] === "Drawer")){

        //const dialogChildren = JSON.parse(JSON.stringify(dialogUI['uiParts'][currentScreenIndex]['dataarray'][0]['Fields']));
        for (let j = 0; j < screensArr.length; j++) {
          if(j === currentScreenIndex)  continue;
          //dialogUI['uiParts'][j]['dataarray'][0]['Fields'] = dialogChildren;
          
          const containerIndex = (_props['editorParent']['index']) ? _props['editorParent']['index'] : 0;
          if(dialogUI['uiParts'][j]['dataarray'][containerIndex]){
            let _slaveScreen_dialogChildren = dialogUI['uiParts'][j]['dataarray'][containerIndex]['Fields'];
            _slaveScreen_dialogChildren.forEach(element => {
              delete element['selected'];
            });

            if(containerIndex === 0){          
              const pastedUI = JSON.parse(JSON.stringify(cutUIdef));        
              /*for(let aa=0; aa< pastedUI['uiParts'].length; aa++){
                if(aa !== j){
                  pastedUI['uiParts'][aa] = {};
                }else{
                  delete cutUIdef['selected'];
                  cutUIdef['uiParts'][aa] = {};
                }
              }*/
             
              _slaveScreen_dialogChildren.push(pastedUI);
            }
          }  
        }
        //console.log(dialogUI, ".... paste uipart in dialog >>>> ", dialogChildren);
      }      
    }
    else if(targetEditor === "ExpansionPanel" || targetEditor === "SwipeableView") {

      let panelUI;      
      const parentUI = _props['editorParent']['ui'];
      if(pageChildren.length > 1) {
        pageChildren.forEach(uipart => {
          if(uipart['viewType'] === targetEditor && (uipart['uiParts'][currentScreenIndex]['name'] === parentUI['name'])) {
            panelUI = uipart;
          }
        });
      }

      if(panelUI) {        
        let sourceUI;
        for (let i = 0; i < panelUI['uiParts'].length; i++) {
          if(i === currentScreenIndex)  continue;
          sourceUI = panelUI['uiParts'][i];          
        }
        
        if(sourceUI) {
          const pastedUI = JSON.parse(JSON.stringify(cutUIdef));

          const itemFieldName = (sourceUI['viewType'] === "ExpansionPanel") ? 'panelItems' : 'swipeableItems';
          const arrrPanelItems = sourceUI[itemFieldName];
    
          const panelIndex = _props['editorParent']['index'];
          let panelObj = arrrPanelItems[panelIndex];
          panelObj['Fields'].push(pastedUI);  

        }
      }
    }else if(targetEditor === "DataGrid") {

      let dataGridUI;      
      const parentUI = _props['editorParent']['ui'];
      if(pageChildren.length > 1) {
        pageChildren.forEach(uipart => {
          if(uipart['viewType'] === targetEditor && (uipart['uiParts'][currentScreenIndex]['name'] === parentUI['name'])) {
            dataGridUI = uipart;
          }
        });
      }

      if(dataGridUI) {        
        let sourceUI;
        for (let i = 0; i < dataGridUI['uiParts'].length; i++) {
          if(i === currentScreenIndex)  continue;
          sourceUI = dataGridUI['uiParts'][i];          
        }
        
        if(sourceUI) {
          const pastedUI = JSON.parse(JSON.stringify(cutUIdef));

          const arrColItems = sourceUI['dataCols'];    
          const colIndex = _props['editorParent']['index'];
          let colObj = arrColItems[colIndex];

          if(_props['editorParent']['fieldContainer'] && _props['editorParent']['fieldContainer'] === "headerFields"){
            if(colObj && colObj['isCustomHeader']){
              colObj['headerFields'].push(pastedUI);  
            }
          }else if(colObj && colObj['isCustom']){
            colObj['Fields'].push(pastedUI);  
          }

          _props['editorParent']['ui']['dataCols'] = arrColItems;
          //console.log(currentScreenIndex, "pe DG paste >>>>", arrColItems, _props['editorParent']['ui']);
        }
      }
    }else if(targetEditor === "Popover") {

      let popoverUI;      
      const parentUI = _props['editorParent']['ui'];
      if(pageChildren.length > 1) {
        pageChildren.forEach(uipart => {
          if(uipart['viewType'] === targetEditor && (uipart['uiParts'][currentScreenIndex]['name'] === parentUI['name'])) {
            popoverUI = uipart;
          }
        });
      }

      if(popoverUI) { 
        for (let j = 0; j < screensArr.length; j++) {
          if(j === currentScreenIndex)  continue;
          
          let _slaveScreen_popoverChildren = popoverUI['uiParts'][j]['dataarray'][0]['Fields'];
          _slaveScreen_popoverChildren.forEach(element => {
            delete element['selected'];
          });
  
          const pastedUI = JSON.parse(JSON.stringify(cutUIdef));
          _slaveScreen_popoverChildren.push(pastedUI);
        }      
      }    
    }

  }

  function handleUIForward() {
    if(props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if(props.selectedUI && props.selectedUI.hasOwnProperty('viewType')){
      let pageChildren = getUIData_byContainer(props, props['targetEditor'], selectedScreen);  //props.data['Children'];
      if(pageChildren.length === 0){
        return;
      }
      const lastUIElement = pageChildren[pageChildren.length-1];
      let lastUI_displayOrder = (lastUIElement['uiParts'][selectedScreen]) ? parseInt(lastUIElement['uiParts'][selectedScreen]['displayOrderOnScreen']) : pageChildren.length-1;
      if(props.selectedUI['displayOrderOnScreen'] === lastUI_displayOrder){
        setOpenalert(true);
        setAlertMsg("This can't be forward more.");
        return;
      }

      let _index = -1;
      for (let i = 0; i < pageChildren.length; i++) {
        const child = pageChildren[i];
        let uipart = (child['uiParts'][selectedScreen]) ? child['uiParts'][selectedScreen] : child['uiParts'][0];
        if(uipart.name === props.selectedUI['name'] && uipart.viewType === props.selectedUI['viewType']){
          uipart['displayOrderOnScreen'] = parseInt(uipart['displayOrderOnScreen']) +1;
          _index = i+1;
        }else {
          if(i === _index) {
            uipart['displayOrderOnScreen'] = parseInt(uipart['displayOrderOnScreen']) -1;
          }
        }
      }

      updateMultiScreen_displayOrderOnScreen(props, props['targetEditor'], selectedScreen);
      props.onUpdatePage(props.data);

    }else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send forward.");
    }
  }

  function handleUIFront() {
    if(props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if(props.selectedUI && props.selectedUI.hasOwnProperty('viewType')){
      let pageChildren = getUIData_byContainer(props, props['targetEditor'], selectedScreen);    //props.data['Children'];
      if(pageChildren.length === 0){
        return;
      }
      const lastUIElement = pageChildren[pageChildren.length-1];
      let lastUI_displayOrder = (lastUIElement['uiParts'][selectedScreen]) ? parseInt(lastUIElement['uiParts'][selectedScreen]['displayOrderOnScreen']) : pageChildren.length-1;
      if(props.selectedUI['displayOrderOnScreen'] === lastUI_displayOrder){
        setOpenalert(true);
        setAlertMsg("This is already foremost.");
        return;
      }

      let _index = -1;
      for (let i = 0; i < pageChildren.length; i++) {
        const child = pageChildren[i];
        let uipart = (child['uiParts'][selectedScreen]) ? child['uiParts'][selectedScreen] : child['uiParts'][0];
        if(uipart.name === props.selectedUI['name'] && uipart.viewType === props.selectedUI['viewType']){
          uipart['displayOrderOnScreen'] = lastUI_displayOrder;
          _index = i;
        }else {
          if(i > _index) {
            uipart['displayOrderOnScreen'] = (uipart['displayOrderOnScreen'] > 0) ? parseInt(uipart['displayOrderOnScreen']) -1 : 0;
          }
        }
      }

      updateMultiScreen_displayOrderOnScreen(props, props['targetEditor'], selectedScreen);
      props.onUpdatePage(props.data);

    }else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send front.");
    }
  }

  function handleUIBackward() {
    if(props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if(props.selectedUI && props.selectedUI.hasOwnProperty('viewType')){
      if(props.selectedUI['displayOrderOnScreen'] === 0){
        setOpenalert(true);
        setAlertMsg("This can't be back further");
        return;
      }

      let pageChildren = getUIData_byContainer(props, props['targetEditor'], selectedScreen);    //props.data['Children'];
      let _index = -1;
      for (let i = pageChildren.length-1; i >= 0; i--) {
        const child = pageChildren[i];
        let uipart = (child['uiParts'][selectedScreen]) ? child['uiParts'][selectedScreen] : child['uiParts'][0];
        if(uipart.name === props.selectedUI['name'] && uipart.viewType === props.selectedUI['viewType']){
          uipart['displayOrderOnScreen'] = parseInt(uipart['displayOrderOnScreen']) -1;
          _index = i-1;
        }else {
          if(i === _index) {
            uipart['displayOrderOnScreen'] = parseInt(uipart['displayOrderOnScreen']) +1;
          }
        }
        //console.log(i, "...handleUIBackward >>>", uipart.name, uipart['displayOrderOnScreen']);
      }

      updateMultiScreen_displayOrderOnScreen(props, props['targetEditor'], selectedScreen);
      props.onUpdatePage(props.data);

    }else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send backward.");
    }
  }

  function handleUIBack() {
    if(props.selectedUIparts.length > 0) {
      setOpenalert(true);
      setAlertMsg("This operation is not supported for multiple UIs.");
      return;
    }

    if(props.selectedUI && props.selectedUI.hasOwnProperty('viewType')){
      if(props.selectedUI['displayOrderOnScreen'] === 0){        
        setOpenalert(true);
        setAlertMsg("This can't be back further");
        return;
      }

      let pageChildren = getUIData_byContainer(props, props['targetEditor'], selectedScreen);    //props.data['Children'];
      let _index = -1;
      for (let i = pageChildren.length-1; i >= 0; i--) {
        const child = pageChildren[i];
        let uipart = (child['uiParts'][selectedScreen]) ? child['uiParts'][selectedScreen] : child['uiParts'][0];
        if(uipart.name === props.selectedUI['name'] && uipart.viewType === props.selectedUI['viewType']){
          uipart['displayOrderOnScreen'] = 0;
          _index = i;
        }else {
          if(i < _index) {
            uipart['displayOrderOnScreen'] = parseInt(uipart['displayOrderOnScreen']) +1;
          }
        }
        //console.log(i, "...handleUIBack >>>", uipart.name, uipart['displayOrderOnScreen']);
      }

      updateMultiScreen_displayOrderOnScreen(props, props['targetEditor'], selectedScreen);
      props.onUpdatePage(props.data);

    }else {
      setOpenalert(true);
      setAlertMsg("Select a UI to send back");
    }
  }

  //as of now, only toolbar case managed
  function updateMultiScreen_displayOrderOnScreen(propsObj, targetEditor, scrIndex) {

    let changeforAllScreen = false;
    let masterScreenIndex = 0;
    const screens = propsObj.appData['availableScreens'];
    if(screens.length > 1) {        
      screens.forEach((element, i) => {
        if(element['embed']) {
          masterScreenIndex = i;          
        }
      });        
      
      const isMasterSlave = propsObj.appData['isMasterScreenSet'];
      if(isMasterSlave && scrIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }        
    }

    if(changeforAllScreen){
      if(targetEditor.toLowerCase().indexOf("toolbar") > -1) {
        let barType;
        if(targetEditor === "topToolbar")           barType = "_toolBarTop";
        else if(targetEditor === "bottomToolbar")   barType = "_toolBarBottom";
        else if(targetEditor === "leftToolbar")     barType = "_toolBarLeft";
        else if(targetEditor === "rightToolbar")    barType = "_toolBarRight";

        let mainScrChildren;
        for (let s = 0; s < screens.length; s++) {
         if(s === scrIndex){
          mainScrChildren = propsObj['data'][barType][scrIndex]['Children'];
          for (let index = 0; index < mainScrChildren.length; index++) {
            const uidef = mainScrChildren[index];
            let uidefparts = uidef['uiParts'];
            for (let i = 0; i < uidefparts.length; i++) {
              if(i === scrIndex)  continue;
              const uiobj = uidefparts[i];
              uiobj['displayOrderOnScreen'] = uidefparts[scrIndex]['displayOrderOnScreen'];            
            }
          }
         }else{
          let slaveScr_toolbarChildren = propsObj['data'][barType][s]['Children'];
          for (let index = 0; index < slaveScr_toolbarChildren.length; index++) {
            const s_uidef = slaveScr_toolbarChildren[index];
            let s_uidefparts = s_uidef['uiParts'];
            for (let i = 0; i < s_uidefparts.length; i++) {              
              const uiobjName = s_uidefparts[i]['name'];
              const _displayOrder = getDisplayOrder(mainScrChildren, uiobjName, scrIndex);
              if(_displayOrder > -1){
                s_uidefparts[i]['displayOrderOnScreen'] = _displayOrder;
              }
            }            
          }          
         }          
        }        
      }
    }
  }

  function getDisplayOrder(mainScrChildren, uiobjName, scrIndex){
    for (const uidef of mainScrChildren) {
      const mainUIdef = uidef['uiParts'][scrIndex];
      if(mainUIdef['name'] === uiobjName){
        return mainUIdef['displayOrderOnScreen'];
      }
    } 
    return -1;
  }


  ////////////////////////////////

  function handleAlignLeft() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minX = Number.MAX_VALUE;
    let dataModel;
			
		for (let i= 0; i< selectedItems.length; i++)
		{
			dataModel = selectedItems[i]['UI'];
      if(dataModel.frame.x < minX)
        minX = dataModel.frame.x;
		}
			
		for (let j= 0; j< selectedItems.length; j++)
    {
      dataModel = selectedItems[j]['UI'];
      dataModel['frame']['x'] = minX;
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignCenter() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length  < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minX = Number.MAX_VALUE;
		let maxX = Number.MIN_VALUE;
			
		let dataModel;			
		for (let i= 0; i< selectedItems.length; i++)
		{				
      dataModel = selectedItems[i]['UI'];				
      if (dataModel.frame.x < minX)
        minX = parseInt(dataModel.frame.x);				
      if (parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width) > maxX)
        maxX = parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width);				
		}			
		let centerX = parseInt((minX + maxX) / 2);
			
		for (let j= 0; j< selectedItems.length; j++)
		{
      dataModel = selectedItems[j]['UI'];
      dataModel['frame']['x'] = parseInt(centerX - (parseInt(dataModel.frame.width) / 2));
    }
    
    props.onUpdatePage(props.data);
  }

  function handleAlignRight() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length  < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let maxX = Number.MIN_VALUE;
			
		let dataModel;			
		for (let i= 0; i< selectedItems.length; i++)
		{				
      dataModel = selectedItems[i]['UI'];
      if (parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width) > maxX)
        maxX = parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width);
    }
			
		for (var j= 0; j< selectedItems.length; j++)
    {
      dataModel = selectedItems[j]['UI'];
      dataModel['frame']['x'] = maxX - parseInt(dataModel.frame.width);
    }

    props.onUpdatePage(props.data);
  }

  function handleSpacingHorizontal() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length  < 3) {
      setOpenalert(true);
      setAlertMsg("Select at-least 3 UIs for this operation.");
      return;
    }

    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;

    let dataModel;
    let firstObject;
    let lastObject;

    for (let i = 0; i < selectedItems.length; i++)
    {
      dataModel = selectedItems[i]['UI'];      
      if (dataModel.frame.x < minX)
      {
        firstObject = dataModel;
        minX = dataModel.frame.x;
      }
      if (parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width) > maxX)
      {
        maxX = parseInt(dataModel.frame.x) + parseInt(dataModel.frame.width);
        lastObject = dataModel;
      }
    }
    
    let arrMiddleObjs = [];
    let totalWidthOfMiddleObjs = 0;
    selectedItems.forEach(modelItem => {
      let modelObj = modelItem['UI']
      if(modelObj !== firstObject && modelObj !== lastObject)
      {
        let obj = {};
        obj.model = modelObj;
        obj.X = parseInt(modelObj.frame.x);
        arrMiddleObjs.push(obj);
        totalWidthOfMiddleObjs += parseInt(modelObj.frame.width);
      }
    });

    arrMiddleObjs.sort(function(a, b){return a.X - b.X});
    let gap_Between_First_N_Last_Objs = parseInt(lastObject.frame.x) - (parseInt(firstObject.frame.x) + parseInt(firstObject.frame.width));
    let equalSpace = (gap_Between_First_N_Last_Objs - totalWidthOfMiddleObjs)/(arrMiddleObjs.length+1);    
    let prevModel;
    for (let j = 0; j < arrMiddleObjs.length; j++)
    {
      dataModel = arrMiddleObjs[j].model
      prevModel = (j === 0) ? firstObject : arrMiddleObjs[j-1].model;
      let newX = (parseInt(prevModel.frame.x) + parseInt(prevModel.frame.width)) + equalSpace;
      dataModel['frame']['x'] = isNaN(newX) ? 0 : parseInt(newX);
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignTop() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minY = Number.MAX_VALUE;
    let dataModel;
			
		for (let i= 0; i< selectedItems.length; i++)
		{
			dataModel = selectedItems[i]['UI'];
      if(dataModel.frame.y < minY)
        minY = dataModel.frame.y;
		}
			
		for (let j= 0; j< selectedItems.length; j++)
    {
      dataModel = selectedItems[j]['UI'];
      dataModel['frame']['y'] = minY;
    }

    props.onUpdatePage(props.data);
  }

  function handleAlignMiddle() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length  < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let minY = Number.MAX_VALUE;
		let maxY = Number.MIN_VALUE;
			
		let dataModel;			
		for (let i= 0; i< selectedItems.length; i++)
		{				
      dataModel = selectedItems[i]['UI'];				
      if (dataModel.frame.y < minY)
        minY = parseInt(dataModel.frame.y);				
      if (parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height) > maxY)
        maxY = parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height);				
		}			
    
		let centerY = parseInt((minY + maxY) / 2);
		for (let j= 0; j< selectedItems.length; j++)
		{
      dataModel = selectedItems[j]['UI'];
      dataModel['frame']['y'] = parseInt(centerY - (parseInt(dataModel.frame.height) / 2));
    }
    
    props.onUpdatePage(props.data);
  }

  function handleAlignBottom() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length  < 2) {
      setOpenalert(true);
      setAlertMsg("Select at-least 2 UIs for this operation.");
      return;
    }

    let maxY = Number.MIN_VALUE;
			
		let dataModel;			
		for (let i= 0; i< selectedItems.length; i++)
		{				
      dataModel = selectedItems[i]['UI'];	
      if (parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height) > maxY)
        maxY = parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height);				
    }
    
    for (let j= 0; j< selectedItems.length; j++)
		{
      dataModel = selectedItems[j]['UI'];
      dataModel['frame']['y'] = maxY - parseInt(dataModel.frame.height);
    }
    
    props.onUpdatePage(props.data);
  }

  function handleSpacingVertical() {
    let selectedItems = props.selectedUIparts;
    if(selectedItems.length  < 3) {
      setOpenalert(true);
      setAlertMsg("Select at-least 3 UIs for this operation.");
      return;
    }

    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    let dataModel;
    let firstObject;
    let lastObject;

    for (let i = 0; i < selectedItems.length; i++)
    {
      dataModel = selectedItems[i]['UI'];      
      if (dataModel.frame.y < minY)
      {
        firstObject = dataModel;
        minY = dataModel.frame.y;
      }
      if (parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height) > maxY)
      {
        maxY = parseInt(dataModel.frame.y) + parseInt(dataModel.frame.height);
        lastObject = dataModel;
      }
    }
    
    let arrMiddleObjs = [];
    let totalHeightOfMiddleObjs = 0;
    selectedItems.forEach(modelItem => {
      let modelObj = modelItem['UI']
      if(modelObj !== firstObject && modelObj !== lastObject)
      {
        let obj = {};
        obj.model = modelObj;
        obj.Y = parseInt(modelObj.frame.y);
        arrMiddleObjs.push(obj);
        totalHeightOfMiddleObjs += parseInt(modelObj.frame.height);
      }
    });

    arrMiddleObjs.sort(function(a, b){return a.Y - b.Y});
    let gap_Between_First_N_Last_Objs = parseInt(lastObject.frame.y) - (parseInt(firstObject.frame.y) + parseInt(firstObject.frame.height));
    let equalSpace = (gap_Between_First_N_Last_Objs - totalHeightOfMiddleObjs)/(arrMiddleObjs.length+1);    
    let prevModel;
    for (let j = 0; j < arrMiddleObjs.length; j++)
    {
      dataModel = arrMiddleObjs[j].model
      prevModel = (j === 0) ? firstObject : arrMiddleObjs[j-1].model;
      let newY = (parseInt(prevModel.frame.y) + parseInt(prevModel.frame.height)) + equalSpace;
      dataModel['frame']['y'] = isNaN(newY) ? 0 : parseInt(newY);
    }

    props.onUpdatePage(props.data);
  }
  
  ////////////////////////////////

  const [openalert, setOpenalert] = React.useState(false);
  const [alertmsg, setAlertMsg] = React.useState('');

  const handleCloseAlert = () => {
    setOpenalert(false);
    setAlertMsg('');
  };

  ///////// Copy Page-bars functionality /////////

  const displayCopyBars = (props.appData.hasOwnProperty('ProjectRole') && props.appData['ProjectRole'] === "contributor") ? "none" : "inline-flex";
  const isMultiScreen = (props.appData.hasOwnProperty('availableScreens') && props.appData.availableScreens.length > 1) ? "flex" : "none";
  const [screenvalue, setCopyScreenValue] = React.useState(false);
  const [switchtext, setSwitchText] = React.useState('For Current Screen');
  const [pagebarsvalue, setCopyPagebarsValue] = React.useState('');
  const [pagebardef, setPagebarDefs] = React.useState({});
  const [openconfirm, setPagebarsConfirm] = React.useState(false);
  const [setconfirmmsg, setConfirmMessage] = React.useState('');
  const [confirmaction, setConfirmAction] = React.useState('');

  const handleCloseCopyPagebars = () => {
    setOpenPagebarsDialog(false);
    setCopyPagebarsValue('');

    resetPageList();
  }

  const handleSetScreenValue = (event) => {
    setCopyScreenValue(event.target.checked);
    if(event.target.checked){
      setSwitchText('For All Screens');
    }else{
      setSwitchText('For Current Screen');
    }
  }

  const handlePagebarsValueChange = (event) => {
    setCopyPagebarsValue(event.target.value);
  }

  const handleApplyCopyPagebars = () => {    
    if(pagebarsvalue === "") {
      setOpenalert(true);
      setAlertMsg('Select any one part to set');
      return;
    }else {
      const _scrIndex = parseInt(selectedScreen);
      let pageBarDefs;
      let pageBarName = "";
      let eventError = "";

      switch(pagebarsvalue)
      {
        case "toptoolbar" :
          pageBarDefs = (screenvalue) ? pagedata._toolBarTop : pagedata._toolBarTop[_scrIndex];
          pageBarName = "Top Toolbar";
          break;
        case "bottomtoolbar" :
          pageBarDefs = (screenvalue) ? pagedata._toolBarBottom : pagedata._toolBarBottom[_scrIndex];
          pageBarName = "Bottom Toolbar";						
          break;
        case "lefttoolbar" :
          pageBarDefs = (screenvalue) ? pagedata._toolBarLeft : pagedata._toolBarLeft[_scrIndex];
          pageBarName = "Left Sidebar";						
          break;
        case "righttoolbar" :
          pageBarDefs = (screenvalue) ? pagedata._toolBarRight : pagedata._toolBarRight[_scrIndex];
          pageBarName = "Right Sidebar";						
          break;
        case "pageoverlay" :
          pageBarDefs = pagedata.pageOverlay;
          pageBarName = "Page Overlay";						
          break;
        case "pageevents" :
          if(checkedPageEvents.length > 0){
            let eventObj = {};
            const beforeObj = checkedPageEvents.find(x => x === "before");
            if(beforeObj) {
              const beforeViewEvents = pagedata.actions['beforeViewPage'];
              if(beforeViewEvents.length === 0){
                eventError = "'Before View Page'";
              }else {
                eventObj['beforeViewPage'] = beforeViewEvents;
              }
            }
            const afterObj = checkedPageEvents.find(x => x === "after");
            if(afterObj) {
              const afterViewEvents = pagedata.actions['afterViewPage'];
              if(afterViewEvents.length === 0){
                eventError = (eventError.length > 0) ? eventError +" and 'After View Page'" : "'After View Page'";
              }else {
                eventObj['afterViewPage'] = afterViewEvents;
              }
            }
            const awakeObj = checkedPageEvents.find(x => x === "awake");
            if(awakeObj) {
              const awakeAppEvents = pagedata.actions['becameAwake'];
              if(awakeAppEvents.length === 0){
                eventError = (eventError.length > 0) ? eventError +" and 'App Wake up'" : "'App Wake up'";
              }else {
                eventObj['becameAwake'] = awakeAppEvents;
              }
            }

            pageBarDefs = {viewType:'pageevents', events:eventObj};

          }else {
            pageBarDefs = {};
          }
          pageBarName = "Page Actions";					
          break;        
        default :
          pageBarDefs = {};
          break;
      }

      if(pageBarDefs) 
      {
        if(pageBarDefs.hasOwnProperty('hidden') && pageBarDefs['hidden']) {
          setOpenalert(true);
          setAlertMsg(pageBarName + ' is not set for this page.');
          return;
        }else if(pagebarsvalue === "pageoverlay" && pageBarDefs['Children'].length === 0) {
          setOpenalert(true);
          setAlertMsg('No ui-part set on '+ pageBarName + ' for this page.');
          return;
        }else if(pagebarsvalue === "pageevents" && eventError.length > 0) {
          setOpenalert(true);
          setAlertMsg("Current page don't have actions in " +eventError+ " for this page.");
          return;
        }else {
          setPagebarDefs(pageBarDefs);
          setPagebarsConfirm(true);
          setConfirmMessage(pageBarName + ' definition of current page will be override to all/selected pages.\n\nDo you want to continue?');
        }
      }
    }

    setOpenalert(false);
    setAlertMsg('');    
  }  

  const [checkedPageEvents, setCheckedPageEvents] = React.useState(['before','after']);
   
  function handleSelectPageEvents(event) {
    const strname = event.currentTarget.name;
    //console.log(".....handleSelectPageEvents >>>>>>", strname);
    const currentIndex = checkedPageEvents.indexOf(strname);
    const selectEvent = [...checkedPageEvents];

    if (currentIndex === -1) {
      selectEvent.push(strname);
    }else {
      selectEvent.splice(currentIndex, 1);         
    }

    if(selectEvent.length === 0){
      setOpenalert(true);
      setAlertMsg('Any one of the options must be selected');
      return;
    }
    setCheckedPageEvents(selectEvent);
  }

  // ---- Page Selection implementation ---- //

  const [anchorPagelist, setAnchorPagelist] = React.useState(null);
  const openPagelist = Boolean(anchorPagelist);

  const [checkedAllPageIds, setCheckedAllPageIds] = React.useState(true);
  const [checkedPageIds, setCheckedPageIds] = React.useState([]);

  function resetPageList() {
    setCheckedAllPageIds(true);
    const _pageids = setAllPageIds();
    setCheckedPageIds(_pageids);
  }
  function setAllPageIds() {
    let pageids = [];
    for (let i = 0; i < props.allPages.length; i++) {
      const _page = props.allPages[i];
      pageids.push(_page.pageid);      
    }
    return pageids;
  }

  function handlePageListOpen(event) {
    //console.log(props, ".. handlePageListOpen >>>", props.allPages);
    setAnchorPagelist(event.currentTarget);
    
    //console.log(checkedAllPageIds, "SelectPageIds>>>>", checkedPageIds);
    //setCheckedAllPageIds(true);
    let _pageids;
    if(checkedAllPageIds) {
      _pageids = setAllPageIds();
    }else {
      _pageids = checkedPageIds;
    }
    setCheckedPageIds(_pageids);
  }
  function handlePageListClose() {
    setAnchorPagelist(null);
    resetPageList();    
  }
  function handlePageListCancel() {
    setAnchorPagelist(null);
  }
  function handlePageListSet() {
    //console.log(checkedAllPageIds, ".. handlePageListSet >>>", checkedPageIds);    
    if(!checkedAllPageIds) {
      let noselect = false;
      if(checkedPageIds.length === 0){
        noselect = true;
      }else if(checkedPageIds.length === 1){
        if(parseInt(checkedPageIds[0]) === parseInt(props.currentPage['pageid'])) {
          noselect = true;
        }
      }
      if(noselect){
        setOpenalert(true);
        setAlertMsg('Need to select atleast one page');
        return;
      }
    } 
    setAnchorPagelist(null);
  }
  function handleSelectAllPageIds(event) {
    let updatedValue = Boolean(event.currentTarget.checked);
    setCheckedAllPageIds(updatedValue);    
    if(updatedValue) {
      const _pageids = setAllPageIds();
      setCheckedPageIds(_pageids);
    }else {
      const _currentpageid = [props.currentPage['pageid']];
      setCheckedPageIds(_currentpageid);
    }
  }
  function handleSelectPageIds(event) {
    const value = event.currentTarget['dataset']['id'];
    const currentIndex = checkedPageIds.indexOf(value);
    const newChecked = [...checkedPageIds];

    if (currentIndex === -1) {
      newChecked.push(value);
    }else {
      newChecked.splice(currentIndex, 1);         
    }
    //console.log(value, currentIndex, "handleSelectPageIds>>>>", newChecked);
    setCheckedPageIds(newChecked);
    if(newChecked.length !== props.allPages.length) {
      setCheckedAllPageIds(false);
    }
  }

  // ---- ---- //

  function ConfirmAlertCloseHandler() {    
    setPagebarsConfirm(false);
    setConfirmMessage('');
  }
  function ConfirmAlertOKHandler() {   
     
    if(confirmaction === "clearpage") {

      const _pagedata = props.data;
      //console.log(props, "...handleClearPageData >>>>", _pagedata);

      if(_pagedata.viewType === "BaseView"){
        _pagedata.Children = [];
      }else if(_pagedata.viewType === "ScrollView"){
        _pagedata.Children[0].Children = [];
      }else if(_pagedata.viewType.indexOf("TableViewList") > -1){
        if(_pagedata.Children[0]['_tmpCellStyle'] === "custom") {
          _pagedata.Children[0].Group[0]['RecordCellDef']['Fields'] = [];
          _pagedata.Children[0].Group[0]['rowarray'][0]['Fields'] = [];
        }    
      }

      let scrLen = props.appData.availableScreens.length;
      for(let i=0; i<scrLen; i++){
        _pagedata._toolBarTop[i].Children = [];
        _pagedata._toolBarBottom[i].Children = [];
        _pagedata._toolBarLeft[i].Children = [];
        _pagedata._toolBarRight[i].Children = [];
      }
      _pagedata.pageOverlay.Children = [];

      props.onUpdatePage(_pagedata);      

      let _page = JSON.parse(JSON.stringify(_pagedata));
      if(pagestate) {
        let undoState = pagestate['undo'];
        if(undoState) {
          if(undoState.length > 10) {
            undoState.shift();        
          }
          undoState.push(_page);
        }
      }

      setConfirmAction('');
      setConfirmMessage('');
      setPagebarsConfirm(false);
      setAnchorSetting(null);
      return;
    
    }else if(confirmaction === "") {
      setOpenPagebarsDialog(false);
      setCopyPagebarsValue('');
      setConfirmMessage('');
      setPagebarsConfirm(false);

      const _scrIndex = parseInt(selectedScreen);
      let isSlaveScreen = false;
      let masterScreenIndex = 0;
      const screens = props.appData['availableScreens'];
      if(screens.length > 1) {        
        screens.forEach((element, i) => {
          if(element['embed']) {
            masterScreenIndex = i;          
          }
        });
        const isMasterSlave = props.appData['isMasterScreenSet'];
        if(isMasterSlave && _scrIndex !== masterScreenIndex) {
          isSlaveScreen = true;
        }        
      }
      const _pageprops = {pageList: props.allPages, currentPage: props.data, selectAll: checkedAllPageIds, selectedPages:checkedPageIds};
      let _response = copypagebarResponse(pagebardef, _scrIndex, _pageprops, screenvalue, isSlaveScreen, masterScreenIndex);
      if(_response.length > 0) {
        /* setConfirmAction('preview');
        setPagebarsConfirm(true);
        setConfirmMessage(_response); */
        
        setOpenalert(true);
        setAlertMsg(_response);
        if(checkedAllPageIds) {
          props.onAllPagesChanged(true);
        }else {
          props.onAllPagesChanged(false, checkedPageIds);                   
        }
      }
    }else {
      setConfirmAction('');
      setConfirmMessage('');
      setPagebarsConfirm(false);
      //var _allpages:Array = [];
      //refs.pageEditorHelper.preview(_allpages);
    }

    resetPageList();
  }

  return (

    <Paper id="toolbox" elevation={6} square className={classes.toolbox}>
      <Box className={classes.paperbox} >
        <div className={classes.griddiv} >
          <Tooltip title="Page Settings">
            <Fab size="small" aria-label="setting" className={classes.fab}>
              <SvgIcon onClick={handleSettingOpen}>
                <path transform="scale(1.2, 1.2)" fill="none" d="M0 0h20v20H0V0z"></path><path transform="scale(1.2, 1.2)" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Popover id="setting-popover" classes={{paper: classes.paper}} style={{marginLeft:32, marginTop:-8}}
                   open={settingopen} anchorEl={anchorSetting} onClose={handleSettingClose}
                   anchorOrigin={{vertical: 'top', horizontal: 'right',}}
                   transformOrigin={{vertical: 'top', horizontal: 'left',}}
            >  
            <div className="vertical-align" style={{alignItems: 'start'}}>            
              <div className="horizontal-align" style={{height:36}}>
                <Typography variant="subtitle2" >Set Screen :</Typography>
                <Select native value={selectedScreen} style={{margin:'0px 8px', fontSize:'0.875em'}}
                        onChange={handleChangeScreen}
                >
                {screens.map((screen,id) =>
                  <option key={id} value={id}>{screen.width} x {screen.height}</option>
                )}
                </Select>
              </div>
              <div className={classes.vdivider}/>
              <Button color="default" className={classes.popbtn} style={{display:displayCopyBars}} onClick={handleOpenCopyPagebars} >Copy Page-Parts</Button>
              <Button color="default" className={classes.popbtn} onClick={handleClearPageUIData} >Clear Page UI-Data</Button>
              <Button color="default" className={classes.popbtn} onClick={handlePageValidation} >Page Validation</Button>
            </div>
          </Popover>
        </div>
      </Box>
      <Box className={classes.paperbox} >
        <div className={classes.griddiv} > 
          <Tooltip title="Save">        
            <Fab size="small" aria-label="save" className={classes.fab}>              
              <SvgIcon onClick={handlePageSave}>
                <path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </SvgIcon>
            </Fab> 
          </Tooltip>
          <Tooltip title="View Menu">
            <Fab size="small" aria-label="view" className={classes.fab} onClick={handleViewOpen}>              
              <img src="assets/view-off.png" alt="view" className={classes.aspect} style={{height:16}}/>
            </Fab>
          </Tooltip>
          <Popover id="view-popover" className={classes.popover} classes={{paper: classes.paper,}}
                    open={viewopen} anchorEl={anchorEl} onClose={handleViewClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'right',}}
                    transformOrigin={{vertical: 'top', horizontal: 'left',}}
            >              
              <List dense disablePadding>
                {viewItem.map((value, index) => {
                  const labelId = `checkbox-list-secondary-label-${index}`;
                  return (
                    <ListItem key={index} className={classes.menulist}>                      
                      <ListItemText id={labelId} primary={value} />
                      <ListItemSecondaryAction>
                        <Checkbox color="default" edge="end"
                                  onChange={handleToggle(value)}
                                  checked={checked.indexOf(value) !== -1}
                                  inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}                
                <ListItem className={classes.menulist} style={{display:'none'}}>
                  <ListItemText primary="Snap Guide" />
                  <ListItemSecondaryAction>
                    <Checkbox color="default" edge="end" checked={snapguide} onChange={handleSnapGuide} style={{display:'none'}} />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.menulist}>      
                  <ListItemText primary="Snap Grid" />
                  <ListItemSecondaryAction>
                    <Checkbox color="default" edge="end" checked={snapgrid} onChange={handleSnapGrid} />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem className={classes.menulist} style={{borderWidth:0}}>
                  <ListItemText primary="Set Grid Gap" />
                  <ListItemSecondaryAction style={{right:2}}>
                    <input id="numinput" className={classes.gridgap} style={{'border': '2px solid #676767', 'padding':0}}
                          type="number" value={gridgap} min="5" max="100" step="5"
                          onChange={handleGridGapValue}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Popover>
        </div>
        <div className={classes.griddiv} >            
          <Tooltip title="Undo : only last 10 changes can be undo">
            <Fab size="small" aria-label="undo" className={classes.fab}>              
              <SvgIcon onClick={handlePageUndo} >
                <path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip title="Redo : only last 10 changes can be redo">
            <Fab size="small" aria-label="redo" className={classes.fab}>              
              <SvgIcon onClick={handlePageRedo} >
                <path d="M0 0h24v24H0z" fill="none"/><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>          
        <div className={classes.griddiv} >
          <Tooltip title="Zoom In">
            <Fab size="small" aria-label="zoom in" className={classes.fab}>              
              <SvgIcon onClick={handlePageZoomin} >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <Fab size="small" aria-label="zoom out" className={classes.fab}>              
              <SvgIcon onClick={handlePageZoomout} >
                <path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>       
      </Box> 
      <div className={classes.hdivider}/>
      <Box className={classes.paperbox} >
        <div className={classes.griddiv} >            
          <Tooltip title="Cut">
            <Fab size="small" aria-label="cut" className={classes.fab} onClick={handleUICut}>
              <img src="assets/pagetoolbar/cut.png" alt="center align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Copy">
            <Fab size="small" aria-label="copy" className={classes.fab} onClick={handleUICopy}> 
              <img src="assets/pagetoolbar/copy.png" alt="center align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Paste">
            <Fab size="small" aria-label="Paste" className={classes.fab} onClick={handleUIPaste}>
              <img src="assets/pagetoolbar/paste.png" alt="center align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
        </div>
        <div className={classes.griddiv} >
          <Tooltip title="Send Forward">
            <Fab size="small" aria-label="forward" className={classes.fab} onClick={handleUIForward}>
              <img src="assets/pagetoolbar/send_forward.png" alt="center align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Send Front">
            <Fab size="small" aria-label="front" className={classes.fab} onClick={handleUIFront}>              
              <SvgIcon >
                <path d="M0 0h24v24H0z" fill="none"/><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.11 0-2 .9-2 2v10c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8 6h2v-2h-2v2zm-4 0h2v-2H7v2z"/>
              </SvgIcon>
            </Fab>
          </Tooltip>
          <Tooltip title="Send Backward">
            <Fab size="small" aria-label="backward" className={classes.fab} onClick={handleUIBackward}>
              <img src="assets/pagetoolbar/send_backward.png" alt="center align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Send Back">
            <Fab size="small" aria-label="back" className={classes.fab} onClick={handleUIBack}>
              <SvgIcon >
                <path d="M0 0h24v24H0z" fill="none"/><path d="M9 7H7v2h2V7zm0 4H7v2h2v-2zm0-8c-1.11 0-2 .9-2 2h2V3zm4 12h-2v2h2v-2zm6-12v2h2c0-1.1-.9-2-2-2zm-6 0h-2v2h2V3zM9 17v-2H7c0 1.1.89 2 2 2zm10-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zM5 7H3v12c0 1.1.89 2 2 2h12v-2H5V7zm10-2h2V3h-2v2zm0 12h2v-2h-2v2z"/>
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <div className={classes.hdivider}/>
      <Box className={classes.paperbox} >
        <div className={classes.griddiv} >
          <Tooltip title="Left Align">
            <Fab size="small" aria-label="left align" className={classes.fab} onClick={handleAlignLeft}>              
              <img src="assets/pagetoolbar/align-left.png" alt="left align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Center Align">
            <Fab size="small" aria-label="center align" className={classes.fab} onClick={handleAlignCenter}>              
              <img src="assets/pagetoolbar/align-center.png" alt="center align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Right Align">
            <Fab size="small" aria-label="right align" className={classes.fab} onClick={handleAlignRight}>              
              <img src="assets/pagetoolbar/align-right.png" alt="right align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Equal Horizontal Spacing">
            <Fab size="small" aria-label="equal horizontal spacing" className={classes.fab} onClick={handleSpacingHorizontal}>              
              <img src="assets/pagetoolbar/align-horizontal-equal-spacing.png" alt="horizontal align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
        </div>
        <div className={classes.griddiv} >
          <Tooltip title="Top Align">
            <Fab size="small" aria-label="top align" className={classes.fab} onClick={handleAlignTop}>              
              <img src="assets/pagetoolbar/align-top.png" alt="top align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Middle Align">
            <Fab size="small" aria-label="middle align" className={classes.fab} onClick={handleAlignMiddle}>              
              <img src="assets/pagetoolbar/align-middle.png" alt="middle align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Bottom Align">
            <Fab size="small" aria-label="bottom align" className={classes.fab} onClick={handleAlignBottom}>              
              <img src="assets/pagetoolbar/align-bottom.png" alt="bottom align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
          <Tooltip title="Equal Vertical Spacing">
            <Fab size="small" aria-label="equal vertical spacing" className={classes.fab} onClick={handleSpacingVertical}>              
              <img src="assets/pagetoolbar/align-vertical-equal-spacing.png" alt="vertical align" className={classes.aspect}/>
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <div className={classes.hdivider}/>
      <Box className={classes.paperflexbox} >
        <div className={classes.griddiv} >
          <Tooltip title="Settings Menu">
            <Fab size="small" aria-label="setting" className={classes.fab}>
              <SvgIcon>
                <path transform="scale(1.2, 1.2)" fill="none" d="M0 0h20v20H0V0z"></path><path transform="scale(1.2, 1.2)" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
              </SvgIcon>
            </Fab>
          </Tooltip>
        </div>
      </Box>
      <Backdrop className={classes.backdrop} open={openalert} onClick={handleCloseAlert}/>
      <Snackbar open={openalert} message={alertmsg} 
          anchorOrigin={{ vertical: 'bottom',  horizontal: 'center' }} TransitionComponent={SlideTransition}
          autoHideDuration={8000} onClose={handleCloseAlert}
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseAlert}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
      />
      <Dialog id="copypagebarsdialog" scroll="paper" open={opencopybars} fullWidth={true} maxWidth="sm" >
        <DialogTitle id="dialogtitle" className={classes.copypageparttitle}>Copy Page-Parts</DialogTitle>
        <DialogContent dividers className={classes.copypagepartcontent}>          
          <FormControl component="fieldset" style={{width:'100%'}}>
            <FormLabel style={{lineHeight:'2', fontSize:'0.875rem'}} component="article">Please make sure selected page-parts is already set on current page.</FormLabel>
            <div style={{margin:0, border:'1px solid', borderRadius:8, display:isMultiScreen, alignItems:'center', justifyContent:'space-between', padding:'0px 8px'}}>
              <FormControlLabel label={switchtext} control={<Switch color="primary" checked={screenvalue} onChange={handleSetScreenValue} />} />
              <Tooltip title="Page Overlay & Page Actions are independent of screens">
                <HelpIcon />
              </Tooltip>
            </div>
            <RadioGroup style={{margin:'4px 0px', padding:'0px 8px'}} aria-label="page-parts" name="pagebars" value={pagebarsvalue} onChange={handlePagebarsValueChange}>
              <FormControlLabel style={{maxHeight:36}} value="toptoolbar" control={<Radio color="default" />} label="ToolBar [Top]" />
              <FormControlLabel style={{maxHeight:36}} value="bottomtoolbar" control={<Radio color="default" />} label="ToolBar [Bottom]" />
              <FormControlLabel style={{maxHeight:36}} value="lefttoolbar" control={<Radio color="default" />} label="SideBar [Left]" />
              <FormControlLabel style={{maxHeight:36}} value="righttoolbar" control={<Radio color="default" />} label="SideBar [Right]" />
              <FormControlLabel style={{maxHeight:36}} value="pageoverlay" control={<Radio color="default" />} label="Page Overlay" />
              <FormControlLabel style={{maxHeight:36}} value="pageevents" control={<Radio color="default" />} label="Page Actions" />
            </RadioGroup>            
          </FormControl>
          {(pagebarsvalue === "pageevents") && 
            <FormControl component="dialog" className={classes.formpageevents}>
              {[{text:'Before View Page', val:'before'}, {text:'After View Page', val:'after'}, {text:'App Wake up', val:'awake'}].map((item,id) => (
                <div key={id} className={classes.divpageevents}>
                  <Checkbox color="default" edge="start" disableRipple size="small" 
                            checked={checkedPageEvents.indexOf(item['val']) > -1} name={item['val']}
                            onChange={handleSelectPageEvents} />
                  <Typography variant="caption">{item['text']}</Typography>
                </div>
              ))}              
            </FormControl>
          }
          {(pagebarsvalue !== "") && 
            <FormControl component="dialog" className={classes.copypagebarpages}>
              <FormLabel component="article">If needed, you can select page(s) :</FormLabel>
              <Button variant="contained" color="default" className={classes.actionbtn} onClick={handlePageListOpen}>Select Page(s)</Button>            
              <Popover id="view-popover" className={classes.popover} classes={{paper: classes.paper}} style={{overflow:'hidden'}}
                      open={openPagelist} anchorEl={anchorPagelist} onClose={handlePageListClose}
                      anchorOrigin={{vertical: 'center', horizontal: 'right',}}
                      transformOrigin={{vertical: 'center', horizontal: 'left',}}
              >                  
                <FormControlLabel label="Select All" className={classes.pageidall} style={{color:'blue'}}
                                  control={<Checkbox color="default" edge="start" disableRipple checked={checkedAllPageIds} 
                                            onChange={handleSelectAllPageIds} />}
                />
                <List dense disablePadding style={{maxHeight:480, overflow:'auto'}}>                  
                  {setpagelist(props.allPages, props.currentPage, props.pageHeirarchy).map((value, index) => (
                    <ListItem key={index} button dense className={classes.pageidlist} data-id={value['id']} data-status={value['checked']}
                              onClick={handleSelectPageIds}>                      
                      <ListItemIcon style={{minWidth:32, height:32}}>
                        <Checkbox color="default" edge="start" disableRipple tabIndex={-1} checked={checkedPageIds.indexOf(value['id']) !== -1} />
                      </ListItemIcon>
                      <ListItemText primary={value['title']} />
                    </ListItem>       
                  ))}
                </List>
                <div className="horizontal-align" style={{justifyContent:'space-around'}}>
                  <Button variant="contained" color="primary" className={classes.pageidbtn} style={{width:'100%'}} onClick={handlePageListSet}>Set</Button>
                  <Button variant="contained" color="default" className={classes.pageidbtn} style={{display:'none'}} onClick={handlePageListCancel}>Cancel</Button>
                </div>
              </Popover>
            </FormControl>
          }
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="default" className={classes.actionbtn} onClick={handleCloseCopyPagebars}>Cancel</Button>
          <Button variant="contained" color="primary" className={classes.actionbtn} onClick={handleApplyCopyPagebars}>Apply</Button>
        </DialogActions>
      </Dialog>
      {openconfirm === true && 
        <AlertWindow open={true} 
                    title="" message={setconfirmmsg}
                    ok="Yes" okclick={ConfirmAlertOKHandler}
                    cancel="No" cancelclick={ConfirmAlertCloseHandler}
        />
      }
      {openvalidation && 
        <ProjectValidation show={openvalidation} target="page" onCloseWindow={handleCloseValidations}/>        
      }
    </Paper>
  );
}
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}
function setpagelist(pages, currentpage, pageH) {
  let pagelist = [];
  
  for (let i = 0; i < pageH.length; i++) {
    const pageObj = pageH[i];
    if(pageObj && pageObj['level'] > 0) {

      if(pageObj['id'] === currentpage['pageid']){
        //continue;
      }else {
        pagelist.push({id:pageObj['id'], title:pageObj['title'], checked:true});
      }

      let pchildren = pageObj['children'];
      let childlist = setpagelist(pages, currentpage, pchildren);
      for (let j = 0; j < childlist.length; j++) {
        const element = childlist[j];
        pagelist.push({id:element['id'], title:element['title'], checked:element['checked']});
      }
    }    
  }
  
  return pagelist;
}

function LayoutWindow(props) {
  
  const appConfig = props.appconfig;
  const pageData = props.data;
  const bgColor = (pageData.viewType === "ScrollView") ? getColorValue(pageData.Children[0].backgroundColor) : getColorValue(pageData.backgroundColor);
  //const bgGradient = (pageData.viewType === "ScrollView") ? pageData.Children[0].backgroundGradient : pageData.backgroundGradient;
  //console.log(pageData, ">>>>>>>>>>>>>>>", bgColor);
  
  let screenIndex = 0;//(props.defaultScreenId) ? props.defaultScreenId : 0;
  let screenObj;
  
  let showruler = 'hidden';
  //let showguide = 'hidden';
  let showgrid = false;
  //let snapguide = false;
  //let snapgrid = false;
  let gridgap = 10;

  let zoom = 1;

  if(props.pagestate) {
    let _params = props.pagestate['params'];
    if(_params) {
      if(_params['showall'] && _params['showall'] === 'on') {
        showruler = 'visible';
        //showguide = 'visible';
        showgrid = true;
      }else {
        showruler = (_params['showruler'] && _params['showruler'] === 'on') ? 'visible' : 'hidden';
        //showguide = (_params['showguide'] && _params['showguide'] === 'on') ? 'visible' : 'hidden';
        showgrid = (_params['showgrid'] && _params['showgrid'] === 'on') ? true : false;
      }
      //snapguide = (_params['snapguide'] && _params['snapguide'] === 'on') ? true : false;
      //snapgrid = (_params['snapgrid'] && _params['snapgrid'] === 'on') ? true : false;
      gridgap = (_params['gridgap']) ? _params['gridgap'] : 10;

      zoom = (_params['zoom']) ? parseInt(_params['zoom'])/100 : 1;

      screenIndex = (_params['screenIndex']) ? parseInt(_params['screenIndex']) : 0;//props.defaultScreenId;
      screenObj = _params['screen'];
    }
    
    //console.log(pageData, "LayoutWindow param >>>>", _params);
  }

  if(!screenObj) {
    /* const scrIndex = (props.defaultScreenId) ? props.defaultScreenId : 0;
    screenObj = props.appData['availableScreens'][scrIndex]; */
    screenObj = props.appData['availableScreens'][0];
  }else {
    screenObj = props.appData['availableScreens'][screenIndex];
  }

  const layoutWidth = (screenObj) ? screenObj['width'] : pageData.frame.width;
  const layoutHeight = (screenObj) ? screenObj['height'] : pageData.frame.height;
  const statusbarheight = (pageData.StatusBarHidden) ? 0 : 20;
  const navbarheight = (pageData.NavigationBarHidden) ? 0 : 44;
  //const navbarpromptheight = (pageData._navigationBars[0].barHidden) ? 0 : 74;
  const tabbarheight = (pageData._tabBarHiddens[screenIndex]) ? 0 : 49;
  const topToolbar = (pageData._toolBarTop[screenIndex]) ? pageData._toolBarTop[screenIndex] : pageData._toolBarTop[0];
  const toolbartopheight = topToolbar ? ((topToolbar.hidden) ? 0 : topToolbar.frame.height) : 0;
  const bottomToolbar = (pageData._toolBarBottom[screenIndex]) ? pageData._toolBarBottom[screenIndex] : pageData._toolBarBottom[0];
  const toolbarbottomheight = bottomToolbar ? ((bottomToolbar.hidden) ? 0 : bottomToolbar.frame.height) : 0;

  let contentheight = statusbarheight + navbarheight + tabbarheight + toolbartopheight + toolbarbottomheight;
  let contentmargin = statusbarheight + navbarheight + toolbartopheight;

  const gridRows = Math.ceil(layoutHeight/gridgap);
  const gridColumns = Math.ceil(layoutWidth/gridgap);
  let gridRC = [];
  if(pageData.viewType.indexOf("TableView") > -1) showgrid = false;
  if(showgrid) {
    for (let i = 0; i < gridRows; i++) {
      let _gridCol = [];
      for (let j = 0; j < gridColumns; j++) {
        _gridCol.push(j);      
      }
      gridRC.push(_gridCol);    
    }
  }

  const scale = 'scale(' + zoom + ')';

  const headerheight = 2;
  const rulersize = 16;
  
  const useStyles = makeStyles(theme => ({
    root: {
      //position: 'absolute',
      //overflow: 'auto',
      width: '100%',
      height: `calc(100% - 55px)`,
      display: 'flex',
      justifyContent: 'start',
      paddingTop: 12, 
    },
    zoom150: {
     //height: '100%',
     alignItems: 'flex-start',
     justifyContent: 'center',
     //paddingLeft: 1,
     paddingTop: 200,  
    },
    zoom200: {
      //height: '100%',
      alignItems: 'flex-start',
      justifyContent: 'center',
      //paddingLeft: 1,
      paddingTop: 350,  
     },
    layoutbox: {
      width: `calc(${layoutWidth+rulersize}px)`,
      height: `calc(${layoutHeight+rulersize+headerheight+2}px)`,
      display: 'flex',
      flexDirection: 'column',  
      alignItems: 'center',
      background: theme.palette.background.contrast,  //'rgba(189, 189, 189, 0)',
      borderStyle: 'solid',
      borderWidth: 12,
      borderLeftWidth: 4,
      borderRightWidth: 20,
      borderBottomWidth: 8,
      borderRadius: 6,
      borderColor: theme.palette.background.contrast,
      transform: scale,
    },
    header: {
      display: 'flex',
      width: '100%',
      height: headerheight,
      lineHeight: headerheight,
      alignItems : 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.palette.common.black,
      color: theme.palette.getContrastText('#000'),
      visibility: 'hidden',
    },
    headerclose: {
      color: theme.palette.background.paper,
    },
    heading: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: theme.typography.pxToRem(14),
      fontWeight: theme.typography.fontWeightRegular,
      paddingRight: theme.spacing(6),
      //paddingTop: theme.spacing(2.5),
    },
    topruler: {
      width: layoutWidth,
      height: rulersize,
      marginLeft: rulersize,      
      borderTop : 0,
      backgroundColor: theme.palette.common.black,
      backgroundImage: `url(${toprulerImage})`,
      backgroundRepeat: 'repeat-x',
      //backgroundPosition: 'center',
      visibility: showruler,
    },
    leftruler: {
      width: rulersize,
      height: `calc(100% - ${contentheight}px)`,
      marginTop : contentmargin,   
      backgroundColor: theme.palette.common.black,
      backgroundImage: `url(${leftrulerImage})`,
      backgroundRepeat: 'repeat-y',
      visibility: showruler,
    },
    layouteditor: {
      display: 'flex',
    },
    pagelayout: {      
      width: layoutWidth,
      height: layoutHeight,
      backgroundColor: bgColor,
      borderRadius: 0,
      border: '1px solid',
      borderColor: theme.palette.common.black,
      //background: bgGradient
    },
    gridcanvas: {
      position: 'absolute',
      //top: `calc(${headerheight+rulersize}px)`,
      //left: rulersize,
      width: layoutWidth,
      height: `calc(${layoutHeight - contentheight}px)`,  //layoutHeight,
      marginTop : contentmargin, 
      //backgroundColor: 'rgba(219,119,19,0.19)'
      borderCollapse: 'collapse', 
      borderSpacing: 0
    },
    gridcell: {
      padding: 0,
      border: '1px solid red',
    },
    footer: {      
      width: '100%',
      height: 12,
      lineHeight: '12px',      
      backgroundColor: theme.palette.common.black,
      border: '1px solid',
      borderColor : theme.palette.common.black,
      borderTop : 0,
      display: 'none'
    },
  }));

  const classes = useStyles();
  let cx = classNames.bind(classes);
  let windowStyle = cx('root');
  if(zoom === 1.5)  windowStyle = cx(["root", "zoom150"]);
  if(zoom === 2.0)  windowStyle = cx(["root", "zoom200"]);

  function handlePageClose() {
    setAction('pagesave');
    let alertmsg = "Do you want to save this page ?";
    setAlertTitle('');
    setAlertMessage(alertmsg);
    //setOpenAlert(true);
    setOpenConfirm(true);

    //props.onWindowClose(pageData.pageid);
  }

  function handleLayoutClick() {
    props.onWindowSelect(pageData.pageid);
  }

  const [action, setAction] = React.useState('');
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [openConfirm, setOpenConfirm] = React.useState(false);

  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }

  function confirmCloseHandler() {
    if(action === 'pagesave'){
      props.onWindowClose(pageData.pageid, "nosave");
    }
    setOpenConfirm(false);
    setAction('');
  }
  function confirmOKHandler() {   
    if(action === 'pagesave'){
      props.onWindowClose(pageData.pageid, "save");
    } 
    setOpenConfirm(false);
    setAction('');
  }
  
  return ( 
    <div id="layoutwindow" className={windowStyle} onClick={handleLayoutClick} > 
      <Box className={classes.layoutbox}>
        <div id="header" className={classes.header}>
          <IconButton className={classes.headerclose} onClick={handlePageClose}>
            <CloseIcon />
          </IconButton>
          <Typography className={classes.heading}>{pageData.Title}</Typography>
        </div>
        <span className={classes.topruler}></span>
        <div id="layouteditor" className={classes.layouteditor}>
          <span className={classes.leftruler}></span>
          <Paper className={classes.pagelayout}>            
            <table id="grid" className={classes.gridcanvas}>
              <tbody>
                {gridRC.map((item, index) => (
                  <tr key={index} >
                    {item.map((item1, index1) => (
                        <td key={index1} className={classes.gridcell} ></td>
                    ))}                      
                  </tr>
                ))}
              </tbody>
            </table>
            <PageLayoutEditor show={true} appconfig={appConfig} appData={props.appData} pageList={props.allPages} data={pageData} screenIndex={screenIndex} />
          </Paper>
        </div>
        <span className={classes.footer}></span>
      </Box>
      {openAlert === true && 
        <AlertWindow open={true} 
                    title={alertTitle} message={alertMessage}
                    ok="OK" okclick={alertOKHandler}
                    cancel="" cancelclick={alertCloseHandler}
        />
      }
      {openConfirm === true && 
        <AlertWindow open={true} 
                    title={alertTitle} message={alertMessage}
                    ok="Yes" okclick={confirmOKHandler}
                    cancel="No" cancelclick={confirmCloseHandler}
        />
      }
    </div>       
  );
}


function ContentWindow(props) { 
    
  const pagedata = props.data;
  //const pageconfig = props.pageconfig;
  const appconfig = props.appconfig;
  const scrIndex = (props.screenIndex) ? props.screenIndex : 0;
  const scrObj = props.appdata['availableScreens'][scrIndex];
  let source = "";
  let show = false;
  let contentChildren = [];
  let editorwidth = 0;
  let editorheight = 0;
  let editorFrame = {x:0, y:0, width:0, height:0};  
  
  const editorParentPage = props.editorParent["page"];
  if(editorParentPage && editorParentPage["pageid"] === pagedata["pageid"]) {
    
    const editorParentUI = props.editorParent["ui"];
    if(editorParentUI['viewType']){
      if(editorParentUI['viewType'] === "TileList" || editorParentUI['viewType'] === "Dialog" || editorParentUI['viewType'] === "Drawer" || editorParentUI['viewType'] === "Popover" ||
          editorParentUI['viewType'] === "ExpansionPanel" || editorParentUI['viewType'] === "SwipeableView" || editorParentUI['viewType'] === "FormView" ||
          editorParentUI['viewType'] === "DataGrid" || editorParentUI['viewType'] === "ScrollableView" || editorParentUI['viewType'] === "NestedList") {
        show = true;
  
        if(editorParentUI['viewType'] === "TileList") {
          source = "TileList";
          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          /* if(pagedata.viewType === "BaseView") {
            pageChildren = pagedata.Children;
          }else if(pagedata.viewType === "ScrollView") {
            pageChildren = pagedata.Children[0].Children;
          } */

          let tilelistUI;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "TileList" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                tilelistUI = uipart;
              }
            });
          }else {
            tilelistUI = pageChildren[0];
          }
          if(!tilelistUI) {
            // case of when TileList is children of Dialog UI
            let _pageChildren = getUIData_byContainer(props, "Dialog", scrIndex);
            tilelistUI = _pageChildren[0];
            //console.log(props['targetEditor'], _pageChildren, "... ContentWindow TileList >>>> ", tilelistUI);
          }
          contentChildren = tilelistUI['uiParts'][scrIndex].dataarray[0].Fields;

          //console.log(editorParentUI, "... ContentWindow TileList >>>> ", editorParentUI.dataarray);
          editorwidth = Math.floor(editorParentUI.frame.width/parseInt(editorParentUI.dataarray[0].columns)); //parseInt(editorParentUI.dataarray[0].width);
          editorheight = Math.floor(editorParentUI.frame.height/parseInt(editorParentUI.dataarray[0].rows)); //parseInt(editorParentUI.dataarray[0].height);

        }else if (editorParentUI['viewType'] === "Dialog") {
          source = "Dialog";
          let overlayChildren = pagedata['pageOverlay']['Children'];
          let dialogUI;
          if(overlayChildren.length > 1) {
            let overlayUI = overlayChildren.filter(function(uipart) {
              if(uipart['viewType'] === "Dialog" && (uipart['uiParts'][0]['name'] === editorParentUI['name'])) {
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

          let containerIndex = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          if(containerIndex > dialogUI['uiParts'][scrIndex].dataarray.length - 1){
            containerIndex = 0;
          }

          contentChildren = dialogUI['uiParts'][scrIndex].dataarray[containerIndex].Fields;          
          //console.log(dialogUI, "... ContentWindow Dialog >>>> ", dialogUI['uiParts'][scrIndex]);

          const _width = (scrObj) ? parseInt(scrObj['width']) : parseInt(editorParentUI.dataarray[0].width);
          const isLeftbarVisible = !(pagedata._toolBarLeft[scrIndex].hidden);
          const isLeftbarFixed = (isLeftbarVisible) ? pagedata._toolBarLeft[scrIndex].fixed : false;
          const leftbarWidth = parseInt(pagedata._toolBarLeft[scrIndex].frame['width']);
          let _containerWidth = _width;//parseInt(editorParentUI.frame.width);
          if(isLeftbarVisible && isLeftbarFixed) {
            _containerWidth = _containerWidth - parseInt(leftbarWidth);
          }
         
          editorwidth = _containerWidth - parseInt(editorParentUI.padding.left + editorParentUI.padding.right);
          editorheight = parseInt(editorParentUI.dataarray[containerIndex].height);// - (editorParentUI.padding.top + editorParentUI.padding.bottom);

        }else if (editorParentUI['viewType'] === "Drawer") {
          source = "Drawer";
          let overlayChildren = pagedata['pageOverlay']['Children'];
          let drawerUI;
          if(overlayChildren.length > 1) {
            let overlayUI = overlayChildren.filter(function(uipart) {
              if(uipart['viewType'] === "Drawer" && (uipart['uiParts'][0]['name'] === editorParentUI['name'])) {
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
          contentChildren = drawerUI['uiParts'][scrIndex].dataarray[0].Fields;

          const _width = (scrObj) ? parseInt(scrObj['width']) : parseInt(editorParentUI.dataarray[0].width);
          let _containerWidth = _width;//parseInt(editorParentUI.frame.width);         
          editorwidth = _containerWidth - parseInt(editorParentUI.padding.left + editorParentUI.padding.right);
          editorheight = parseInt(editorParentUI.dataarray[0].height);// - (editorParentUI.padding.top + editorParentUI.padding.bottom);

        }else if (editorParentUI['viewType'] === "ExpansionPanel") {
          source = "ExpansionPanel";

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let expansionUI;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "ExpansionPanel" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                expansionUI = uipart;
              }
            });
          }else {
            expansionUI = pageChildren[0];
          }
          if(!expansionUI) {
            // case of when Expansion-panel is children of Dialog UI
            let _pageChildren = getUIData_byContainer(props, "Dialog", scrIndex);
            expansionUI = _pageChildren[0];
            //console.log(props['targetEditor'], _pageChildren, "... ContentWindow TileList >>>> ", tilelistUI);
          }

          let panelIndex = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          if(panelIndex > expansionUI['uiParts'][scrIndex].panelItems.length){
            panelIndex = 0;
          }
          contentChildren = expansionUI['uiParts'][scrIndex].panelItems[panelIndex].Fields;
                 
          editorwidth = parseInt(editorParentUI.frame.width) - parseInt(editorParentUI.padding.left + editorParentUI.padding.right  + 2*editorParentUI.borderWeight);
          editorheight = parseInt(editorParentUI.panelItems[panelIndex].height);//parseInt(editorParentUI.frame.height) - parseInt(editorParentUI.headerheight + editorParentUI.padding.top + editorParentUI.padding.bottom  + 2*editorParentUI.borderWeight);

        }else if (editorParentUI['viewType'] === "SwipeableView") {
          source = "SwipeableView";         

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let swipeableView;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "SwipeableView" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                swipeableView = uipart;
              }
            });
          }else {
            swipeableView = pageChildren[0];
          }

          let viewIndex = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          if(viewIndex > swipeableView['uiParts'][scrIndex].swipeableItems.length){
            viewIndex = 0;
          }
          contentChildren = swipeableView['uiParts'][scrIndex].swipeableItems[viewIndex].Fields;
                 
          editorwidth = parseInt(editorParentUI.frame.width) - parseInt(editorParentUI.padding.left + editorParentUI.padding.right  + 2*editorParentUI.borderWeight);
          editorheight = parseInt(editorParentUI.frame.height) - parseInt(editorParentUI.padding.top + editorParentUI.padding.bottom  + 2*editorParentUI.borderWeight);

        }else if (editorParentUI['viewType'] === "DataGrid") {
          source = "DataGrid";         

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let datagridView;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "DataGrid" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                datagridView = uipart;
              }
            });
          }else {
            datagridView = pageChildren[0];
          }

          let colIndex = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          if(colIndex > datagridView['uiParts'][scrIndex].dataCols.length){
            colIndex = 0;
          }

          const _fieldContainer = (props.editorParent["fieldContainer"]) ? props.editorParent["fieldContainer"] : 'Fields';
          contentChildren = datagridView['uiParts'][scrIndex].dataCols[colIndex][_fieldContainer];
                 
          editorwidth = parseInt(editorParentUI.dataCols[colIndex].width);
          if(_fieldContainer === 'Fields'){
            editorheight = parseInt(editorParentUI.rowheight);
          }else{
            if(editorParentUI.dataCols[colIndex].heading === ""){
              editorheight = parseInt(editorParentUI.headerheight);
            }else{
              editorheight = parseInt(editorParentUI.headerheight) - 40;
            }
          }

        }else if (editorParentUI['viewType'] === "Popover") {
          source = "Popover";         

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let popoverUI;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "Popover" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                popoverUI = uipart;
              }
            });
          }else {
            popoverUI = pageChildren[0];
          }
          
          contentChildren = popoverUI['uiParts'][scrIndex].dataarray[0].Fields;
                 
          let _containerWidth = parseInt(editorParentUI.frame.width);         
          editorwidth = _containerWidth - parseInt(editorParentUI.padding.left + editorParentUI.padding.right);
          editorheight = parseInt(editorParentUI.dataarray[0].height);

        }else if (editorParentUI['viewType'] === "FormView") {
          source = "Form";
          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);

          let formitemUI;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if((uipart['viewType'] === "Form" || uipart['viewType'] === "FormView") && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                formitemUI = uipart;
              }
            });
          }else {
            formitemUI = pageChildren[0];
          }
          if(!formitemUI) {
            // case of when FormItem is children of Dialog UI
            let _pageChildren = getUIData_byContainer(props, "Dialog", scrIndex);
            formitemUI = _pageChildren[0];
          }

          const formindex = (props.editorParent["index"]) ? props.editorParent["index"] : 0;
          const formItemObj = formitemUI['uiParts'][scrIndex].formItems[formindex];
          if(formItemObj){
            contentChildren = formItemObj.Fields;
  
            const _containerWidth = (scrObj) ? parseInt(scrObj['width']) : Math.floor(formItemObj.width);
            editorwidth = _containerWidth - parseInt(editorParentUI.padding.left + editorParentUI.padding.right);
            editorheight = Math.floor(formItemObj.height) - 2*parseInt(editorParentUI.itemborderWeight);
            if(formItemObj.label.length > 0 || formItemObj.required){
              editorheight = editorheight - 32;
            }
          }

        }else if (editorParentUI['viewType'] === "ScrollableView") {
          source = "ScrollableView";         

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);
          let scrollableView;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "ScrollableView" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                scrollableView = uipart;
              }
            });
          }else {
            scrollableView = pageChildren[0];
          }
          
          contentChildren = scrollableView['uiParts'][scrIndex].dataarray[0].Fields;
                 
          editorwidth = parseInt(editorParentUI.scrollwidth);
          editorheight = parseInt(editorParentUI.scrollheight);

        }else if(editorParentUI['viewType'] === "NestedList") {
          source = "NestedList";

          const nestedListSource = props.editorParent["source"];

          let pageChildren = getAllChildrenOnPage(pagedata, scrIndex);

          let nestedlistUI;
          if(pageChildren.length > 1) {
            pageChildren.forEach(uipart => {
              if(uipart['viewType'] === "NestedList" && (uipart['uiParts'][scrIndex]['name'] === editorParentUI['name'])) {
                nestedlistUI = uipart;
              }
            });
          }else {
            nestedlistUI = pageChildren[0];
          }
          if(!nestedlistUI) {
            // case of when TileList is children of Dialog UI
            let _pageChildren = getUIData_byContainer(props, "Dialog", scrIndex);
            nestedlistUI = _pageChildren[0];
            //console.log(props['targetEditor'], _pageChildren, "... ContentWindow TileList >>>> ", tilelistUI);
          }

          const uicontentWidth = parseInt(editorParentUI.frame.width) - (editorParentUI.padding.left + editorParentUI.padding.right);

          if(nestedListSource === "NestedList"){
            contentChildren = nestedlistUI['uiParts'][scrIndex].mainCellDef.Fields;
            editorwidth = uicontentWidth;
            editorheight = parseInt(editorParentUI.mainCellDef.height); 
          }else{
            contentChildren = nestedlistUI['uiParts'][scrIndex].subCellDef.Fields;
            editorwidth = uicontentWidth;
            editorheight = parseInt(editorParentUI.subCellDef.height);
          }

        }
      }

      editorFrame.width = editorwidth;
      editorFrame.height = editorheight;

    }else {
      const editorParentSource = props.editorParent["source"];
      if(editorParentSource && editorParentSource === "overlay") {
        //console.log(pagedata, ".... ContentWindow Editor ....", editorParentPage, editorParentSource);
        if(editorParentPage.hasOwnProperty('pageOverlay')) {
          show = true;

          source = "pageOverlay";  
          contentChildren =  editorParentPage.pageOverlay.Children;
          editorwidth = (scrObj) ? parseInt(scrObj['width']) : parseInt(pagedata.frame['width']);
          editorheight = (scrObj) ? parseInt(scrObj['height']) : parseInt(pagedata.frame['height']);
          editorFrame.width = editorwidth;
          editorFrame.height = editorheight;
        }
      }
    }
  }

  let lwid = 0; 
  let lhei = 0;
  const lbox = document.getElementById("layoutbox");
  if(lbox) {
    const lboxstyle = window.getComputedStyle(lbox);
    lwid = lboxstyle.getPropertyValue('width');
    if(lwid)  lwid = parseInt(lwid);
    lhei = lboxstyle.getPropertyValue('height');
    if(lhei)  lhei = parseInt(lhei);    
  }

  let isStyle = false;
  if(lwid !== 0 && lwid < editorwidth) {
    //zoomval = Math.ceil(lwid/editorwidth *100) + '%';
    isStyle = true
    //console.log(lwid, editorwidth, "... isStyle needed >>>> ", isStyle);
  };
  const justify = (isStyle) ? '' : 'center';

  let twid = 0; 
  const tbox = document.getElementById("toolbox");
  if(tbox) {
    const tboxstyle = window.getComputedStyle(tbox);
    twid = tboxstyle.getPropertyValue('width');
    if(twid)  twid = parseInt(twid);
  }  
  let shiftleft = (props.shiftlist === 'none') ? 24 : 256;
  shiftleft = shiftleft + twid;

  const useStyles = makeStyles(theme => ({
    root: {
      position: 'absolute',
      top: 8, bottom: 8,
      left: shiftleft, right: 390,
      padding: theme.spacing(0.5),
      backgroundColor: "#f5f5f5e6",
      border: '2px solid rgba(0, 0, 0, 1)',
      borderRadius: 5,
      overflow: 'hidden',
    },
    contentheader: {
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      backgroundColor: "#f5f5f5",
    },
    closeicon: {
      color: theme.palette.common.white, 
      backgroundColor: theme.palette.common.black,
      padding: 0,
    },
    contentarea: {
      width: '100%',
      height: `calc(100% - 28px)`,
      display: 'inline-grid',
      alignItems: 'center',
      justifyItems: justify,
      backgroundColor: 'rgba(2,2,2,0.6)',
      overflow: 'auto',
    },
    contenteditor: {
      width: editorwidth,
      height: editorheight,
      margin: theme.spacing(0.5),
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.grey[100],
      //maxWidth: 768,
      //overflow: 'auto'
    }, 
    
  }));

  const classes = useStyles(); 

  
  function handleCloseWindow(ev) {
    ev.preventDefault();
    //sessionStorage.setItem("editor", props['editorParent']['source']);
    if(props['editorParent']['source'] === "Dialog" || props['editorParent']['source'] === "Drawer"){
      sessionStorage.setItem("editor", props['editorParent']['source']);
    }else{
      sessionStorage.setItem("editor", "page");
    }
    props.onWindowClose();
  }
  function handleContentWindowClick() {
    const _source = props['editorParent']['source'];
    console.log(_source, "... ContentWindow CLICK >>>> ", props['editorParent'] );
    if(_source === "TileList") {
      props.onWindowSelect("TileList");
    }else if(_source === "DataGrid") {
      props.onWindowSelect("DataGrid");
    }else if(_source === "Dialog") {
      props.onWindowSelect("Dialog");
    }else if(_source === "overlay") {
      props.onWindowSelect("overlay");
    }else if(_source === "Drawer") {
      props.onWindowSelect("Drawer");
    }else if(_source === "Popover") {
      props.onWindowSelect("Popover");
    }else if(_source === "ExpansionPanel") {
      props.onWindowSelect("ExpansionPanel");
    }else if(_source === "SwipeableView") {
      props.onWindowSelect("SwipeableView");
    }else if(_source === "Form") {
      props.onWindowSelect("Form");
    }else if(_source === "ScrollableView") {
      props.onWindowSelect("ScrollableView");
    }else{
      props.onWindowSelect(_source);
    }
  } 

  return (
    <div id="contentwindow">
      {show && 
        <div className={classes.root}>
          <div className={classes.contentheader}>
            <IconButton aria-label="Close" className={classes.closeicon} onClick={handleCloseWindow}>
              <CloseIcon />
            </IconButton>
          </div>
          <div id="contentarea" className={classes.contentarea} onClick={handleContentWindowClick}>
            <Box id="contenteditor" className={classes.contenteditor}>
              <UIContainer show={true} style={{width:'inherit'}} 
                           appconfig={appconfig} pagedata={pagedata} data={contentChildren} source={source} screenIndex={scrIndex} containerFrame={editorFrame} />
            </Box>
          </div>
        </div>      
      }
    </div>
   
  );
}

function TabContainer(props) {
  /* return (
    <Typography component="div" style={{ padding: 4, width: '100%', height: 700, backgroundColor: 'rgba(244, 244, 244, 1)'}}>
      {props.children}
    </Typography>
  ); */
  return (
    <Typography component="div" style={{ width:'100%', position:'absolute', top:36, bottom:56, backgroundColor:'rgba(244, 244, 244, 1)'}}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};


function getUIData_byContainer(_props, _editorContainer, _scrIndex) {
  const _pagedata = _props['data'];
  //const _editorContainer = _props['targetEditor'];
  if(!_scrIndex) _scrIndex = 0;

  if(_editorContainer === "page") {
    let pageChildren = [];
    if(_pagedata.viewType === "BaseView"){
      pageChildren = _pagedata.Children;
    }else if(_pagedata.viewType === "ScrollView"){
      pageChildren = _pagedata.Children[0].Children;
    }else if(_pagedata['viewType'].indexOf('TableViewList') > -1) {
      if(_pagedata.Children[0]['_tmpCellStyle'] === "custom") {
        const tableGroup = _pagedata.Children[0].Group;
        return tableGroup[0].RecordCellDef.Fields;
      }
    }

    return sortUI_byDisplayOrder(pageChildren, _scrIndex);
  }
  else if(_editorContainer === "topToolbar") {

    if(!_pagedata._toolBarTop[_scrIndex].hidden){
      return sortUI_byDisplayOrder(_pagedata._toolBarTop[_scrIndex].Children, _scrIndex);
    }
    else return [];    
  }
  else if(_editorContainer === "bottomToolbar") {

    if(!_pagedata._toolBarBottom[_scrIndex].hidden){
      return sortUI_byDisplayOrder(_pagedata._toolBarBottom[_scrIndex].Children, _scrIndex);
    }
    else return [];    
  }
  else if(_editorContainer === "leftToolbar") {

    if(!_pagedata._toolBarLeft[_scrIndex].hidden){
      return sortUI_byDisplayOrder(_pagedata._toolBarLeft[_scrIndex].Children, _scrIndex);
    }
    else return [];    
  }
  else if(_editorContainer === "rightToolbar") {

    if(!_pagedata._toolBarRight[_scrIndex].hidden){
      return sortUI_byDisplayOrder(_pagedata._toolBarRight[_scrIndex].Children, _scrIndex);
    }
    else return [];    
  }
  else if(_editorContainer === "TileList") {
    const _uidata = (_props.editorParent) ? _props.editorParent['ui'] : "";
    const _uichildren = getUIData_byContainer(_props, "page", _scrIndex);
    //console.log(_uidata, _pagedata, "*** getUIData_TileList **", _uichildren);

    /*for (let index = 0; index < _uichildren.length; index++) {
      const uidef = _uichildren[index];
      let uidefparts = uidef['uiParts'];
      if(uidefparts && (uidefparts[_scrIndex]['name'] === _uidata['name'])) { 
        return sortUI_byDisplayOrder(uidefparts[_scrIndex].dataarray[0].Fields, _scrIndex);
      }                
    }*/
    
    let selectedUI;
    if(_uichildren.length > 0) {
      _uichildren.forEach(uipart => {
        if(uipart['viewType'] === "TileList" && (uipart['uiParts'][_scrIndex]['name'] === _uidata['name'])) {
          selectedUI = uipart;
        }
      });
    }

    if(selectedUI) {
      return sortUI_byDisplayOrder(selectedUI['uiParts'][_scrIndex].dataarray[0].Fields, _scrIndex);
    }else{
      let _pageChildren = getAllChildrenOnPage(_props.data, _scrIndex);
      for (let index = 0; index < _pageChildren.length; index++) {
        const uidef = _pageChildren[index];
        let uidefparts = uidef['uiParts'];
        if(uidefparts && (uidefparts[_scrIndex]['name'] === _uidata['name'])) { 
          return sortUI_byDisplayOrder(uidefparts[_scrIndex].dataarray[0].Fields, _scrIndex);
        }                
      }      
    }

    return [];
  }
  else if(_editorContainer === "Dialog" || _editorContainer === "Drawer") {

    if(_pagedata['pageOverlay'] && _pagedata['pageOverlay'].Children) {
      let overlayChildren = _pagedata['pageOverlay'].Children;
      for (let index = 0; index < overlayChildren.length; index++) {
        const overlayChild = overlayChildren[index];
        if(overlayChild && overlayChild['viewType'] === _editorContainer) {
          if(overlayChild.uiParts[_scrIndex]) {
            const containerIndex = (_props['editorParent']['index']) ? _props['editorParent']['index'] : 0;
            const overlayFields = overlayChild.uiParts[_scrIndex].dataarray[containerIndex].Fields;
            return sortUI_byDisplayOrder(overlayFields, _scrIndex);
          }            
        }            
      }
    }else{
      return [];
    }  

    /*if(_pagedata.pageOverlay.Children.length > 0){
      const dialogUI = _pagedata.pageOverlay.Children[0].uiParts[_scrIndex];
      return sortUI_byDisplayOrder(dialogUI.dataarray[0].Fields, _scrIndex);
    }
    else return []; */   
  }
  else {
    //return sortUI_byDisplayOrder(_props['allChildren'], _scrIndex);
    const pageallChildren = getAllChildrenOnPage(_props.data, _scrIndex);
    return sortUI_byDisplayOrder(pageallChildren, _scrIndex);
  }
};

function sortUI_byDisplayOrder(uichildren, scrIndex) {
  if(!scrIndex) scrIndex = 0;  
  //console.log(".... sortUI_byDisplayOrder uichildren >>>>", uichildren);
  if(!uichildren) return [];

  uichildren.sort(function (a, b) {
    return a.uiParts[scrIndex].displayOrderOnScreen - b.uiParts[scrIndex].displayOrderOnScreen;
  });
  return uichildren;
}

function copyPageOverlay(pageOverlayDef, _scrIndex, _props) {
  let overlayData = pageOverlayDef['Children'];

  if(overlayData.length > 0) {
    let selectedPageIds = [];
    if(_props.hasOwnProperty('selectAll')) {
      if(!_props['selectAll'] && _props['selectedPages'].length > 0){
        selectedPageIds = _props['selectedPages'];
      }
    }
    
    const arrPages = _props['pageList'];
    for (let i = 0; i < arrPages.length; i++) {
      if(arrPages[i] === _props['currentPage']) {
        continue;
      }
      if(selectedPageIds.length > 0){
        const isPageIdSelected = (selectedPageIds.indexOf(arrPages[i]['pageid']) > -1) ? true : false;
        //console.log(selectedPageIds, "-->>>>>>", arrPages[i]['pageid'], isPageIdSelected);
        if(!isPageIdSelected){
          continue;
        }
      }

      if(!arrPages[i].hasOwnProperty('pageOverlay')) {
        arrPages[i]['pageOverlay'] = pageOverlayDef;
      }else {
        let otherPageOverlay = arrPages[i]['pageOverlay'];
        otherPageOverlay['Children'] = overlayData;
      }
    }

    const _msgDone = "Page Overlay children successfully copied. \n\n Please preview the app before closing the Page Editor, else the related changes will be lost."
    return _msgDone;
  }
  return "";
}

function copyPageEvents(pageEventsDef, _scrIndex, _props) {
  let pageEventsData = pageEventsDef;
  if(pageEventsData) {
    let selectedPageIds = [];
    if(_props.hasOwnProperty('selectAll')) {
      if(!_props['selectAll'] && _props['selectedPages'].length > 0){
        selectedPageIds = _props['selectedPages'];
      }
    }
    
    const arrPages = _props['pageList'];
    for (let i = 0; i < arrPages.length; i++) {
      if(arrPages[i] === _props['currentPage']) {
        continue;
      }
      if(selectedPageIds.length > 0){
        const isPageIdSelected = (selectedPageIds.indexOf(arrPages[i]['pageid']) > -1) ? true : false;
        if(!isPageIdSelected){
          continue;
        }
      }

      if(pageEventsDef.hasOwnProperty('beforeViewPage')) {
        arrPages[i]['actions']['beforeViewPage'] = pageEventsDef['beforeViewPage'];
      }
      if(pageEventsDef.hasOwnProperty('afterViewPage')) {
        arrPages[i]['actions']['afterViewPage'] = pageEventsDef['afterViewPage'];
      }
      if(pageEventsDef.hasOwnProperty('becameAwake')) {
        arrPages[i]['actions']['becameAwake'] = pageEventsDef['becameAwake'];
      }
    }

    const _msgDone = "Page Actions successfully copied. \n\n Please preview the app before exiting the Page Editor, else the related changes will be lost."
    return _msgDone;
  }
  return "";
}

function copypagebarResponse(pageBarDefs, _scrIndex, _props, isAllScreens, isSlaveScreen, masterScreenId) {
				
  if(pageBarDefs['viewType'] === "pageevents"){
    const _pageEventsDef = JSON.parse(JSON.stringify(pageBarDefs['events']));
    let msgCopyEvents = copyPageEvents(_pageEventsDef, _scrIndex, _props);
    return msgCopyEvents;

  }else if(pageBarDefs['viewType'] === "overlay"){
    const _pageOverlayDefs = JSON.parse(JSON.stringify(pageBarDefs))
    let msgCopyOverlay = copyPageOverlay(_pageOverlayDefs, _scrIndex, _props);
    return msgCopyOverlay;

  }else{
    let _pageBarDefs = JSON.parse(JSON.stringify(pageBarDefs));
    if(isAllScreens){
      for (let i = 0; i < _pageBarDefs.length; i++) {
        if(i === (_pageBarDefs.length - 1)) {
          return copyPageBars(_pageBarDefs[i], _props, i, isAllScreens, masterScreenId);
        }else{
          copyPageBars(_pageBarDefs[i], _props, i, isAllScreens, masterScreenId);
        }
      }
    }else{
      return copyPageBars(_pageBarDefs, _props, _scrIndex, isAllScreens, masterScreenId);
    } 
  }
  return "";				
}
function copyPageBars(_pageBarDefs, _props, _scrIndex, isAllScreens, masterScreenId) {

  const _barPosition = _pageBarDefs.barPosition.toUpperCase();				
  var pageBarData = [];
  if(_barPosition === "TOP" || _barPosition === "BOTTOM") {
    if(_pageBarDefs.hasOwnProperty('Children')) {
      pageBarData = _pageBarDefs['Children'];
    }						
  }else {						
    if(_pageBarDefs.hasOwnProperty('view')) {
      if(_pageBarDefs['view'] === "TableView") {
        if(_pageBarDefs.hasOwnProperty('tableData')) {
          pageBarData = _pageBarDefs['tableData'];
        }
      }else {
        if(_pageBarDefs.hasOwnProperty('Children')) {
          pageBarData = _pageBarDefs['Children'];
        }
      }
    }
  }

  //console.log(_scrIndex, pageBarDefs, "-->>>>>>", pageBarData);  
  if(pageBarData.length > 0) {
    let selectedPageIds = [];
    if(_props.hasOwnProperty('selectAll')) {
      if(!_props['selectAll'] && _props['selectedPages'].length > 0){
        selectedPageIds = _props['selectedPages'];
      }
    }
    const arrPages = _props['pageList'];
    
    for (let i = 0; i < arrPages.length; i++) {
      if(arrPages[i] === _props['currentPage']) {
        continue;
      }
      if(selectedPageIds.length > 0){
        const isPageIdSelected = (selectedPageIds.indexOf(arrPages[i]['pageid']) > -1) ? true : false;
        //console.log(selectedPageIds, "-->>>>>>", arrPages[i]['pageid'], isPageIdSelected);
        if(!isPageIdSelected){
          continue;
        }
      }
      if(_barPosition === "TOP" || _barPosition === "BOTTOM") {
        var toolBar;	
        if(_barPosition === "TOP")
          toolBar = arrPages[i]['_toolBarTop'];
        else
          toolBar = arrPages[i]['_toolBarBottom'];
        
        if(toolBar) 
        {
          if(toolBar.length > 0) {
            if(isAllScreens){

              console.log(_scrIndex, _pageBarDefs, "-->>>>>>", pageBarData);

              for (let tb = 0; tb < toolBar.length; tb++) {
                if(tb !== _scrIndex)  continue;
                var _pageToolbar = toolBar[tb];
                _pageToolbar['view'] = _pageBarDefs.view;
                //_pageToolbar['frame'] = _pageBarDefs.frame;
                _pageToolbar['backgroundColor'] = _pageBarDefs.backgroundColor;
                _pageToolbar['Children'] = JSON.parse(JSON.stringify(_pageBarDefs['Children']));//_pageBarDefs['Children']; 
                if(tb === masterScreenId){
                  masterScreenPageBarChildren(_pageToolbar['Children'], masterScreenId, _barPosition);
                }             
              }
            }else{
              let _pageToolbar = toolBar[_scrIndex];
              if(_pageToolbar){
                _pageToolbar['view'] = _pageBarDefs.view;
                _pageToolbar['backgroundColor'] = _pageBarDefs.backgroundColor;
                _pageToolbar['Children'] = JSON.parse(JSON.stringify(_pageBarDefs['Children']));
              }
            }
          }
          else
            toolBar.push(_pageBarDefs);
        }
      }else {	
        var sideBar;	
        if(_barPosition === "LEFT")
          sideBar = arrPages[i]['_toolBarLeft'];
        else
          sideBar = arrPages[i]['_toolBarRight'];
        if(sideBar) 
        {
          if(sideBar.length > 0) {
            if(isAllScreens){
              for (let sb = 0; sb < sideBar.length; sb++) {
                var _pageSidebar = sideBar[sb];
                _pageSidebar['view'] = _pageBarDefs['view'];              
                if(sb === _scrIndex){
                  _pageSidebar['fixed'] = _pageBarDefs['fixed'];
                  _pageSidebar['frame'] = _pageBarDefs.frame;
                }
                _pageSidebar['backgroundColor'] = _pageBarDefs.backgroundColor;
                if(_pageBarDefs['view'] === "TableView") {
                  _pageSidebar['Children'] = [];
                  _pageSidebar['tableData'] = _pageBarDefs['tableData'];
                }
                else {
                  _pageSidebar['tableData'] = [];
                  _pageSidebar['Children'] = JSON.parse(JSON.stringify(_pageBarDefs['Children']));               
                }             
              }
            }else{
              let _pageSidebar = sideBar[_scrIndex];
              if(_pageSidebar){
                _pageSidebar['fixed'] = _pageBarDefs['fixed'];
                _pageSidebar['frame'] = _pageBarDefs.frame;
                _pageSidebar['backgroundColor'] = _pageBarDefs.backgroundColor;
                _pageSidebar['Children'] = JSON.parse(JSON.stringify(_pageBarDefs['Children']));
                _pageSidebar['tableData'] = [];
              }
            }
          }
          else
            sideBar.push(_pageBarDefs);
        }
      }      
    }
    
    const _msgDone = "PageBar definitions successfully copied. \n\n Please preview the app before exiting the Page Editor, else the changes related 'Copy Page bars' will be lost."// Do you want to do it now?";
    return _msgDone;
  }
}
function masterScreenPageBarChildren(pageBarChildren, masterScreenId, barPosition) {
  console.log(masterScreenId, barPosition+"-ToolBar >>", pageBarChildren);
  /*for (let index = 0; index <  pageBarChildren.length; index++) {
    const _uiparts =  pageBarChildren[index]['uiParts'];
    if(_uiparts && _uiparts[masterScreenId]){
      const uiDef = _uiparts[masterScreenId];
      uiDef['_enabledOnScreen'] = false;
    }                    
  }*/
}

function getAllChildrenOnPage(_page, scrIndex)
{
  return getAllChildren_onPage(_page, scrIndex);
  
  //console.log(_page, "... getAllChildrenOnPage >>>>", scrIndex);
  /*let arrChildren = [];
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
      for (let i = 0; i < arrGroup.length; i++) 
      {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) 
        {
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
        for (let u = 0; u < arrTileItems.length; u++) 
        {
          arrChildren.push(arrTileItems[u]);								
        }
      }else if(uiContainerDic['viewType'] === "ExpansionPanel" || uiContainerDic['viewType'] === "SwipeableView") {
        const itemFieldName = (uiContainerDic['viewType'] === "ExpansionPanel") ? 'panelItems' : 'swipeableItems';
        let arrrPanelItems = uiContainerDic['uiParts'][scrIndex][itemFieldName];
        for (let p = 0; p < arrrPanelItems.length; p++) {
          let panerItemsField = arrrPanelItems[p]['Fields'];
          for (let pi = 0; pi < panerItemsField.length; pi++) {
            arrChildren.push(panerItemsField[pi]);								
          }                
        }
      }else if(uiContainerDic['viewType'] === "Form" || uiContainerDic['viewType'] === "FormView") {
        let arrFormItems = uiContainerDic['uiParts'][scrIndex].formItems[0]['Fields'];
        for (let f = 0; f < arrFormItems.length; f++) 
        {
          arrChildren.push(arrFormItems[f]);								
        }
      }else if(uiContainerDic['viewType'] === "DataGrid"){        
        const dataGridUI = uiContainerDic['uiParts'][scrIndex];
        const arrDataCols = dataGridUI.dataCols;
        for (let dg = 0; dg < arrDataCols.length; dg++) {
          let datacolField = (arrDataCols[dg]['isCustom']) ? arrDataCols[dg]['Fields'] : [];
          for (let dc = 0; dc < datacolField.length; dc++) {
            arrChildren.push(datacolField[dc]);								
          }                
        }       
      }
    });
  }
    
  // page-bars children 

  let cntTop = -1;
  if(_page._toolBarTop.length > 0) {		
    _page._toolBarTop.forEach(_topToolbar => {
      cntTop++;
      if(cntTop === scrIndex) {
        for (let t = 0; t < _topToolbar.Children.length; t++) 
        {
          arrChildren.push(_topToolbar.Children[t]);
          if(_topToolbar.Children[t]['viewType'] === "TileList") {
            let arrtTileItems = _topToolbar.Children[t]['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let t0 = 0; t0 < arrtTileItems.length; t0++) 
            {
              arrChildren.push(arrtTileItems[t0]);								
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
      if(cntBottom === 0) {
        for (let b = 0; b < _bottomToolbar.Children.length; b++) 
        {
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
    });
  }

  let cntLeft = -1;
  if(_page._toolBarLeft.length > 0)
  {
    _page._toolBarLeft.forEach(_leftToolbar => {
      cntLeft++;
      if(cntLeft === scrIndex) {
        for (let l = 0; l < _leftToolbar.Children.length; l++) {
          let leftToolbarUI = _leftToolbar.Children[l];
          arrChildren.push(leftToolbarUI);
          if(leftToolbarUI['viewType'] === "TileList") {
            let arrlTileItems = leftToolbarUI['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let l0 = 0; l0 < arrlTileItems.length; l0++) {
              arrChildren.push(arrlTileItems[l0]);								
            }
          }
          else if(leftToolbarUI['viewType'] === "ExpansionPanel" || leftToolbarUI['viewType'] === "SwipeableView") {
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
    });
  }
  let cntRight = -1;
  if(_page._toolBarRight && _page._toolBarRight.length > 0){
    _page._toolBarRight.forEach(_rightToolbar => {
      cntRight++;
      if(cntRight === scrIndex) {
        for (let r = 0; r < _rightToolbar.Children.length; r++) {
          let rightToolbarUI = _rightToolbar.Children[r];
          arrChildren.push(rightToolbarUI);
          if(rightToolbarUI['viewType'] === "TileList") {
            let arrrTileItems = rightToolbarUI['uiParts'][scrIndex].dataarray[0]['Fields'];
            for (let r0 = 0; r0 < arrrTileItems.length; r0++) {
              arrChildren.push(arrrTileItems[r0]);								
            }
          }
          else if(rightToolbarUI['viewType'] === "ExpansionPanel" || rightToolbarUI['viewType'] === "SwipeableView") {
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
          let arrDialogItems = overlayChildren[o]['uiParts'][scrIndex].dataarray[0]['Fields'];
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
    
  return arrChildren;*/
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}


function mapStateToProps(state) {   
  //console.log("PageEditor mapStateToProps >>>>>", state); 
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    contributorTabs: state.appData.contributortabs,
    pageLocale: state.appParam.pagelocale,
    pageContainer: state.appParam.pagecontainer,
    pageConfig: state.appParam.pageconfig,
    currentPage: state.selectedData.pagedata,
    pageChildren: state.selectedData.paeChildren,
    currentUI: state.selectedData.uidata,
    selectedUIs: state.selectedData.uiparts,
    targetEditor: state.selectedData.editor,
    layoutContainer: state.selectedData.container,
    contentEditorParent: state.selectedData.editorParent,
    previousEditorParent: state.selectedData.prevEditorParent,
    defaultScreenId: state.appParam.screenId,
  };
}
export default connect(mapStateToProps)(PageEditor);