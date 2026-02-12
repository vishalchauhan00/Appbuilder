import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Fab, IconButton, Input, Snackbar, Tooltip } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';

// --- Types ---
export interface PageNode {
  id: string | number;
  title: string;
  parent: string;
  type?: string;
  childcount: number;
  children: PageNode[];
  level: number;
  page?: any;
}

export interface PageFinderProps {
  data: Record<string, any>;
  listData: Record<string, any>;
  source?: string;
  onSelectPage: (pageid : string | number) => void;
  onFindPage: (pageid : string | number) => void;
  onClose: () => void; 
}

const PageFinder: React.FC<PageFinderProps> = ({ data, listData, source, onSelectPage, onFindPage, onClose }) => {
    console.info(data, listData, source);

    const theme = useTheme();
    /*const root: React.CSSProperties = {
        maxHeight:360, width: 300, overflowX: 'hidden',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
    };
    const input: React.CSSProperties = {
        margin: theme.spacing(1),
    };
    const pagefinderdiv: React.CSSProperties = {
        width: '100%',
        height: 32,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: theme.spacing(0.5),
        background: theme.palette.background.default,
        borderBottom: '4px inset rgb(227,227,227)'
    };
    const searchinput: React.CSSProperties = {
        width: '100%',
        height: `calc(100% - 2px)`,
        padding: theme.spacing(0, 0.5),
        margin: theme.spacing(0, 0.5),
        fontSize: '0.875rem',
    };
    const openbtn: React.CSSProperties = {
      width: 28, height: 24, minHeight: 24,
    };*/
    const finderitem: React.CSSProperties = {
        width: 24, height: 24, minHeight: 24,
        margin: theme.spacing(0, 0.5),
    };
    const closebtndiv: React.CSSProperties = {
        width: 24,
        height: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        textAlign: 'center',
        borderLeft: '1px solid',
        marginLeft: theme.spacing(0.5),
    };
    const closebtn: React.CSSProperties = {
        maxWidth: 24, minHeight: 24, maxHeight: 24,
    };

    const [searchvalue, setSearchValue] = React.useState<string>('');
    const [searcherror, setSearchError] = React.useState<boolean>(false);
    const [showitems, setShowItems] = React.useState<boolean>(false);
    const [filterlist, setFilterList] = React.useState<any[]>([]);
    const [moveNumber, setMoveNumber] = React.useState<number>(0);
    const [snackbaropen, setSnackbarOpen] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');

    const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {

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
          handleFindPage(val);

      }else {
          setSearchError(true);
          setSearchValue('');
          setShowItems(false);
          setMoveNumber(0);
          setFilterList([]);
      }
    };

    function getSortedList(pagelist:Record<string, any>, updatedlist:any[]) {
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
    function handleFindPage(strsearch: string) {
        //console.log(props.listData, props['originalData'], "... handleFindPage >>>", strsearch);
        //const pageData = JSON.parse(JSON.stringify(props['originalData']));
        let pageData:any[] = [];
        pageData = getSortedList(listData, pageData);

        setSearchError(false);
        setSnackbarOpen(false);
        if(strsearch.length === 0) {
            setSearchError(true);
        }else {
            let pageList:any[] = pageData.filter(function(item) {
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
                onSelectPage(_pageObj['pageid']);
            }
            //console.log(props.listData, pageData, "... handleFindPage >>>", strsearch, "******", pageList);       
        }
    }

    function handleMovePreviousMatch() {  
        if(moveNumber > 1) {
            let prevNum = moveNumber - 1;
            setMoveNumber(prevNum);
    
            const _index = prevNum - 1;
            const _pageObj = filterlist[_index];
            onSelectPage(_pageObj['pageid']);
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
            onSelectPage(_pageObj['pageid']);
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
            onFindPage(_pageObj['pageid']);
        }else{
            setSnackbarOpen(true);
            setMessage('No match found');
        }
    }

    function handleClosePageFinder() {
        setSearchValue('');
        setSearchError(false);
        setFilterList([]);
        setMoveNumber(0);
        setSnackbarOpen(false);

        onClose();
    }

    function handleSnackbarClose() {
        setSnackbarOpen(false);
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', p: 1, border: '1px solid #666666', borderRadius: 4}}>
          <Input autoFocus type="text" required placeholder="Search by Page Title" 
                value={searchvalue} onChange={handleSearchInput} error={searcherror}/>
          {showitems && 
            <div style={{display:'flex', height:'24px'}}>
                <Fab color="default" size="small" aria-label="Previous Match" style={finderitem}>
                    <Tooltip title="Previous Match"><ArrowUpwardIcon onClick={handleMovePreviousMatch} /></Tooltip>
                </Fab>
                <Fab color="default" size="small" aria-label="Next Match" style={finderitem}>
                    <Tooltip title="Next Match"><ArrowDownwardIcon onClick={handleMoveNextMatch} /></Tooltip>
                </Fab>
                <Fab color="default" size="small" style={finderitem} >
                   <Tooltip title="Set page selected"><ArrowForwardOutlined onClick={handleOpenSearchedPage} /></Tooltip>
                </Fab>
            </div>
          }
          <div style={closebtndiv}>
            <IconButton aria-label="Close Finder" style={closebtn} onClick={handleClosePageFinder}>
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
        </Box>
    );

};

export default PageFinder;
