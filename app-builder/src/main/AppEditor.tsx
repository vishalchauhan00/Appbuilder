import React from 'react';
import { useMemo, useState, useEffect } from 'react';

import { CircularProgress, Fab, Stack, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

import { useAppStore } from '../store/appDataStore';
import { usePageStore } from '../store/appPageStore';
import { useAppComponentStore } from '../store/appComponentStore';
import { getAppPages, getPageList, setPageListHeirarchy } from '../utils/pagelistUtils';
import AlertDialog from '../components/AlertDialog';

import AppMenuBar from './AppMenuBar';
import AppDetails from './AppDetails';
import PageList from './PageListView/PageList';
import ProjectValidation from './ProjectEditor/ProjectValidation';
import ResourceManager from './ProjectEditor/ResourceManager';
import DatabaseViewer from './ProjectEditor/DatabaseViewer';
import ScreenManager from './ProjectEditor/ScreenManager';
import ProjectVariable from './ProjectEditor/ProjectVariable';
import BotView from './BotView';
import PagesView from './PageEditor/PagesView';


const AppEditor: React.FC = () => {
    const { credentials, config, projectData } = useAppStore();
    const { error, loadPageList, pagelistData, pagetree, setOpenedPages, removeOpenedPage, activePageId } = usePageStore();
    const { openComponents, addComponent, removeComponent, toggleComponent, clearComponents } = useAppComponentStore();
    //const apiParam = Object.assign({}, credentials, config);

    //const [selectedPageId, setSelectedPageId] = useState<string>('-1');    

    const appPageList = useMemo(() => {
        if (!projectData) return [];
        return getAppPages(projectData);
    }, [projectData]);

    useEffect(() => {
        if (!config || !credentials || !projectData) return;
        if (appPageList.length === 0) {
            getPageList(config, credentials);
        } else {
            setPageListHeirarchy(appPageList, projectData, false);
        }
    }, [config, credentials, projectData, appPageList]);


    const [showAlert, setShowAlert] = useState(false);
    useEffect(() => {
        if (error) {
            setShowAlert(true);
        }
    }, [error]);
    if (error) { 
        return (
        <>
            <div className="backdropStyle">
                <AlertDialog
                    open={showAlert}
                    onClose={() => setShowAlert(false)}
                    title="App Error"
                    message={error?.message || 'Something went wrong.'}
                />
            </div>
        </>
        );
    }

    if (appPageList.length === 0) { 
        return (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <div>Need to show import Figma window</div>
            </div>
        );
    }

    if (!loadPageList) {
        return (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <AppMenuBar/>
                <CircularProgress />
                <div>Please wait...</div>
                <Tooltip title="AppE Bot">
                    <Fab variant="circular" size="small" color="primary" style={{ position: 'fixed', bottom: 32, right: 32 }}
                            onClick={() => toggleComponent('chatbot')}>
                        <ChatIcon/>        
                    </Fab >
                </Tooltip>
            </div>
        );
    }

    if (pagelistData && pagetree) {
        //console.info(pagelistData, "****** $$ ********", pagetree);

        const handleAppexeBotClick = () => {
            /*if(openComponents.includes('chatbot'){
                setOpenComponent(null);
            }else{
                setOpenComponent('chatbot');
            }*/
           toggleComponent('chatbot');
        }

        const handleAppFunctionEditorClose = (funcName: string) => {
            addComponent('appdetails');
            removeComponent(funcName);
        }

        const handlePageSelect = (page:any) => {
            const pageid = page['id'];
            //setSelectedPageId(pageid);

            /*const pageObj = pagelistData[pageid];
            setPageMasterSlave(pageObj['_pagemasterslave']);
            const pageScreenIndex:number = pageObj['_selectedScreenIndex'];
            setPageScreenIndex(pageScreenIndex);
            const pageScreenObj = pageObj['screenData'][pageScreenIndex];
            
            const pageData = JSON.parse(JSON.stringify(pageScreenObj));
            console.info(pageid, ">>>>", pageObj, "***** page select *****", pageData);

            setOpenedPages(pageData);*/
            setOpenedPages(pageid);
            addComponent('pagesview');
            removeComponent('pagelist');
        }

        const handleMultiPageSelection = () => {
            console.info("Multi-Pages Node Click Handler .......");
        }

        const handleClosePagesView = (pageId: string) => {
            //setOpenComponent(null);
            removeOpenedPage(pageId);
            if(activePageId === '-1'){
                clearComponents()
            }
        }

        return (
            <>
                <AppMenuBar/>

                {(projectData && openComponents.includes('appdetails')) && (
                    <AppDetails data={projectData} onClose={() => removeComponent('appdetails')} />
                )}
                {(projectData && openComponents.includes('validation')) && (
                    <>
                        <AppDetails data={projectData} onClose={() => removeComponent('appdetails')} />
                        <ProjectValidation show={true} onCloseEditor={() => handleAppFunctionEditorClose('validation')}/>
                    </>
                )}
                {(projectData && openComponents.includes('resources')) && (
                    <>
                        <AppDetails data={projectData} onClose={() => removeComponent('appdetails')} />
                        <ResourceManager show={true} onCloseEditor={() => handleAppFunctionEditorClose('resources')}/>
                    </>
                )}
                {(projectData && openComponents.includes('database')) && (
                    <>
                        <AppDetails data={projectData} onClose={() => removeComponent('appdetails')} />
                        <DatabaseViewer show={true} onCloseEditor={() => handleAppFunctionEditorClose('database')}/>
                    </>
                )}
                {(projectData && openComponents.includes('screens')) && (
                    <>
                        <AppDetails data={projectData} onClose={() => removeComponent('appdetails')} />
                        <ScreenManager show={true} onCloseEditor={() => handleAppFunctionEditorClose('screens')}/>
                    </>
                )}
                {(projectData && openComponents.includes('variables')) && (
                    <>
                        <AppDetails data={projectData} onClose={() => removeComponent('appdetails')} />
                        <ProjectVariable show={true} onCloseEditor={() => handleAppFunctionEditorClose('variables')}/>
                    </>
                )}
                {openComponents.includes('pagelist') && (
                    <PageList data={pagelistData} list={pagetree} source="view"
                    onNodeSelection={handlePageSelect} onMultiPageSelection={handleMultiPageSelection}
                    onClose={() => removeComponent('pagelist')} />
                )}
                {(openComponents.includes('pagesview') && activePageId !== '-1') && (
                    <PagesView onClosePagesView={handleClosePagesView} />
                )}
                <Tooltip title="AppE Bot">
                    <Fab variant="circular" size="small" color="primary" style={{ position: 'fixed', bottom: 8, right: 6 }}
                            onClick={() => handleAppexeBotClick()}>
                        <ChatIcon/>        
                    </Fab >
                </Tooltip>
                {(openComponents.includes('chatbot')) && (
                    <Stack alignItems={'center'} justifyContent={'center'} 
                            sx={{ 
                                width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.2)',
                                position: 'absolute', top: 0, left: 0, zIndex: 999
                            }}
                    >
                        <BotView onCloseEditor={() => removeComponent('chatbot')}/>
                    </Stack>
                )}
                
            </>
        );
    }

    return (
        <></>
    );

};

export default AppEditor;