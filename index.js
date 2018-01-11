/**
 * Purpose: Provide class for Google OAuth2 process to get token
 * Docs: https://developers.google.com/identity/protocols/OAuth2UserAgent
 */

const GoogleAuth = class {

  /**
   * Constructor
   */

  constructor() {
    this.setDefaultValues();
    this.checkHashForToken();
    this.checkLocalStorageForToken();
  }

  /**
   * Auth process
   */

  signIn() {
    window.location.href = this.getAuthUri();
  }

  signOut() {
    this.token = null;
    window.localStorage.removeItem('_googleToken');
  }

  checkHashForToken() {
    const params = this.getHashParams();
    if (params.access_token && params.scope && params.expires_in && params.token_type) {
      this.setToken({
        'access_token': params.access_token,
        'scope': params.scope,
        'expires_in': params.expires_in,
        'type': params.token_type
      });
      this.cleanHash();
    }
  }

  checkLocalStorageForToken() {
    if (!this.token && window.localStorage._googleToken) {
      this.setToken(JSON.parse(window.localStorage._googleToken));
    }
  }

  /**
   * Setter
   */

  setDefaultValues() {
    this.clientId = null;
    this.redirectUri = null;
    this.prompt = 'select_account';
    this.scopes = [];
    this.state = null;
    this.loginHint = null;
    this.token = null;
  }

  setToken(tokenParams) {
    this.token = tokenParams;
    window.localStorage._googleToken = JSON.stringify(tokenParams);
  }

  setClientId(clientId) {
    this.clientId = clientId;
  }

  setRedirectUri(redirectUri) {
    this.redirectUri = redirectUri;
  }

  setPrompt(prompt) {
    this.prompt = prompt;
  }

  addScope(scope) {
    this.scopes.push(scope);
  }

  setState(state) {
    this.state = state;
  }

  setLoginHint(loginHint) {
    this.loginHint = loginHint;
  }

  /**
   * Getter
   */

  getToken() {
    return this.token ? this.token.access_token : null;
  }

  getAuthUri() {
    // Check required parameters
    if (!this.clientId) throw new Error('Client ID must be assigned with GoogleAuth.setClientId() before');
    if (!this.redirectUri) throw new Error('Redirect URI must be assigned with GoogleAuth.redirectUri() before');
    if (this.scopes.length === 0) throw new Error('Scope must be assigned with GoogleAuth.addScope() before');
    // Define base URI
    const baseUri = 'https://accounts.google.com/o/oauth2/v2/auth';
    // Define required parameters
    const params = {
      client_id: this.clientId,
      redirect_uri: encodeURIComponent(this.redirectUri),
      prompt: this.prompt,
      response_type: 'token',
      include_granted_scopes: true,
      scope: encodeURIComponent(this.scopes.join(' '))
    }
    // Add optional parameters
    if (this.state) params.state = encodeURIComponent(this.state);
    if (this.loginHint) params.login_hint = encodeURIComponent(this.loginHint);
    // Build URI
    return this.buildUri(baseUri, params);
  }

  /**
   * Helper
   **/

  buildUri(baseUri, params) {
    let uri = baseUri;
    for (let key in params) {
      uri = uri + (uri.indexOf('?') === -1 ? '?' : '&') + key + '=' + params[key];
    }
    return uri;
  }

  getHashParams() {
    const hash = window.location.hash.substr(1);
    const hashParts = hash !== '' ? hash.split('&') : [];
    const hashParams = {};
    hashParts.forEach(keyVal => {
      keyVal = keyVal.split('=');
      hashParams[keyVal[0]] = keyVal[1];
    })
    return hashParams;
  }

  cleanHash() {
    const hash = this.getHashParams().state ? '#' + this.getHashParams().state : ' ';
    window.history.replaceState({}, null, hash);
  }

};

module.exports = GoogleAuth;
