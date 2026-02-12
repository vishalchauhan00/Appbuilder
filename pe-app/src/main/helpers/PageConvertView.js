import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, List } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AlertWindow from '../../components/AlertWindow';

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  content: {
    background: theme.palette.background.default,
    padding: 0,
    marginTop: '-20px'  // since 'DialogContent' has padding top as 20 px for first child
  },
  editorheading: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  editornote: {
    background: theme.palette.background.default,
    color: theme.palette.text.secondary,
    fontSize: '0.825rem',
    padding: theme.spacing(1)
  },
  editorpaper: {
    width: '100%',
    minHeight: 280,
    maxWidth: 600,    
    padding: theme.spacing(1),
    borderRadius: 8,
  },
  editorbtn: {
    textTransform: 'none',
    margin: theme.spacing(1),
  },
  propdiv: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  proptext: {
    fontWeight: 'bold'
  },
  propsubtext: {
    width: 120
  },
  numinput: {
    width: 50
  },
  previewdiv:{
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
  pagelist: {
    maxHeight: 250,
    overflow: 'hidden auto',
    padding: '8px 24px', 
    borderBottom: '1px solid rgba(221,221,221,1)'
  },
  pagenamediv: {
    display: 'flex',
    height: 32
  },
  actions: {
    display: 'flex', 
    justifyContent: 'center',
    background: theme.palette.background.paper,
  }

}));

export default function PageConvertView(props) {

  const [open, setOpen] = React.useState(true);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState("");
  const [openAlert, setOpenAlert] = React.useState(false);

  const [checked, setChecked] = React.useState([0]);

  function handleClose() {
    setOpen(false);
    props.onCloseEditor();
  }

  function handleCancelUpdate() {
    setOpen(false);
    props.onCloseEditor();
  }  
  
  function handlePropValueChange(value) {    
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  }

  function handleOkUpdate() {
    
    if(checked.length === 1 && checked[0] === 0){
      setAlertMsg("Please select atleast 1 page to change.");
      setOpenAlert(true);
      return;
    }

    setOpenConfirm(true);
  }

  function confirmOKHandler() {

    let updatedPagelist = props['pagelist'];
    
    const pageDicArray = props['pageDic'];
    let scrollPageDic = pageDicArray[0].dic;    
    scrollPageDic.Children = [];
    let scrollBasedic = pageDicArray.filter(function(pagedic) {
      return pagedic.name === 'ScrollBaseView';
    });
    scrollPageDic.Children.push(scrollBasedic[0].dic);

    //console.log(props['pagelist'], "**************", scrollPageDic);
    for (let i = 0; i < checked.length; i++) {
      const _pageid = checked[i];
      if(_pageid !== 0){
        //console.log(i, ">>>>>", _pageid);

        let pageIndex;
        let pagedef = props['pagelist'].filter(function(pageobj,index) {
          if(pageobj.pageid === _pageid){
            pageIndex = index;
            return true;
          }else{
            return false;
          }
        });

        if(pagedef.length > 0){
          
          let updatePage = Object.assign({}, scrollPageDic, pagedef[0]);

          let pageChildren = scrollPageDic['Children'];
          pageChildren[0]['Children'] = pagedef[0]['Children'];
          pageChildren[0]['_frames'] = [];
          pageChildren[0]['_frames'].push(pagedef[0]['frame']);
          pageChildren[0].backgroundColor = pagedef[0]['backgroundColor'];
          pageChildren[0].backgroundGradient = pagedef[0]['backgroundGradient'];
          updatePage['Children'] = pageChildren;

          updatePage['viewType'] = 'ScrollView';

          console.log(pageIndex, "!!!!!!!!!!!", updatePage);
          updatedPagelist[pageIndex] = updatePage;
        }
      }      
    }

    
    props.onUpdatePageList(updatedPagelist);

    setOpenConfirm(false); 
    setOpen(false);
  }

  function confirmCloseHandler() {
    setOpenConfirm(false);    
  }

  function alertOKHandler() {
    setAlertMsg("");
    setOpenAlert(false);
  }

  const classes = useStyles();

  return (
    
    <Dialog open={open} fullWidth={true} maxWidth="sm" disableBackdropClick onClose={handleClose} >
      <DialogContent className={classes.content}>
        <Typography component="div" className={classes.editorheading} >Change Page-Type</Typography>
        <Typography component="div" className={classes.editornote} >Note: All selected Free-layout pages will be change to Free-scroll pages</Typography>
        <List component="nav" dense={true} className={classes.pagelist} >
          {getBaseViewPages(props.pagelist).map((page, index) => (
            <div key={index} className={classes.pagenamediv}>
              <div className="horizontal-align" style={{justifyContent:'space-between'}}>
                <Typography variant="body2" >{page.Title}</Typography>
                <input id={page.pageid} type='checkbox' style={{width:18, height:18}}
                       checked={checked.indexOf(page.pageid) !== -1}
                       onChange={() => handlePropValueChange(page.pageid)}/>
              </div>
            </div>
          ))}
        </List>
        <div className={classes.actions}>
          <Button variant="contained" color="default" className={classes.editorbtn} onClick={handleCancelUpdate}>
            Cancel 
          </Button>
          <Button variant="contained" color="primary" className={classes.editorbtn} onClick={handleOkUpdate}>
            Submit
          </Button>
        </div>
        {openAlert === true && 
          <AlertWindow open={true} title="" message={alertMsg}
                      ok="OK" okclick={alertOKHandler}
                      cancel="" cancelclick={confirmCloseHandler}
          />
        }
        {openConfirm === true && 
          <AlertWindow open={true} title="" message="Are you sure to change page type ?"
                      ok="Yes" okclick={confirmOKHandler}
                      cancel="No, Cancel" cancelclick={confirmCloseHandler}
          />
        }
      </DialogContent>
    </Dialog>
  );

  function getBaseViewPages(pagelist) {
    let basepageList = pagelist.filter(function(page) {
      return page['viewType'] === 'BaseView';
    });  
    if(basepageList.length > 0) {
      return basepageList;
    }
    return [];
  }
}
