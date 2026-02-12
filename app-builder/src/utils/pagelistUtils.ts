import type { AppConfig, AppCredentials } from '../types/index';
import { useAppStore } from '../store/appDataStore';
import { usePageStore } from '../store/appPageStore';


export function getAppPages(projectdata: any) {
    let pagelist:any = [];
    if(projectdata){
      if(projectdata.hasOwnProperty('pages')){
        if(projectdata.pages.length > 0){
          for (let i = 0; i < projectdata.pages.length; i++) {
            const padedata = projectdata.pages[i];
            pagelist.push({pageid: padedata.pageid, Title: padedata.Title, parentid: padedata.parentid});            
          }
        }
      }
    }    

    const nondupPageList = (pagelist as { pageid: string }[]).reduce((acc, current) => {
      const x = acc.find(item => item.pageid === current.pageid);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as { pageid: string }[]);
    //console.info(pagelist, "--- pagelist ---", nondupPageList);
    pagelist = nondupPageList;

    //pagelist = [];
    return pagelist;
}

////////////////////// Page Data Init ////////////////////// 

export function getPageList(config: AppConfig | null, credentials: AppCredentials | null) {
  //const { setError, setLoadPageList, setPagelistData } = usePageStore();
  const page = usePageStore.getState();
  
  if (!config || !credentials) return;

  const pageListCall = async () => {
    try {
      const pagelist = await fetchPageData(config, credentials);        
      if (pagelist.response === 'NACK'){
        throw new Error('Invalid Project');

      }else{
        if (pagelist){
          console.info("pagelist>>>", pagelist);
          page.setPagelistData(pagelist);
        }
        page.setLoadPageList(true);
      }
      
    } catch (err) {
      console.error('Error fetching getPageList:', err);
      page.setError(err as Error);
    }
  };

  pageListCall();
}


async function fetchPageData(config: AppConfig | null, credentials: AppCredentials | null) {  
  try {
    if (!config || !credentials) return null;

    const pagelistAPI = config.apiURL+"service.json?command=pagelist&userid="+credentials.userid+"&sessionid="+credentials.sessionid+"&projectid="+credentials.projectid;
    
    const response = await fetch(pagelistAPI);
    const pagelistdata = await response.json();

    return pagelistdata;

  } catch (err) {
    console.error('Error fetching pagelist:', err);
  }
}


////////////////////////////////////////

  export function setPageListHeirarchy( pagelist: any[], projectdata: any, pageLoaded: boolean = false ) {
    
    const app = useAppStore.getState();
    const page = usePageStore.getState();
    
    if (!app.credentials || !app.config || !pagelist || !projectdata) return;
    page.setLoadPageList(false);
    
    const apiParam = Object.assign({}, app.credentials, app.config);

    if(!pageLoaded){
      let selectedTabs: any[] = [];
      if(projectdata.hasOwnProperty('Contributors')){
        const contributors = projectdata['Contributors'];
        if(contributors) {
          for (let i = 0; i < contributors.length; i++) {
            const contributorObj = contributors[i];
            if(contributorObj['contributorName'] === projectdata['owner']) {
              selectedTabs = contributorObj['selectTabPages'];
              break;
            }               
          }
        }
      }

      let moduleArr: any[] = [];
      var tabid = -1;
      if(selectedTabs.length > 0){
        for (let i = 0; i < selectedTabs.length; i++) {
          const element = selectedTabs[i];
          tabid = element;
          moduleArr.push(tabid);
          while(tabid !== -1){
            const child = pagelist.filter(item => (item.parentid === moduleArr[moduleArr.length-1]));
            if(child.length > 0){
              for (let j = 0; j < child.length; j++) {
                tabid = child[j]['pageid'];
                moduleArr.push(tabid);                
              }
            }else{
              tabid = -1;
            }
          }          
        }

        if(moduleArr.length > 0){
          const rest = pagelist.filter((item) => !moduleArr.includes(item.pageid));
          pagelist = rest;

          const strPages = moduleArr.join();
          const custompagelistAPI = apiParam.apiURL+"service.json?command=custompagelist&userid="+apiParam.userid+"&sessionid="+apiParam.sessionid+"&projectid="+apiParam.projectid+"&pageids="+strPages;
          fetch(custompagelistAPI)
            .then(response => response.json())
            .then(
              (result) => {
                // { pages: [...], response: "ACK", count: 1, command: "pagelist"  }
                if(result.response === "NACK"){
                  throw new Error(result.error);
                }
                else{
                  let custompagelist = result.pages;
                  // Replace pages in pagelist with custompagelist
                  let updatedPageList = [...pagelist];
                  for (let index = 0; index < custompagelist.length; index++) {
                    const cpage = custompagelist[index];
                    const pageIndex = updatedPageList.findIndex(
                      (element) => element["pageid"] === cpage.pageid
                    );
                    if (pageIndex !== -1) updatedPageList[pageIndex] = cpage;
                  }
                  
                  //setPageCache_Validation(pageList);
                  setPageListHeirarchy(updatedPageList, projectdata, true);

                  const _pageList = updatedPageList;//this.state.pagelist;
                  fetchCustomPages(_pageList, apiParam, projectdata);
                }
              },
              (error) => {
                console.error('Custom Page list Fetch Error:', error);
                throw new Error(error);
              }
            );
        }else{
          fetchCustomPages(pagelist, apiParam, projectdata);
          //setPagelistData(_customPages);
        }
      }else{
        fetchCustomPages(pagelist, apiParam, projectdata);
        //setPagelistData(_customPages);
      }
    }    
  }

  async function fetchCustomPages(pagelist: any[], apiParam: any, projectdata: any) {
    const page = usePageStore.getState();

    const BATCH_LIMIT = 15;
    let offset = 0;
    let count = BATCH_LIMIT;
    let remainedCount = pagelist.length;
    
    let arrPageIds = [];

    while (remainedCount > 0) {

      let strPageIDs = '';
      for (let index = offset; index < count; index++) {
        const pageobj = pagelist[index];
        if(pageobj)   strPageIDs = strPageIDs + pageobj.pageid +',';
      }
      strPageIDs = strPageIDs.slice(0,-1);

      offset = offset + BATCH_LIMIT;
      count = count + BATCH_LIMIT;
      remainedCount = remainedCount - BATCH_LIMIT;      

      if(strPageIDs.length > 0) {
        arrPageIds.push(strPageIDs);
      }
    }

    const _screensData: any[] = projectdata['availableScreens'];
    
    const _pagelistData = await fetchSelectedPages(arrPageIds, pagelist, apiParam, _screensData);
    //console.info("...fetchSelectedPages >>> ", _pagelistData);
    if(_pagelistData) {
      var arrPageData = [];
      let projectNode = {level:0, title:projectdata.ProjectName, id:"-1", parent:"App", type:"", children:[]};
      arrPageData.push(projectNode);
  
      manipulatePageData(_pagelistData, 1, arrPageData, null); 
  
      let pageHeirarchy = setPageHeirarchy(arrPageData);
      pageHeirarchy = pageHeirarchy.filter((page: any) => page.parent === "App");
  
      //console.info(_pagelistData, "****** 2 ********", arrPageData, pageHeirarchy);

      page.setLoadPageList(true);
      page.setPagelistData(_pagelistData);
      page.setPagelistHeirarchy(pageHeirarchy);
    }
  }

  async function fetchSelectedPages(arrPageIds: string[], pagelist: any[], apiParam: any, screensData: any[]): Promise<any[] | null>{
    //let fetchedPages = 0;
      
    const promises = arrPageIds.map(strPages => {
      const _fetchUrl = apiParam.apiURL+"service.json?command=custompagelist&userid="+apiParam.userid+"&sessionid="+apiParam.sessionid+"&projectid="+apiParam.projectid+"&pageids="+strPages;
      return fetch(_fetchUrl)
        .then(response => response.json())
        .then(
          (result) => {
            // { pages: [...], response: "ACK", count: 1, command: "pagelist"  }
            if(result.response === "NACK"){
              throw new Error(result.error);
            }
            else{
              let pageList = pagelist;//this.state.pages;

              let custompagelist = result.pages;
              for (let index = 0; index < custompagelist.length; index++) {
                let cpage = custompagelist[index];
                cpage = optimizePageData(cpage, screensData);
                //console.info(cpage.pageid, "&&&&&&", optimizedpage);

                const pageIndex = pageList.findIndex((element) => element['pageid'] === cpage.pageid);
                pageList[pageIndex] = cpage;  
              }
              
              //setPageCache_Validation(pageList);
              //setPageListHeirarchy(pageList, projectdata, true);
              
              //fetchedPages = fetchedPages + custompagelist.length;
              //const percentLoad = Math.ceil((fetchedPages/pageList.length) * 100);
              //this.setState({ pageLoadProgress: percentLoad +'% complete' });
              
              //console.log('Custom Page list length:', custompagelist.length);
              return custompagelist.length;
            }
          },
          (error) => {
            console.error('Custom Page list Fetch Error:', error);
            throw new Error(error);
            return 0;
          }
        );
    });
    
    
    let pageCnt = 0;
    // wait for all the promises in the promises array to resolve
    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        pageCnt += result.value as number;
      } else {
        console.error('Page fetch error:', result.reason);
      }
    });

    return pageCnt === pagelist.length ? pagelist : null;
    
  }

  function manipulatePageData(pages: any[], level:number, arrPageData: any[], parentPageids: string[] | null){
    let appendPages = [];
    let pendingNodes = [];
    let nextParentNodePageids = [];
    
    for (let i = 0; i < pages.length; i++) {
      const pageContainerDic = pages[i];
      if(pageContainerDic) {
        if(!pageContainerDic.hasOwnProperty('parentid')) {
          pageContainerDic['parentid'] = "App";
        }        
          
        if (!parentPageids && pageContainerDic.parentid === "App") {
          appendPages.push(pageContainerDic);
          nextParentNodePageids.push(pageContainerDic.pageid);
          //lastTabBasedPageid = pageContainerDic.pageid;
        } else if (parentPageids && parentPageids.indexOf(pageContainerDic.parentid) >= 0) {
          appendPages.push(pageContainerDic);
          nextParentNodePageids.push(pageContainerDic.pageid);						
        } else {
          pendingNodes.push(pageContainerDic);
        }
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
      //console.log(nextParentNodePageids, "... pendingNodes:", pendingNodes);
      manipulatePageData(pendingNodes, level, arrPageData, nextParentNodePageids);
      return;
    }
    else if (pendingNodes.length > 0) {    
      console.log("... zombie nodes:", pendingNodes);
      getZombiesParent(pendingNodes, appendPages);
      return;				
    }
  }
  function setPageLevel(_page:any, _level:number, arrLevel:any[]){
    arrLevel.push({level:_level, id:_page.pageid, title:_page.Title, parent:_page.parentid, type:_page.viewType, children:[], childcount:0, page:_page});
    return arrLevel;
  }

  function getZombiesParent(zombienodes:any, pages:any[]){
    console.info(zombienodes, "... zombie parents:", pages);
  }

  function setPageHeirarchy(arrPageLevel:any[]){
    let _pageHeirarchy = [];

    var _lastNodelevel = arrPageLevel[arrPageLevel.length -1].level;
    do {      
      _pageHeirarchy = setPageData(arrPageLevel, _lastNodelevel);      
      _lastNodelevel = _lastNodelevel-1;
    }
    while (_lastNodelevel > 0);

    return _pageHeirarchy;
  }
  function setPageData(_arrpage:any[], _level:number){  

    let _nodePages =  _arrpage.filter(function(node) {
      return node.level === _level;
    });
    
    let _branchPages = _arrpage.filter(function(branch) {
      return branch.level === (_level-1);
    });
    
    _nodePages.forEach(node => {
      _branchPages.forEach(item => {
        if(node.type === 'SplitView'){
          node.childcount = node.page.pages.length;
        }
        if(item.id === node.parent){
          item.children.push(node);
          item.childcount = item.children.length;
        }
      }); 
    });

    return _arrpage;
  }

  function optimizePageData(pageobj:any, screensData:any[]){
    const pageTypes:string[] = ['BaseView', 'ScrollView'];
    if(pageTypes.indexOf(pageobj['viewType']) === -1){
      return pageobj;
    }

    if(!pageobj['_navigationBars']){
      return pageobj;
    }
    if(pageobj['_navigationBars'].length < 2){
      return pageobj;
    }

    const slaveIndex = pageobj['_navigationBars'].length - 1;
    let slavepageObj = JSON.parse(JSON.stringify(pageobj));

    if(pageobj['viewType'] === 'ScrollView') {
      slavepageObj['Children'][0]['_frames'] = pageobj['Children'][0]['_frames'].slice(slaveIndex);
      slavepageObj['frame'] = Object.fromEntries(
        Object.entries({ ...slavepageObj['frame'], ...screensData[slaveIndex] }).filter(
          ([key]) => key in slavepageObj['frame']
        )
      );
  
      pageobj['Children'][0]['_frames'] = pageobj['Children'][0]['_frames'].slice(0, slaveIndex);
      pageobj['frame'] = Object.fromEntries(
        Object.entries({ ...pageobj['frame'], ...screensData[0] }).filter(
          ([key]) => key in pageobj['frame']
        )
      );
    }

    slavepageObj['_navigationBars'] = pageobj['_navigationBars'].slice(slaveIndex);
    pageobj['_navigationBars'] = pageobj['_navigationBars'].slice(0, slaveIndex);

    slavepageObj['_tabBarHiddens'] = pageobj['_tabBarHiddens'].slice(slaveIndex);
    pageobj['_tabBarHiddens'] = pageobj['_tabBarHiddens'].slice(0, slaveIndex);

    if(pageobj['_toolBarTop']?.length > 1){
      slavepageObj['_toolBarTop'] = pageobj['_toolBarTop'].slice(slaveIndex);
      pageobj['_toolBarTop'] = pageobj['_toolBarTop'].slice(0, slaveIndex);
    }

    if(pageobj['_toolBarBottom']?.length > 1){
      slavepageObj['_toolBarBottom'] = pageobj['_toolBarBottom'].slice(slaveIndex);
      pageobj['_toolBarBottom'] = pageobj['_toolBarBottom'].slice(0, slaveIndex);
    }
    
    if(pageobj['_toolBarLeft']?.length > 1){
      slavepageObj['_toolBarLeft'] = pageobj['_toolBarLeft'].slice(slaveIndex);
      pageobj['_toolBarLeft'] = pageobj['_toolBarLeft'].slice(0, slaveIndex);
    }

    if(pageobj['_toolBarRight']?.length > 1){
      slavepageObj['_toolBarRight'] = pageobj['_toolBarRight'].slice(slaveIndex);
      pageobj['_toolBarRight'] = pageobj['_toolBarRight'].slice(0, slaveIndex);
    }

    pageobj = optimizePageChildren(pageobj, 0);
    //console.log(0, "pageobj Data >>>>>", pageobj);
    slavepageObj = optimizePageChildren(slavepageObj, slaveIndex);
    //console.log(slaveIndex, "slavepageObj Data >>>>>", pageobj);

    const masterScreenIndex:number = screensData.findIndex(obj => obj['embed'] === true);
    
    return {
      'viewType': pageobj['viewType'], 
      'pageid': pageobj['pageid'], 
      'Title': pageobj['Title'], 
      'parentid': pageobj['parentid'], 
      'screenData': [pageobj, slavepageObj],
      '_selectedScreenIndex': masterScreenIndex,
      '_pagemasterslave': true
    };
  }

  function optimizePageChildren(pageobj:any, index:number){
    let pagedata = JSON.parse(JSON.stringify(pageobj));

    pagedata['_toolBarTop'][0]['Children'] = optimizePageContainersChildren(pagedata['_toolBarTop'][0]['Children'], index);
    pagedata['_toolBarBottom'][0]['Children'] = optimizePageContainersChildren(pagedata['_toolBarBottom'][0]['Children'], index);
    pagedata['_toolBarLeft'][0]['Children'] = optimizePageContainersChildren(pagedata['_toolBarLeft'][0]['Children'], index);
    pagedata['_toolBarRight'][0]['Children'] = optimizePageContainersChildren(pagedata['_toolBarRight'][0]['Children'], index);
    pagedata['pageOverlay']['Children'] = optimizePageContainersChildren(pagedata['pageOverlay']['Children'], index);

    if(pageobj['viewType'] === 'BaseView') {
      pagedata['Children'] = optimizePageContainersChildren(pagedata['Children'], index);

    }else{
      pagedata['Children'][0]['Children'] = optimizePageContainersChildren(pagedata['Children'][0]['Children'], index);
    }
    return pagedata;
  }

  function optimizePageContainersChildren(children:any[], index:number){
    const containerUIs:string[] = ['TileList', 'ExpansionPanel', 'DataGrid', 'Popover', 'SwipeableView', 'Dialog', 'Drawer', 'NestedList'];

    for (let i = 0; i < children.length; i++) {      
      let uiArr:any[] = children[i]['uiParts'];
      uiArr = uiArr.splice(index, 1);      
      children[i]['uiParts'] = uiArr;

      if(containerUIs.includes(children[i]['viewType']) === true){        
        //console.log(i, "::", children[i]['viewType'], "***********", children[i]['uiParts']);

        if(children[i]['viewType'] === 'TileList' || children[i]['viewType'] === 'Popover'){
          const arrFields = children[i]['uiParts'][0]['dataarray'][0]['Fields'];
          children[i]['uiParts'][0]['dataarray'][0]['Fields'] = optimizePageContainersChildren(arrFields, index);

        }else if(children[i]['viewType'] === 'Dialog' || children[i]['viewType'] === 'Drawer'){
          const arrContainers = children[i]['uiParts'][0]['dataarray'];
          for (let d = 0; d < arrContainers.length; d++) {
            const arrOverlayFields = arrContainers[d]['Fields'];
            children[i]['uiParts'][0]['dataarray'][d]['Fields'] = optimizePageContainersChildren(arrOverlayFields, index);            
          }

        }else if(children[i]['viewType'] === 'ExpansionPanel'){
          let arrPanels = children[i]['uiParts'][0]['panelItems'];
          for (let e = 0; e < arrPanels.length; e++) {
            const arrExpFields = arrPanels[e]['Fields'];
            children[i]['uiParts'][0]['panelItems'][e]['Fields'] = optimizePageContainersChildren(arrExpFields, index);            
          }

        }else if(children[i]['viewType'] === 'SwipeableView'){
          let arrSwipeItems = children[i]['uiParts'][0]['swipeableItems'];
          for (let s = 0; s < arrSwipeItems.length; s++) {
            const arrSwipeFields = arrSwipeItems[s]['Fields'];
            children[i]['uiParts'][0]['swipeableItems'][s]['Fields'] = optimizePageContainersChildren(arrSwipeFields, index);            
          }

        }else if(children[i]['viewType'] === 'DataGrid'){
          let arrCols = children[i]['uiParts'][0]['dataCols'];
          for (let g = 0; g < arrCols.length; g++) {
            const arrColFields = arrCols[g]['Fields'];
            children[i]['uiParts'][0]['dataCols'][g]['Fields'] = optimizePageContainersChildren(arrColFields, index); 
            
            const arrHeaderFields = arrCols[g]['headerFields'];
            if(arrHeaderFields && arrHeaderFields.length > 0){
              children[i]['uiParts'][0]['dataCols'][g]['headerFields'] = optimizePageContainersChildren(arrHeaderFields, index);
            }
          }

        }else if(children[i]['viewType'] === 'NestedList'){
          const arrFields = children[i]['uiParts'][0]['dataarray'][0]['Fields'];
          children[i]['uiParts'][0]['dataarray'][0]['Fields'] = optimizePageContainersChildren(arrFields, index);

        }
      }
    }
    return children;
  }

