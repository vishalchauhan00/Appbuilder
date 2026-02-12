
  ////////////////////////////////////////////////////////////////////////

  export function getTabModuleAccess(openedpage:any, selectedtabs:any[], pagelist:Record<string, any>) {
    let _parentpage;
    let _parentId = openedpage['parentid'];
    if(_parentId !== "App") {
      while(_parentId !== "App")
      { 
        _parentpage = getParantPage(_parentId, pagelist)
        if(_parentpage) {
          _parentId = _parentpage.parentid;
        }
      }
    }else {
      _parentpage = openedpage;
    }
    
    let openedpageid = _parentpage['pageid'];
    if(selectedtabs && selectedtabs.length > 0) {
      //console.log(pagelist, selectedtabs, "********", _parentpage, openedpageid);
      if(selectedtabs.indexOf(openedpageid) > -1) {
        return true;
      }
      return false;
    }
    return true;
  }
  function getParantPage(_parentId:string, pagelist:Record<string, any>) {
    let parentObjArr =  pagelist.filter(function(_page:any) {
      return (_page['pageid'] === _parentId);
    });
    let _parentpage = parentObjArr[0];
    return _parentpage;
  }

  export function checkProjectRole(projectdata:any) {
    const username = projectdata['owner'];
    const contributors = projectdata['Contributors'];
    if(contributors) {
      for (let i = 0; i < contributors.length; i++) {
        const contributorObj = contributors[i];
        if(contributorObj['owner'] === "") {
          return 'norole';
        }
        if(contributorObj['owner'] === username) {
          return 'owner';
        }                
      }
      return 'contributor';
    }
    return 'norole';
  }