import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import LocaleIcon from '@material-ui/icons/Language';
import HelpIcon from '@material-ui/icons/Help';
import DetailIcon from '@material-ui/icons/Details';
import CloseIcon from '@material-ui/icons/Close';
import Drawer from '@material-ui/core/Drawer';
import { Tooltip, SvgIcon } from '@material-ui/core';

import logo from '../assets/Appexe.png';
import ListMenu from '../components/ListMenu';
import ProjectDetails from './helpers/projectDetails';
import StyleEditor from './helpers/StyleEditor';
import HelperBotView from './helpers/HelperBotView';

const drawerWidth = 480;

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    densetoolbar: {
      height: 40,
      minHeight: 40,
    },
    appBar: {
      background: theme.palette.background.appexe,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: drawerWidth,
    },
    hide: {
      display: 'none',
    },
    drawerModal: {
      position: 'fixed',
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: drawerWidth,
      backgroundColor: theme.palette.divider,
      zIndex: 9999,     
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px 0 8px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
    },
    heading: {
      marginLeft: 8,
      width: '100%',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      background: theme.palette.background.default,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
    iconbtn: {
      padding: theme.spacing(1),
      marginRight: '-8px',
      color: theme.palette.background.contrast
    },
  }));

  const fileoptions = [
    {value:'new', text:'New'},
    {value:'save', text:'Save'},
    {value:'close', text:'Close'},
  ];
  const editoptions = [
    {value:'cut', text:'Cut'},
    {value:'copy', text:'Copy'},
    {value:'paste', text:'Paste'},
  ];
  const viewoptions = [
    {value:'v1', text:'View 1'},
    {value:'v2', text:'View 2'},
  ];
  const helpoptions = [
    {value:'uiparts', text:'UI Parts Help'},
    {value:'actions', text:'Actions Help'},
  ];
  
  function AppHeader(props) {
    //console.log(props.appconfig, "<<< AppHeader >>>", props.apiParam);
    const consoleURL = props.apiParam.console || "stagemultiuser.mobilous.com";
    const apiParam = {apiURL: props.appconfig.apiURL, userid: props.appconfig.userid, sessionid: props.appconfig.sessionid, projectid: props.appconfig.projectid};
    const project = props.data;

    const classes = useStyles();

    /////////////////////////////////////
    // Functionalities on App-Builder bar
    /////////////////////////////////////

    function handleLocaleClick(event) {
      console.log("Locale Click Handler .......");
    }
    
    function handleThemeClick(event) {
      props.onThemeChange();
    }

    //// Style Editor

    const [openstyleeditor, setStyleEditor] = React.useState(false);

    function handleStyleEditorClick() {
      console.log("Style Editor Handler .......", props);    
      const openedPagesList = props['openedPages'];
      if(openedPagesList.length === 0) {
        setStyleEditor(true);
      }else {            
        console.log("Please close all opened pages.");
        //setErrorMessage("Please close all opened pages.");
        //setErrorDisplay(true);
      }  
    }

    function handleCloseStyleEditor(param) {
      setStyleEditor(false);
    }
        
    //// PE Help Bot

    const [helpbotopen, setHelpBotOpen] = React.useState(false);

    function handleHelpClick() {
      setHelpBotOpen(true);
    }

    function handleHelpBotClose(){
      setHelpBotOpen(false);
    }

    //// Project Details

    const [prjdetailsopen, setPrjDetailsOpen] = React.useState(false);

    function handleProjectDetailsOpen() {
      setPrjDetailsOpen(true);
      //props.openProjectDetails('open');
    }
    function handleProjectDetailsClose() {
      setPrjDetailsOpen(false);
      //props.openProjectDetails('close');
    }

    ///////////////////////////////////////

    const projectSideBar = side => (      
      <div role="presentation">
        <div className={classes.drawerModal}></div>
        <div className={classes.drawerHeader} style={{height: 40, minHeight: 40}}>
          <Typography variant="h6" color="inherit" className={classes.heading}> Project Detail </Typography>
          <IconButton className={classes.iconbtn} onClick={handleProjectDetailsClose}>
              <CloseIcon />
          </IconButton>
        </div>
        <Divider />
        <div id="projectdata">            
          <ProjectDetails appconfig={apiParam} data={project}/>
        </div>
      </div>
    );
  
    return (
      <div className={classes.root}>
        <AppBar position="fixed"
                className={clsx(classes.appBar)}>
          <Toolbar variant="dense" className={classes.densetoolbar}>
            <div className="horizontal-align">
              <img className="App-logo" src={logo} alt="logo"></img>
              <span className="spacer"></span>
              <div className="horizontal-align" style={{display:'none'}}>
                <ListMenu id="filemenu" appconfig={apiParam} menutitle="File" menuoptions={fileoptions}/>
                <ListMenu id="editmenu" appconfig={apiParam} menutitle="Edit" menuoptions={editoptions}/>
                <ListMenu id="viewmenu" appconfig={apiParam} menutitle="View" menuoptions={viewoptions}/>
                <ListMenu id="helpmenu" appconfig={apiParam} menutitle="Help" menuoptions={helpoptions}/>
              </div>
            </div>
            <Tooltip title="Change Language" style={{display:'none'}}>
              <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Locale" 
                  onClick={handleLocaleClick}>
                <LocaleIcon />                
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle theme">
              <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Theme" 
                  onClick={handleThemeClick}>
                <SvgIcon>
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path>
                </SvgIcon>                            
              </IconButton>
            </Tooltip>
            <Tooltip title="Style Editor" style={{display:'none'}}>
              <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Theme" 
                  onClick={handleStyleEditorClick}>
                <SvgIcon>
                    <path d="M16.24,11.51l1.57-1.57l-3.75-3.75l-1.57,1.57L8.35,3.63c-0.78-0.78-2.05-0.78-2.83,0l-1.9,1.9 c-0.78,0.78-0.78,2.05,0,2.83l4.13,4.13L3.15,17.1C3.05,17.2,3,17.32,3,17.46v3.04C3,20.78,3.22,21,3.5,21h3.04 c0.13,0,0.26-0.05,0.35-0.15l4.62-4.62l4.13,4.13c1.32,1.32,2.76,0.07,2.83,0l1.9-1.9c0.78-0.78,0.78-2.05,0-2.83L16.24,11.51z M9.18,11.07L5.04,6.94l1.89-1.9c0,0,0,0,0,0l1.27,1.27L7.73,6.8c-0.39,0.39-0.39,1.02,0,1.41c0.39,0.39,1.02,0.39,1.41,0 l0.48-0.48l1.45,1.45L9.18,11.07z M17.06,18.96l-4.13-4.13l1.9-1.9l1.45,1.45l-0.48,0.48c-0.39,0.39-0.39,1.02,0,1.41 c0.39,0.39,1.02,0.39,1.41,0l0.48-0.48l1.27,1.27L17.06,18.96z"/><path d="M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.47-0.47-1.12-0.29-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z"/>
                </SvgIcon>                            
              </IconButton>
            </Tooltip>
            {openstyleeditor && 
              <StyleEditor show={true} appconfig={apiParam} appData={project} uiList={[]} pagelist={[]}
                            onCloseEditor={handleCloseStyleEditor} /> 
            }
            {!helpbotopen && 
              <Tooltip title="Help Me !">
                <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Help" 
                    onClick={handleHelpClick}>
                  <HelpIcon />                
                </IconButton>
              </Tooltip>
            }
            {!prjdetailsopen && 
              <Tooltip title="Project Details">
                <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Menu"
                    onClick={handleProjectDetailsOpen}>
                  <DetailIcon />                
                </IconButton>
              </Tooltip>
            }            
          </Toolbar>
        </AppBar>        
        <Drawer anchor="right" open={prjdetailsopen} variant="persistent"
                className={classes.drawer}
                classes={{
                    paper: classes.drawerPaper,
                }}
                onClose={handleProjectDetailsClose} 
        >
          {projectSideBar('right')} 
        </Drawer>
        <Drawer anchor="right" open={helpbotopen} variant="persistent"
                className={classes.drawer}
                classes={{
                    paper: classes.drawerPaper,
                }}
        >
          <div role="presentation">
          <div className={classes.drawerModal}></div>
          <div className={classes.drawerHeader} style={{height: 40, minHeight: 40}}>
            <Typography variant="h6" color="inherit" className={classes.heading}> Help Me ! </Typography>
            <IconButton className={classes.iconbtn} onClick={handleHelpBotClose}>
                <CloseIcon />
            </IconButton>
          </div>
          <Divider />
          <div id="helpbot" style={{display:'none'}}>  
            <HelperBotView/>
          </div>
          <div id="chatbot" style={{height:'92vh'}}>     
            <iframe width="475" height="100%"
                    src={`https://${consoleURL}/AppExeBot/`}
                    title="AppE" >
            </iframe>
          </div>
        </div>
        </Drawer>
      </div>
    );  
  }

  //export default AppHeader;
  function mapStateToProps(state) {   
    //console.log("AppEditor mapStateToProps >>>>>", state); 
    return {
      apiParam: state.appParam.params,
      appData: state.appData.data,
      openedPages: state.selectedData.pages,
    };
  }
  export default connect(mapStateToProps)(AppHeader);
