import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import './module.css';
import logo from '../assets/Appexe.png';
import AppData from './AppData';
import ProjectsList from './helpers/projectsList';
import ErrorBoundary from '../components/ErrorBoundary';
import { setAppConfig, setAppCredentials } from './ServiceActions';

class AppBuilder extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {        
        error: null,
        showlist: false,
        loadproject: false,

        hostname:'',
        port: '',
        userid: '',
        sessionid: '',
        projectid: '',
        locale: '',
      };      
    }
  
    componentDidMount() {
      this.clearSessionStorage();
      this.fetchConfig().then(response => this.getAppCredential(response));
      //this.props.dispatch(fetchAppConfig());
    }    

    clearSessionStorage() {
      for(let key in sessionStorage) {
			  if (!sessionStorage.hasOwnProperty(key)) {
			    continue; // skip keys like "setItem", "getItem" etc
			  }
			}			
			sessionStorage.clear();
    }
    
    fetchConfig() {
      return fetch("././config/builder.xml")
      .then(res => res.text())
      .then(
        (result) => {
          //console.log("config >>>", result);

          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(result,"text/xml");
          const servername = xmlDoc.getElementsByTagName("server")[0].childNodes[0].nodeValue;
          const port = xmlDoc.getElementsByTagName("port")[0].childNodes[0].nodeValue;
          const version = xmlDoc.getElementsByTagName("version")[0].childNodes[0].nodeValue;
          const consoleURL = (xmlDoc.getElementsByTagName("console")) ? xmlDoc.getElementsByTagName("console")[0].childNodes[0].nodeValue : "";
          console.log("servername >>", servername, port);
          /* this.setState({hostname: servername});
          this.setState({port: port}); */

          let _apiUrl = "https://"+servername+":"+port+"/appexe/api/";
          let configresult = {hostname: servername, port: port, version: version, apiURL: _apiUrl, console: consoleURL};
          this.props.dispatch(setAppConfig(configresult));        
          return configresult;
        },        
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error
          });
        }
      )
    }

    getAppCredential(config) {
        let strURL = window.location.href;    //http://localhost:3000?userid=stagetivauser1&sessionid=18b6e60f9dd0974f5fd23a9a024d13cc&projectid=2&lang=en
        var credential = this.getURLCredential(strURL);
        if (credential)
        {   
            if(credential.projectid){
                this.setState({showlist: false});

                if(!credential.hasOwnProperty('sessionid')){
                  let _getUserURL = config.apiURL+"getUser.json?projectid="+credential.projectid+"&userid="+credential.userid;
                  fetch(_getUserURL)
                    .then(res => res.json())
                    .then(
                      (result) => {
                        if(result.response === "NACK"){
                          this.setState({loadproject: false});
                        }
                        else{
                          let sessionid = result.s_id;
                          let credentials = {userid: credential.userid, sessionid: sessionid, projectid: credential.projectid, locale: credential.lang};
                          this.props.dispatch(setAppCredentials(credentials)); 
                          this.props.dispatch({ type: "LOADAPP" }); 
                        }
                      },
                      (error) => {
                        console.error('getUser Fetch Error:', error);
                        this.setState({loadproject: false});
                      }
                    )
                }else{
                  let credentials = {userid: credential.userid, sessionid: credential.sessionid, projectid: credential.projectid, locale: credential.lang};
                  this.props.dispatch(setAppCredentials(credentials)); 
                  this.props.dispatch({ type: "LOADAPP" }); 
                }
                
            }else{
                this.setState({showlist: true});
                this.setState({loadproject: false});               
            }
        }
    }
    getURLCredential(appURL)
    {        
        let assoc = {};
        
        let searchString = appURL.split("?")[1];
        //console.log("href search : " + searchString);
        if(searchString) {
            let keyValues = searchString.split('&');
            for (let i = 0; i < keyValues.length; i++) {
                const element = keyValues[i];
                let key = element.split('=');
                if (key.length > 1) 
                {
                    assoc[key[0]] = key[1];
                }            
            }
        }
        
        return assoc;
    }

    
    
    render() {      
      //const { error, showlist, loadproject } = this.state;
      //const _apiUrl = "http://"+this.state.hostname+":"+this.state.port+"/appexe/api/";
      //const apiParam = {apiURL: _apiUrl, userid: this.state.userid, sessionid: this.state.sessionid, projectid: this.state.projectid}; 
      
      const showlist = this.state.showlist;
      const { error, apiParam, loadproject } = this.props;      // set via redux-mapStateToProps

      if (error) {
        return (
          <div>
            <DefaultAppbar />
            <div className="backdropStyle">App Loading Error: {error.message}</div>
          </div>
        );
      } else if (showlist) {
        return (
          <div>
            <DefaultAppbar />
            <ProjectsList show={showlist} appconfig={apiParam}/>
          </div>
        );
      } else if (loadproject){
        return (
          <div className="no-selection">
            <DefaultAppbar />
            <ErrorBoundary>
              <AppData show={loadproject} appconfig={apiParam}/>
            </ErrorBoundary>
          </div>                      
        );
      } else {
          return <DefaultAppbar />;
      }

    }
  }

  function DefaultAppbar(props) {

    const useStyles = makeStyles(theme => ({
                        root: {
                          flexGrow: 1,
                        },
                        densetoolbar: {
                          height: 40,
                          minHeight: 40,
                        },
                        title: {
                            flexGrow: 1,
                        },
                      }));
    const classes = useStyles();
  
    return (
      <div id="defaultAppbar" className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar variant="dense" className={classes.densetoolbar}>
          <div className={classes.title}>
            <img className="App-logo" src={logo} alt="logo"></img>            
          </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }


  //export default AppBuilder;

  function mapStateToProps(state) {   
    //console.log("mapStateToProps >>>>>", state); 
    return {
      count: state.counter,
      error: state.appParam.error,
      apiParam: state.appParam.params,
      loadproject: state.appParam.loadapp,
    };
  }
  export default connect(mapStateToProps)(AppBuilder);