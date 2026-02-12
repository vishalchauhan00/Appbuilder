import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { AppBar, Tab, Tabs, Snackbar, Tooltip, Fab, SvgIcon, Popover, Button, Select, Checkbox, FormControlLabel, IconButton, LinearProgress, CircularProgress, List, Input } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
//import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import ArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeftRounded';

import ProjectValidation from './projectValidation';
import ResourceEditor from '../editors/resourceEditor';
import DatabaseDetail from '../editors/databaseDetail';
import ScreenEditor from '../editors/screenEditor';
import AppVariableEditor from '../editors/appVariableEditor';
import StyleEditor from './StyleEditor';

import { setAutoSaving, setAllPageChanged, setProjectData, setEditorState, setAppCredentials, setDefaultScreenIndex, setPageList } from '../ServiceActions';
import LoginWindow from '../../components/LoginWindow';
import { getTabModuleAccess, checkProjectRole } from './Utility';
import PageConvertView from './PageConvertView';
import PriorityTabsView from './PriorityTabsView';


function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const AccordionSummary = withStyles(theme => ({
    root: {
      //height: 48, 
      minHeight: 48,   
      padding: theme.spacing(0, 1),
      backgroundColor: theme.palette.grey[300],
      '&$expanded': {
        minHeight: 48,
      },
    },
    content: {
      alignItems: 'center',
      '&$expanded': {
        margin: '4px 0px 4px 24px',
      },
    },   
    expanded: {},
  }))(MuiAccordionSummary);



class ProjectDetails extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
          isLoaded: false,
          isSessionError: false,       
          
          projectData: this.props.data,
          isContributorWorking: false,
          isProjectRoleOwner : true,
        };
    }
  
    componentDidMount() {
      //console.log("............. ProjectDetails componentDidMount ............");
      const _projectData = this.state.projectData;
      if(_projectData.hasOwnProperty("Contributors")) {
        const contributors = _projectData['Contributors'];        
        let contributorObj = contributors.filter(function(node) {
          if(node['contributorName'] !== _projectData['owner'] && node['contributorProjectid'] !== _projectData['projectid']){
              const contributorModules = node['selectTabPages'];
              if(contributorModules && contributorModules.length > 0){
                return true;
              }
              return false;
          }
          return false;
        });  
        if(contributorObj.length > 0) {
          this.setState({isContributorWorking: true});
        }

        const _projectRole = checkProjectRole(_projectData);
        if(_projectRole === "contributor") {
            this.setState({isProjectRoleOwner: false});
        }else{
            this.setState({isProjectRoleOwner: true});
        }        
      }
    }
  
    componentDidUpdate(prevProps,prevState) {    
       
    }

    componentWillUnmount() {
        clearTimeout(this.intervalID);
    }

    handleAutoSaving(autosave) {
        //console.log(autosave, "Enable Auto Saving", this.props.currentPage);
        this.props.dispatch(setAutoSaving(autosave));

        if (autosave){
            var self = this;
            this.intervalID = setInterval(() => {
                let currentpage = self.props.currentPage;                
                this.fetchUpdatePage(currentpage, self.props.appconfig);
            }, 600000);     //10 seconds

        } else {
            //console.log("clearInterval......", this.intervalID);
            clearInterval(this.intervalID);
        }
    }

    fetchUpdatePage(page, appConfig) {
        //console.log("fetchUpdatePage......", this.props);
        this.props.dispatch(setAllPageChanged(false));
        if(page && page['pageid']) {            

            this.updateDocument_forPage(page);
            page['IconTitle'] = page['TabBase']['icontitle'];

            var formData = new FormData();
            formData.append("command", "pageupdate");
            formData.append("userid", appConfig.userid);
            formData.append("sessionid", appConfig.sessionid);
            formData.append("projectid", appConfig.projectid);
            formData.append("pageid", page.pageid);

            let _jsonforsave = JSON.stringify(page);
            var pageData = encodeURIComponent(_jsonforsave);            
            let text = new File([pageData], "updatePage.txt", {type: "text/plain"});
            formData.append("file", text);
        
            return fetch(appConfig.apiURL+"multipartservice.json", {
              method: 'POST',
              body: formData
            })
            .then((response) => response.json())
            .then((result) => {
              //result = {"response":"ACK","count":1,"page":{....},"command":"pageupdate"} 
              //console.log('pageupdate result:', result);
              if(result.response === "NACK"){
                console.log("pageupdate : Error >>", result.error);
              }
              else{
                console.log("pageupdate : Success >> ", result.page);
              }
              return result;
            })
            .catch((error) => {
              console.error('pageupdate : catch >>', error);
            });
        }
    }
    updateDocument_forPage(pageObj) {
        const nowDate = new Date();
        let df = new Intl.DateTimeFormat('default', {      
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          literal: '-',
        });
        const formattedDate = df.format(nowDate);
        let dateVal = nowDate.getFullYear() +'-'+ formattedDate.split("/")[1] +'-'+ formattedDate.split("/")[0];
    
        let tf = new Intl.DateTimeFormat('default', {  
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });
        const timeVal = tf.format(nowDate);
    
        let strDate = dateVal  +' '+ timeVal;
        const i = nowDate.toString().indexOf("GMT");
        strDate = strDate +" GMT"+ nowDate.toString().substr(i+3, 5);
      
        let docObj = pageObj['Document'];
    
        let _pageCreatedDT =  docObj.filter(function(node) {
          return node.key === "createddatetime";
        });
        if(_pageCreatedDT.length === 0){
          let createdObj = {"key": "createddatetime", "value": ""};
          docObj.push(createdObj);
        }
    
        let _pageUpdateDT =  docObj.filter(function(node) {
          return node.key === "lastupdatedatetime";
        });
        if(_pageUpdateDT.length === 0){
          let createdObj = {"key": "lastupdatedatetime", "value": strDate};
          docObj.push(createdObj);
        }else {
          _pageUpdateDT[0]["value"] = strDate;
        }
    }

    handleProjectUpdate(projectData) {
        if(projectData) {
            const screenDefs = projectData['availableScreens'];
            if(screenDefs) {
                screenDefs.forEach(screenDef => {
                    if(screenDef['orientation'] === "Landscape" && (parseInt(screenDef['width']) < parseInt(screenDef['height']))) {
                        const screenClone = JSON.parse(JSON.stringify(screenDef));
                        screenDef['width'] = parseInt(screenClone['height']);
                        screenDef['height'] = parseInt(screenClone['width']);
                    }
                });
            }
            this.props.dispatch(setProjectData(projectData));
            this.setState({projectData: projectData});
        }
    }

    handlePageStates(_pagestates) {
        //console.log(".... handlePageStates >>>", _pagestates);
        this.props.dispatch(setEditorState({_pagestates}));
    }

    handleAppCredentials(credentials) {
        this.props.dispatch(setAppCredentials(credentials));
    }

    handleDefaultScreen(screenId) {
        this.props.dispatch(setDefaultScreenIndex(screenId));
    }

    handleSetAppLaunchLog(logcheck, logtime) {
        const projectData = this.state.projectData;
        if(projectData) {
            projectData['logAppLaunch'] = logcheck;
            projectData['logAppLaunchTime'] = logtime;
            this.props.dispatch(setProjectData(projectData));
            this.setState({projectData: projectData});
        }
    }

    handleSetGASet(gacheck) {
        const projectData = this.state.projectData;
        if(projectData) {
            projectData['isGASet'] = gacheck;
            this.props.dispatch(setProjectData(projectData));
            this.setState({projectData: projectData});
        }
    }

    handleUpdatePageList(pagelist){
        console.log("########", pagelist);
        this.props.dispatch(setPageList(pagelist));
    }
  
    render() {
        const appConfig = {apiURL: this.props.appconfig.apiURL, userid: this.props.appconfig.userid, sessionid: this.props.appconfig.sessionid, projectid: this.props.appconfig.projectid, version: this.props.apiParam.version};
        const selectedData = {  
                                pageList: this.props.pageList, 
                                openedPages: this.props.openedPages, 
                                pagesState: this.props['openedPagesState'], 
                                allpagesUpdated: this.props['allpagesUpdated'],
                                changedPagesId: this.props['changedPagesId'], 
                                selectedTabs: this.props['contributorTabs']
                            };
        const {isContributorWorking, isProjectRoleOwner} = this.state;
        const defaultScrId = (this.props.defaultScreenId) ? parseInt(this.props.defaultScreenId) : 0;
        const counter = -1;
        
        return (
            <ProjectDetail appconfig={appConfig} pageDic={this.props.pageContainer} data={this.state.projectData} selectedData={selectedData} 
                         updatedData={this.props.appData} defaultScreenId={defaultScrId} counter={counter}
                         isContributorWorking={isContributorWorking} isProjectRoleOwner={isProjectRoleOwner}
                         onSetAutoSaving={(...args) => this.handleAutoSaving(args[0])} onSavePageData={(...args) => this.fetchUpdatePage(args[0],args[1])} onProjectUpdateSuccess={(...args) => this.handleProjectUpdate(args[0])} 
                         onResetPageStates={(...args) => this.handlePageStates(args[0])} onRelogin={(...args) => this.handleAppCredentials(args[0])} onSetDefaultScreen={(...args) => this.handleDefaultScreen(args[0])}
                         onAppLaunchLog={(...args) => this.handleSetAppLaunchLog(args[0],args[1])} onEnableGA={(...args) => this.handleSetGASet(args[0])} onUpdatePageList={(...args) => this.handleUpdatePageList(args[0])}/>
                      
        );
    }
  }

  function ProjectDetail(props) {
    const useStyles = makeStyles(theme => ({
        root: {
          flexGrow: 1,
          background: theme.palette.background.default,
        },
        ulmargin: {
          width: '100%', 
          margin: theme.spacing(2, 3),
          marginRight: 72, 
          padding: theme.spacing(2, 4),
          border: '2px solid rgb(227,227,227)',
          borderRadius: '8px',
        },
        margin: {
          marginBottom: theme.spacing(1),
        },
        tab: {
          textTransform:'none',
          minWidth:110,
          background: theme.palette.background.paper,
          fontSize: theme.typography.pxToRem(15),
          fontWeight: theme.typography.fontWeightBold,
        },
        panel: {
          margin: theme.spacing(0.5),          
          border: '1px solid',
          borderBottom: '2px solid',
        },
        panelheader: {
            background: theme.palette.background.paper,
        },
        heading: {
          fontSize: theme.typography.pxToRem(15),
          fontWeight: theme.typography.fontWeightBold,
        },
        paneldetail: {
          padding: theme.spacing(1, 1.5, 1.5),
          maxHeight: 300,
          background: theme.palette.background.default,
        },  
        previewfab: {
          margin: theme.spacing(0),
          position: 'absolute',
          top: 56, right: 20,
        },
        settingfab: {
          margin: theme.spacing(0),
          position: 'absolute',
          top: 100, right: 20,
        },
        themefab: {
            margin: theme.spacing(0),
            position: 'absolute',
            top: 144, right: 20,
          },
        popover: {
          marginTop: theme.spacing(0.5),
        },
        paper: {
          padding: theme.spacing(0.5),
          background: theme.palette.background.default,
          right: 75,
          width: 160,
        },
        previewbtn:{
          width: '100%',
          height: 28,
          marginTop: theme.spacing(0.5),
          textTransform: 'none',
          borderRadius: theme.spacing(1),
        },
        popbtn:{
          width: '100%',
          textTransform: 'none',
          borderRadius: 'inherit',
          borderTop: '1px solid',
          borderBottom: '1px solid'
        },
        formlbl:{
          width: '100%',
          flexDirection: 'row',
          margin: 0,
          borderTop: '1px solid',
          borderBottom: '1px solid'
        },
        helptext: {
            textAlign: 'start',
            marginRight: theme.spacing(6),
            padding: theme.spacing(0.5),
            color: theme.palette.common.white,
            backgroundColor: theme.palette.grey[600],
            border: '2px solid rgb(227,227,227)',
            borderRadius: 8,
        },
        logdiv: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            margin: '2px 0px'
        },
        numinput: {
            width: 40, 
            height: 22,
            backgroundColor: theme.palette.grey[300],
        },

      }));
    const classes = useStyles();

    const apiParam = {apiURL: props.appconfig.apiURL, userid: props.appconfig.userid, sessionid: props.appconfig.sessionid, projectid: props.appconfig.projectid, version: props.appconfig.version};
    const projectdata = props.data;
    //const [projectdata, setProjectdata] = React.useState(props.data);
    //console.log(projectdata);

    let savedpagecounter = props.counter;
    const [showWait, setWaiting] = React.useState(false);
    const [errordisplay, setErrorDisplay] = React.useState(false); 
    const [errormessage, setErrorMessage] = React.useState(''); 

    function handleErrorDisplayClose(event) {           
        setErrorDisplay(false);
    }

    /////////////////////////////////////////////
    // Functionalities on Project Preview
    ////////////////////////////////////////////

    const [anchorPreview, setAnchorPreview] = React.useState(null);
    const openPreview = Boolean(anchorPreview);

    const [screens, setScreens] = React.useState([]);
    const [selectedScreen, setSelectedScreen] = React.useState(props.defaultScreenId);

    const [isSessionError, setSessionError] = React.useState(false);
    
    function handlePreviewOpen(event) {
        setAnchorPreview(event.currentTarget);
        setScreens(projectdata['availableScreens']);      
    }
    function handlePreviewClose() {
        setAnchorPreview(null);
    }    
    function handleChangeScreen(event) {
        let scrId = event.currentTarget.value;
        setSelectedScreen(scrId);
    }

    function filter_changedPagelist(allPages, pagesId) {
        let changedPagelist = [];
        for (let i = 0; i < allPages.length; i++) 
        {
            if(pagesId.length > 0){
                const isPageIdSelected = (pagesId.indexOf(allPages[i]['pageid']) > -1) ? true : false;
                if(isPageIdSelected){
                    changedPagelist.push(allPages[i]);
                }
            }
        }
        return changedPagelist;
    }

    function handleMobilePreview() {
        handlePreviewClick("mobile");
    }
    function handleDesktopPreview() {
        handlePreviewClick("desktop");
    }
    function handlePreviewClick(type) {
        let previewType = (type) ? type : "mobile";
        let pagelist = props['selectedData']['pageList'];
        if(pagelist.length === 0){
            setErrorMessage("App don't have any page data to preview.");
            setErrorDisplay(true);
        }else{

            /*console.log(projectdata['createddatetime'], "... DT >>>", projectdata['pelaunchDT']);
            let xdtobj = new Date(projectdata['createddatetime']);
            let ldtobj = new Date(projectdata['pelaunchDT']);
            console.log(xdtobj, "... DAtes >>>", ldtobj);
            if(xdtobj.getTime() > ldtobj.getTime()){
                setErrorMessage("There is some recent changes in DB schema after this PE launch. So, preview is not allowed. Please save your changes & reload PE.");
                setErrorDisplay(true);
                setWaiting(false);
                return;
            }*/

            fetchContributorsData().then(
                result => { 
                    if(result.response !== "ACK"){
                        var _err = {message: result.error};
                        console.log("project_contributors NotACK >>", _err);
                        setPreviewCall();
                    }else {
                        //console.log(projectdata, ".... project_contributors >>", result);
                        //{"response":"ACK", "Contributors":[{}, ...], "count":..}
                        const _ownerName = projectdata['owner'];
                        const _contributors = result['Contributors'];
                        if(_contributors) {
                            let contributorObj =  _contributors.filter(function(node) {
                                if(node.contributorName === _ownerName){
                                    return node;
                                }
                                return node.contributorName === _ownerName;
                            });
                            if(contributorObj.length > 0) {
                                const contributorPages = contributorObj[0]['selectTabPages'];
                                if(contributorPages.length === 0){
                                    const selectedTabModule = props.selectedData['selectedTabs'];
                                    if(selectedTabModule && selectedTabModule.length > 0) {
                                        if(selectedTabModule[0] !== 'none') {
                                            setErrorMessage("Contributor's selected pages already released. Thereafter changes will be discarded during merge.");
                                            setErrorDisplay(true);
                                            projectdata['Contributors'] = result['Contributors'];
                                        }
                                    }
                                }else{
                                    updateContributorsData(result['Contributors']);
                                }
                            }
                            //projectdata['Contributors'] = result['Contributors'];
                            setPreviewCall(previewType);
                        }
                    }
                }
            );
        }     
    }

    function updateContributorsData(resultData){
        //console.log(projectdata['owner'], "***************", projectdata['Contributors'], "======", resultData);
        let prjContributors = projectdata['Contributors'];
        for(let i=0; i<prjContributors.length; i++){
            if(prjContributors[i]['contributorName'] === projectdata['owner']){
                continue;
            }
            const resultObj = resultData.find(({ contributorName }) => contributorName === prjContributors[i]['contributorName']);
            if(resultObj){
                prjContributors[i] = resultObj;
            }
        }
    }

    function setPreviewCall(previewType) {
        handlePreviewClose();
        setWaiting(true);
        //console.log(savedataOnly, "...... setPreviewCall ........", props.selectedData['allpagesUpdated']);
        const _selectedData = props.selectedData;        
        
        let _openedPages;
        if(savedataOnly || _selectedData['allpagesUpdated']){
            _openedPages = _selectedData['pageList'];
        }else if(_selectedData.hasOwnProperty('changedPagesId') && _selectedData['changedPagesId'].length > 0){
            _openedPages = filter_changedPagelist(_selectedData['pageList'], _selectedData['changedPagesId']);
            //console.log(_selectedData.changedPagesId, "......_selectedData >>>>", _openedPages);
        }else {
            _openedPages = _selectedData['openedPages']; 
            /*if(_selectedData['selectedTabs']) {
                if(_selectedData['selectedTabs'].length === 1 && _selectedData['selectedTabs'][0] === 'none') {
                    _openedPages = []; 
                }
            }*/
        }
        
        if(_openedPages.length > 0) {
            savedpagecounter = _openedPages.length;
            savePages(_openedPages, previewType); 
        }else {
            saveProjectData(previewType);
        }
    }

    function savePages(_openedPages, previewType) {        
                
        const pagecounter = savedpagecounter -1;
        const page = _openedPages[pagecounter];
        if(page) {
            const _validateData = validatePageData(page, props.selectedData['pageList'], 0);
            if(_validateData.length > 0) {
                setErrorMessage("There are errors in page: "+ page['Title'] +". Please validate page/project.");
                setErrorDisplay(true);
                setWaiting(false);
                return;
            }

            let isAccess = (projectdata['Contributors'] && projectdata['Contributors'].length > 1) ? false : true;
            const saveAllPages = props.selectedData['allpagesUpdated'];
            if(saveAllPages && projectdata['ProjectRole'] === "owner") {
                isAccess = true;
            }else {
                const selectedTabModule = props.selectedData['selectedTabs'];
                if(selectedTabModule && selectedTabModule.length > 0) {
                    if(selectedTabModule[0] !== 'none') {
                        isAccess = getTabModuleAccess(page, selectedTabModule, props.selectedData['pageList'], projectdata);
                    }
                }
            }
            if(!isAccess){
                savedpagecounter = savedpagecounter -1;
                if(savedpagecounter > 0) {
                    savePages(_openedPages);
                }else if(savedpagecounter === 0) {
                    saveProjectData(previewType);
                }
            }else {
                props.onSavePageData(page, props.appconfig)
                .then(response => setPageSaveResponseHandler(response, _openedPages, previewType))
                .catch((error) => {
                    setWaiting(false);
                    setErrorMessage("Something went wrong. Please check Server/Internet connection.");
                    setErrorDisplay(true);
                });
            }
            console.log(pagecounter, savedpagecounter, "page for save >>>>", page['pageid'], page['Title']);
            
        }else {
            saveProjectData(previewType);
        }
    }
    function setPageSaveResponseHandler(response, _openedPages, previewType) {        
        if(response['response'] === "ACK") {
            savedpagecounter = savedpagecounter -1;

            resetPageState(response['page'], props.selectedData['pagesState']);            
        }else {
            const errormsg = response.error;
            if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                savedpagecounter = -1;
                setSessionError(true);
            }
            setErrorMessage(response.error);
            setErrorDisplay(true);
            setWaiting(false);
        }
        //console.log(_openedPages,"...pages remained to save....", savedpagecounter);
        if(savedpagecounter > 0) {
            savePages(_openedPages);
        }else if(savedpagecounter === 0) {
            saveProjectData(previewType);
        }
    }

    function saveProjectData(previewType) {        
        projectdata.isPreview = "1";
        projectdata.isPublish = "0";  

        const screenDefs = projectdata['availableScreens'];
        setLandscapeScreen(screenDefs);

        if(props.isProjectRoleOwner) {
            let pagelist = props['selectedData']['pageList'];
            if(pagelist.length > 0){
                let tabPages = [];
                for (let i = 0; i < pagelist.length; i++) {
                    if(pagelist[i]['parentid'] === "App"){
                        //console.log(i, ">>>", pagelist[i]['pageid'], "....", pagelist[i]['Title']);
                        tabPages.push(Number(pagelist[i]['pageid']));
                    }
                }
                projectdata['TabsOrder'] = tabPages;
            }
        }else{
            if(projectdata.hasOwnProperty('TabsOrder')){
                delete projectdata['TabsOrder'];
            }
        }

        /*let isMultidev = (projectdata['Contributors'] && projectdata['Contributors'].length > 1) ? true : false;
        if(!isMultidev){
            fetchUpdateProject(previewType);
        }else{*/
            if(projectdata.hasOwnProperty("environment")){
                projectdata.environment = "development";
                updateProjectKeys("environment", true); 
            }
            updateProjectKeys("isPreview", true);
            updateProjectKeys("isPublish", true);
            if(projectdata['TabsOrder']){
                updateProjectKeys("TabsOrder", false);
            }
            if(projectdata['availableScreens']){
                updateProjectKeys("availableScreens", false);
            }
            
            //since PE not updating Table definitions, so no need to save at time of 'preview'
            //this came since user can update tables in console while PE opened
            /*if(projectdata['TableDefs']){
                updateProjectKeys("TableDefs", false);
                updateProjectKeys("RemoteTableDefs", false);
            }*/

            if(sessionStorage){
                const _isGASet = sessionStorage.getItem("isGASet");
                if(_isGASet)    updateProjectKeys("isGASet", false);

                const _logAppLaunch = sessionStorage.getItem("logAppLaunch");
                if(_logAppLaunch){                    
                    updateProjectKeys("logAppLaunch, logAppLaunchTime", false);
                }else{
                    const _logAppLaunchTime = sessionStorage.getItem("logAppLaunchTime");
                    if(_logAppLaunchTime)    updateProjectKeys("logAppLaunchTime", false);
                }

                sessionStorage.clear();
            }
            
            props.onProjectUpdateSuccess(projectdata);

            fetchPreviewCall(previewType);
        //}
    }
    function setLandscapeScreen(screenDefs) {
        screenDefs.forEach(screenDef => {
            if(screenDef['orientation'] === "Landscape" && (parseInt(screenDef['width']) > parseInt(screenDef['height']))) {
              const screenClone = JSON.parse(JSON.stringify(screenDef));
              screenDef['width'] = parseInt(screenClone['height']);
              screenDef['height'] = parseInt(screenClone['width']);
            }
        });
    }
    function resetLandscapeScreen(screenDefs) {
        screenDefs.forEach(screenDef => {
            if(screenDef['orientation'] === "Landscape" && (parseInt(screenDef['width']) < parseInt(screenDef['height']))) {
              const screenClone = JSON.parse(JSON.stringify(screenDef));
              screenDef['width'] = parseInt(screenClone['height']);
              screenDef['height'] = parseInt(screenClone['width']);
            }
        });
    }

    function resetPageState(pagedata, pagesState) {
        const updatepageid = pagedata['pageid'];
        let pageStatesArr = (pagesState.hasOwnProperty('_pagestates')) ? pagesState._pagestates : [];
        for (let index = 0; index < pageStatesArr.length; index++) {
            const _page = pageStatesArr[index];
            if(_page[updatepageid]){
              //console.log(updatepageid, "relaodPageList >>>>>>>>>>>>>>>>>", _page[updatepageid]);
              let __pageState = _page[updatepageid];
              __pageState['init'][0] = JSON.parse(JSON.stringify(pagedata));
              __pageState['undo'] = __pageState['redo'] = [];
              //console.log("Means page opened, need to update state >>>>>>>>", __pageState);
            }      
        }        
        props.onResetPageStates(pageStatesArr);
    }

    /*function fetchUpdateProject(previewType) {
        var formData = new FormData();
        formData.append("command", "projectupdate");
        formData.append("userid", props.appconfig.userid);
        formData.append("sessionid", props.appconfig.sessionid);
        formData.append("projectid", props.appconfig.projectid);

        var prjctData = encodeURIComponent(JSON.stringify(projectdata));
        let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
        formData.append("file", text);

        fetch(props.appconfig.apiURL+"multipartservice.json", {
            method: 'POST',
            body: formData
        })
        .then((response) => response.json())
        .then((result) => {
            //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
            if(result.response === "NACK"){
                const errormsg = result.error;
                if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                    setSessionError(true);
                }

                var _err = {message: result.error};
                console.log("projectupdate : Error >>", _err);
                setErrorMessage(result.error);
                setErrorDisplay(true);
                setWaiting(false);
            }
            else{  
                props.onProjectUpdateSuccess(result.project);
                        
                if(!savedataOnly) {
                    //set genappdb.db through 'createschemalocaldb'
                    fetchCreateldbSchema();                
    
                    //call preview
                    fetchPreviewCall(previewType);
                }else {
                    setWaiting(false);
                    //setSavedataOnly(false);
                    savedataOnly = false;
                }
            }
        })
        .catch((error) => {
            console.error('projectupdate : catch >>', error);
            setWaiting(false);
            setErrorMessage("Something went wrong. Please check Server/Internet connection.");
            setErrorDisplay(true);
        });
    }

    function fetchCreateldbSchema() {
        let _fetchLocalSchemaUrl = props.appconfig.apiURL+"service.json?command=createschemalocaldb&userid="+props.appconfig.userid+"&sessionid="+props.appconfig.sessionid+"&projectid="+props.appconfig.projectid+"&tablename=spotdetail";
        fetch(_fetchLocalSchemaUrl, {method: 'POST'})
            .then(res => res.json())
            .then(
                (result) => {
                    // {
                    //    response: "ACK", count: 1, command: "createschemalocaldb", 
                    //    results:[{"tablename":"spotdetail","createschemalocaldb":"NACK"}] / [{"createschemalocaldb":"ACK"}] 
                    // }
                    if(result.response !== "ACK"){
                        var _err = {message: result.error};
                        console.log(_err);
                    }else {
                        //console.log("createschemalocaldb >>", result['results']);
                    }
                },
                (error) => {
                    console.log(error);
                }
            )
    }*/

    function fetchPreviewCall(previewType) {
        const screenDef = projectdata['availableScreens'];
        resetLandscapeScreen(screenDef);
        //console.log("fetchPreviewCall screenDef >>>>", screenDef);
        const _scrIndex = (selectedScreen) ? selectedScreen : 0;

        let _fetchPreviewUrl = props.appconfig.apiURL+"service.json?command=temppublish&userid="+props.appconfig.userid+"&sessionid="+props.appconfig.sessionid+"&projectid="+props.appconfig.projectid+"&screenId="+_scrIndex+"&language=en&version=4.0";
        fetch(_fetchPreviewUrl, {method: 'POST'})
            .then(res => res.json())
            .then(
                (result) => {
                    // {response: "ACK", count: 1, command: "temppublish", previewURL: "...." }
                    if(result.response === "ACK"){
                        let _previewSecureURL = result['previewURL'];
                        if(_previewSecureURL && _previewSecureURL.indexOf('https') > -1)
                        {
                            const screenDic = screenDef[_scrIndex];
                            let path = window.location.href.split('/index.html')[0];
                            let _previewUrl = path+"/assets/preview.html?iurl="+ _previewSecureURL +"?height="+screenDic['height']+"&width="+screenDic['width'];                            
                            if(path.indexOf('localhost') > -1){
                                _previewUrl = _previewSecureURL;
                            } 
                            console.log("Preview URL ********************", _previewUrl);
                            openPreviewWindow(_previewUrl, screenDic, previewType);
                        }else {
                            const _msg = "Preview generation failed. Please validate project";
                            setErrorMessage(_msg);
                            setErrorDisplay(true);
                        }
                    }
                    else 
                    {
                        const errormsg = result.error;
                        if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                            setSessionError(true);
                        }

                        var _err = {message: errormsg};
                        console.log(_err);
                        setErrorMessage(errormsg);
                        setErrorDisplay(true);
                    }
                    setWaiting(false);
                },
                (error) => {
                    console.log(error);
                }
            )
    }

    function openPreviewWindow(_url, _screen, previewType)
    {
        console.log( "open...previewType >>>", previewType);

        const _hei = (previewType === "mobile") ? _screen['height']+4 : window.innerHeight;
        const _wid = (previewType === "mobile") ? _screen['width']+4 : window.innerWidth;
        var _args = "height="+_hei+",width="+_wid+",left=300,top=150,menubar=no,statusbar=no,toolbar=no,scrollbars=no,location=no,modal=yes";
        window.open(_url, "Application Preview", _args);  
    }

    function handleRelogin(credentialObj) {
        if(credentialObj && credentialObj.hasOwnProperty('status')) {
            if(credentialObj.status === "NACK") {
                setErrorMessage(credentialObj.result.error);
                setErrorDisplay(true);
            }else{
                let credentials = credentialObj.result;
                props.onRelogin(credentials);

                setSessionError(false);
            }
        }else{
            setErrorMessage("Something went wrong. Please re-login from console.");
            setErrorDisplay(true);
        }
    }
    function handleUserSession(sessionObj){
        if(sessionObj && sessionObj.hasOwnProperty('status')) {
            if(sessionObj.status === "NACK") {
                setErrorMessage(sessionObj.result.error);
                setErrorDisplay(true);

            }else{
                props.onRelogin(sessionObj.result);
                setSessionError(false);
            }
        }
    }

    function fetchContributorsData() {
        let _fetchContributorsData = props.appconfig.apiURL+"project_contributors.json?project_id="+props.appconfig.projectid;
        return fetch(_fetchContributorsData)
            .then(res => res.json())
            .then(
                (result) => {                    
                    return result;
                },
                (error) => {
                    //console.log("project_contributors Error >>", error);
                    return {"response":"ERROR", "error": error['message']};
                }
            )
    }

    function updateProjectKeys(keytoupdate, isStringType) {
        const updatedval = projectdata[keytoupdate];
      
        let apiurl = props.appconfig.apiURL;
        var formData = new FormData();
        if(isStringType){
            apiurl = apiurl+"service.json";

            formData.append("command", "projectkeyupdate");
            formData.append("projectid", props.appconfig['projectid']);
            formData.append("userid", props.appconfig['userid']);
            formData.append("sessionid", props.appconfig['sessionid']);
            formData.append("key", keytoupdate);
            formData.append("value", updatedval);
        }else{
            apiurl = apiurl+"multipartservice.json";

            formData.append("command", "projectupdate");
            formData.append("projectid", props.appconfig['projectid']);
            formData.append("userid", props.appconfig['userid']);
            formData.append("sessionid", props.appconfig['sessionid']);
          
            var keyObj = {};
            var arrKeys = keytoupdate.split(",");
            for (let index = 0; index < arrKeys.length; index++) {
              const elemKey = arrKeys[index];
              keyObj[elemKey] = projectdata[elemKey];    
            }  
            let text = new File([JSON.stringify(keyObj)], "updateProject.txt", {type: "text/plain"});
            formData.append("file", text);
        }

        fetch(apiurl, {
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
          },
          (error) => {
            console.log("projectkeyupdate Error >>> Fail");
          }
        )
    }

    function handleSaveAllPages() {
        const arrPages = props.selectedData['pageList'];
        if(arrPages.length === 0){
            setErrorMessage("No pages are there to save. Please verify.");
            setErrorDisplay(true);
            return;
        }

        setWaiting(true);

        var formData = new FormData();
        formData.append("command", "updateallpages");
        formData.append("userid", props.appconfig.userid);
        formData.append("sessionid", props.appconfig.sessionid);
        formData.append("projectid", props.appconfig.projectid);
        
        let objPages = {pages:arrPages};
        //console.log(objPages,"...SaveAllPages *************", JSON.stringify(objPages));
        //var pagesdata = encodeURIComponent(JSON.stringify(objPages));
        //let text = new File([pagesdata], "updateallpages.txt", {type: "text/plain"});
        let text = new File([JSON.stringify(objPages)], "updateallpages.txt", {type: "text/plain"});
        formData.append("file", text);

        fetch(props.appconfig.apiURL+"multipartservice.json", {
            method: 'POST',
            body: formData
        })
        .then((response) => response.json())
        .then((result) => {
            console.log("** updateallpages **", result);
            //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
            if(result.response === "NACK"){
                const errormsg = result.error;
                if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                    setSessionError(true);
                }

                var _err = {message: result.error};
                console.log("updateallpages : Error >>", _err);
                setErrorMessage(result.error);
                setErrorDisplay(true);
                setWaiting(false);
            }
            else{  
                setErrorMessage("Success : pages data saved");
                setErrorDisplay(true);
                setWaiting(false);
            }
        })
        .catch((error) => {
            console.error('updateallpages : catch >>', error);
            setWaiting(false);
            setErrorMessage("Something went wrong. Please check Server/Internet connection.");
            setErrorDisplay(true);
        });
    }

    /////////////////////////////////////////////
    // Functionalities on Project Setting
    ////////////////////////////////////////////

    const [anchorSetting, setAnchorSetting] = React.useState(null);
    const openSetting = Boolean(anchorSetting);
    
    function handleSettingClick(event) {
      setAnchorSetting(event.currentTarget);
    }
    function handleSettingClose() {
      setAnchorSetting(null);
    }

    /** ****** Auto Saving ***** */
    const [enableAutoSave, setAutoSave] = React.useState(false);
    function handleAutoSavingClick(event) {
        setAutoSave(event.target.checked);        
        props.onSetAutoSaving(event.target.checked);

        handleSettingClose();
    }

    /** ****** Project Validation ***** */
    const [openvalidation, setOpenValidationView] = React.useState(false);
    function handleValidationClick(event) {
        setOpenValidationView(true);
    }
    function handleCloseValidations() {
        setOpenValidationView(false);
        handleSettingClose();
    } 

    /** ****** App Events ***** */
    function handleEventsClick(event) {
        console.log("Project Events Handler", projectdata['appEvents'], projectdata['pnEvents']);
        //applicationDidEnterBackground
        //applicationIdleTimeout
        handleSettingClose();
    }

    /** ****** Default Screen ***** */
    const [opensetscreen, showDefaultScreenPopup] = React.useState(false);
    function handleDefaultScreenClick(event) {
        const _openedPages = props.selectedData['openedPages'];
        if(_openedPages && _openedPages.length > 0) {
            setErrorMessage('Please close all opened pages.');
            setErrorDisplay(true);
        }else {
            showDefaultScreenPopup(true);
            handleSettingClose();
        }
    }
    function handleCloseDefaultScreen() {
        showDefaultScreenPopup(false);
    }
    function handleSetDefaultScreen(scrId) {
        props.onSetDefaultScreen(scrId);
        showDefaultScreenPopup(false);
    }

    /** ****** Priority Tabs ***** */
    const [openprioritytabWindow, setPriorityTabView] = React.useState(false);
    function handlePriorityTabsWindow() {
        const _pageCount = props.selectedData['pageList'].length;
        if(_pageCount === 0){
            setErrorMessage("No pages are there in the app yet.");
            setErrorDisplay(true);
            return;
        } 

        const _openedPages = props.selectedData['openedPages'];
        if(_openedPages.length === 0) {
            setPriorityTabView(true);
        }else {            
            handleSettingClose();
            setErrorMessage("Please close all opened pages.");
            setErrorDisplay(true);
        }
    }
    function handleClosePriorityTabsWindow(){
        setPriorityTabView(false);
        handleSettingClose();
    }

    function handleUpdatePriorityTabs(tabslist){
        setPriorityTabView(false);
        handleSettingClose();
        
        console.log("priorityTabs >>>>>", tabslist);
        projectdata['priorityTabs'] = tabslist;
        updateProjectKeys("priorityTabs", false);
    }


    ///////// more functionalities //////////

    const [anchorMore, setAnchorMore] = React.useState(null);
    const openMoreSetting = Boolean(anchorMore);

    function handleClickMore(event) {
        setAnchorMore(event.currentTarget);
    }
    function handleCloseMore() {
        setAnchorMore(null);
    }

    /** ****** App launch logs ***** */
    const [islogAppLaunch, setLogAppLaunch] = React.useState(props.data['logAppLaunch']);
    const [thresholdTime, setThresholdTime] = React.useState(props.data['logAppLaunchTime']);
    function handleAppLaunchLog(event) {
        setLogAppLaunch(event.target.checked); 
        props.onAppLaunchLog(event.target.checked, thresholdTime);
        sessionStorage.setItem("logAppLaunch", event.target.checked);
        sessionStorage.setItem("logAppLaunchTime", thresholdTime);

        const _msg = "Preview is must to save changes.";
        setErrorMessage(_msg);
        setErrorDisplay(true);
    }
    function handleThresholdTime(event) {
        const _time = parseInt(event.currentTarget.value);
        setThresholdTime(_time);
        props.onAppLaunchLog(islogAppLaunch, _time);
        sessionStorage.setItem("logAppLaunchTime", _time);
    }

    /** ****** enable Google Analytics ***** */
    const [enableGA, isGAEnable] = React.useState(props.data['isGASet']);
    function handleGAEnabledClick(event) {
        isGAEnable(event.target.checked);        
        props.onEnableGA(event.target.checked);
        sessionStorage.setItem("isGASet", event.target.checked);

        //handleSettingClose();
        const _msg = "Preview is must to save this change.";
        setErrorMessage(_msg);
        setErrorDisplay(true);
    }

    /** ****** check Pages for Performance issue ***** */
    const [openperformancepageWindow, setPerformancePageView] = React.useState(false);
    function handlePerformancePageWindow() {
        const _pageCount = props.selectedData['pageList'].length;
        if(_pageCount === 0){
            setErrorMessage("No pages are there in the app yet.");
            setErrorDisplay(true);
            return;
        } 

        const _openedPages = props.selectedData['openedPages'];
        if(_openedPages.length === 0) {
            setPerformancePageView(true);
        }else {            
            setAnchorMore(null);
            setErrorMessage("Please close all opened pages.");
            setErrorDisplay(true);
        }
    }
    function handleClosePerformancePageWindow(){
        setPerformancePageView(false);
        setAnchorMore(null);
    }

    function handleUpdatePerformancePages(pageIds){
        setPerformancePageView(false);
        setAnchorMore(null);
        
        //console.info("Performance Page >>>>>", pageIds);
        localStorage.setItem("performance", pageIds);
    }

    /** ****** Page convert: Free layout to Scroll ***** */
    const [openpageconvert, setPageConvert] = React.useState(false);
    function handlePageConvertWindow() {
        const _pageCount = props.selectedData['pageList'].length;
        if(_pageCount === 0){
            setErrorMessage("No pages are there in the app yet.");
            setErrorDisplay(true);
            return;
        }     

        const _openedPages = props.selectedData['openedPages'];
        if(_openedPages.length === 0) {
            setPageConvert(true);
        }else {            
            setAnchorMore(null);
            setErrorMessage("Please close all opened pages.");
            setErrorDisplay(true);
        }
    }
    function handleClosePageConvertWindow(){
        setPageConvert(false);
        setAnchorMore(null);
    }

    function handleUpdatePageList(pagelist){
        setPageConvert(false);
        setAnchorMore(null);

        props.onUpdatePageList(pagelist);
    }

    
    ///////////////////// Style Editor ///////////////////////

    const [openstyleeditor, setStyleEditor] = React.useState(false);
    //const [savedataOnly, setSavedataOnly] = React.useState(false);

    function handleStyleEditorClick(event) {
        const _openedPages = props.selectedData['openedPages'];
        if(_openedPages.length === 0) {
            setStyleEditor(true);
        }else {            
            setErrorMessage("Please close all opened pages.");
            setErrorDisplay(true);
        }        
    }

    let savedataOnly = false;
    function handleCloseStyleEditor(param) {
        setStyleEditor(false);

        if(param !== "") {
            //setSavedataOnly(true);
            savedataOnly = true;
            if(param === "apply") {
                //setWaiting(true);
                //fetchUpdateProject();
                updateProjectKeys("AppStyle", false);

            }else if(param === "applysave") {
                console.log(props['selectedData'], projectdata['AppStyle']['PageStyle'], "... applysave >>>", props['selectedData']['pageList']);
                const allPages = props['selectedData']['pageList'];
                for(let i = 0; i < allPages.length; i++) {
                    let pageObj = allPages[i];
                    updatePageDicwithStyle(pageObj);
                }
                updateProjectKeys("AppStyle", false);
                handlePreviewClick();
            }
        }        
    }
    function updatePageDicwithStyle(pageDic) {
        const appPageStyle = projectdata['AppStyle']['PageStyle'];        
        if(appPageStyle && appPageStyle.length > 0){
            //console.log(pageDic, "...... updatePageDic ----->>>>>", appPageStyle);
            const pageBGcolor = getStylePropValue(appPageStyle, 'body', 'background-color');
            const pageGradient = getStylePropValue(appPageStyle, 'body', 'background-gradient');
            if(pageDic['viewType'] === "ScrollView") {
                pageDic.Children[0]['backgroundColor'] = pageBGcolor;
                if(pageGradient.length > 0) pageDic.Children[0]['backgroundGradient'] = pageGradient;
            }else{
                pageDic['backgroundColor'] = pageBGcolor;
                if(pageGradient.length > 0) pageDic['backgroundGradient'] = pageGradient;
            }

            if(pageDic['viewType'].indexOf("TableView") > -1) {
                const cellBGcolor = getStylePropValue(appPageStyle, 'table', 'cell-color');
                pageDic.Children[0].Group[0]['RecordCellDef']['backgroundColor'] = cellBGcolor;
                pageDic.Children[0].Group[0]['RecordCellDef']['alternatingRowColors1'] = cellBGcolor;
                const cellAlternatecolor = getStylePropValue(appPageStyle, 'table', 'alternate-cell-color');
                pageDic.Children[0].Group[0]['RecordCellDef']['alternatingRowColors2'] = cellAlternatecolor;
            }

            pageDic['_navigationBars'][0]['tintColor'] = getStylePropValue(appPageStyle, 'navbar', 'background-color');
            //pageDic['_navigationBars'][0]['barHidden'] = !(getStylePropValue(appPageStyle, 'navbar', 'visible'));
            //pageDic['NavigationBarHidden'] = pageDic['_navigationBars'][0]['barHidden'];

            pageDic['TabTintColor'] = getStylePropValue(appPageStyle, 'tabbar', 'background-color');
            //pageDic['_tabBarHiddens'][0] = !(getStylePropValue(appPageStyle, 'tabbar', 'visible'));

            const screenDefs = projectdata['availableScreens'];
            for (let i = 0; i < screenDefs.length; i++) {
                
                pageDic['_toolBarTop'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'topnav', 'background-color');
                pageDic['_toolBarTop'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'topnav', 'background-gradient');
                //pageDic['_toolBarTop'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'topnav', 'visible'));
    
                pageDic['_toolBarBottom'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'bottomnav', 'background-color');
                pageDic['_toolBarBottom'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'bottomnav', 'background-gradient');
                //pageDic['_toolBarBottom'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'bottomnav', 'visible'));
    
                pageDic['_toolBarLeft'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'leftnav', 'background-color');
                pageDic['_toolBarLeft'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'leftnav', 'background-gradient');
                //pageDic['_toolBarLeft'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'leftnav', 'visible'));
    
                pageDic['_toolBarRight'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'rightnav', 'background-color');
                 pageDic['_toolBarRight'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'rightnav', 'background-gradient');
                //pageDic['_toolBarRight'][0]['hidden'] = !(getStylePropValue(appPageStyle, 'rightnav', 'visible'));                
            }
        }

        return pageDic;
    }
    function getStylePropValue(pageStyleData, stylename, propname) {
        let propval = '#ffffff';
        let styleObj = getStyleObject(pageStyleData, stylename);    
        if(styleObj.length > 0) {
          const styleData = styleObj[0];
          styleData['children'].forEach(element => {
            if(element['name'] === propname){
                if(element['type'] === "color") {
                    propval = hextoRGB(element['value']);
                }else{
                    propval = element['value'];
                }              
            }
          });
        }    
        return propval;
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

    ///////////////////// Resource Manager ///////////////////////

    function handleResourceUpdate(_func, _type, _resourceObj, _resourceData) {
        //console.log(_func, _type, _resourceObj, ".... updateResourceData >>>>>>>>>", _resourceData);
        if(_func === "add") 
        {
            if(_type === 'image') {
                projectdata.images.push(_resourceObj);
                
            }else if(_type === 'video') {
                projectdata.videos.push(_resourceObj);                
            
            }else if(_type === "bgm") {
                projectdata.bgms.push(_resourceObj);                
            
            }else if(_type === "soundeffect") {
                projectdata.soundeffects.push(_resourceObj);                
            
            }else{
                projectdata.others.push(_resourceObj);
            }
        }else if(_func === "remove") 
        {
            const _resourcename = _resourceObj["filename"];
            if(_type === 'image') {
                projectdata.images.forEach((image,index) => {
                    if(image.filename === _resourcename) {
                        projectdata.images.splice(index,1);
                    }                    
                });
                
            }else if(_type === 'video') {
                projectdata.videos.forEach((video,index) => {
                    if(video.filename === _resourcename) {
                        projectdata.videos.splice(index,1);
                    }                    
                });                
            
            }else if(_type === "bgm") {
                projectdata.bgms.forEach((bgm,index) => {
                    if(bgm.filename === _resourcename) {
                        projectdata.bgms.splice(index,1);
                    }                    
                });               
            
            }else if(_type === "soundeffect") {
                projectdata.soundeffects.forEach((soundeffect,index) => {
                    if(soundeffect.filename === _resourcename) {
                        projectdata.soundeffects.splice(index,1);
                    }                    
                });                
            
            }else{
                projectdata.others.forEach((other,index) => {
                    if(other.filename === _resourcename) {
                        projectdata.others.splice(index,1);
                    }                    
                });
            }            
        }
    }

    /////////////////////// Screen Manager /////////////////////////

    function handleSaveAllPagesData() {
        console.log("handleSaveAllPagesData >>>>>", props.selectedData);        
        handlePreviewClick();

        /*fetchContributorsData().then(
            result => { 
                if(result.response !== "ACK"){
                    var _err = {message: result.error};
                    console.log("project_contributors NotACK >>", _err);
                    updateProjectData();
                }else {
                    const _ownerName = projectdata['owner'];
                    const _contributors = result['Contributors'];
                    if(_contributors) {
                        let contributorObj =  _contributors.filter(function(node) {
                            if(node.contributorName === _ownerName){
                                return node;
                            }
                            return node.contributorName === _ownerName;
                        });
                        if(contributorObj.length > 0) {
                            const contributorPages = contributorObj[0]['selectTabPages'];
                            if(contributorPages.length === 0){
                                const selectedTabModule = props.selectedData['selectedTabs'];
                                if(selectedTabModule && selectedTabModule.length > 0) {
                                    if(selectedTabModule[0] !== 'none') {
                                        setErrorMessage("Contributor's selected pages already released. Thereafter changes will be discarded during merge.");
                                        setErrorDisplay(true);
                                        projectdata['Contributors'] = result['Contributors'];
                                    }
                                }
                            }else{
                                updateContributorsData(result['Contributors']);
                            }
                        }
                        //projectdata['Contributors'] = result['Contributors'];
                        updateProjectData();
                    }
                }
            }
        );*/
    }
    /*function updateProjectData() {
        var formData = new FormData();
        formData.append("command", "projectupdate");
        formData.append("userid", props.appconfig.userid);
        formData.append("sessionid", props.appconfig.sessionid);
        formData.append("projectid", props.appconfig.projectid);

        var prjctData = encodeURIComponent(JSON.stringify(projectdata));
        let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
        formData.append("file", text);

        fetch(props.appconfig.apiURL+"multipartservice.json", {
            method: 'POST',
            body: formData
        })
        .then((response) => response.json())
        .then((result) => {
            //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
            if(result.response === "NACK"){
                const errormsg = result.error;
                if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                    setSessionError(true);
                }

                var _err = {message: result.error};
                console.log("projectupdate : Error >>", _err);
                setErrorMessage(result.error);
                setErrorDisplay(true);
                setWaiting(false);
            }
            else{  
                props.onProjectUpdateSuccess(result.project);
                        
                handleSaveAllPages();
            }
        })
        .catch((error) => {
            console.error('projectupdate : catch >>', error);
            setWaiting(false);
            setErrorMessage("Something went wrong. Please check Server/Internet connection.");
            setErrorDisplay(true);
        });
    }*/

    /////////////////////////////////////////////////////////////

    const [value, setTabValue] = React.useState(0);
    const [expanded, setExpanded] = React.useState(false);    
    const [snackbaropen, setSnackbarOpen] = React.useState(true); 
    const [isallowtoUpdate, setAllowtoUpdate] = React.useState(true);   
    function handleTabChange(event, newValue) {
        setTabValue(newValue);

        if(newValue === 2) {    // screen settings
            const _projectData = props.data;
            if(_projectData && _projectData.hasOwnProperty("Contributors")) {
                const contributors = _projectData['Contributors'];
                if(contributors.length > 1){    // means contributors assigned
                    let canOwnerAccess = true;

                    for (let index = 0; index < contributors.length; index++) {
                        const node = contributors[index];
                        if(node['contributorName'] === _projectData['owner'] && node['contributorProjectid'] === _projectData['projectid']){
                            //means owner project
                            const ownerModules = node['selectTabPages'];                        
                            if(ownerModules) {// && ownerModules.length > 0){
                                console.log(props.selectedData['pageList'], ownerModules);
                                const _pageList = props.selectedData['pageList'];
                                let tabPageIDs = [];
                                _pageList.forEach(page => {
                                    if(page['parentid'] === "App") {
                                        tabPageIDs.push(page.pageid);
                                    }
                                });
    
                                if(tabPageIDs.length !== ownerModules.length){
                                    //console.log("tabPageIDs >>>", tabPageIDs);
                                    canOwnerAccess = false;
                                }
                            }                        
                        }else{
                            const contributorModules = node['selectTabPages'];
                            if(contributorModules && contributorModules.length > 0){
                                canOwnerAccess = false;
                            }
                        }
                    }

                    if(!canOwnerAccess){
                        // commented below lines for 19801
                        //setErrorMessage("Owner must have select all modules before making any change in screen setting.");
                        //setErrorDisplay(true);
                        setAllowtoUpdate(false);
                    }
                }    
            }
        }    
    }
    
    const handleExpansion = panel => (event, isExpanded) => {
        //console.log(panel, "<< akshay >>", isExpanded);
        setExpanded(isExpanded ? panel : false);
    };
    
    function handleSnackbarClose(event, reason) {
        if (reason === 'clickaway') {
          return;
        }    
        setSnackbarOpen(false);
    }
    

    return (
        <div className={classes.root}>
            {showWait && 
                <div className="backdropStyle" style={{zIndex:9999}}>
                    <Typography variant="h5" color="textSecondary" className="waitlabel"><CircularProgress style={{marginRight:12}} />Please Wait ....</Typography>                
                </div>
            }            
            <div className="horizontal-align">
                <ul className={classes.ulmargin} key={projectdata.projectid}>
                    <li className={classes.margin}><strong>Project Id: </strong>{projectdata.projectid}</li>
                    <li className={classes.margin}><strong>Project Name: </strong>{projectdata.ProjectName}</li>
                    <li className={classes.margin}><strong>Owner: </strong>{projectdata.owner}</li>
                    <li className={classes.margin}><strong>Version: </strong>{projectdata.version}</li>
                    <li className={classes.margin}><strong>Created at: </strong>{projectdata.createddatetime}</li>
                </ul>
                <Tooltip title="Preview">
                    <Fab size="small" aria-label="preview" className={classes.previewfab} onClick={handlePreviewOpen}>
                        <SvgIcon>
                            <path fill="none" d="M0 0h24v24H0V0z"/><path d="M23 11.01L18 11c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-9c0-.55-.45-.99-1-.99zM23 20h-5v-7h5v7zM20 2H2C.89 2 0 2.89 0 4v12c0 1.1.89 2 2 2h7v2H7v2h8v-2h-2v-2h2v-2H2V4h18v5h2V4c0-1.11-.9-2-2-2zm-8.03 7L11 6l-.97 3H7l2.47 1.76-.94 2.91 2.47-1.8 2.47 1.8-.94-2.91L15 9h-3.03z"/>
                        </SvgIcon>
                    </Fab>
                </Tooltip>
                <Popover id="prjpreview-popover" className={classes.popover} classes={{paper: classes.paper}}
                        open={openPreview} anchorEl={anchorPreview} onClose={handlePreviewClose}
                        anchorOrigin={{vertical: 'center', horizontal: 'left',}}
                        transformOrigin={{vertical: 'top', horizontal: 'right',}}
                >
                    <div className="vertical-align" >                        
                        <div className="horizontal-align" style={{height:36}}>
                            <Typography variant="subtitle2" style={{width:60}} >Screen :</Typography>
                            <Select native value={selectedScreen} style={{margin:'0px 6px', fontSize:'0.875em'}}
                                    onChange={handleChangeScreen}
                            >
                                {screens.map((screen,id) =>
                                    <option key={id} value={id}>{screen.width} x {screen.height}</option>
                                )}
                            </Select>
                        </div>
                        <Button color="default" variant="outlined" className={classes.previewbtn} onClick={() => handlePreviewClick("mobile")}>Preview</Button>
                        <div className="horizontal-align" style={{height:44, display:'none'}}>
                            <Typography variant="subtitle2" style={{width:60, padding:'0px 4px'}} >Preview :</Typography>
                            <IconButton color="inherit" style={{padding:8}} aria-label="desktop-preview" onClick={handleMobilePreview}>
                                <SmartphoneIcon />
                            </IconButton>
                            <IconButton color="inherit" style={{padding:8}} aria-label="desktop-preview" onClick={handleDesktopPreview}>
                                <DesktopIcon />
                            </IconButton>
                        </div>
                    </div>
                </Popover>
                <Tooltip title="Settings">
                    <Fab size="small" aria-label="setting" className={classes.settingfab} onClick={handleSettingClick}>
                        <SvgIcon>
                            <path transform="scale(1.2, 1.2)" fill="none" d="M0 0h20v20H0V0z"></path><path transform="scale(1.2, 1.2)" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
                        </SvgIcon>
                    </Fab>
                </Tooltip>
                <Popover id="prjsettings-popover" className={classes.popover} classes={{paper: classes.paper}}
                        open={openSetting} anchorEl={anchorSetting} onClose={handleSettingClose}
                        anchorOrigin={{vertical: 'center', horizontal: 'left',}}
                        transformOrigin={{vertical: 'top', horizontal: 'right',}}
                >
                    <div className="vertical-align" >
                        <FormControlLabel className={classes.formlbl} value="start" labelPlacement="start" 
                                        label={<Typography style={{fontSize:'0.875rem'}}>Auto Saving</Typography>}
                                        control={<Checkbox color="default" checked={enableAutoSave} onChange={handleAutoSavingClick} />}                            
                        />
                        <Button color="default" className={classes.popbtn} onClick={handleValidationClick}>Project Validation</Button>
                        {openvalidation && 
                            <ProjectValidation show={openvalidation} target="project" onCloseWindow={handleCloseValidations}/>        
                        }
                        <Button color="default" className={classes.popbtn} onClick={handlePriorityTabsWindow}>Set Priority Modules</Button>                        
                        {openprioritytabWindow && 
                            <PriorityTabsView show={true} appdata={projectdata} pagelist={props.selectedData['pageList']}
                                            onCloseEditor={handleClosePriorityTabsWindow} onUpdatePriorityTabs={handleUpdatePriorityTabs} />        
                        }
                        <Button style={{display:'none'}} color="default" className={classes.popbtn} onClick={handleDefaultScreenClick}>Set Default Screen</Button>                       
                        {opensetscreen && 
                            <DefaultScreenPopup screens={projectdata['availableScreens']} defaultScreenId={props.defaultScreenId} 
                                                onSetDefaultScreen={handleSetDefaultScreen} onCloseWindow={handleCloseDefaultScreen}/>        
                        }
                        <Button style={{display:'none'}} color="default" className={classes.popbtn} onClick={handleEventsClick}>App Events</Button>                                               
                        <Button color="default" className={classes.popbtn} style={{paddingLeft:0}} onClick={handleClickMore} startIcon={<ArrowLeftIcon />}>More Options</Button>
                        <Popover id="prjsettings-popover" className={classes.popover} classes={{paper: classes.paper}}
                                open={openMoreSetting} anchorEl={anchorMore} onClose={handleCloseMore}
                                anchorOrigin={{vertical: 'center', horizontal: 'left'}}
                                transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        >
                            <div className="vertical-align" >
                                <FormControlLabel className={classes.formlbl} value="start" labelPlacement="start" 
                                        label={<Typography style={{fontSize:'0.875rem'}}>Log App Launch</Typography>}
                                        control={<Checkbox color="default" checked={islogAppLaunch} onChange={handleAppLaunchLog} />}                            
                                />                        
                                {islogAppLaunch && 
                                    <div className={classes.logdiv}>
                                        <Typography variant="body2" gutterBottom style={{marginRight:0}}>Time threshold</Typography>
                                        <input id="numinput" className={classes.numinput} style={{'border': '1px solid #676767', 'paddingLeft':2}}
                                                type="number" value={thresholdTime} min="2" max="3600" step="1" onChange={handleThresholdTime}
                                        />
                                    </div>
                                }
                                <FormControlLabel className={classes.formlbl} value="start" labelPlacement="start" 
                                        label={<Typography style={{fontSize:'0.875rem'}}>GA Enabled</Typography>}
                                        control={<Checkbox color="default" checked={enableGA} onChange={handleGAEnabledClick} />}                            
                                /> 
                                <Button color="default" className={classes.popbtn} onClick={handlePerformancePageWindow}>Performance issue</Button>                        
                                {openperformancepageWindow && 
                                    <PerformancePagePopup show={true} appdata={projectdata} pagelist={props.selectedData['pageList']}
                                                    onCloseEditor={handleClosePerformancePageWindow} onUpdatePerformancePages={handleUpdatePerformancePages} />        
                                }
                                <Button color="default" className={classes.popbtn} onClick={handlePageConvertWindow}>Convert FreeLayout to FreeScroll</Button>
                                {openpageconvert && 
                                    <PageConvertView show={true} appdata={projectdata} pageDic={props.pageDic} pagelist={props.selectedData['pageList']}
                                                    onCloseEditor={handleClosePageConvertWindow} onUpdatePageList={handleUpdatePageList} />        
                                }
                            </div>
                        </Popover>
                    </div>
                </Popover> 
                <Tooltip title="Save All Pages" style={{display:'none'}}>
                    <Fab size="small" aria-label="saveall" className={classes.themefab} onClick={handleSaveAllPages}>
                    <SvgIcon>
                        <path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                    </SvgIcon>
                    </Fab>
                </Tooltip>               
                <Tooltip title="Style Editor">
                    <Fab size="small" aria-label="setting" className={classes.themefab} onClick={handleStyleEditorClick}>
                        <SvgIcon>
                            <path d="M16.24,11.51l1.57-1.57l-3.75-3.75l-1.57,1.57L8.35,3.63c-0.78-0.78-2.05-0.78-2.83,0l-1.9,1.9 c-0.78,0.78-0.78,2.05,0,2.83l4.13,4.13L3.15,17.1C3.05,17.2,3,17.32,3,17.46v3.04C3,20.78,3.22,21,3.5,21h3.04 c0.13,0,0.26-0.05,0.35-0.15l4.62-4.62l4.13,4.13c1.32,1.32,2.76,0.07,2.83,0l1.9-1.9c0.78-0.78,0.78-2.05,0-2.83L16.24,11.51z M9.18,11.07L5.04,6.94l1.89-1.9c0,0,0,0,0,0l1.27,1.27L7.73,6.8c-0.39,0.39-0.39,1.02,0,1.41c0.39,0.39,1.02,0.39,1.41,0 l0.48-0.48l1.45,1.45L9.18,11.07z M17.06,18.96l-4.13-4.13l1.9-1.9l1.45,1.45l-0.48,0.48c-0.39,0.39-0.39,1.02,0,1.41 c0.39,0.39,1.02,0.39,1.41,0l0.48-0.48l1.27,1.27L17.06,18.96z"/><path d="M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.47-0.47-1.12-0.29-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z"/>
                        </SvgIcon>
                    </Fab>
                </Tooltip>
                {openstyleeditor && 
                    <StyleEditor show={true} appconfig={apiParam} pagelist={props.selectedData['pageList']}
                                 isProjectRoleOwner={props.isProjectRoleOwner} isContributorWorking={props.isContributorWorking}
                                 onCloseEditor={handleCloseStyleEditor} />        
                }
            </div>            
            {errordisplay && <LinearProgress />}
            {isSessionError && 
                <LoginWindow loginid={props.appconfig.userid} onRelogin={handleRelogin} 
                             config={props.appconfig} onGetSession={handleUserSession} />
            }
            <div>
                <AppBar position="static" color="default">
                    <Tabs value={value} onChange={handleTabChange} indicatorColor="primary">
                        <Tab label="Resources" wrapped className={classes.tab} />
                        <Tab label="Database" wrapped className={classes.tab} />
                        <Tab label="Screens" wrapped className={classes.tab} />
                        <Tab label="Project-Variables" wrapped className={classes.tab} />
                    </Tabs>
                </AppBar>
                {value === 0 && 
                    <TabContainer>
                        {!(props.isProjectRoleOwner) && 
                            <Typography variant="body2" gutterBottom className={classes.helptext} style={{marginRight:0}}>
                                A contributor can manage "Image" only
                            </Typography>
                        }
                        {resourceData(projectdata, props.appconfig.apiURL).map((item, index) => 
                            <Accordion key={'rpanel'+index} className={classes.panel} 
                                    expanded={expanded === 'rpanel'+index} onChange={handleExpansion('rpanel'+index)}>
                                <AccordionSummary className={classes.panelheader}
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panela-content"
                                    id="panela-header"
                                >
                                    <Typography className={classes.heading}>{item.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.paneldetail}>
                                    <ResourceEditor style={{margin:8}} appconfig={apiParam} 
                                                    type={item.title} data={item.data} isProjectRoleOwner={props.isProjectRoleOwner} 
                                                    updateResourceData={handleResourceUpdate}/>
                                </AccordionDetails>
                            </Accordion>    
                        )}                      
                    </TabContainer>
                }
                {value === 1 && 
                    <TabContainer>
                        {dbData(projectdata).map((item, index) => 
                            <Accordion key={'dbpanel'+index}  className={classes.panel} 
                                    expanded={expanded === 'dbpanel'+index} onChange={handleExpansion('dbpanel'+index)}>
                                <AccordionSummary className={classes.panelheader}
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panelb-content"
                                    id="panelb-header"
                                >
                                    <Typography className={classes.heading}>{item.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.paneldetail}>
                                    <DatabaseDetail data={item} />                             
                                </AccordionDetails>
                            </Accordion>    
                        )}                        
                        <Snackbar
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
                            open={snackbaropen} onClose={handleSnackbarClose}
                            autoHideDuration={10000}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span id="message-id">Database can be edited via Console only.</span>}                            
                        />
                    </TabContainer>                
                }                                
                {value === 2 && 
                    <TabContainer>
                        {!(props.isProjectRoleOwner) && 
                            <Typography variant="body2" gutterBottom className={classes.helptext} style={{marginRight:0}}>
                                A contributor is not allowed to update
                            </Typography>
                        }
                        <div className="vertical-align" style={{alignitems:'start'}}>
                            {(props.isContributorWorking && props.isProjectRoleOwner) &&
                                <Typography variant="body2" gutterBottom className={classes.helptext} style={{marginRight:0}}>
                                    Since contributor(s) is/are working on project. So any update not allowed.                            
                                </Typography>
                            }                            
                            {(!props.isContributorWorking && props.isProjectRoleOwner) && 
                                <Typography variant="body2" gutterBottom className={classes.helptext}>
                                    Project 'preview' is must after any screen modification (add/ delete/ edit).                            
                                </Typography>
                            }
                            <Typography variant="caption" ></Typography>
                            <ScreenEditor show={true} appconfig={apiParam} pagelist={props.selectedData['pageList']}
                                        screens={projectdata.availableScreens} isMasterScreenSet={projectdata.isMasterScreenSet} 
                                        isProjectRoleOwner={props.isProjectRoleOwner} isContributorWorking={props.isContributorWorking} isallowtoUpdate={isallowtoUpdate}
                                        onSaveAllPagesData={handleSaveAllPagesData} />
                        </div>
                    </TabContainer>
                }
                {value === 3 && 
                    <TabContainer>
                        {!(props.isProjectRoleOwner) && 
                            <Typography variant="body2" gutterBottom className={classes.helptext} style={{marginRight:0, display:'none'}}>
                                A contributor is not allowed to update
                            </Typography>
                        }
                        {(props.isContributorWorking && props.isProjectRoleOwner) && 
                            <Typography variant="body2" gutterBottom className={classes.helptext} style={{marginRight:0, display:'none'}}>
                                Since contributor(s) is/are working on project. So any update not allowed.                            
                            </Typography>
                        }
                        <AppVariableEditor show={true} appconfig={apiParam} data={projectdata} isProjectRoleOwner={props.isProjectRoleOwner} isContributorWorking={false}/> 
                    </TabContainer>
                }
            </div>
            <Snackbar open={errordisplay} message={errormessage}
                      autoHideDuration={8000} onClose={handleErrorDisplayClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                      action={
                        <React.Fragment>
                            <IconButton color="inherit" className={classes.close} onClick={handleErrorDisplayClose} >
                                <CloseIcon />
                            </IconButton>
                        </React.Fragment>
                    }                                            
            />            
        </div>
    );
}

function DefaultScreenPopup(props) {  
    const screens = props.screens;      
  
    const useStyles = makeStyles(theme => ({
      root: {
        position: 'absolute',
        overflow: 'hidden',
      },
      title: {
        padding: '2px 16px',
      },
      selectdd: {
        width: 120,
        margin: '0px 12px',
        fontSize:'0.925em',
      },
      btn: {
        textTransform: 'none',
      }      
    }));
  
    const classes = useStyles(); 

    function handlePopupClose(event) {
        props.onCloseWindow();
    }

    const [selectedScreen, setSelectedScreen] = React.useState(props.defaultScreenId);
    function handleChangeScreen(event) {
        let scrId = event.currentTarget.value;
        setSelectedScreen(scrId);
    }

    function handleSetDefaultScreen() {
        //console.log(screens, "... DefaultScreenPopup >>>> ", selectedScreen); 
        props.onSetDefaultScreen(selectedScreen); 
    }
  
    return (
        <Dialog id="defaultscreendialog" open={true} scroll="paper" fullWidth={true} maxWidth="sm" >
            <DialogTitle onClose={handlePopupClose} className={classes.title} > Set Default Screen </DialogTitle>
            <DialogContent dividers>
                <div className="vertical-align" >
                    <Typography variant="subtitle1" >For current session, all pages will be opened in selected screen dimension.</Typography>
                    <div className="horizontal-align" style={{paddingLeft:24, paddingTop:16}}>
                        <Typography variant="subtitle1" >Screen :</Typography>
                        <Select native value={selectedScreen} className={classes.selectdd}
                                onChange={handleChangeScreen}
                        >
                            {screens.map((screen,id) =>
                                <option key={id} value={id}>{screen.width} x {screen.height}</option>
                            )}
                        </Select>
                    </div>                
                </div>
            </DialogContent>
            <DialogActions>
                <Button color="default" variant="outlined" className={classes.btn} onClick={handlePopupClose}>Cancel</Button>
                <Button color="default" variant="outlined" className={classes.btn} onClick={handleSetDefaultScreen}>Set</Button>
            </DialogActions>
        </Dialog>     
    );
}

function PerformancePagePopup(props) {
  
    const useStyles = makeStyles(theme => ({
      root: {
        position: 'absolute',
        overflow: 'hidden',
      },
      title: {
        padding: '8px 16px',
      },
      content: {
        background: theme.palette.background.default,
        padding: 0
      },
      editornote: {
        background: theme.palette.background.default,
        color: theme.palette.text.secondary,
        fontSize: '0.825rem',
        padding: theme.spacing(0.5, 1.5)
      },
      resourcefinderdiv: {
        height: 36,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: theme.spacing(0.5,3),
        padding: theme.spacing(0.5,1),
        background: theme.palette.background.default,
        border: '2px solid rgb(227,227,227)',
        borderRadius: 8
      },
      searchinput: {
        width: '100%',
        height: `calc(100% - 2px)`,
        padding: theme.spacing(0, 0.5),
        margin: theme.spacing(0, 0.5),
        fontSize: '0.875rem',
        background: theme.palette.background.default,
      },
      searchbtn: {
        maxWidth: 32, minHeight: 32, maxHeight: 32,
        background: theme.palette.background.default,
      },
      finderitemdiv: {
        width: 48,
        height: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        textAlign: 'center',
        borderLeft: '1px solid',
      },
      finderitem: {
        width: 32,
        height: 32,
        minHeight: 32,
        background: theme.palette.background.default
      },
      editorbtn: {
        textTransform: 'none',
        margin: theme.spacing(1),
      },
      tablist: {
        height: 250,
        overflow: 'hidden auto',
        padding: '8px 24px', 
        borderBottom: '1px solid rgba(221,221,221,1)'
      },
      tabnamediv: {
        height: 32,
        display: 'flex',
        alignItems: 'center'
      },
      tabcheck: {
        width: 18,
        height: 18,
        marginRight: 12
      },
      actions: {
        display: 'flex', 
        justifyContent: 'center',
        background: theme.palette.background.paper,
      }   
    }));
  
    const classes = useStyles(); 
    
    const [open, setOpen] = React.useState(true);
    

    const [pagelist, setPagelist] = React.useState(props.pagelist);

    const [searchvalue, setSearchValue] = React.useState('');
    const [searcherror, setSearchError] = React.useState(false);

    const performancePageIds = !(localStorage.getItem("performance")) ? [] : localStorage.getItem("performance").split(",");
    const [tabchecked, setTabChecked] = React.useState(performancePageIds);
    //console.info(tabchecked, ".... performancePageIds >>>>", performancePageIds);

    const [alertMsg, setAlertMsg] = React.useState("");
    const [openAlert, setOpenAlert] = React.useState(false);

    function handleSearchInput(event) {
        const val = event.target.value;
        if(val.length > 0) {
          const allowedChars = /\w/g;
          let allowedTitle = val.match(allowedChars);
          if(!allowedTitle) {
            setSearchError(true);
            return;
          }
          if(allowedTitle && (val.length !== allowedTitle.length)) {
            setSearchError(true);
            return;
          }
        }      
        setSearchValue(val);
        handleFindResource(val);
    }
    function handleFindResource(strsearch) {
        setSearchError(false);
        if(strsearch.length === 0) {
          setSearchError(true);

        }else {
          let filteredList = props.pagelist.filter(function(page) {
            const pageName = page.Title.toLowerCase();
            return (pageName.indexOf(strsearch.toLowerCase()) > -1);
          });
  
          if(filteredList.length === 0){
            setSearchError(true);
          }else{
            setPagelist(filteredList);
          }
        }
    }
    function handleCloseResourceFinder() {
        setSearchValue('');
        setSearchError(false);

        setPagelist(props.pagelist);
    }
    
    function handleTabValueChange(value) {    
        const currentIndex = tabchecked.indexOf(value);
        const newChecked = [...tabchecked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setTabChecked(newChecked);
    }

    function handleSubmitUpdate() {
        if(tabchecked.length > 15){
            setAlertMsg("Maximum 15 modules can be selected.");
            setOpenAlert(true);
            return;
        }

        props.onUpdatePerformancePages(tabchecked);
    }

    function handleClose() {
        setOpen(false);
        props.onCloseEditor();
    }

    function handleCancelUpdate() {
        setOpen(false);
        props.onCloseEditor();
    } 

    function alertOKHandler() {
        setAlertMsg("");
        setOpenAlert(false);
    }

    return (
    
    <Dialog open={open} fullWidth={true} maxWidth="sm" disableBackdropClick onClose={handleClose} >
        <DialogTitle onClose={handleClose} className={classes.title} > Set Performance issue Pages </DialogTitle>
        <DialogContent className={classes.content}>
            <Typography component="div" className={classes.editornote} >Check pages which are creating performance issues.</Typography>
            <div className={classes.resourcefinderdiv} >
                <IconButton color="inherit" aria-label="Find Resource" className={classes.searchbtn}>          
                    <SvgIcon>
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </SvgIcon>
                </IconButton>
                <Input aria-label="Search Input" className={classes.searchinput} type="text" required placeholder="Search by page title"
                        value={searchvalue} onChange={handleSearchInput} error={searcherror}/>  
                <div className={classes.finderitemdiv}>
                    <IconButton color="default" size="small" aria-label="Close Finder" className={classes.finderitem} onClick={handleCloseResourceFinder} >
                        <CloseIcon />
                    </IconButton>
                </div>             
            </div>
            <List component="nav" dense={true} className={classes.tablist} >
                {pagelist.map((page, index) => (
                    <div key={index} className={classes.tabnamediv}>
                        <div className="horizontal-align">
                            <input id={page.pageid} type='checkbox' className={classes.tabcheck}
                                    checked={getCheckedValue(tabchecked,page.pageid)}
                                    onChange={() => handleTabValueChange(page.pageid)}/>
                            <Typography variant="body1" >{page.Title}</Typography>
                        </div>
                    </div>
                ))}
            </List>
            <div className={classes.actions}>
                <Button variant="contained" color="default" className={classes.editorbtn} onClick={handleCancelUpdate}> Cancel </Button>
                <Button variant="contained" color="primary" className={classes.editorbtn} onClick={handleSubmitUpdate}> Submit </Button>
            </div>
            {openAlert === true && 
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
                    open={true} onClose={alertOKHandler}
                    autoHideDuration={10000}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{alertMsg}</span>}                            
                />
            }
        </DialogContent>
    </Dialog>
    );

    function getCheckedValue(tabchecked, pageid){
        const ischecked = (tabchecked.indexOf(pageid) !== -1) ? true : false;
        return ischecked;
    }
}

function resourceData(_projectdata, _apiURL) {
    let _resources = [];

    let _images = [];
    _projectdata.images.forEach(image => {
        let _imgsrc = _apiURL + "download/image/" + _projectdata.projectid +"/" + image.filename;
        if(image.resourceid > 0) {
            let imgObj = {id:image.resourceid, name:image.filename, source:_imgsrc};       
            _images.push(imgObj);
        }
    });    
    _resources.push({title:"Image", data:_images});

    let _videos = [];
    _projectdata.videos.forEach(video => {
        let _vidsrc = _apiURL + "download/video/" + _projectdata.projectid +"/" + video.filename;
        if(video.resourceid > 0) {
            let vidObj = {id:video.resourceid, name:video.filename, source:_vidsrc};       
            _videos.push(vidObj);
        }
    });    
    _resources.push({title:"Video", data:_videos});
    
    let _audios = [];
    _projectdata.bgms.forEach(audio => {
        let _bgmsrc = _apiURL + "download/bgm/" + _projectdata.projectid +"/" + audio.filename;
        let bgmsObj = {id:audio.resourceid, name:audio.filename, source:_bgmsrc};       
        _audios.push(bgmsObj);
    });    
    _resources.push({title:"Audio", data:_audios});

    let _sounds = [];
    _projectdata.soundeffects.forEach(sound => {
        let _sesrc = _apiURL + "download/soundeffect/" + _projectdata.projectid +"/" + sound.filename;
        let imgObj = {id:sound.resourceid, name:sound.filename, source:_sesrc};       
        _sounds.push(imgObj);
    });    
    _resources.push({title:"Audio Recording", data:_sounds});

    /* let _gadgets = [];
    _projectdata.gadgets.forEach(gadget => {
        let gdtObj = {id:gadget.resourceid, name:gadget.filename};       
        _gadgets.push(gdtObj);
    });    
    _resources.push({title:"Gadget", data:_gadgets}); */

    return _resources;
};

function dbData(_projectdata) {
    let _dbs = [];

    let _ldbs = [];
    _projectdata.TableDefs.forEach(ldb => {
        let ldbObj = {};
        if(ldb.view){
            const _viewFields = (ldb.fields) ? ldb.fields : [];
            ldbObj = {name:ldb.tablename, type:"view", fields:_viewFields};
        }else if(ldb.trigger){
            ldbObj = {name:ldb.triggername, type:"trigger", fields:[]};
        }else if(ldb.procedure){
            ldbObj = {name:ldb.procedurename, type:"procedure", fields:[]};
        }else {
            ldbObj = {name:ldb.tablename, type:"table", fields:ldb.fields, csvfile:ldb.csvfilename};
        }
        _ldbs.push(ldbObj);
    });    
    _dbs.push({title:"Local Database", data:_ldbs});
    
    let _rdbs = [];
    _projectdata.RemoteTableDefs.forEach(rdb => {
        let rdbObj = {name:rdb.tablename, fields:rdb.fields};
        if(rdb.servicename !== "Mobilous"){
            rdbObj = {name:rdb.tablename, type:"plugin", fields:rdb.fields};
        }else{
            if(rdb.view){
                const _viewFields = (rdb.fields) ? rdb.fields : [];
                rdbObj = {name:rdb.tablename, type:"view", fields:_viewFields};
            }else if(rdb.trigger){
                rdbObj = {name:rdb.triggername, type:"trigger", fields:[]};
            }else if(rdb.procedure){
                rdbObj = {name:rdb.procedurename, type:"procedure", fields:[]};
            }else {
                rdbObj = {name:rdb.tablename, type:"table", fields:rdb.fields, csvfile:rdb.csvfilename};
            }
        }
        _rdbs.push(rdbObj);
    });
    _dbs.push({title:"Remote Database", data:_rdbs});

    return _dbs;
};

function validatePageData(_page, pagelist, screenIndex) {
    let _validationError = [];
  
    const pagetitle = _page['Title'];
    const allowedChars = /\w/g;
    let allowedName = pagetitle.match(allowedChars);
    if(pagetitle.length !== allowedName.length) {
      const _title = "'" +pagetitle+ "'";
      _validationError.push({type:_title, message:"Page Title: Only alphabets, numbers & underscore allowed."});
    }
  
    let _pageTitleValidate =  pagelist.filter(function(node) {
      if(node.Title === pagetitle){
        return node;
      }
      return node.Title === pagetitle;
    });
    if(_pageTitleValidate.length > 1) {
      _validationError.push({type:pagetitle, message:"Same page 'Title' exist"});
    }
  
    /* let arrUIpartName = [];
    let _pageUIs = getAllChildrenOnPage(_page, screenIndex);
    _pageUIs.forEach(uipart => {
      arrUIpartName.push(uipart.uiParts[screenIndex]['name']);
    });
  
    const uiPartsNoDuplicates = [...new Set(arrUIpartName)];
    if(uiPartsNoDuplicates.length !== arrUIpartName.length) {
      let duplicates = [...arrUIpartName];
      uiPartsNoDuplicates.forEach((item) => {
        const i = duplicates.indexOf(item)
        duplicates = duplicates
        .slice(0, i)
        .concat(duplicates.slice(i + 1, duplicates.length));
      });
  
      let duplicateStr = duplicates.join(", ");
      _validationError.push({type:duplicateStr, message:"UI(s) has duplicate name"});
    } */
  
    return _validationError;
}


function mapStateToProps(state) {   
    //console.log("ProjectDetails mapStateToProps >>>>>", state); 
    return {
      apiParam: state.appParam.params,
      pageLocale: state.appParam.pagelocale,
      pageContainer: state.appParam.pagecontainer,
      pageConfig: state.appParam.pageconfig,
      appData: state.appData.data,
      pageList: state.appData.pagelist,
      allpagesUpdated: state.appData.allpageschanged,
      changedPagesId: state.appData.changedpages,
      contributorTabs: state.appData.contributortabs,
      openedPages: state.selectedData.pages,
      openedPagesState: state.selectedData.editorState,
      currentPage: state.selectedData.pagedata,
      pageChildren: state.selectedData.paeChildren,
      currentUI: state.selectedData.uidata,
      selectedUIs: state.selectedData.uiparts,
      contentEditorParent: state.selectedData.editorParent,
      defaultScreenId: state.appParam.screenId,
    };
  }
  export default connect(mapStateToProps)(ProjectDetails);



