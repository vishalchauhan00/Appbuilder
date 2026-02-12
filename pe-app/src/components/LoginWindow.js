import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Paper, Typography, TextField } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  loginpaper: {
    height: 300,
    width: 400,
    borderRadius: 8,
  },
  title: {
    background: theme.palette.primary.main,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: theme.palette.common.white,
    padding: theme.spacing(1, 3),
  },
  loginform: {
    height: 150,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: theme.spacing(3)
  },
  loginbtn: {
    textTransform: 'none',
    margin: '0px 8px 16px 280px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

}));

export default function LoginWindow(props) {

  const [open, setOpen] = React.useState(true);
  const [passwordVal, setPasswordValue] = React.useState("");

  function handleSetPassword(e) {
    let fields = passwordVal;
    fields = e.target.value;
    setPasswordValue(fields);
  }

  function handleLoginSubmit() {
    if(passwordVal.toString().trim().length > 0) {
      //props.onRelogin(passwordVal);

      let config = props.config;

      const data = passwordVal;
      const skey = "YDQ9hCBhKgQMgbrAARybQzY1YePAuEo6tYM9pYWwuKU=";
      const siv = "266+4ypL6gIAGRlmVu73LA==";

      encryptAES256CBC(data, skey, siv).then(encryptPwd => {
        //console.info(data, "... encryptPwd ...", encryptPwd);

        let api_relogin = config.apiURL+"login.json?command=login&username="+config.userid+"&password="+encryptPwd+"&oldsession="+config.sessionid;
        fetch(api_relogin, {method: 'POST'})
          .then(res => res.json())      
          .then(
            (result) => {
              if(result.response === "NACK"){
                console.info('re-login NACK :', result);
                props.onRelogin({status: "NACK", result: result});
              }
              else{
                const sessionid = result.s_id;
                console.info(config.sessionid, '<< sessionid >>', sessionid);
                const credentials = {userid: config.userid, sessionid: sessionid, projectid: config.projectid, locale: (config.lang ? config.lang : "en")};
                props.onRelogin({status: "ACK", result: credentials});
              }
            },
            (error) => {
              console.error('re-login Fetch Error:', error);
            }
          )
      });
    }
    //setOpen(false);
  }

  async function encryptAES256CBC(plainText, base64Key, base64Iv) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(base64Iv), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      data
    );

    // Convert ArrayBuffer to Base64
    const encryptedBytes = new Uint8Array(encrypted);
    const base64Encrypted = btoa(String.fromCharCode(...encryptedBytes));

    return base64Encrypted;
  }

  function handleClose() {
    setOpen(false);
  }

  function handleUserSession() {
    const config = props.config;

    let _getUserURL = config.apiURL+"getUser.json?projectid="+config.projectid+"&userid="+config.userid;
    fetch(_getUserURL)
      .then(res => res.json())
      .then(
        (result) => {
          if(result.response === "NACK"){
            console.info('getUser NACK :', result);
            props.onGetSession({status: "NACK", result: result});
          }
          else{
            const sessionid = result.s_id;
            console.info(config.sessionid, '<< sessionid >>', sessionid);
            const credentials = {userid: config.userid, sessionid: sessionid, projectid: config.projectid, locale: (config.lang ? config.lang : "en")};
            props.onGetSession({status: "ACK", result: credentials});
          }
        },
        (error) => {
          console.error('getUser Fetch Error:', error);
        }
      )
  }

  const classes = useStyles();

  return (    
    <Dialog open={open} onClose={handleClose}
            disableBackdropClick disableEscapeKeyDown        
      >
        <DialogContent style={{padding:0}}>
          <Paper elevation={6} className={classes.loginpaper} >
            <Typography component="div" className={classes.title} >Login</Typography>
            <form className={classes.loginform} noValidate autoComplete="off">
              <TextField label="User Id" variant="outlined"
                          defaultValue={props.loginid}
                          InputProps={{ readOnly: true, }} />
              <TextField id="pwdtext" required type="password" autoFocus label="Password" variant="outlined"
                         value={passwordVal} onChange={handleSetPassword}/>
              <Typography variant='body2' style={{padding: '16px', display: 'none'}}>
                Session expired. It could be due to another login from console for same account.
                <br/><br/>
                Click 'OK' to get session.
              </Typography>
            </form>
            <Button variant="contained" className={classes.loginbtn} onClick={handleLoginSubmit}>
              Submit
            </Button>
            <Button variant="contained" className={classes.loginbtn} style={{display: 'none'}} onClick={handleUserSession}>
              OK
            </Button>
          </Paper>
        </DialogContent>
      </Dialog>
  );
}
