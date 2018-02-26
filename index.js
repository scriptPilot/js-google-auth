const electron = process.versions.electron ? require('electron') : null;
const axios = require('axios');
const qs = require('qs');

const GoogleAuth = class {
  constructor(parameters) {
    // Copy parameters
    const params = parameters;
    // Add default parameters
    if (!params.redirectUri && electron) params.redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    if (typeof params.scope === 'string') params.scope = [params.scope];
    if (typeof params.onTokenChange !== 'function') params.onTokenChange = () => {};
    // Check parameters
    if (!params.clientId) throw new Error('GoogleAuth() should have parameter clientId');
    else if (!params.clientSecret) throw new Error('GoogleAuth() should have parameter clientSecret');
    else if (!params.redirectUri) throw new Error('GoogleAuth() should have parameter redirectUri');
    else if (!params.scope) throw new Error('GoogleAuth() should have parameter scope');
    // Remember parameters
    this.clientId = params.clientId;
    this.clientSecret = params.clientSecret;
    this.redirectUri = params.redirectUri;
    this.scope = params.scope;
    this.onTokenChange = params.onTokenChange;
    // Load credentials
    this.loadCredentials();
    // Keep token refreshed
    this.keepTokenRefreshed();
    // Handle code, given in URI
    this.handleCodeInURI();
  }

  loadCredentials() {
    try {
      const credentials = JSON.parse(window.localStorage.googleCredentials);
      if (credentials.access_token && credentials.refresh_token) {
        this.credentials = credentials;
      } else {
        this.credentials = null;
      }
    } catch (err) {
      this.credentials = null;
    }
    this.onTokenChange(this.getToken());
  }

  getToken() {
    return this.credentials && this.credentials.access_token ? this.credentials.access_token : null;
  }

  keepTokenRefreshed() {
    setInterval(() => {
      this.refreshToken();
    }, 1000 * 60 * 5);
  }

  refreshToken() {
    if (this.credentials) {
      axios.post('https://www.googleapis.com/oauth2/v4/token', qs.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refresh_token,
      }))
        .then((res) => {
          if (res.data.access_token) {
            this.credentials.access_token = res.data.access_token;
            this.saveCredentials();
          }
        });
    }
  }

  saveCredentials() {
    if (this.credentials) {
      window.localStorage.googleCredentials = JSON.stringify(this.credentials);
    } else {
      window.localStorage.removeItem('googleCredentials');
    }
    this.onTokenChange(this.getToken());
  }

  handleCodeInURI() {
    const uriQuery = window.location.href.replace(/^(.+)\?/, '');
    const uriParms = qs.parse(uriQuery);
    if (uriParms && uriParms.code) {
      this.exchangeCode(uriParms.code);
    }
  }

  exchangeCode(code, callback = () => {}) {
    axios.post('https://www.googleapis.com/oauth2/v4/token', qs.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
      code,
    }))
      .then((res) => {
        this.credentials = res.data;
        this.credentials.created = new Date().getTime();
        this.saveCredentials();
        if (!electron) window.location = this.redirectUri;
        callback(null);
      })
      .catch((err) => {
        callback(err);
      });
  }

  getAuthUri() {
    const authUri = 'https://accounts.google.com/o/oauth2/v2/auth'
                  + `?client_id=${this.clientId}`
                  + `&redirect_uri=${this.redirectUri}`
                  + `&scope=${this.scope.join(' ')}`
                  + '&access_type=offline'
                  + '&prompt=consent'
                  + '&response_type=code';
    return authUri;
  }

  signIn(callback = () => {}) {
    if (navigator.onLine) {
      const authUri = this.getAuthUri();
      if (electron) {
        let authProcessInProgress = false;
        const win = new electron.remote.BrowserWindow({
          width: 400,
          height: 600,
          center: true,
          resizable: false,
          alwaysOnTop: true,
          autoHideMenuBar: true,
          nodeIntegration: false,
        });
        win.on('page-title-updated', () => {
          const title = win.getTitle();
          if (title.startsWith('Denied')) {
            callback(new Error('Access denied'));
            win.close();
          } else if (title.startsWith('Success') && authProcessInProgress === false) {
            authProcessInProgress = true;
            const code = title.split(/[ =]/)[2];
            win.close();
            this.exchangeCode(code, (err) => {
              callback(err);
            });
          }
        });
        win.loadURL(authUri);
      } else {
        window.location = authUri;
      }
    } else {
      callback(new Error('Sign-in not possible when offline'));
    }
  }

  signOut(callback = () => {}) {
    this.credentials = null;
    this.saveCredentials();
    callback();
  }
};

module.exports = GoogleAuth;
