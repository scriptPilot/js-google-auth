# JavaScript Google OAuth2 Wrapper

This wrapper provides you simplified functionality to handle the Google OAuth2 process. The token is stored in the local storage and will be restored after page reload until you sign-out the user.

More information about the process:
https://developers.google.com/identity/protocols/OAuth2UserAgent

You can use the token to proceed with other wrappers:

* [JavaScript Google Drive Wrapper](https://github.com/scriptPilot/js-google-drive)
* [JavaScript Google Photos Wrapper](https://github.com/scriptPilot/js-google-photos)
* [JavaScript Google Contacts Wrapper](https://github.com/scriptPilot/js-google-contacts)

You can use the token as well for any other Google REST API.

## Installation

`npm install --save js-google-auth`

## Usage

```js
// Load module
const Auth = require('js-google-auth');

// Create new instance
const auth = new Auth();

// Assign client id and redirect uri
auth.setClientId('your-google-client-id');
auth.setRedirectUri('your-redirect-uri');

// Add scope (repeat for each scope)
auth.addScope('https://www.googleapis.com/auth/contacts');

// Use methods
auth.signIn();
```

## Methods

**setClientId(clientId)**

To set the client ID received from the Google API console.

* clientId: string

**setRedirectUri(redirectUri)**

To set the redirect URI. Must be allowed in the Google API console before.

* redirectUri: string

**addScope(scope)**

To add a scope. You find a list of all scopes here:
https://developers.google.com/identity/protocols/googlescopes

* scope: <string>
  
**setPrompt(type)**

Optional. A space-delimited, case-sensitive list of prompts to present the user. If you don't specify this parameter, the user will be prompted only the first time your app requests access. Possible values are:

* none
* consent
* select_account

Default: select_account

**setState(state)**

Specifies any string value that your application uses to maintain state between your authorization request and the authorization server's response. The server returns the exact value that you send as a name=value pair in the hash (#) fragment of the redirect_uri after the user consents to or denies your application's access request.

- state: string

**setLoginHint(hint)**

If your application knows which user is trying to authenticate, it can use this parameter to provide a hint to the Google Authentication Server. The server uses the hint to simplify the login flow either by prefilling the email field in the sign-in form or by selecting the appropriate multi-login session.

- hint: string

**getToken()**

Return the users OAuth2 token or null. Use this method to decide whether the user is signed-in or not.

**signIn()**

Start the sign-in process: Redirect to Google, prompt the login / select account page, come back to your App and update the token information. Or similiar, if you have modiefied the behavior with the methods above.

**signOut()**

Remove the token from the App and the local storage.

## Example

This example will handle the sign-in / sign-out process and display five names of your Google Contacts.
For this example, please install jQuery as well with `npm install --save jquery`.

```js
/**
 * Load modules
 */

const Auth = require('js-google-auth');
const $ = require('jquery');

/**
 * Google authentication object
 */

const auth = new GoogleAuth();
auth.setClientId('your-google-client-id');
auth.setRedirectUri('your-redirect-uri');
auth.addScope('https://www.googleapis.com/auth/contacts');

/**
 * If no access token found
 */

if (!auth.getToken()) {

  // Show sign-in button;
  const button = $('body').append('<button>Sign-in to Google</button>');
  button.click($.proxy(auth.signIn, auth));

/**
 * If access token found
 */

} else {

  // Show token
  $('body').append('<pre><b>Token</b>: ' + auth.getToken() + '</pre>');

  // Show sign-out button
  const button = $('body').append('<button>Google sign-out</button>');
  button.click(() => {
    $.proxy(auth.signOut(), auth);
    window.location.reload();
  });

  // Do API request
  const restUri = 'https://people.googleapis.com/v1/people/me/connections'
                + '?pageSize=5&personFields=names'
                + '&access_token=' + auth.getToken();
  $.get(restUri, data => {
    $('body').append('<p><b>Contacts</b></p>');
    data.connections.forEach(contact => {
      $('body').append('<p>- ' + contact.names[0].displayName + '</p>');
    });
  });

}
```
