import React from 'react';
import { connect } from 'react-redux';
import { withStyles, styled, makeStyles } from '@material-ui/core/styles';
import { Paper, Box, TextField, Typography, Button, CircularProgress, Select, Tooltip, Popover } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Help';
import CancelIcon from '@material-ui/icons/Cancel';
import WarningIcon from '@material-ui/icons/Warning';

import AlertWindow from '../../components/AlertWindow';

import { setAllPageChanged } from '../ServiceActions';

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1, 2),
    borderBottom: '1px solid lightgrey',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(0),
    right: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});


const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      {onClose ? (
        <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
      <Typography variant="h6">{children}</Typography>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(1),
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1,5),
  },
}))(MuiDialogActions);

const DialogButton = styled(Button)({
    textTransform: 'none',
    width: 72,
    maxHeight: 32,
    padding: 6,
    margin: '0px 4px',
});

const HelpText = withStyles(theme => ({
  root: {
    textAlign: 'start',
    //margin: theme.spacing(0, 6),
    padding: theme.spacing(0.5),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[600],
    border: '2px solid rgb(227,227,227)',
    borderRadius: 8,
  },
}))(Typography);

const PaperContainer = withStyles(theme => ({
  root: {
      //border: "1px solid rgb(212, 0, 0)",
      position: 'relative',
      height: '80vh',
      maxWidth: 700,
      minWidth: 400,
      //padding: 10,              
  },  
}))(Paper);

const StyledListItem = withStyles(theme => ({
  root: {
      //paddingLeft: 4,
      height: 32,
      borderBottom: '1px solid lightgrey',
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
  selected: {}
}))(ListItem);

class ProjectMergeView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
        error: null,
        isLoaded: false,
        pages: [],
        pageCaches: [],
        pagelist: [],

        showMergeView: false,
        appid: '',
        targetAppData: {},
        disableCont: true,
        clickCont: false,
        targetPageList: [],
        targetPageData: [],
        sourcePageData:[],
        showWait: false,
        showConfirm: false,
    };
    
    this.handlePopupClose = this.handlePopupClose.bind(this);
    this.handleMergeApps = this.handleMergeApps.bind(this);
  }

  componentDidMount() {   
    this.setPageList(this.props.pageList, this.props.projectdata);
  } 

  setPageList(_pages, projectdata) {
    let pageCacheList = makePageCacheList(_pages);
    //console.log("_pageCacheList ::--", _pageCacheList);
    
    let pageHeirarchy = makePageHeirarchy(_pages, projectdata);
    //console.log(_pageCacheList, "***** pageHeirarchy >>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ", pageHeirarchy);            

    this.setState({
      isLoaded: true,           
      pages: _pages,
      pageCaches: pageCacheList,
      pagelist: pageHeirarchy
    });
  }
  
  //////////////////////////
  // Event Handlers
  /////////////////////////
    
  handlePopupClose = () => {
    this.setState({ isLoaded: false });

    // below is a callback function of parent component which passed as properties
    // please note it must be passed, otherwise issues.
    this.props.oncloseWindow();
  };

  handleChange = (event) => {   
    this.setState({disableCont: true});

    const val = event.target.value;
    if(val.length > 0) {
      const allowedChars = /[0-9]/g;
      let allowedTitle = val.match(allowedChars);
      if(!allowedTitle) {
        return;
      }
      if(allowedTitle && (val.length !== allowedTitle.length)) {
        return;
      }
    }    
    this.setState({ appid: val }); 
  }

  handleAppValidate() {
    const _appid = this.state.appid;
    //console.log(_appid, "***", this.props);
    
    if(_appid.toString() === this.props['appData']['projectid']){
      this.setState({error: "It is current project id. Please input other value."});
      return;
    }

    let api_projectget = this.props.apiParam.apiURL+"service.json?command=projectget&userid="+this.props.apiParam.userid+"&sessionid="+this.props.apiParam.sessionid+"&projectid="+_appid;
    fetch(api_projectget, {method: 'POST'})
    .then(res => res.json())      
    .then(
      (result) => {
        if(result.response === "NACK"){  
          this.setState({error: result.error});
        }
        else {
          const screendata = result.project['availableScreens'];
          if(screendata && screendata.length === 1) {
            this.setState({error: null});
            this.setState({targetAppData: result.project});
            this.setState({disableCont: false});
          }else {
            this.setState({error: "Selected project has more than one screen."});
            return;
          }
        }
      },
      (error) => {
        this.setState({error: error});
      })
  }

  handleShowAppMerge() {
    if(!this.state.clickCont) {

      this.setState({clickCont: true});
      const _appid = this.state.appid;
      this.fetchPageData(_appid);    
    }else {
      console.log("Maan ja bhai... ");
    }
  }

  fetchPageData(appid){
    let _fetchUrl = this.props.apiParam.apiURL+"service.json?command=pagelist&userid="+this.props.apiParam.userid+"&sessionid="+this.props.apiParam.sessionid+"&projectid="+appid;
    fetch(_fetchUrl)
      .then(res => res.json())
      .then(
        (result) => {
          // { pages: [...], response: "ACK", count: 1, command: "pagelist" }
          if(result.response === "NACK"){
            this.setState({error: result.error});
          }
          else{
            let _pages = result.pages;
            if(_pages.length > 0) {
              
              /* const currentPagelist = this.props.pageList;
              if(currentPagelist && currentPagelist.length !== _pages.length) {
                this.setState({error: "Page count of selected project is not matching with current project."});
                this.setState({clickCont: false});
                this.setState({disableCont: true});
                return;
              } */

              let currentPagelist = getSortedList(this.state.pagelist, []);
              
              let setPagelist = makePageHeirarchy(_pages, this.state.targetAppData);
              let sortPagelist = getSortedList(setPagelist, []);
              //console.log(sortPagelist, "... pages :--", _pages);
              
              this.setState({targetPageList: sortPagelist});
              let pageData = getPageData(sortPagelist, currentPagelist);
              this.setState({targetPageData: pageData});

              let pageData2 = getPageData2(currentPagelist, sortPagelist);
              this.setState({sourcePageData: pageData2});
              
              this.setState({clickCont: false});
              this.setState({showMergeView: true});
            }else {
              const _err = "There is no pages exist in the project: "+ appid;
              this.setState({error: _err});
            }
          }
        },
        (error) => {
          this.setState({error: error});
        }
      )
  }

  //////////////////////////////////////////////////////////
  
  
  handleMergeApps = () => {
    this.setState({showWait: true});
    //console.log(this.state['sourcePageData'], "<< .......... >>", this.state['pages'], this.state['targetPageList']);
    
    let screenDef = this.props['appData']['availableScreens'];
    const sourceScrObj = screenDef[0];
    const targetScrObj = this.state.targetAppData['availableScreens'][0];
    screenDef.push(targetScrObj);
    console.log(this.props['appData'], "<< .....screenDef..... >>", screenDef);

    let scaleW = targetScrObj.width/sourceScrObj.width;
    let scaleH = targetScrObj.height/sourceScrObj.height;

    const mergeArr = this.state['sourcePageData'];
    mergeArr.forEach((element, index) => {
      let sourcePageObj = getPageObj(this.state['pages'], element['source']);
      let targetPageObj = (element['target'] !== "-1") ? getPageObj(this.state['targetPageList'], element['target']) : {};
      
      //console.log(element['source'], sourcePageObj, "<< Merge >>", element['target'], targetPageObj);
      /* if(element['target'] === "-1") {
        console.log("************", sourcePageObj['Title']);
      } */
      mergePageData(sourcePageObj, targetPageObj, scaleW, scaleH);
    });

    this.setState({showConfirm: true});
  }; 

  handleVerifyApp() {
    this.setState({showWait: false});
    this.setState({showConfirm: false});

    this.props.dispatch(setAllPageChanged(true));
    this.props.oncloseWindow();
  }

  handleSaveApp() {
    this.setState({showConfirm: false});
    console.log("*******", this.props);
    /* this.handleSaveAllPages().then(
      result => {
        if(result.response !== "ACK"){
          var _err = {message: result.error};
          console.log("Save_All_Pages NotACK >>", _err);
        }else {
          this.updateProjectData();
        }
      }
    ); */
  }

  handleSaveAllPages() {
    
    var formData = new FormData();
    formData.append("command", "updateallpages");
    formData.append("userid", this.props.appconfig.userid);
    formData.append("sessionid", this.props.appconfig.sessionid);
    formData.append("projectid", this.props.appconfig.projectid);

    let arrPages = this.props['pageList'];
    let objPages = {pages:arrPages};
    var pagesdata = encodeURIComponent(JSON.stringify(objPages));
    //console.log("...SaveAllPages *************", JSON.stringify(objPages));
    let text = new File([pagesdata], "updateallpages.txt", {type: "text/plain"});
    formData.append("file", text);

    return fetch(this.props.appconfig.apiURL+"multipartservice.json", {method: 'POST', body: formData} )
    .then((response) => response.json())
    .then(
      (result) => {
        console.log("** updateallpages **", result);
        return result;      
      },
      (error) => {
        console.error('updateallpages : catch >>', error);
        return {"response":"ERROR", "error": error['message']};
      }    
    )
  }

  fetchUpdateProject() {
    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", this.props.appconfig.userid);
    formData.append("sessionid", this.props.appconfig.sessionid);
    formData.append("projectid", this.props.appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(this.props.projectdata));
    let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
    formData.append("file", text);

    fetch(this.props.appconfig.apiURL+"multipartservice.json", {method: 'POST', body: formData})
    .then((response) => response.json())
    .then((result) => {
        //result = {"response":"ACK","count":1,"command":"projectupdate","project":{....}}
        if(result.response === "NACK"){
            /* const errormsg = result.error;
            if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
                setSessionError(true);
            }

            var _err = {message: result.error};
            console.log("projectupdate : Error >>", _err);
            setErrorMessage(result.error);
            setErrorDisplay(true);
            setWaiting(false); */
        }
        else{  
          this.setState({showWait: false});
          this.props.oncloseWindow();
        }
    })
    .catch((error) => {
        console.error('projectupdate : catch >>', error);
       /*  setWaiting(false);
        setErrorMessage("Something went wrong. Please check Server/Internet connection.");
        setErrorDisplay(true); */
    });
}


  ///////////////////////////////////////////////////////////////////////////


  render() {
    
    const { error, showMergeView, disableCont, targetPageData, sourcePageData } = this.state;
    const { showWait, showConfirm } = this.state;
    const contLabel = (this.state.clickCont) ? "Fetching data ..." : "Continue";

    let currentPagelist = getSortedList(this.state.pagelist, []); //this.props.pageList;
    const currentData = {project: this.props.projectdata, page:currentPagelist};
    const targetData = {project: this.state.targetAppData, page:this.state.targetPageList};
    const appConfig = this.props.appconfig;

    if (!showMergeView) {
      return (
        <div>
          <Dialog aria-labelledby="customized-dialog-title" open={!showMergeView} fullWidth={true} maxWidth="sm">
            <DialogTitle id="customized-dialog-title" onClose={this.handlePopupClose}>
              Merge Application
            </DialogTitle>             
            <DialogContent>
              <div style={{padding:"0px 8px"}}>
                <HelpText variant="body2" gutterBottom>
                  1. Please provide project-id from same user within same instance.<br/>
                  2. Selected project must have same number of pages as current project.<br/>
                  3. Selected project should have one screen & different from current project.<br/> 
                  4. After validating project existence, continue for merge process.
                </HelpText>
                <Box className="horizontal-align" style={{width:"inherit", justifyContent:"space-between", margin:"4px 48px"}}>
                  <TextField id="var-key" label="Project-Id" value={this.state.appid}
                              autoComplete="off" required autoFocus variant="outlined" margin="normal" InputLabelProps={{ shrink: true, }}
                              style={{width:"100%", height:48, marginTop:8}}
                              onChange={this.handleChange.bind(this)}
                  />
                  <DialogButton variant="outlined" color="default" disabled={!disableCont} style={{width:96, maxHeight:48, height:48, marginTop:8}}
                                onClick={this.handleAppValidate.bind(this)}>
                    Validate
                  </DialogButton>
                </Box>
                <DialogButton variant="outlined" color="default" disabled={disableCont} style={{width:"calc(100% - 96px)", margin:"8px 48px"}}
                              onClick={this.handleShowAppMerge.bind(this)}>
                  {contLabel}
                </DialogButton>
                {error &&
                  <div style={{color:'red', margin:"0px 8px", textAlign:"center"}}>{error}</div>
                }
                {this.state.clickCont &&
                  <div className="backdropStyle" style={{zIndex:9999}}>
                    <Typography variant="h5" color="textSecondary" className="waitlabel"><CircularProgress style={{marginRight:12}} />Please Wait ....</Typography>                
                  </div>
                }
              </div>    
            </DialogContent>              
          </Dialog>
        </div>
      );

    } else {
        return (
          <div id="akshay">
            <Dialog id="fullsize" open={showMergeView} scroll="paper" fullScreen style={{padding:4, paddingTop:40}} >
              <DialogTitle id="customized-dialog-title" onClose={this.handlePopupClose}>
                Merge Application
              </DialogTitle>
              <DialogContent dividers>
                <div className="horizontal-align">
                  {targetPageData.length > 0 && 
                    <AppMergeView globalData={this.props} appConfig={appConfig} currentData={currentData} targetData={targetData}
                                  selectedpagedata={targetPageData} sourcePageData={sourcePageData} />
                  }
                  {showWait &&
                    <div className="backdropStyle" style={{zIndex:9999}}>
                      <CircularProgress />
                    </div>
                  }
                </div>
              </DialogContent>
              <DialogActions>
                <DialogButton variant="outlined" color="default" onClick={this.handleMergeApps}>
                  Merge
                </DialogButton>                    
                <DialogButton variant="outlined" color="default" onClick={this.handlePopupClose}>
                  Cancel
                </DialogButton>
              </DialogActions>
            </Dialog>
            {showConfirm && 
              <AlertWindow open={true} 
                    title="" message="Do you want to continue to save data or verify the app first & save later ?"
                    ok="Verify" okclick={this.handleVerifyApp.bind(this)}
                    cancel="Continue" cancelclick={this.handleSaveApp.bind(this)}
              />
            }               
          </div>
        );
    }
  }
}

function getSortedList(pagelist, updatedlist) {
  for (let i = 0; i < pagelist.length; i++) {
      const _pageObj = pagelist[i];
      if(_pageObj['id'] !== "-1"){
          //updatedlist.push({pageid:_pageObj['id'], Title:_pageObj['title'], level:_pageObj['level']});
          updatedlist.push(_pageObj['page']);

          let childPages = _pageObj['children'];
          if(childPages.length > 0) {
              updatedlist = getSortedList(childPages, updatedlist);
          }
      }
  }
  return updatedlist;
}

function AppMergeView(props) {
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    divcontainer:{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'flex-start',
      flexGrow: 1,
    },
    header: {
      display: 'flex',
      height: 32,
      backgroundColor: 'rgba(189, 189, 189, 1)',
      textAlign: 'left',
    },    
    heading: {
      width: '100%',
      height: '100%',      
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
      paddingTop: theme.spacing(0),
      paddingLeft: theme.spacing(2),
      display: 'flex',
      alignItems: 'center', 
    },
    divview:{
      width: 'initial',
      height: `calc(100% - 32px)`,
      display: 'flex',
      flexDirection: 'column',
      //justifyContent: 'space-evenly',
      alignItems: 'center',
      flexGrow: 1,
      padding: 8,
    },
    screenbox:{
      width: 'inherit',
      height: '100%',
      maxHeight: 53,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      margin: 4,
      overflow: 'hidden'
    },
    scrlbl:{
      width:120
    },
    pagelist: {
      margin: theme.spacing(0.5, 2),
      fontSize:'0.875em', 
    },
    warningicon: {
      padding: theme.spacing(0.5),
      color: theme.palette.grey[800],
    },
    selectedpage: {
      display: 'flex',
      position: 'absolute',
      bottom: 36,
      left: 4, right: 4,
      minHeight: 22,
    },
    selectedpageheading: {
      minWidth: 120,
    },
    selectedpagetitle: {
      width: '100%',
      padding: theme.spacing(0, 1),
      border: '1px solid',
      borderColor : theme.palette.grey[300],
      borderRadius: 4,
    },
    addpageheader: {      
      width: '100%',
      position: 'absolute',
      top: 1,
      padding: 2,
      backgroundColor: theme.palette.grey[300],
      display: 'flex',
      justifyContent: 'space-between',
    },
    addpageheading: {
      paddingLeft: 12,
      lineHeight: 2
    },
    iconbtn: {
      padding: theme.spacing(0.25),
      marginRight: theme.spacing(1),
    },
    popover: {
      marginTop: theme.spacing(0.5),
    },
    paper: {
      padding: theme.spacing(0.5),
      backgroundColor: theme.palette.grey[600],
    },
    pophelp:{
      paddingLeft: theme.spacing(1),
      maxWidth: 240,
    },
    
  }));

  const classes = useStyles();
  
  //const currentPageList = props.currentData['page'];
  const targetPageList = props.targetData['page'];
  const alertTitle = '';
  const [alertMessage, setAlertMessage] = React.useState('');

  const [openAlert, setOpenAlert] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openHelp = Boolean(anchorEl);
  function handleHelpClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleHelpClose() {
    setAnchorEl(null);
  }

  const [scrId, setSelectedScreenId] = React.useState(0);
  function handleScreenChange(event) {
    //console.log(event.currentTarget, "******", event.currentTarget.value, event.target.dataset);
    const _scrid = parseInt(event.target.dataset['id']);
    setSelectedScreenId(_scrid);
  }

  const [selectedpage, setSelectedPage] = React.useState(-1);
 /*  const [selectedpagedata, setSelectedPageData] = React.useState(props.selectedpagedata);
  React.useEffect(() => {
    setSelectedPageData(props.selectedpagedata);
  }, [props.selectedpagedata])
  console.log(props.currentData, props.targetData, "**************", props.selectedpagedata); */

  const [selectedpagedata, setSelectedPageData] = React.useState(props.sourcePageData);
  React.useEffect(() => {
    setSelectedPageData(props.sourcePageData);
  }, [props.sourcePageData])
  //console.log(props.currentData, props.targetData, "**************", props.sourcePageData);
  
  function handleSetPage(event, sourcePageid) {
    let targetPageid = event.target.value;
    let targetPage = getPageObj(props.targetData['page'], targetPageid);
    let currentPage = getPageObj(props.currentData['page'], sourcePageid);

    const isMatched = isViewTypeMatched(targetPage, currentPage);
    if(!isMatched){
      setAlertMessage("Selected page type not matched with current page");
      setOpenAlert(true);
      return;
    }
    const isSelected = isTargetAlreadySelected(selectedpagedata, targetPageid, sourcePageid);
    if(!isSelected){
      setAlertMessage("Selected page already assigned to another page");
      setOpenAlert(true);
      return;
    }
    let isvalid = true;
    if(isvalid) {
      let selectedData = selectedpagedata;
      selectedData.forEach(element => {
        if(element['source'] === sourcePageid && element['target'] === '-1') {
          element['target'] = targetPageid;
          element['isvalid'] = false;
        }
      });
      setSelectedPageData(selectedData);
      console.log(selectedpage, "...", targetPageid, sourcePageid, "******", selectedData);

      setSelectedPage(targetPageid);
    }else {
      console.log("Not a valid page");
    }
  }

  //////////////////////////////////////

  function alertCloseHandler() {
    setOpenAlert(false);
  }
  function alertOKHandler() {
    setOpenAlert(false);
  }


  return ( 
    <div className={classes.root}>
      <div className={classes.divcontainer}>                                         
        <PaperContainer elevation={9}>
          <div className={classes.header}>
            <strong className={classes.heading}>Current Project</strong>
            <Tooltip title="Help">
                <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Help" onClick={handleHelpClick}>
                  {!openHelp && <HelpIcon />}
                  {openHelp && <CancelIcon />}
                </IconButton>
              </Tooltip>
              <Popover id="help-popover" className={classes.popover} classes={{paper: classes.paper}}
                      open={openHelp} anchorEl={anchorEl} onClose={handleHelpClose}
                      anchorOrigin={{vertical: 'top', horizontal: 'left',}}
                      transformOrigin={{vertical: 'top', horizontal: 'right',}}
              >                
                <div>
                  <HelpText variant="body2" gutterBottom style={{border:0}}>
                    If a page-id of current project matched with any page of target project,<br/> then those pages data will be merged<br/>
                    Else user have to select a page to merge.<br/><br/>
                    For pages, if no corresponding page selected,<br/> their new screen definition will be generated from page itself.
                  </HelpText>
                </div>
              </Popover>   
          </div>
          <div className={classes.divview} draggable="false">
            <Box className={classes.screenbox}>
              <Typography variant="subtitle2" className={classes.scrlbl}>Screens: </Typography>
              <table className="tg" style={{width:'100%', tableLayout:'fixed', margin:0}}>   
                <thead>
                  <tr>
                    <th width="100px">Width</th>
                    <th width="100px">Height</th>
                    <th>Orientation</th>
                  </tr>
                </thead>             
                <tbody>
                  {props.currentData['project']['availableScreens'].map((vobj, index) => (
                    <tr key={index}>
                      <td > {vobj.width} </td>
                      <td > {vobj.height} </td>
                      <td style={{wordBreak:'break-all'}} > {vobj.orientation} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            <Box className="box" p={0.25} m={1.25} draggable="false" style={{height:'100%', overflow:'hidden'}}>
              <List component="nav" dense={true} draggable="false" style={{height:'100%', padding:4, overflow:'auto'}}>
                {props.sourcePageData.map((item, index) => (
                  <StyledListItem key={index}> 
                    <ListItemText primary={item.title +' ('+item.source +')'} />
                    <ListItemSecondaryAction style={{display:'flex'}}>
                      <Select native className={classes.pagelist} style={{width:240, height:24, minWidth:200}} disabled={item.disable}
                              value={item.target} onChange={(e) => handleSetPage(e, item.source)} >
                        <option disabled value="-1"> -- Select a Page -- </option>
                        {targetPageList.map((page,id) =>
                          <option key={id} value={page.pageid}>{page.Title}</option>
                        )}
                      </Select>
                      <div style={{width:32, visibility:((!item.disable) ? 'visible' : 'hidden')}}>
                        {!(item.isvalid) && 
                          <IconButton className={classes.warningicon}>
                            <WarningIcon />
                          </IconButton>
                        }
                      </div>
                    </ListItemSecondaryAction>
                  </StyledListItem>
                ))}
              </List>
            </Box>
          </div>
        </PaperContainer>
        <PaperContainer elevation={6} style={{width:480}} >
          <div className={classes.header}>
            <strong className={classes.heading}>Target Project to merge</strong>   
          </div>
          <div className={classes.divview} draggable="false">            
            <Box className={classes.screenbox}>
              <Typography variant="subtitle2" className={classes.scrlbl}>Screens: </Typography>
              <table className="tg" style={{width:'100%', tableLayout:'fixed', margin:0}}>   
                <thead>
                  <tr>
                    <th style={{display:'none'}}></th>
                    <th width="60px">Width</th>
                    <th width="60px">Height</th>
                    <th>Orientation</th>
                  </tr>
                </thead>             
                <tbody>
                  {props.targetData['project']['availableScreens'].map((vobj, index) => (
                    <tr key={index}>
                      <td style={{display:'none'}}>
                        <div className="radio">
                          <input type="radio" name="scrradio" id={index} data-id={index} checked={scrId === index} onChange={handleScreenChange}/>
                        </div>
                      </td>
                      <td> {vobj.width} </td>
                      <td> {vobj.height} </td>
                      <td style={{wordBreak:'break-all'}} ><label htmlFor={index}>{vobj.orientation}</label></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>  
            <Box className="box" p={0.25} m={1.25} draggable="false" style={{height:'100%', overflow:'hidden'}}>
              <List component="nav" dense={true} draggable="false" style={{height:'100%', padding:4, overflow:'auto'}}>
                {props.selectedpagedata.map((item, index) => (
                  <StyledListItem key={index}> 
                    <ListItemText primary={item.title +' ('+item.target +')'} />                    
                  </StyledListItem>
                ))}
              </List>
            </Box>                             
          </div>
        </PaperContainer>
      </div>
      {openAlert === true && 
        <AlertWindow open={true} 
                    title={alertTitle} message={alertMessage}
                    ok="OK" okclick={alertOKHandler}
                    cancel="" cancelclick={alertCloseHandler}
        />
      }
    </div>       
  );
}

function getPageData(targetPageList, sourcePageList) {
  let arrPageData = [];
  targetPageList.forEach(element => {
    let sourcepageid = getSourceId(sourcePageList, element['pageid']);
    let disableSelect = (sourcepageid !== "-1") ? true : false;
    arrPageData.push({title:element['Title'], target:element['pageid'], source:sourcepageid, disable:disableSelect, isvalid:true});
  });

  return arrPageData;
}

function getPageData2(currentPageList, targetPageList) {
  //console.log(currentPageList, "***$ cccccccccccc $***", targetPageList);

  let arrPageData = [];
  currentPageList.forEach(element => {
    let targetpageid = getSourceId(targetPageList, element['pageid']);
    let disableSelect = (targetpageid !== "-1") ? true : false;
    arrPageData.push({title:element['Title'], source:element['pageid'], target:targetpageid, disable:disableSelect, isvalid:true});
  });

  return arrPageData;
}

function getSourceId(sourcelist, targetid) {
  let _nodes =  sourcelist.filter(function(node) {
    return node['pageid'] === targetid;
  });

  if(_nodes.length > 0) {
    return _nodes[0]['pageid'];
  }
  return "-1";
}

function isViewTypeMatched(targetpage, sourcepage){
  let targetPagetype = (targetpage && targetpage.hasOwnProperty("viewType")) ? targetpage['viewType'] : "target";
  let sourcePagetype = (sourcepage && sourcepage.hasOwnProperty("viewType")) ? sourcepage['viewType'] : "source";

  if(targetPagetype === sourcePagetype) return true;
  return false;
}

function isTargetAlreadySelected(selecteddata, targetid, sourceid) {
  console.log(selecteddata, "***$$***", targetid, sourceid);
  let _nodes =  selecteddata.filter(function(node) {
    return node['target'] === targetid;
  });

  if(_nodes.length > 0) {
    return false;
  }
  return true;
}


function makePageCacheList(pageList){
  let _pageCacheList = [];
  pageList.forEach(pageObj => {
    _pageCacheList[pageObj.pageid] = pageObj;
  });
  return _pageCacheList;
}

function makePageHeirarchy(pageList, projectdata) {
  var arrPageData = [];
  let projectNode = {level:0, title:projectdata['ProjectName'], id:"-1", parent:"App", type:"", children:[]};
  arrPageData.push(projectNode);

  manipulatePageData(pageList, 1, arrPageData);
  var pageHeirarchy = setPageHeirarchy(arrPageData);
  pageHeirarchy =  pageHeirarchy.filter(function(page) {
    return page.parent === "App";
  });

  return pageHeirarchy;
}

function manipulatePageData(pages, level, arrPageData, parentPageids, flag){
  let appendPages = [];
  let pendingNodes = [];
  let nextParentNodePageids = [];
  
  for (let i = 0; i < pages.length; i++) {
    const pageContainerDic = pages[i];
    if(!pageContainerDic.hasOwnProperty('parentid')) {
      console.log("manage page without parent ?? ", pageContainerDic);
      pageContainerDic['parentid'] = "App";
    }
      
    if (!parentPageids && pageContainerDic.parentid === "App") {
      appendPages.push(pageContainerDic);
      nextParentNodePageids.push(pageContainerDic.pageid);
      //console.log("lastTabBasedPageid =>>>",  pageContainerDic.pageid, pageContainerDic.Title);
    }
    else if (parentPageids && parentPageids.indexOf(pageContainerDic.parentid) >= 0) {
      appendPages.push(pageContainerDic);
      nextParentNodePageids.push(pageContainerDic.pageid);						
    }
    else {
      pendingNodes.push(pageContainerDic);
    }
  }
  
  if (appendPages.length > 0){
    if (appendPages[0].parentid !== "App")
      appendPages.sort(function(a, b){return a.pageid - b.pageid});
    
    for (let j = 0; j < appendPages.length; j++) {
      arrPageData = setPageLevel(appendPages[j], level, arrPageData);
    }      
  }

  level = level+1;
  if (pendingNodes.length > 0 && nextParentNodePageids.length > 0) {
    manipulatePageData(pendingNodes, level, arrPageData, nextParentNodePageids, true);
    return;
  }
  else if (pendingNodes.length > 0) {
    console.log("zoombie nodes:", pendingNodes);
    return;				
  }
}
function setPageLevel(_page, _level, arrLevel){
  arrLevel.push({level:_level, id:_page.pageid, title:_page.Title, parent:_page.parentid, type:_page.viewType, children:[], childcount:0, page:_page});
  return arrLevel;
}

function setPageHeirarchy(arrPageLevel){
  let _pageHeirarchy = [];

  var _lastNodelevel = arrPageLevel[arrPageLevel.length -1].level;
  do {      
    _pageHeirarchy = setPageData(arrPageLevel, _lastNodelevel);      
    _lastNodelevel = _lastNodelevel-1;
  }
  while (_lastNodelevel > 0);

  return _pageHeirarchy;
}
function setPageData(_arrpage, _level){  

  let _nodePages =  _arrpage.filter(function(node) {
    return node.level === _level;
  });
  
  let _branchPages = _arrpage.filter(function(branch) {
    return branch.level === (_level-1);
  });
  
  _nodePages.forEach(node => {
    _branchPages.forEach(item => {
      if(item.id === node.parent){
        item.children.push(node);
        item.childcount = item.children.length;
      }
    }); 
  });

  return _arrpage;
}

function getPageObj(pagelist, pageid) {
  let nodes =  pagelist.filter(function(node) {
    return node['pageid'] === pageid;
  });

  if(nodes.length > 0) {
    return nodes[0];
  }
  return {};
}

function mergePageData(sourcePage, targetPage, scaleW, scaleH) {
  /* if(sourcePage['viewType'].indexOf("TableView") > -1) {
    console.log(sourcePage, "**********", sourcePage.Children[0].Group[0]);
    return;
  } */

  let isScaled = false;
  if(!targetPage.hasOwnProperty('viewType')) {
    targetPage = JSON.parse(JSON.stringify(sourcePage));
    isScaled = true;
  }

  sourcePage._navigationBars.push(targetPage._navigationBars[0]);
  sourcePage._tabBarHiddens.push(targetPage._tabBarHiddens[0]);
  if(targetPage._toolBarTop) {
    const ttbarSChildren = sourcePage._toolBarTop[0]['Children'];
    const ttbarTChildren = targetPage._toolBarTop[0]['Children'];
    let ttChildren = updateUIparts(ttbarSChildren, ttbarTChildren, scaleW, scaleH, isScaled);
    targetPage._toolBarTop[0]['Children'] = ttChildren;

    sourcePage._toolBarTop.push(targetPage._toolBarTop[0]);
  }
  if(targetPage._toolBarBottom) {
    const btbarSChildren = sourcePage._toolBarBottom[0]['Children'];
    const btbarTChildren = targetPage._toolBarBottom[0]['Children'];
    let btChildren = updateUIparts(btbarSChildren, btbarTChildren, scaleW, scaleH, isScaled);
    targetPage._toolBarBottom[0]['Children'] = btChildren;

    sourcePage._toolBarBottom.push(targetPage._toolBarBottom[0]);
  }
  if(targetPage._toolBarLeft) {
    const ltbarSChildren = sourcePage._toolBarLeft[0]['Children'];
    const ltbarTChildren = targetPage._toolBarLeft[0]['Children'];
    let ltChildren = updateUIparts(ltbarSChildren, ltbarTChildren, scaleW, scaleH, isScaled);
    targetPage._toolBarLeft[0]['Children'] = ltChildren;

    sourcePage._toolBarLeft.push(targetPage._toolBarLeft[0]);
  }
  if(targetPage._toolBarRight) {
    const rtbarSChildren = sourcePage._toolBarRight[0]['Children'];
    const rtbarTChildren = targetPage._toolBarRight[0]['Children'];
    let rtChildren = updateUIparts(rtbarSChildren, rtbarTChildren, scaleW, scaleH, isScaled);
    targetPage._toolBarRight[0]['Children'] = rtChildren;

    sourcePage._toolBarRight.push(targetPage._toolBarRight[0]);
  }

  let sourceChildren;
  let targetChildren;
  if(sourcePage.viewType === "ScrollView"){
    let scrollFrames = sourcePage.Children[0]['_frames'];
    let _frameObj = targetPage.Children[0]['_frames'];
    scrollFrames.push(_frameObj);

    sourceChildren = sourcePage['Children'][0].Children;
    targetChildren = targetPage['Children'][0].Children;
  }
  else if(sourcePage['viewType'].indexOf("TableView") > -1) {
    if(sourcePage.Children[0]['_tmpCellStyle']) {
      sourceChildren = sourcePage['Children'][0].Group[0].RecordCellDef.Fields;
      targetChildren = targetPage['Children'][0].Group[0].RecordCellDef.Fields;
    }
  }
  else {
    sourceChildren = sourcePage['Children'];
    targetChildren = targetPage['Children'];
  }
  updateUIparts(sourceChildren, targetChildren, scaleW, scaleH, isScaled);

  if(sourcePage.pageOverlay && targetPage.pageOverlay) {
    const overlaySChildren = sourcePage.pageOverlay.Children;
    const overlayTChildren = targetPage.pageOverlay.Children;
    if(overlaySChildren.length > 0) {
      //console.log(overlaySChildren, "........pageOverlay........", overlayTChildren);
      overlaySChildren.forEach((ochild,o) => {
        if(ochild['viewType'] === "Dialog") {
          let dialogUIparts = ochild['uiParts'];
          const sdialogChildren = dialogUIparts[0]['dataarray'][0]['Fields'];

          const tdialogUIparts = overlayTChildren[o]['uiParts'];
          const tdialogChildren = tdialogUIparts[0]['dataarray'][0]['Fields'];
          let dfChildren = updateUIparts(sdialogChildren, tdialogChildren, scaleW, scaleH, isScaled);
          tdialogUIparts[0]['dataarray'][0]['Fields'] = dfChildren;

          const dialogObj = JSON.parse(JSON.stringify(tdialogUIparts[0]));
          dialogUIparts.push(dialogObj);          
        }          
      });
    }
  }
  //console.log(sourcePage, "****", targetPage);
}

function updateUIparts(sourceChildren, targetChildren, scaleW, scaleH, scaled) {
  let sChildren;
  let tChildren;
  let scalingW;
  let scalingH;
  let enabled;
  
  if(sourceChildren.length === 0 && targetChildren.length > 0) {
    sChildren = targetChildren;
    tChildren = sourceChildren;
    scalingW = 1;
    scalingH = 1;
    enabled = false;
  }else {
    sChildren = sourceChildren;
    tChildren = targetChildren;
    scalingW = scaleW;
    scalingH = scaleH;
  }

  sChildren.forEach((sobj, i) => {
    //console.log(i, ">>>>", sobj['viewType'], "****", sobj.uiParts[0]['name']);
    
    let _nodes =  tChildren.filter(function(node) {
      return (node['viewType'] === sobj['viewType'] && node.uiParts[0]['name'] === sobj.uiParts[0]['name']);
    });
  
    sobj['uiParts'].splice(1,1);
    if(_nodes.length > 0) {
      //console.log(_nodes[0]['viewType'], "%%%%%", _nodes[0].uiParts[0]['name']);
      if(!scaled) {
        sobj.uiParts.push(_nodes[0].uiParts[0]);
      }else {
        const clonedNode = scaleUIpart(_nodes[0].uiParts[0], scalingW, scalingH);
        sobj.uiParts.push(clonedNode);
      }
    }else {
      //console.log("Nahi mila................");
      const clonedObj = scaleUIpart(sobj.uiParts[0], scalingW, scalingH);
      if(enabled !== undefined) {
        clonedObj['_enabledOnScreen'] = enabled;
        sobj.uiParts.unshift(clonedObj);
      }else {
        sobj.uiParts.push(clonedObj);
      }
      
    }
  });

  return sChildren;
}

function scaleUIpart(uiObj, scaleW, scaleH) {
  const scaledObj = JSON.parse(JSON.stringify(uiObj));
  let _frameObj = scaledObj['frame'];
  let newFrameObj = JSON.parse(JSON.stringify(_frameObj));
  newFrameObj['x'] = Math.ceil(newFrameObj['x'] * scaleW);
  newFrameObj['y'] = Math.ceil(newFrameObj['y'] * scaleH);
  newFrameObj['width'] = Math.ceil(newFrameObj['width'] * scaleW);
  newFrameObj['height'] = Math.ceil(newFrameObj['height'] * scaleH);
  scaledObj['frame'] = newFrameObj;

  return scaledObj;
}


function mapStateToProps(state) { 
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    pageList: state.appData.pagelist,
    contributorTabs: state.appData.contributortabs,
    openedPages: state.selectedData.pages,
    currentPage: state.selectedData.pagedata,
    pageChildren: state.selectedData.paeChildren,
    currentUI: state.selectedData.uidata,
    targetEditor: state.selectedData.editor,
    editorState: state.selectedData.editorState,
    contentEditorParent: state.selectedData.editorParent,
  };
}
export default connect(mapStateToProps)(ProjectMergeView);