import React, { useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
//import ListSubheader from '@material-ui/core/ListSubheader';
import {Box, Switch, FormControlLabel, Fab, SvgIcon, Input, IconButton, Tooltip, Snackbar, Typography, CircularProgress} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardOutlined from '@material-ui/icons/ArrowForwardOutlined';

import imgBaseViewSource from '../../assets/pagetype/iconBaseView.png';    
import imgScrollViewSource from '../../assets/pagetype/iconScrollView.png';
import imgTableViewSource from '../../assets/pagetype/iconTableView.png';
import imgTableViewListSource from '../../assets/pagetype/iconTableViewList.png'; 
import imgDbTableViewSource from '../../assets/pagetype/iconDbTableView.png';           
import imgDbTableViewListSource from '../../assets/pagetype/iconDbTableViewList.png';          
import imgRemoteTableViewSource from '../../assets/pagetype/iconRemoteTableView.png';
//import imgRemoteTableViewListSource from '../../assets/pagetype/iconRemoteTableViewList.png';
import imgSplitViewSource from '../../assets/pagetype/iconSplitView.png';
import imgPageScrollViewSource from '../../assets/pagetype/iconPageScrollView.png';
import imgProjectSource from '../../assets/pagetype/iconApp.png';
import AlertWindow from '../../components/AlertWindow';

import { getTabModuleAccess, checkProjectRole } from '../helpers/Utility';

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
    },
    pagelist: {
        width: '100%',
        height: `calc(100% - 36px)`,//'100%',
        overflow: 'auto',
        padding: 0,
        marginTop: 2,        
        background: theme.palette.background.default,
    },
    pagelisthelperdiv: {
        height:32, 
        display:'flex', 
        alignItems:'center', 
        borderBottom:'4px inset',
        background: theme.palette.background.default
    },
    findbutton: {
        width:24, 
        height:24, 
        minHeight:20,
        marginRight:4
    },
    halign: {
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'flex-start',
        'align-items': 'center',
    },
    hspacer: {
        width: '24px',
    },
    icontype: {
        width: '18px',
        height: '20px',
        paddingRight: theme.spacing(2),
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
}));

const StyledListItem = withStyles(theme => ({
    root: {
        //border: "1px solid rgb(212, 0, 0)",
        maxHeight: 24,
        paddingLeft: 4,
        '&:focus': {
            background: theme.palette.background.hover,
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
        "&.Mui-selected": {
            background: theme.palette.background.hover,
            color: theme.palette.common.white,
        }        
    },
    selected: {}
}))(ListItem);


export default function PageListView(props) {
    const appConfig = props.appConfig;
    const projectdata = props.projectdata;
    const data = props.listdata;
    const records = data.list;
    //console.log(props, "------------ PAGELIST ---------", records);    

    useEffect(() => {
        const _pagelisttop = sessionStorage.getItem("pageListTop");
        const el = document.getElementById('pagelist');
        if(el) {
            el.scrollLeft = 0;
            el.scrollTop = (_pagelisttop) ? _pagelisttop : 0;
        }
    }, [])
    
    const classes = useStyles();

    const [selectedId, setSelectedId] = React.useState(-1);
    const [multiChecked, setMultiChecked] = React.useState(false);
    const [multiSelectedPages, setMultiSelectedPages] = React.useState([]);
    const resetMS = props.resetmultiselection;
    React.useEffect(() => {
        if(resetMS) setMultiSelectedPages([]);
    }, [resetMS])    

    function getSelectedPage(_page) {
        var el = document.getElementById('pagelist');
        if(el) {
            sessionStorage.setItem("pageListTop", el.scrollTop);
        }

        //console.log("getSelectedPage >>", _page.id);
        setFindPageId(_page.id);
        setSelectedId(_page.id);
        if(!multiChecked) {
            props.onNodeSelection(_page);
            setMultiSelectedPages([]);
        }else {
            if(_page.id !== -1){                
                props.onMultiPageSelection(_page);

                if(showFinder) {
                    setMultiSelectedPages([]);
                }else {
                    let arrSelectedPages = multiSelectedPages;
                    arrSelectedPages.push(_page.id);
                    setMultiSelectedPages(arrSelectedPages);
                }
            }
        }
        //console.log(findpageId, multiChecked, "... multiChecked >> ", multiSelectedPages);
    }

    function handlePageAdd(_page) {
        //console.log("handlePageAdd >>", _page);        
        props.updatePageList(_page);
    }
    
    const handleChange = (event) => {
        setMultiChecked(event.target.checked);
    };

    const [showFinder, setShowFinder] = React.useState(false);
    const [findpageId, setFindPageId] = React.useState(-1);
    function handleOpenFinder() {
        setShowFinder(!showFinder);
        setFindPageId(-1);
    }

    function handleCloseFinder() {
        setShowFinder(false);
        setFindPageId(-1);
    }

    function handlePageSelection(pageid) {
        console.log(multiChecked, props.source, "... handlePageSelection >>>", pageid);
        if(showFinder && multiChecked) {
            setMultiSelectedPages([]);
        }
        setSelectedId(pageid);
        setFindPageId(pageid);
        const node = (props.source === "manage") ? document.getElementById("m_"+pageid) : document.getElementById(pageid); 
        if(node) {
            node.scrollIntoView(false);
        }      
    }

    function handlePageFinder(pageid) {
        getSelectedPage({id:pageid});
    }

    return (
        <Box className={classes.root}>
            {!showFinder && 
                <div className={classes.pagelisthelperdiv}>
                    <FormControlLabel style={{width:'100%', margin:0}} label="Enable Multiple Selection" 
                                    control={<Switch color="primary" size="small" checked={multiChecked} onChange={handleChange} />}  
                    />                    
                    <Fab color="default" size="small"  aria-label="Find Page" className={classes.findbutton} onClick={handleOpenFinder}>
                        <SvgIcon >
                            <path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </SvgIcon>
                    </Fab>
                </div>
            }
            {showFinder && 
                <PageFinder originalData={props['listdata']['pagedata']} listData={records} source={props.source} 
                            onSelectPage={handlePageSelection} onFindPage={handlePageFinder} onClose={handleCloseFinder}/>
            }
            <List id="pagelist"
                component="nav" dense={true}
                aria-labelledby="nested-list-subheader"
                className={classes.pagelist} 
            >
                {records.map(item => (
                    <ListBranch id="treeitem" key={item.id} selected={selectedId === item.id} source={props.source}
                                node={item} appConfig={appConfig} projectdata={projectdata} pagelist={props['listdata']['pagedata']} selectedtabs={props.selectedtabs}
                                onSelection={getSelectedPage} onPageAdd={handlePageAdd} isMultiSelect={multiChecked} multiSelectedPages={multiSelectedPages} findpageId={findpageId} >  
                    </ListBranch>
                ))}         
            </List>
        </Box>
    );
}

function ListBranch(props) {
    const appConfig = props.appConfig;
    const projectdata = props.projectdata;
    const pagelist = props['pagelist'];
    const _child = props.node.children;
    const _level = props.node.level;
    const _arrlevel = [];
    for(let i = 0; i < _level; i++) {
        _arrlevel.push(i);
    }
    const _text = props.node.title;// + ' :: ' +props.node.id;

    let _pointerEvent = "";
    let _color = "";
    /*if(_level === 1){
        if(props.selectedtabs && props.selectedtabs.indexOf(props.node['id']) > -1) {
            //console.log(_level, props.node, "**********", props.selectedtabs);
            _color = "blue";
        }
    }*/

    const nodeid = Number(props.node['id']);
    if(nodeid > -1){
        if((props.selectedtabs && props.selectedtabs.length > 0) && checkModuleAccess(props.node['id'])) {
            _color = "blue";
        }
    }

    var nodeicon = '';
    const _type = props.node.type;
    if(_type !== undefined){
        switch (_type){
            case "BaseView":
                nodeicon = imgBaseViewSource;
                break;
            
            case "ScrollView":
                nodeicon = imgScrollViewSource;
                break;
                        
            case "TableView":
                nodeicon = imgTableViewSource;
                break;
            
            case "TableViewList":
                nodeicon = imgTableViewListSource;
                break;
                        
            case "DbTableView":
            case "RemoteTableView":
                nodeicon = imgDbTableViewSource;
                break;
            
            case "DbTableViewList":
            case "RemoteTableViewList":
                nodeicon = imgDbTableViewListSource;
                break;

            case "DbTableViewNestedList":
                nodeicon = imgRemoteTableViewSource;
                break;
                        
            case "SplitView":
                nodeicon = imgSplitViewSource;
                break;

            case "PageScrollView":
                nodeicon = imgPageScrollViewSource;
                break; 
            
            default:
                nodeicon = imgProjectSource;
        }
    }else{
        _color = "grey";
        _pointerEvent = "none";
    }

    const classes = useStyles();

    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertTitle, setAlertTitle] = React.useState('');
    const [alertMessage, setAlertMessage] = React.useState('');
    //const [openConfirm, setOpenConfirm] = React.useState(false);
    const [showWait, setShowWait] = React.useState(false);

    const [open, setOpen] = React.useState(true);
    const [selectedNodeId, setSelectedNodeId] = React.useState(-1);

    function handleStatus(e) {
        setOpen(!open);
    }

    function handleListItemClick(e) {
        let _dataset = e.currentTarget.dataset;
        //console.log(_dataset.id + " handleListItemClick >> node_count is: " + _dataset.count, props.node.id);
        if(_level > 1) {
            setSelectedNodeId(props.node.id);
        }
        props.onSelection(_dataset);
    }

    function handleDoubleClick(e) {
        console.log("handleDoubleClick.........");
        e.preventDefault();
    }

    function handleChildSelection(_child) {      
        //let _dataset = _child;
        //console.log(_child.id + " handleChildSelection >> node_count is: " + _child.count);

        //setSelectedNodeId(_child.id);
        props.onSelection(_child);
    } 

    function handlePageAdd_onchildNode(_page) {
        props.onPageAdd(_page);
    }

    function handleDropAllow(ev) {
        //ev.currentTarget.style.background = "lightyellow";
        ev.preventDefault();
    }
    
    function handlePageDrop(ev) {
        ev.currentTarget.style.background = "";
        ev.preventDefault();
    
        let droppedNodeId = ev.currentTarget.dataset['id'];
        var draggedNodeData = ev.dataTransfer.getData("text/plain");
        //createPageData(droppedNodeId, draggedNodeData);

        let isAccess = checkModuleAccess(parseInt(droppedNodeId));
        //console.log(droppedNodeId, "... checkModuleAccess >>>", isAccess);
        if(!isAccess){
            console.log("Not authorized to add page here");
            setAlertTitle('');
            setAlertMessage("Not authorized to 'Add' page here");
            setOpenAlert(true);
            return;
        }else {
            createPageData(droppedNodeId, draggedNodeData);
        }        
    }

    function checkModuleAccess(pageid) {    
        if(pageid > -1) {
            const _selectedtabs = props.selectedtabs;
            if(_selectedtabs && _selectedtabs.length > 0) {
                const _pageobj = props.node['page'];
                const isAccess = getTabModuleAccess(_pageobj, _selectedtabs, props['pagelist'], props.projectdata);
                return isAccess;
            }
        }else {
            const _projectRole = checkProjectRole(props.projectdata);
            if(_projectRole === "contributor") {
                return false;
            }
            return true;
        }
        return true;
    }

    function createPageData(nodeId, nodedata) {
        setShowWait(true);
        let arrData = nodedata.split(";");
        let pageTitle = arrData[0];
        //let pageType = arrData[1];
        let pageDic = JSON.parse(arrData[2]);
        let parentId = (nodeId === "-1") ? "App" : nodeId;
        
        let pagedata = populateNewPageData(pageDic, pageTitle, parentId);
        pagedata['Document'] = setDocument_forPage();   
        //console.log(pageDic, "...... createNewPage ----->>>>>", pagedata);             
        createNewPage(pagedata);
    }

    function populateNewPageData(newpagedic, pagetitle, parentid) {
        //console.log(projectdata['availableScreens'], "...... populateNewPageData ----->>>>>", newpagedic);

        let screensArr = projectdata['availableScreens'];
        let masterScrIndex = 0;
        screensArr.forEach((screen, id) => {
            if(screen['embed']){
                masterScrIndex = id;
                return;
            }
        });
        const masterScreen = screensArr[masterScrIndex];
        const mscrWidth = parseInt(masterScreen['width']);
        const mscrHeight = parseInt(masterScreen['height']);        

        let _pagedata = updatePageDicwithStyle(newpagedic);

        let displayText = (_pagedata.hasOwnProperty('moduleName') && _pagedata['moduleName'].length > 0) ? _pagedata['moduleName'] : pagetitle;
        _pagedata['parentid'] = parentid;
        _pagedata['Title'] = pagetitle;
        _pagedata['TabBase']['icontitle'] = displayText;
        _pagedata['IconTitle'] = displayText;
        _pagedata['frame']['width'] = mscrWidth;
        _pagedata['frame']['height'] = mscrHeight;

        if(_pagedata['viewType'] === "ScrollView") {
            _pagedata.Children[0]['frame']['width'] = mscrWidth;
            _pagedata.Children[0]['frame']['height'] = mscrHeight;
        }else {
            if(_pagedata['viewType'].indexOf("TableView") > -1) {
                //console.log(_pagedata['viewType'], "...... populateNewPageData ----->>>>>", _pagedata);

                _pagedata.Children[0]['tmpCellStyle'] = _pagedata.Children[0]['_tmpCellStyle'];
                _pagedata.Children[0].Group[0]['RecordCellDef']['CellStyle'] = _pagedata.Children[0]['_tmpCellStyle'];
                if(_pagedata['viewType'].indexOf("TableViewList") > -1) {
                    _pagedata.Children[0].Group[0]['rowarray'][0] = _pagedata.Children[0].Group[0]['RecordCellDef'];
                    _pagedata.Children[0].Group[0]['rowarray'][0]['CellStyle'] = _pagedata.Children[0].Group[0]['RecordCellDef']['CellStyle'];
                }
            }
        }

        generate_multiPagebars(_pagedata, screensArr.length);

        for (let i = 0; i < screensArr.length; i++) {            

            _pagedata['_navigationBars'][i]['title'] = displayText;
            if(parentid !== "App") {
                let parent = getparentData(parentid, pagelist);
                if(parent['viewType'] === "PageScrollView"){
                    _pagedata['NavigationBarHidden'] = true;
                }else{
                    setChildPageProp(_pagedata, i);
                }
            }

            const screensObj = screensArr[i];
            let scrWidth = parseInt(screensObj['width']);
            let scrHeight = parseInt(screensObj['height']); 
            //console.log(i, "...... screensObj ----->>>>>", scrWidth, scrHeight);

            if(_pagedata['viewType'] === "ScrollView") {
                _pagedata.Children[0]['_frames'][i]['width'] = scrWidth;
                _pagedata.Children[0]['_frames'][i]['height'] = scrHeight;
            }            
            //Also need to set Splitview-page frames & pages.............
    
            let sidebarFixed = false;
            let sidebarWidth = Math.floor(scrWidth * 0.75);
            if(scrWidth > 768){
                //considering as web screen
                sidebarFixed = true;
                sidebarWidth = Math.floor(scrWidth * 0.25);
            }
            _pagedata['_toolBarTop'][i]['frame']['width'] = scrWidth;
            _pagedata['_toolBarBottom'][i]['frame']['width'] = scrWidth;
            _pagedata['_toolBarLeft'][i]['frame']['width'] = sidebarWidth;
            _pagedata['_toolBarLeft'][i]['frame']['height'] = scrHeight;
            _pagedata['_toolBarRight'][i]['frame']['width'] = sidebarWidth;
            _pagedata['_toolBarRight'][i]['frame']['height'] = scrHeight;  
            _pagedata['_toolBarLeft'][i]['fixed'] = sidebarFixed;
            _pagedata['_toolBarRight'][i]['fixed'] = sidebarFixed;          
        }

        return _pagedata;
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

            /*pageDic['_navigationBars'][0]['tintColor'] = getStylePropValue(appPageStyle, 'navbar', 'background-color');
            pageDic['_navigationBars'][0]['barHidden'] = !(getStylePropValue(appPageStyle, 'navbar', 'visible'));
            pageDic['NavigationBarHidden'] = pageDic['_navigationBars'][0]['barHidden'];

            pageDic['TabTintColor'] = getStylePropValue(appPageStyle, 'tabbar', 'background-color');
            pageDic['_tabBarHiddens'][0] = !(getStylePropValue(appPageStyle, 'tabbar', 'visible'));*/

            const screenDefs = projectdata['availableScreens'];
            for (let i = 0; i < screenDefs.length; i++) {                
                pageDic['_toolBarTop'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'topnav', 'background-color');
                pageDic['_toolBarTop'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'topnav', 'background-gradient');
                pageDic['_toolBarTop'][i]['hidden'] = !(getStylePropValue(appPageStyle, 'topnav', 'visible'));
    
                pageDic['_toolBarBottom'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'bottomnav', 'background-color');
                pageDic['_toolBarBottom'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'bottomnav', 'background-gradient');
                pageDic['_toolBarBottom'][i]['hidden'] = !(getStylePropValue(appPageStyle, 'bottomnav', 'visible'));
    
                pageDic['_toolBarLeft'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'leftnav', 'background-color');
                pageDic['_toolBarLeft'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'leftnav', 'background-gradient');
                pageDic['_toolBarLeft'][i]['hidden'] = !(getStylePropValue(appPageStyle, 'leftnav', 'visible'));
    
                pageDic['_toolBarRight'][i]['backgroundColor'] = getStylePropValue(appPageStyle, 'rightnav', 'background-color');
                pageDic['_toolBarRight'][i]['backgroundGradient'] = getStylePropValue(appPageStyle, 'rightnav', 'background-gradient');
                pageDic['_toolBarRight'][i]['hidden'] = !(getStylePropValue(appPageStyle, 'rightnav', 'visible'));                
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

    function generate_multiPagebars(pageObj, scrCount) {
        const _diff = scrCount - 1;
        if(_diff === 0) {
            return pageObj;
        }       

        for (let i = 0; i < _diff; i++) {
            if(pageObj['viewType'] === "ScrollView") {
                const scrollFrames = JSON.parse(JSON.stringify(pageObj.Children[0]['_frames'][0]));
                pageObj.Children[0]['_frames'].push(scrollFrames);
            }

            const navbarObj = JSON.parse(JSON.stringify(pageObj._navigationBars[0]));
            pageObj._navigationBars.push(navbarObj);            
            
            const tabbarObj = JSON.parse(JSON.stringify(pageObj._tabBarHiddens[0]));
            pageObj._tabBarHiddens.push(tabbarObj); 

            const toptbarObj = JSON.parse(JSON.stringify(pageObj._toolBarTop[0]));
            pageObj._toolBarTop.push(toptbarObj);

            const bottomtbarObj = JSON.parse(JSON.stringify(pageObj._toolBarBottom[0]));
            pageObj._toolBarBottom.push(bottomtbarObj);

            const lefttbarObj = JSON.parse(JSON.stringify(pageObj._toolBarLeft[0]));
            pageObj._toolBarLeft.push(lefttbarObj);

            const righttbarObj = JSON.parse(JSON.stringify(pageObj._toolBarRight[0]));
            pageObj._toolBarRight.push(righttbarObj);
        }
        return pageObj;
    }


    function setChildPageProp(pageContainerDic, i) {
        /*pageContainerDic.NavigationBarHidden = false;

        let navigationBarDic = pageContainerDic._navigationBars[i];
        if(navigationBarDic.leftBarButton.type.length === 0)
            navigationBarDic.leftBarButton.type = 'SystemItem';
        if(navigationBarDic.leftBarButton.systemItem.length === 0)
            navigationBarDic.leftBarButton.systemItem = 'back';
        if(navigationBarDic.leftBarButton.actions.clicked.length === 0) {
            let actionDic = {"category":"ViewAction", "method":"popViewController", "type":"Page"};
            actionDic['params'] = {"animationType":"none", "condition":{"groupcases":[]}, "pageTitle": pageContainerDic['Title']};
            actionDic['actions'] = {"success":[], "error":[], "onElse":[], "notAvailable":[]};
            actionDic['Document'] = setDocument_forPage();

			navigationBarDic.leftBarButton.actions.clicked.push(actionDic);
        }*/    
        
        pageContainerDic.NavigationBarHidden = true;
        pageContainerDic._toolBarTop[i]['hidden'] = false;
    }

    function setDocument_forPage() {
        const nowDate = new Date();
        let strDate = nowDate.getFullYear() +'-'+ parseInt(nowDate.getMonth()+1) +'-'+ nowDate.getDate()  +' '+ nowDate.getHours()  +':'+ nowDate.getMinutes()  +':'+ nowDate.getSeconds();
        const i = nowDate.toString().indexOf("GMT");
        strDate = strDate +" GMT"+ nowDate.toString().substr(i+3, 5);
      
        let _document = [];
        let createdObj = {"key": "createddatetime", "value": strDate};
        _document.push(createdObj);
        let lastupdateObj = {"key": "lastupdatedatetime", "value": strDate};
        _document.push(lastupdateObj);
      
       return _document;
    }

    function createNewPage(newpagedata) {
        //console.log(" createNewPage ----->>>>>", newpagedata);

        var formData = new FormData();
        formData.append("command", "pagenew");
        formData.append("userid", appConfig.userid);
        formData.append("sessionid", appConfig.sessionid);
        formData.append("projectid", appConfig.projectid);

        var pageData = encodeURIComponent(JSON.stringify(newpagedata));
        let text = new File([pageData], "newpage.txt", {type: "text/plain"});
        formData.append("file", text);

        fetch(appConfig.apiURL+"multipartservice.json", {
            method: 'POST',
            body: formData
        })
        .then((response) => response.json())
        .then((result) => {
            //result = {"response":"ACK","count":1,"page":{....},"command":"pagenew"} 
            setShowWait(false);
            if(result.response === "NACK"){
                var _err = {message: result.error};
                console.log("pagenew : Error >>", _err);
                setAlertTitle('');
                setAlertMessage(result.error);
                setOpenAlert(true);
            }
            else{
                console.log("pagenew : Success >> ", result.page);
                setAlertTitle('');
                setAlertMessage("Page created successfully. \n\nTo avoid any inconsistency, project 'preview' \nis recommended before closing PE.");
                setOpenAlert(true);

                //relaodPageList(pageid);
                props.onPageAdd(result.page);
                const pageData = result.page;
                if(pageData['parentid'] !== "App"){
                    let parent = getparentData(pageData['parentid'], pagelist);
                    updateParentPage(parent, pageData);
                }else{
                    console.log("pagenew : props >> ", props);
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function getparentData(parentid, pagelist) {
        let pageDef =  pagelist.filter(function(_page) {
            return _page['pageid'] === parentid;
        });
        return pageDef[0];
    }

    function updateParentPage(parentPage, pageData){
        if(parentPage['viewType'] === "PageScrollView"){
            let parentPages = parentPage.Children[0]['pages'];
            const idVal = parentPages.length;
            const childpagedef = {
                "id":idVal, 
                "pagedef":{"srcLocation": "bundle", "filename": "page_"+pageData['pageid'], "fileext": "plist", "url": ""},
                "frame":{"x":0, "y":0, "z":0, "width":pageData['frame']['width'], "height":pageData['frame']['height'], "depth":0, "rotation":0, "minWidth":0, "maxWidth":0, "minHeight":0, "maxHeight":0, "isLocked":false, "relative":false}
            };
            parentPages.push(childpagedef);

            fetchUpdatePage(parentPage['pageid'], parentPage);
        }
    }

    function fetchUpdatePage(pageid, pageforSave) {    
        var formData = new FormData();
        formData.append("command", "pageupdate");
        formData.append("userid", appConfig.userid);
        formData.append("sessionid", appConfig.sessionid);
        formData.append("projectid", appConfig.projectid);
        formData.append("pageid", pageid);
        
        let _jsonforsave = JSON.stringify(pageforSave);
        var pageData = encodeURIComponent(_jsonforsave);        
        
        let text = new File([pageData], "updatePage.txt", {type: "text/plain"});
        formData.append("file", text);
    
        fetch(appConfig.apiURL+"multipartservice.json", {
          method: 'POST',
          body: formData
        })
        .then((response) => response.json())
        .then((result) => {
          if(result.response === "NACK"){
            const errormsg = result.error;
            if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
              //setSessionError(true);
            }
            setAlertTitle('');
            setAlertMessage(result.error);
            setOpenAlert(true);
          }
          /*else{
            setAlertTitle('');
            setAlertMessage("Page '"+ result.page['Title'] +"' saved successfully.");
            setOpenAlert(true);
          }*/
        })
        .catch((error) => {
          console.error('Fetch Error:', error);
          setAlertTitle("");
          setAlertMessage("Something went wrong. Please check Server/Internet connection.");
          setOpenAlert(true);
        });
    }

    function alertCloseHandler() {
        setOpenAlert(false);
        //setAction('');
    }
    function alertOKHandler() {
        setOpenAlert(false);
        //setAction('');
    }    

    return (
        <div id={(props.source === "manage") ? "m_"+props.node.id : props.node.id}>
            <div className={classes.halign} style={{color:_color, pointerEvents:_pointerEvent}}>
                {(_level !== undefined && _level > -1) &&
                    <div className={classes.halign}>                    
                        {_arrlevel.map(index => (                                            
                            <div key={index} className={classes.hspacer}/>
                        ))} 
                        {(_child !== undefined && props.node.childcount > 0) && 
                            (open ? <ExpandLess onClick={handleStatus}/> : <ExpandMore onClick={handleStatus}/>) 
                        }
                    </div>
                }
                <StyledListItem button selected={(props.isMultiSelect && props.multiSelectedPages.length>0) ? (props.multiSelectedPages.indexOf(props.node.id) > -1) : ((props.findpageId > -1) ? (props.findpageId === props.node.id) : props.selected)} 
                                data-id={props.node.id} data-count={props.node.childcount}
                                onClick={handleListItemClick} onDoubleClick={handleDoubleClick}
                                onDragOver={handleDropAllow} onDrop={handlePageDrop}>
                    {(props.node.childcount === 0) && 
                        <div className={classes.hspacer}/>
                    }
                    {(props.node.type !== undefined) &&
                        <img className={classes.icontype} src={nodeicon} alt="nodeicon"></img>
                    }
                    <ListItemText primary={_text}/>
                </StyledListItem>
            </div>
            {(_level !== undefined && _level > -1) &&
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List dense={true} component="div" disablePadding>
                    {_child.map(child => (                                            
                        <ListBranch id="childitem" key={child.id} selected={selectedNodeId === child.id} source={props.source}
                                    node={child} appConfig={appConfig} projectdata={projectdata} pagelist={pagelist} selectedtabs={props.selectedtabs}
                                    onSelection={handleChildSelection} onPageAdd={handlePageAdd_onchildNode} isMultiSelect={props.isMultiSelect} multiSelectedPages={props.multiSelectedPages} findpageId={props.findpageId} >                            
                        </ListBranch>
                    ))}  
                    </List>
                </Collapse>                                
            }
            {openAlert === true && 
                <AlertWindow open={true} 
                            title={alertTitle} message={alertMessage}
                            ok="OK" okclick={alertOKHandler}
                            cancel="" cancelclick={alertCloseHandler}
                />
            }  
            {showWait && 
                <div className="backdropStyle" style={{zIndex:9999}}>
                    <Typography variant="h5" color="textSecondary" className="waitlabel"><CircularProgress style={{marginRight:12}} />Please Wait ....</Typography>                
                </div>
            } 
        </div>        
    );
}

function PageFinder(props) {    
    const useStyles = makeStyles(theme => ({
                        root: {
                            maxHeight:360, width: 300, overflowX: 'hidden',
                            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        input: {
                            margin: theme.spacing(1),
                        },                        
                        pagefinderdiv: {
                            width: '100%',
                            height: 32,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingRight: theme.spacing(0.5),
                            background: theme.palette.background.default,
                            borderBottom: '4px inset rgb(227,227,227)'
                        },                        
                        searchinput: {
                            width: '100%',
                            height: `calc(100% - 2px)`,
                            padding: theme.spacing(0, 0.5),
                            margin: theme.spacing(0, 0.5),
                            fontSize: '0.875rem',
                        },
                        finderitem: {
                            width: 24, height: 24, minHeight: 24,
                            margin: theme.spacing(0.25, 0.5),
                        },
                        openbtn: {
                            width: 28, height: 24, minHeight: 24,
                        },
                        closebtndiv: {
                            width: 24,
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            textAlign: 'center',
                            borderLeft: '1px solid',
                            marginLeft: theme.spacing(0.5),
                        },
                        closebtn: {
                            maxWidth: 24, minHeight: 24, maxHeight: 24,
                        },
                      }));
    const classes = useStyles(); 

    const [searchvalue, setSearchValue] = React.useState('');
    const [searcherror, setSearchError] = React.useState(false);
    const [showitems, setShowItems] = React.useState(false);
    const [filterlist, setFilterList] = React.useState([]);
    const [moveNumber, setMoveNumber] = React.useState(0);
    const [snackbaropen, setSnackbarOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [timeout, setTimeState] = React.useState(null);
    
    function handleClosePageFinder() {
        setSearchValue('');
        setSearchError(false);
        setFilterList([]);
        setMoveNumber(0);
        setSnackbarOpen(false);

        props.onClose();
    }

    function handleSearchInput(event) {
        clearTimeout(timeout);

        const val = event.target.value;
        //console.log(filterlist, searchvalue, "... handleFindPage >>>", val);
        if(val.length > 0) {
            const allowedChars = /\w/g;
            let allowedTitle = val.match(allowedChars);
            if(!allowedTitle) {
                setSearchError(true);
                setShowItems(false);
                setFilterList([]);
                setMoveNumber(0);
                return;
            }
            if(allowedTitle && (val.length !== allowedTitle.length)) {
                setSearchError(true);
                setShowItems(false);
                setFilterList([]);
                setMoveNumber(0);
                return;
            }
            
            setSearchValue(val);
            //handleFindPage(val);
            const timeout1 = setTimeout(handleFindPage, 750, val, props);
            setTimeState(timeout1);

        }else {
            setSearchError(true);
            setSearchValue('');
            setShowItems(false);
            setMoveNumber(0);
            setFilterList([]);
        }
    }

    function getSortedList(pagelist, updatedlist) {
        for (let i = 0; i < pagelist.length; i++) {
            const _pageObj = pagelist[i];
            if(_pageObj['id'] !== "-1"){
                updatedlist.push({pageid:_pageObj['id'], Title:_pageObj['title'], level:_pageObj['level']});
    
                let childPages = _pageObj['children'];
                if(childPages.length > 0) {
                    updatedlist = getSortedList(childPages, updatedlist);
                }
            }
        }
        return updatedlist;
    }
    function handleFindPage(strsearch, props) {
        //console.log(props.listData, props['originalData'], "... handleFindPage >>>", strsearch);
        //const pageData = JSON.parse(JSON.stringify(props['originalData']));
        let pageData = [];
        pageData = getSortedList(props.listData, pageData);

        setSearchError(false);
        setSnackbarOpen(false);
        if(strsearch.length === 0) {
            setSearchError(true);
        }else {
            let pageList = pageData.filter(function(item) {
                const pageName = item.Title.toLowerCase();
                const pageText = (pageName.indexOf('.') > 0) ? pageName.split('.')[0] : pageName;
                return (pageText.indexOf(strsearch.toLowerCase()) > -1);
            });

            if(pageList.length === 0){
                setSearchError(true);
                setFilterList([]);
            }else {
                //pageList.sort((a, b) => a.pageid - b.pageid);

                setFilterList(pageList);
                setShowItems(true);
                setMoveNumber(1);

                const _pageObj = pageList[0];
                props.onSelectPage(_pageObj['pageid']);
            }
            console.log(props.listData, pageData, "... handleFindPage >>>", strsearch, "******", pageList);       
        }
    }

    function handleMovePreviousMatch() {  
        if(moveNumber > 1) {
            let prevNum = moveNumber - 1;
            setMoveNumber(prevNum);
    
            const _index = prevNum - 1;
            const _pageObj = filterlist[_index];
            props.onSelectPage(_pageObj['pageid']);
        }else{
            setSnackbarOpen(true);
            setMessage('No further previous match available');
        }
      }
      function handleMoveNextMatch() {
        if(moveNumber < filterlist.length) {
            let nextNum = moveNumber + 1;
            setMoveNumber(nextNum);
    
            const _index = nextNum - 1;
            const _pageObj = filterlist[_index];
            props.onSelectPage(_pageObj['pageid']);
        }else{
            setSnackbarOpen(true);
            setMessage('No further next match available');
        }
      }

    function handleOpenSearchedPage() {
        //console.log(props.originalData, "---->", searchvalue, "******", filterlist, moveNumber);
        if(filterlist.length > 0) {
            const _index = moveNumber - 1;
            const _pageObj = filterlist[_index];
            props.onFindPage(_pageObj['pageid']);
        }else{
            setSnackbarOpen(true);
            setMessage('No match found');
        }
    }

    function handleSnackbarClose(event) {
        setSnackbarOpen(false);
    }

    return (
      <div className={classes.pagefinderdiv} >
        <Input aria-label="Search Input" className={classes.searchinput} autoFocus type="text" required placeholder="Search by Page Title"
               value={searchvalue} onChange={handleSearchInput} error={searcherror}/>
        {showitems && 
            <div style={{display:'flex'}}>
                <Fab color="default" size="small" aria-label="Previous Match" className={classes.finderitem}>
                    <Tooltip title="Previous Match"><ArrowUpwardIcon onClick={handleMovePreviousMatch} /></Tooltip>
                </Fab>
                <Fab color="default" size="small" aria-label="Next Match" className={classes.finderitem}>
                    <Tooltip title="Next Match"><ArrowDownwardIcon onClick={handleMoveNextMatch} /></Tooltip>
                </Fab>
                <Fab color="default" size="small" className={classes.finderitem} >
                    {props.source !== "manage" &&
                        <Tooltip title="Open Selected Page"><ArrowForwardOutlined onClick={handleOpenSearchedPage} /></Tooltip>
                    }
                    {props.source === "manage" &&
                        <Tooltip title="Set page selected"><ArrowForwardOutlined onClick={handleOpenSearchedPage} /></Tooltip>
                    }
                </Fab>
            </div>
        }
        <div className={classes.closebtndiv}>
            <IconButton aria-label="Close Finder" className={classes.closebtn} onClick={handleClosePageFinder}>
                <CloseIcon />
            </IconButton>
        </div>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'left'}}
            open={snackbaropen} onClose={handleSnackbarClose}
            autoHideDuration={3000}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{message}</span>}                            
        />                
      </div>
    );
  }