# JavaScript Google OAuth2 Wrapper

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



```js
// Create new Google Auth object
const auth = new GoogleAuth();

// Set required values
auth.setClientId('your-google-client-id');
auth.setRedirectUri('your-redirect-uri');
auth.addScope('https://www.googleapis.com/auth/contacts'); // repeat for each scope

// Set optional values
auth.setPrompt('select_account'); // select_account by default
auth.setState('someCrazyApplicationState');
auth.setLoginHint('max@example.com');

// Get token
auth.getToken(); // returns null if not signed-in

// Start sign-in procedure
auth.signIn();

// Start sign-out procedure
auth.signOut();
```

More information:
https://developers.google.com/identity/protocols/OAuth2UserAgent

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
