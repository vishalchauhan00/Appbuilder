import { useEffect, useRef } from 'react';

import type { AppConfig, AppCredentials } from '../types/index';
import { useAppStore } from '../store/appDataStore';
import { usePageStore } from '../store/appPageStore';


export function useGetAppPages(projectdata: any) {
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

export function usePageData(config: AppConfig | null, credentials: AppCredentials | null) {
  const { setError, setLoadPageList, setPagelistData } = usePageStore();

  useEffect(() => {
    if (!config || !credentials) return;

    const getPageList = async () => {
      try {
        const pagelist = await fetchPageData(config, credentials);        
        if (pagelist.response === 'NACK'){
          throw new Error('Invalid Project');

        }else{
          
          if (pagelist){
            console.info("pagelist>>>", pagelist);
            setPagelistData(pagelist);
          }
          setLoadPageList(true);
        }
        
      } catch (err) {
        console.error('Error fetching getPageList:', err);
        setError(err as Error);
      }
    };

    getPageList();
    
  }, []);
}


async function fetchPageData(config: AppConfig | null, credentials: AppCredentials | null) {  
  try {
    if (!config || !credentials) return null;

    const pagelistAPI = config.apiURL+"service.json?command=pagelist&userid="+credentials.userid+"&sessionid="+credentials.sessionid+"&projectid="+credentials.projectid;
    
    const response = await fetch(pagelistAPI);
    const pagelistdata = await response.json();

    return pagelistdata;

  } catch (err) {
    console.error('Error fetching pagelistdata:', err);
  }
}


////////////////////////////////////////

  export function useSetPageListHeirarchy( pagelist: any[], projectdata: any, pageLoaded: boolean = false ) {
    
    const { credentials, config } = useAppStore();
    const { setLoadPageList, setPagelist } = usePageStore();

    const initialized = useRef(false);

    useEffect(() => {
      if (initialized.current) return;
      if (!credentials || !config || !pagelist || !projectdata) return;

      const apiParam = Object.assign({}, credentials, config);

      /*var arrPageData = [];
      let projectNode = {level:0, title:projectdata.ProjectName, id:"-1", parent:"App", type:"", children:[]};
      arrPageData.push(projectNode);

      manipulatePageData(pagelist, 1, arrPageData, null); 

      let pageHeirarchy = setPageHeirarchy(arrPageData);
      pageHeirarchy = pageHeirarchy.filter((page: any) => page.parent === "App");

      console.info(arrPageData, "****** 1 ********", pageHeirarchy);*/

      setLoadPageList(true);
      setPagelist(pagelist);
      //setPagelistHeirarchy(pageHeirarchy);

      //console.log(pageHeirarchy, "...pagelist >>> ", pagelist);
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
            //this.setState({pagelist: pagelist});

            const strPages = moduleArr.join();
            const custompagelistAPI = config.apiURL+"service.json?command=custompagelist&userid="+credentials.userid+"&sessionid="+credentials.sessionid+"&projectid="+credentials.projectid+"&pageids="+strPages;
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
                    useSetPageListHeirarchy(updatedPageList, projectdata, true);

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
    }, [pagelist, pageLoaded]);
  }

  async function fetchCustomPages(pagelist: any[], apiParam: any, projectdata: any) {
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
    //console.log("...strPageIDs >>> ", arrPageIds);
    const abc = await fetchSelectedPages(arrPageIds, pagelist, apiParam);
    console.log("...fetchSelectedPages >>> ", abc);
    if(abc) {
      var arrPageData = [];
      let projectNode = {level:0, title:projectdata.ProjectName, id:"-1", parent:"App", type:"", children:[]};
      arrPageData.push(projectNode);
  
      manipulatePageData(abc, 1, arrPageData, null); 
  
      let pageHeirarchy = setPageHeirarchy(arrPageData);
      pageHeirarchy = pageHeirarchy.filter((page: any) => page.parent === "App");
  
      console.info(arrPageData, "****** 2 ********", pageHeirarchy);
    }
  }

  async function fetchSelectedPages(arrPageIds: string[], pagelist: any[], apiParam: any): Promise<any[] | null>{
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
                const cpage = custompagelist[index];

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

