import React from 'react';
import PropTypes from 'prop-types';
//import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Container, Button, Backdrop, Fab } from '@material-ui/core';
import PageContainer from './PageContainer';
import UIContainer from './UIContainer';

import expandIcon from '../../assets/icon-expand.png';
import collapseIcon from '../../assets/icon-collapse.png';
import addButton from '../../assets/navigationbar/add.png';
import actionButton from '../../assets/navigationbar/action.png';
import backButton from '../../assets/navigationbar/back.png';	
import bookmarkButton from '../../assets/navigationbar/bookmark.png';
import cameraButton from '../../assets/navigationbar/camera.png';
import composeButton from '../../assets/navigationbar/compose.png';
import forwardButton from '../../assets/navigationbar/fast-forward.png';
import organizeButton from '../../assets/navigationbar/organize.png';
import pagecurlButton from '../../assets/navigationbar/page-curl.png';	
import pauseButton from '../../assets/navigationbar/pause.png';
import playButton from '../../assets/navigationbar/play.png';
import refreshButton from '../../assets/navigationbar/refresh.png';
import replyButton from '../../assets/navigationbar/reply.png';
import rewindButton from '../../assets/navigationbar/rewind.png';	
import searchButton from '../../assets/navigationbar/search.png';
import settingsButton from '../../assets/navigationbar/settings.png';
import stopButton from '../../assets/navigationbar/stop.png';
import trashButton from '../../assets/navigationbar/trash.png';


class PageLayoutEditor extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        show: this.props.show,
        pageData: this.props.data,
        pageType: this.props.viewType,
        pageConfig: this.props.config,
        
        openProps: true,
      };   
    }
  
    componentDidMount() {
      //console.log("............. PageLayoutEditor componentDidMount ............");
    }

    componentDidUpdate(prevProps,prevState) {
      if(prevProps.data !== this.props.data)
      {
        //console.log(".............PageLayoutEditor componentDidUpdate ............");
        this.setState({ pageData: this.props.data });
      }   
    }

    //////////////////////

    handleUpdateValue = (key, value) => {  
      this.props.onPropertyEdit(key, value);
    };

    handleLayoutEditorClick (target) {
      //console.log("........handleLayoutEditorClick........... ", target);
      sessionStorage.setItem("editor", target);
      //this.props.dispatch(setSelectedLayout(target));
    }

    //////////////////////

    
    render() {
      const { show, pageData } = this.state;
      const appData = this.props.appData;
      const scrIndex = this.props.screenIndex;      
      const currentScreen = {screenId: scrIndex, screenObj: appData['availableScreens'][scrIndex]};
      const appConfig = {apiURL: this.props.appconfig.apiURL, userid: this.props.appconfig.userid, sessionid: this.props.appconfig.sessionid, projectid: this.props.appconfig.projectid};
      const haveContainerView = (this.props.haveContainerView) ? this.props.haveContainerView : false;

      if(!show) {
        return null;
      }

      const targetEditor = sessionStorage.getItem("editor");
      
      return ( 
        <div id="pagelayouteditor" className="vertical-align">
          <PageLayout appconfig={appConfig} appData={appData} list={this.props.pageList} screenData={currentScreen} data={pageData} source={targetEditor} haveContainerView={haveContainerView}
                      onClickLayoutEditor={(...args) => this.handleLayoutEditorClick(args[0])}/>          
        </div>
               
      );
      
    }
  }
 
  function getparentViewType(parentid, pagelist) {
    let pageDef =  pagelist.filter(function(_page) {
      return _page['pageid'] === parentid;
    });

    return pageDef[0]['viewType'];
  }

  function PageLayout(props) {

    const appConfig = props.appconfig;
    const pageList = props.list;
    const currentScreen = props.screenData; 
    const scrIndex = currentScreen['screenId'];
    const scrObj = currentScreen['screenObj'];
    const pageData = props.data;    
    
    const isLeftbarVisible = !(pageData._toolBarLeft[scrIndex].hidden);
    const isLeftbarFixed = (isLeftbarVisible) ? pageData._toolBarLeft[scrIndex].fixed : false;
    const leftbarWidth = parseInt(pageData._toolBarLeft[scrIndex].frame['width']);
    let shift = (isLeftbarVisible && isLeftbarFixed) ? (leftbarWidth+16) : 16;
    let parentViewtype = (pageData['parentid'] !== "App") ? getparentViewType(pageData['parentid'], pageList) : "App";
    if(parentViewtype === "SplitView" || parentViewtype === "PageScrollView"){
      console.log(pageData['viewType'], ">> parent type is :", parentViewtype);
      //shift = 0;
    }
    if(props.haveContainerView)      shift = 0;

    const isRightbarVisible = (pageData._toolBarRight) ? !(pageData._toolBarRight[scrIndex].hidden) : false;
    const isRightbarFixed = (pageData._toolBarRight && isRightbarVisible) ? pageData._toolBarRight[scrIndex].fixed : false;
    const rightbarWidth = (pageData._toolBarRight) ? parseInt(pageData._toolBarRight[scrIndex].frame['width']) : 0;
    //console.log("Right toolbar >>", isRightbarVisible, isRightbarFixed, rightbarWidth);
    
    let containerWidth = parseInt(scrObj['width']);  //pageData.frame.width;
    if(isLeftbarVisible && isLeftbarFixed) {
      containerWidth = containerWidth - parseInt(leftbarWidth);
    }
    if(isRightbarVisible && isRightbarFixed) {
      containerWidth = containerWidth -  parseInt(rightbarWidth);
    }
    const containerHeight = calculateContainerSize(pageData, scrObj, scrIndex);      
    
    const isOverlayExist = (pageData.hasOwnProperty("pageOverlay") && pageData.pageOverlay.Children.length > 0) ? true : false;

    let isScrollButtons = false;
    let scrollButtonsBottom = 10;
    let scrollButtonsBGColor = 0;
    let scrollButtonsTextColor = 0;
    if(pageData['viewType'] === "ScrollView") {
      if(pageData.Children[0]['showScrollButtons'])  isScrollButtons = true;
      if(!(pageData._toolBarBottom[scrIndex].hidden)){
        scrollButtonsBottom = scrollButtonsBottom + pageData._toolBarBottom[scrIndex]['frame']['height'];
      }

      scrollButtonsBGColor = getColorValue(pageData.Children[0]['scrollButtonsBGColor']);
      scrollButtonsTextColor = getColorValue(pageData.Children[0]['scrollButtonsTextColor']);
    }

    const bgGradient = (pageData.viewType === "ScrollView") ? pageData.Children[0].backgroundGradient : pageData.backgroundGradient;
    
    const useStyles = makeStyles(theme => ({
      root: {
        width: '100%',
        height: '100%',
        padding: 0,
        margin: 0,
      },
      container: {
        position: "absolute",
        left: shift,
        width: `calc(${containerWidth}px)`,
        maxWidth: `calc(${containerWidth}px)`,
        padding: 0,
        margin: 0,
      },
      pagecontainer: {
        width: `calc(${containerWidth}px)`,
        height: `calc(${containerHeight}px)`,
        //display: 'inline-block',
        overflow: 'auto',
        background: bgGradient
      },
      leftbariconbox: {
        position: 'absolute',
        top: 20, left: 0,
        width: '14px', height: '14px',
        backgroundColor: 'rgba(222, 222, 222, 1)',
      },
      rightbariconbox: {
        position: 'absolute',
        top: 20, right: -16,
        width: '14px', height: '14px',
        backgroundColor: 'rgba(222, 222, 222, 1)',
      },
      sidebaricon: {
        position: 'relative',
        bottom: '2px',
        left: '-2px',
      },
      overlayhandlebox: {
        position: 'absolute',
        top: 0, left: 20,
        width: '14px', height: '14px',
        backgroundColor: 'rgba(222, 222, 222, 1)',
      },      
      scrollbuttondiv: {
        width: '100%',
        position: 'absolute',
        bottom: scrollButtonsBottom,
        pointerEvents: 'none'
      },
      scrollbutton: {
        backgroundColor: scrollButtonsBGColor,
        color: scrollButtonsTextColor,
        textTransform: 'none',
      }     
    }));
  
    const classes = useStyles();

    const [showLeftbar, setLeftbar] = React.useState(true);
    function handleLeftbarVisibility(event) {
      setLeftbar(!showLeftbar);
    }
    const [showRightbar, setRightbar] = React.useState(true);
    function handleRightbarVisibility(event) {
      setRightbar(!showRightbar);
    }
    const [showOverlay, setOverlay] = React.useState(true);
    function handleOverlayVisibility(event) {
      setOverlay(!showOverlay);
    }

    function handleLayoutClick(target) {      
      props.onClickLayoutEditor(target);
    }    

    function handleDragSelection(e) {
      //e.preventDefault();

      const uilist = document.getElementsByName('uilayoutbox12345');
      if(uilist && uilist.length > 0) {        
        const ds = new window.DragSelect({
          selectables: uilist,
          area: document.getElementById('layouteditor')
        });

        //ds.addSelectables(document.getElementsByName('uilayoutbox'), true);
        
        //ds.subscribe('elementselect', ({ items, item }) => { 
        //  console.log(items.length, "...elementselect >> ", item);
        //});
        //ds.subscribe('elementunselect', ({ items, item }) => { 
        //  console.log(items.length, "...elementunselect >> ", item);
        //});
        ds.subscribe('callback', ({ items, event }) => { 
          //console.log(items);
          setUISelection(items);
        });
        
        ds.getSelection();
      }
    }    
    function setUISelection(selectedItems) {
      //console.log("...selectedItems >>", selectedItems);
      let selectedItemsId = [];
      selectedItems.forEach((element) => {
        selectedItemsId.push(element['id']);
      });

      if(selectedItemsId.length > 0) {
        let selectedUIparts = [];
        const _page = props.data;
        let children = getAllChildrenOnPage(_page, scrIndex);
        //console.log(children, "...selected Items >>", selectedItemsId);
        for (let index = 0; index < children.length; index++) {
          const _child = children[index];
          delete _child['selected'];
          let uipart = _child['uiParts'][scrIndex];
          if(selectedItemsId.indexOf(uipart['name']) > -1) {
            _child['selected'] = true;
            //console.log(index, _child, "...selected _child >>", children);
            const source = (props.source === "") ? "page" : props.source;
            let currentUIObj = {editor: source, UI: uipart};
            selectedUIparts.push(currentUIObj);
          }          
        }

        console.log(children, selectedItemsId, "...selected Items >>", selectedUIparts);
        props.onDragSelection(selectedUIparts);
      }
    }
    
    return (
      <div className={classes.root} onMouseDown={handleDragSelection}>
        <SideBarView show={(isLeftbarVisible && isLeftbarFixed)} 
                     position="left" appconfig={appConfig} screenData={currentScreen} data={pageData}
                     onLayoutSelect={handleLayoutClick} />
        <SideBarView show={(isRightbarVisible && isRightbarFixed)} 
                     position="right" appconfig={appConfig} screenData={currentScreen} data={pageData}
                     onLayoutSelect={handleLayoutClick} />
        <Container id="container" fixed className={classes.container}>
          <StatusBarView show={!(pageData.StatusBarHidden)} />
          <NavigationBarView show={!(pageData.NavigationBarHidden)} screenData={currentScreen} data={pageData} />
          <ToolBarView show={!(pageData._toolBarTop[scrIndex].hidden)} position="top"
                       appconfig={appConfig} screenData={currentScreen} data={pageData} 
                       onLayoutSelect={handleLayoutClick}/>
          <Box id="pagecontainer" className={classes.pagecontainer}>            
            <PageContainer appconfig={appConfig} appData={props.appData} pageList={pageList} screenData={currentScreen} data={pageData} viewtype={pageData.viewType}
                           onLayoutSelect={handleLayoutClick}/>
            {isScrollButtons && 
              <div className={classes.scrollbuttondiv}>
                <Fab color="default" size="small" variant='extended' className={classes.scrollbutton} >
                    Scroll Buttons
                </Fab>
              </div>
            }
          </Box>
          <ToolBarView show={!(pageData._toolBarBottom[scrIndex].hidden)} position="bottom"
                       appconfig={appConfig} screenData={currentScreen} data={pageData}
                       onLayoutSelect={handleLayoutClick} />
          <TabBarView show={!(pageData._tabBarHiddens[scrIndex])} appconfig={appConfig} data={pageData} screenId={scrIndex} />                  
        </Container>
        {showLeftbar && 
          <SideBarView show={(isLeftbarVisible && !isLeftbarFixed)} 
                       position="left" appconfig={appConfig} screenData={currentScreen} data={pageData}
                       onLayoutSelect={handleLayoutClick} />
        }
        {(isLeftbarVisible && !isLeftbarFixed) && 
          <Box id="leftbarhandle" className={classes.leftbariconbox} onClick={handleLeftbarVisibility}>
            {showLeftbar && <img src={expandIcon} alt="expand" className={classes.sidebaricon} />}
            {!showLeftbar && <img src={collapseIcon} alt="collapse" className={classes.sidebaricon} style={{transform: 'rotate(180deg)'}} />}            
          </Box>
        }
        {showRightbar && 
          <SideBarView show={(isRightbarVisible && !isRightbarFixed)} 
                       position="right" appconfig={appConfig} screenData={currentScreen} data={pageData}
                       onLayoutSelect={handleLayoutClick} />
        }
        {(isRightbarVisible && !isRightbarFixed) && 
          <Box id="rightbarhandle" className={classes.rightbariconbox} onClick={handleRightbarVisibility}>
            {showRightbar && <img src={expandIcon} alt="expand" className={classes.sidebaricon} style={{transform: 'rotate(180deg)'}} />}
            {!showRightbar && <img src={collapseIcon} alt="collapse" className={classes.sidebaricon} />}            
          </Box>
        }
        {isOverlayExist && 
          <div>
            {showOverlay && 
              <PageOverlay appconfig={appConfig} screenData={currentScreen} data={pageData}
                          hasFixedLeftbar={isLeftbarFixed} leftbarWidth={leftbarWidth} hasFixedRightbar={isRightbarFixed} rightbarWidth={rightbarWidth}
                          onLayoutSelect={handleLayoutClick} />
            }
            <Box id="overlayhandle" className={classes.overlayhandlebox} onClick={handleOverlayVisibility}>
                {!showOverlay && <img src={expandIcon} alt="expand" className={classes.sidebaricon} />}
                {showOverlay && <img src={collapseIcon} alt="collapse" className={classes.sidebaricon} />}            
            </Box>
          </div>
        }
      </div>
    );
  }

  function StatusBarView(props) {
    const useStyles = makeStyles(theme => ({
      root: {        
        width : '100%',
        height: 20,
      },
    }));  
    const classes = useStyles();
    
    if(!props.show) {
      return null;
    }
    return ( 
      <Box id="statusbar" bgcolor="text.secondary" className={classes.root}></Box>       
    );
  }

  function NavigationBarView(props) {
    const currentScreen = props.screenData; 
    const scrIndex = currentScreen['screenId'];
    const scrObj = currentScreen['screenObj'];
    const data = props.data;

    const useStyles = makeStyles(theme => ({
      root: {        
        width : '100%',
        maxWidth: `calc(${scrObj.width}px)`,
        background: getBarStyle(data, scrIndex),
      },      
      prompt: {        
        width : '100%',
        height: 23,
        paddingTop: 7,
      },
      nav: {        
        width : '100%',
        height: 33,
        paddingTop: 11,
        fontSize: '21px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      leftbar: {
        minWidth: 80,
        height: '100%',
        minHeight: 32,
        marginLeft: 5,
        textAlign: 'start',
      },      
      leftsysbutton: {
        textTransform: 'none',
      },      
      lefttextbutton: {
        height: 36,   
        width: 80,
        color: theme.palette.background.paper,
        borderColor: theme.palette.background.paper,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textTransform: 'none',
      },
      rightbar: {
        minWidth: 80,
        height: '100%',
        minHeight: 32,
        marginRight: 5,
        textAlign: 'end',
      },
      rightsysbutton: {
        textTransform: 'none',
      },
      righttextbutton: {
        height: 36,
        width: 80,
        color: theme.palette.background.paper,
        borderColor: theme.palette.background.paper,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textTransform: 'none',
      },
      
    }));  
    const classes = useStyles();
    
    if(!props.show) {
      return null;
    }
    return (
      <div id="navbar" className={classes.root}>
        {(data._navigationBars[scrIndex].prompt !== "") &&
          <Box id="promptnav" className={classes.prompt} color="background.paper">
            {data._navigationBars[scrIndex].prompt}
          </Box>
        }
        <div className="horizontal-align">
          <Box id="leftBarButton" className={classes.leftbar} color="background.paper">
            {(data._navigationBars[scrIndex].leftBarButton.type === "SystemItem") && getNavbarSystemBtn(data._navigationBars[scrIndex].leftBarButton.systemItem)}
            {(data._navigationBars[scrIndex].leftBarButton.type === "TextItem") &&
              <Button variant="outlined" component="span" className={classes.lefttextbutton}>
                {data._navigationBars[scrIndex].leftBarButton.text}
              </Button>
            }
          </Box>          
          <Box id="navbar" className={classes.nav} color="background.paper">
            {data._navigationBars[scrIndex].title}
          </Box>
          <Box id="rightBarButton" className={classes.rightbar} color="background.paper">
            {(data._navigationBars[scrIndex].rightBarButton.type === "SystemItem") && getNavbarSystemBtn(data._navigationBars[scrIndex].rightBarButton.systemItem)}
            {(data._navigationBars[scrIndex].rightBarButton.type === "TextItem") &&
              <Button variant="outlined" component="span" className={classes.righttextbutton} >
                {data._navigationBars[scrIndex].rightBarButton.text}
              </Button>
            }
          </Box>
               
        </div>
      </div>
    );
  }

  function TabBarView(props) {
    const data = props.data;
    let iconName = "";
    if(data.TabBase.icon.fileDic.filename) {
      iconName = (data.TabBase.icon.fileDic.filename.length > 0) ? data.TabBase.icon.fileDic.filename +"."+ data.TabBase.icon.fileDic.fileext : "";
    }else {
      data.TabBase.icon.fileDic = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    }    
    const tabIcon = (iconName.length === 0) ? "" : props.appconfig.apiURL + "download/image/" + props.appconfig.projectid + "/" + iconName;
    const iconVisibility = (iconName.length === 0) ? "hidden" : "visible";

    const useStyles = makeStyles(theme => ({
      root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: 49,
        background: getBarStyle(data, props.screenId),
      },
      tabbar: {        
        width : '100%',
        fontSize: '14px',
      },
      tabicon: {
        width: 30,
        height: 30,
        objectFit:'scale-down',
        visibility: iconVisibility,
      },
    }));
    const classes = useStyles();
    
    if(!props.show) {
      return null;
    }
    return (
      <div id="tabbar" className={classes.root}>
        <img src={tabIcon} alt="" className={classes.tabicon}></img>     
        <Box id="tabbar" className={classes.tabbar} color="background.paper">
          {data.TabBase.icontitle}
        </Box>       
      </div>
    );
  }  

  function getBarStyle(barObj, scrIndex) {
    let _style = {};
    let barStyle = barObj._navigationBars[scrIndex].barStyle; 	
    let customColor = getColorValue(barObj._navigationBars[scrIndex].tintColor);
    
    switch (barStyle)
    {
      case "Default":
        _style = "linear-gradient(#8CA8CF 33%, #678ABA 66%, #5074A7 100%)";
        /* linearGradient.entries = [
          new GradientEntry(0x8CA8CF, 0.00, 0.85),
          new GradientEntry(0x678ABA, 0.33, 0.85),
          new GradientEntry(0x5074A7, 0.66, 0.85)
        ]; */
        
        break;
      case "BlackOpaque":
        _style = "linear-gradient(#2F2F2F 33%, #272727 66%, #1A1A1A 100%)";        
        break;
      case "BlackTranslucent":
        _style = "linear-gradient(#666768 33%, #4B4B4B 66%, #3F3F3F 100%)";
        break;
      case "Translucent":
        _style = "linear-gradient(#FCFCFC 33%, #FEFEFE 66%, #D0D0D0 100%)";
        break;
      case "Custom":
        _style = "linear-gradient("+customColor+" 60%, "+customColor+" 100%)";
       /*  linearGradient.entries = [
          new GradientEntry(ColorUtil.adjustBrightness2(baseColor, 60), 0.0, 0.85),
          new GradientEntry(baseColor, 0.6, 0.85)
        ]; */
        break;
      default:
        _style = customColor;
    }		
    return _style;

  }

  function getNavbarSystemBtn(buttonType) {
    
    let sysbtnMockup;
    
    switch (buttonType) {
      case "add":
        sysbtnMockup = <img className="App-logo" src={addButton} alt="add"></img>;
        break;				
      case "action":
        sysbtnMockup = <img className="App-logo" src={actionButton} alt="action"></img>;
        break;				
      case "back":
        sysbtnMockup = <img className="App-logo" src={backButton} alt=""></img>;
        break;				
      case "bookmark":
        sysbtnMockup = <img className="App-logo" src={bookmarkButton} alt=""></img>;
        break;				
      case "camera":
        sysbtnMockup = <img className="App-logo" src={cameraButton} alt=""></img>;
        break;				
      case "compose":
        sysbtnMockup = <img className="App-logo" src={composeButton} alt=""></img>;
        break;				
      case "fast-forward":
        sysbtnMockup = <img className="App-logo" src={forwardButton} alt=""></img>;
        break;				
      case "organize":
        sysbtnMockup = <img className="App-logo" src={organizeButton} alt=""></img>;
        break;				
      case "page-curl":
        sysbtnMockup = <img className="App-logo" src={pagecurlButton} alt=""></img>;
        break;				
      case "pause":
        sysbtnMockup = <img className="App-logo" src={pauseButton} alt=""></img>;
        break;				
      case "play":
        sysbtnMockup = <img className="App-logo" src={playButton} alt=""></img>;
        break;				
      case "refresh":
        sysbtnMockup = <img className="App-logo" src={refreshButton} alt=""></img>;
        break;				
      case "reply":
        sysbtnMockup = <img className="App-logo" src={replyButton} alt=""></img>;
        break;				
      case "rewind":
        sysbtnMockup = <img className="App-logo" src={rewindButton} alt=""></img>;
        break;				
      case "search":
        sysbtnMockup = <img className="App-logo" src={searchButton} alt=""></img>;
        break;				
      case "settings":
        sysbtnMockup = <img className="App-logo" src={settingsButton} alt=""></img>;
        break;				
      case "stop":
        sysbtnMockup = <img className="App-logo" src={stopButton} alt=""></img>;
        break;				
      case "trash":
        sysbtnMockup = <img className="App-logo" src={trashButton} alt=""></img>;
        break;     
        //
      default:
        sysbtnMockup = <Button disableRipple variant="contained" color="default" style={{minHeight: 32, textTransform: 'none'}} >{buttonType}</Button>;
        break;
    }

    return sysbtnMockup;
  }

  function ToolBarView(props) {
    const currentScreen = props.screenData; 
    const scrIndex = currentScreen['screenId'];
    //const scrObj = currentScreen['screenObj'];
    const data = props.data;
    const position = props.position;
    const source = position+"Toolbar";
    const toolbar = (position === 'top') ? (data._toolBarTop[scrIndex]) : (data._toolBarBottom[scrIndex]);
    //console.log(scrIndex, position, "Toolbar >>>>>>", toolbar.Children);
    for (let index = 0; index < toolbar.Children.length; index++) {
      const element = toolbar.Children[index];
      if(element.uiParts && element.uiParts.length === 0) {
        toolbar.Children.splice(index, 1);
        index--;
      }      
    }
    const height = toolbar.frame.height;      //(position === 'top') ? (data._toolBarTop[0].frame.height) : (data._toolBarBottom[0].frame.height);
    const bgcolor = toolbar.backgroundColor;  //(position === 'top') ? (data._toolBarTop[0].backgroundColor) : (data._toolBarBottom[0].backgroundColor);

    const useStyles = makeStyles(theme => ({
      root: {      
        width: '100%',
        height: `calc(${height}px)`,
        backgroundColor: getColorValue(bgcolor),
        overflow: 'hidden',
        background: toolbar.backgroundGradient
      },      
    }));
    const classes = useStyles();
    
    const appConfig = props.appconfig;
    if(!props.show) {
      return null;
    }

    function handleToolbarClick(event) {
      //console.log("..............handleToolbarClick............... ", source);
      props.onLayoutSelect(source);
    }

    return (
      <Box id="toolbar" className={classes.root} onClick={handleToolbarClick}>
        <UIContainer appconfig={appConfig} pagedata={data} data={toolbar.Children} source={source} screenIndex={scrIndex} containerFrame={toolbar.frame} />
      </Box>
    );
  }

  function SideBarView(props) {
    const appConfig = props.appconfig;
    const data = props.data;
    const currentScreen = props.screenData; 
    const scrIndex = currentScreen['screenId'];

    //const topOffset = 20;
    const offset = 20;//(data.StatusBarHidden) ? (topOffset+0) : (topOffset+20);

    const position = props.position;
    const source = position+"Toolbar";
    //const toolbar = (position === 'left') ? (data._toolBarLeft[scrIndex]) : (data._toolBarLeft[scrIndex]);
    let toolbar = data._toolBarLeft[scrIndex];
    if(position === 'right') {
      if(data._toolBarRight) {
        toolbar = data._toolBarRight[scrIndex];
      }
    }
    //const view = toolbar.view;
    //console.log(position, view, " >>>> Sidebar >>>>>>", toolbar);
    const width = toolbar.frame.width;
    const height = toolbar.frame.height;
    const bgcolor = toolbar.backgroundColor;

    let backdropDisplay = (toolbar.fixed) ? 'none' : 'block';

    const rightshift = (position === 'right') ? 0 : null;

    const useStyles = makeStyles(theme => ({
      backdrop: {
        position: 'absolute',
        overflow: 'hidden',
        left: 16,
        height: '100%',
        zIndex: 0,//theme.zIndex.drawer + 1,
        color: '#fff',
        display: backdropDisplay,
      },
      sidebar: {
        position: 'absolute',
        overflow: 'hidden auto',
        
        right: rightshift,      
        width: `calc(${width}px)`,
        height: `calc(100% - ` +offset+ `px)`,
        backgroundColor: getColorValue(bgcolor),
        background: toolbar.backgroundGradient
      },
      scroll: {
        width: `calc(${width}px)`,
        height: `calc(${height}px)`,
      },     
    }));
    const classes = useStyles();
    
    if(!props.show) {
      return null;
    }

    function handleSidebarClick(event) {
      //console.log("..............handleSidebarClick............... ", source);
      props.onLayoutSelect(source);
    }

    return (
      <div id="sidebarlayout" onClick={handleSidebarClick}>
        <Backdrop className={classes.backdrop} open={true}>
        </Backdrop>
        <Box id="sidebar" className={classes.sidebar}>        
          <div id="scrollarea" className={classes.scroll}> 
            <UIContainer appconfig={appConfig} pagedata={data} data={toolbar.Children} source={source} screenIndex={scrIndex} containerFrame={toolbar.frame} />
          </div>
        </Box>
      </div>
      
    );
  }

  function PageOverlay(props) {
    const appConfig = props.appconfig;
    const currentScreen = props.screenData; 
    const scrIndex = currentScreen['screenId'];
    const scrData = currentScreen['screenObj'];
    
    const topOffset = 18;

    let leftShift = (props.hasFixedLeftbar) ? (props.leftbarWidth) : 0;
    let leftOffset = leftShift + 16;
    let rightShift = (props.hasFixedRightbar) ? (props.rightbarWidth) : 0;
    
    const data = props.data;
    const pageoverlay = data.pageOverlay;
    //console.log(currentScreen, "PageOverlay >>>>", pageoverlay);
    
    const width = parseInt(scrData.width) - leftShift - rightShift;

    const useStyles = makeStyles(theme => ({
      root: {
        position: 'absolute',
        overflow: 'hidden',
        top: topOffset, 
        left: leftOffset,     
        width: `calc(${width}px)`,
        height: `calc(100% - ` +topOffset+ `px)`,
      },
      backdrop: {
        position: 'absolute',
        overflow: 'hidden',
        top: topOffset, left: 16,
        height: `calc(100% - ` +topOffset+ `px)`,
        zIndex: 0,//theme.zIndex.drawer + 1,
        color: '#fff',
      },
    }));

    const classes = useStyles();

    function handleOverlayClick(event) {     
      props.onLayoutSelect("pageOverlay");
    }

    return (
      <div id="overlaylayout">
        <Backdrop className={classes.backdrop} open={true}></Backdrop>
        <Box id="pageoverlay" className={classes.root} onClick={handleOverlayClick}>        
          <UIContainer appconfig={appConfig} pagedata={data} data={pageoverlay.Children} source="pageOverlay" screenIndex={scrIndex} containerFrame={pageoverlay.frame} />
        </Box>        
      </div>
      
    );
  }

  function calculateContainerSize(pageObj, scrObj, scrIndex) {

    let containerHeight = scrObj['height']; //pageObj.frame.height;
    /* if((isSplitViewChild || isSplitViewHierarchy) && splitViewChild)
    {
      if (toolBar_Top.visible)
      {
        containerHeight -= toolBar_Top.height;
      }
      if (toolBar_Bottom.visible)
      {
        containerHeight -= toolBar_Bottom.height;
      }
      return containerHeight;
    } */

    if(pageObj._navigationBars[scrIndex].prompt === undefined) {
      pageObj._navigationBars[scrIndex].prompt = "";
    }
    
    let statusBar = {visible: !(pageObj.StatusBarHidden), height:20};
    let navigationBar = {visible: !(pageObj.NavigationBarHidden), height:44, prompt: (pageObj._navigationBars[scrIndex].prompt), promptheight:74};
    let tabBar = {visible: !(pageObj._tabBarHiddens[scrIndex]), height:49};
    let toolBar_Top = {visible: !(pageObj._toolBarTop[scrIndex].hidden), height:(pageObj._toolBarTop[scrIndex].frame.height)};
    let toolBar_Bottom = {visible: !(pageObj._toolBarBottom[scrIndex].hidden), height:(pageObj._toolBarBottom[scrIndex].frame.height)};

    if (!statusBar || !navigationBar || !tabBar || !toolBar_Top || !toolBar_Bottom)
      return containerHeight;
    
    if (statusBar.visible)
    {
      containerHeight -= statusBar.height;
    }    
    if (navigationBar.visible)
    {      
      if(navigationBar.prompt && navigationBar.prompt.length > 0) {
        containerHeight -= navigationBar.promptheight;
      }else {
        containerHeight -= navigationBar.height;
      }
    }
    if (tabBar.visible)
    {
      containerHeight -= tabBar.height;
    }
    if (toolBar_Top.visible)
    {
      containerHeight -= toolBar_Top.height;
    }
    if (toolBar_Bottom.visible)
    {
      containerHeight -= toolBar_Bottom.height;
    }
    
    return containerHeight;
  
  }

  function getColorValue(colorObj) {
    let _red = parseInt(colorObj.red * 255);
    let _green = parseInt(colorObj.green * 255);
    let _blue = parseInt(colorObj.blue * 255);
  
    return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
  }

  /* function getColorValue(colorObj) {
    let _red = Math.ceil(colorObj.red * 255);
    let _green = Math.ceil(colorObj.green * 255);
    let _blue = Math.ceil(colorObj.blue * 255);
  
    return fullColorHex(_red, _green, _blue);
  }
  function fullColorHex(r,g,b) {   
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return '#'+red+green+blue;
  };
  var rgbToHex = function (rgb) { 
    var hex = Number(rgb).toString(16);  
    if (hex.length < 2) {
         hex = "0" + hex;
    }
    return hex;
  }; */

  PageLayoutEditor.propTypes = {
    //onClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
  };

  function getAllChildrenOnPage(_page, scrIndex)
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
        }
      });
    }
      
    // page-bars children 

    let cntTop = -1;
    if(_page._toolBarTop.length > 0) {		
      _page._toolBarTop.forEach(_topToolbar => {
        cntTop++;
        if(cntTop === 0) {
          for (let t = 0; t < _topToolbar.Children.length; t++) 
          {
            let _topToolbarUIContainerDic = _topToolbar.Children[t];
            let _topToolbarChildPartDic = _topToolbarUIContainerDic['uiParts'][scrIndex];
            if(_topToolbarChildPartDic) {
              if(!_topToolbarChildPartDic['_enabledOnScreen'])
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
      });    
    }

    let cntBottom = -1;
    if(_page._toolBarBottom.length > 0) {				
      _page._toolBarBottom.forEach(_bottomToolbar => {
        cntBottom++;
        if(cntBottom === 0) {
          for (let b = 0; b < _bottomToolbar.Children.length; b++) 
          {
            let _bottomToolbarUIContainerDic = _bottomToolbar.Children[b];
            let _bottomToolbarChildPartDic = _bottomToolbarUIContainerDic['uiParts'][scrIndex];
            if(_bottomToolbarChildPartDic) {
              if(!_bottomToolbarChildPartDic['_enabledOnScreen'])
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
      });
    }

    let cntLeft = -1;
    if(_page._toolBarLeft.length > 0)
    {
      _page._toolBarLeft.forEach(_leftToolbar => {
        cntLeft++;
        if(cntLeft === scrIndex) {
          for (let l = 0; l < _leftToolbar.Children.length; l++) 
          {
            let _leftToolbarUIContainerDic = _leftToolbar.Children[l];
            let _leftToolbarChildPartDic = _leftToolbarUIContainerDic['uiParts'][scrIndex];
            if(_leftToolbarChildPartDic) {
              if(!_leftToolbarChildPartDic['_enabledOnScreen'])
                continue;							
            }
            arrChildren.push(_leftToolbar.Children[l]);
            if(_leftToolbar.Children[l]['viewType'] === "TileList") {
              let arrlTileItems = _leftToolbar.Children[l]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let l0 = 0; l0 < arrlTileItems.length; l0++) 
              {
                arrChildren.push(arrlTileItems[l0]);								
              }
            }
          }
        }
      });
    }
    let cntRight = -1;
    if(_page._toolBarRight && _page._toolBarRight.length > 0)
    {				
      _page._toolBarRight.forEach(_rightToolbar => {
        cntRight++;
        if(cntRight === scrIndex) {
          for (let r = 0; r < _rightToolbar.Children.length; r++) 
          {
            let _rightToolbarUIContainerDic = _rightToolbar.Children[r];
            let _rightToolbarChildPartDic = _rightToolbarUIContainerDic['uiParts'][scrIndex];
            if(_rightToolbarChildPartDic) {
              if(!_rightToolbarChildPartDic['_enabledOnScreen'])
                continue;							
            }
            arrChildren.push(_rightToolbar.Children[r]);
            if(_rightToolbar.Children[r]['viewType'] === "TileList") {
              let arrrTileItems = _rightToolbar.Children[r]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let r0 = 0; r0 < arrrTileItems.length; r0++) 
              {
                arrChildren.push(arrrTileItems[r0]);								
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
              }							
              arrChildren.push(arrDialogItems[o0]);						
            }
          }
        }
      }
    }
      
    return arrChildren;
  }

  export default PageLayoutEditor;