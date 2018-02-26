# JavaScript Google OAuth2 Wrapper

This wrapper provides you simplified functionality to handle the Google OAuth2 process. The token is stored in the local storage and will be restored after page reload until you sign-out the user.

This module is considered to work in the browser and in Electron applications.

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
import GoogleAuth from 'js-google-auth';

// Create new instance
const auth = new GoogleAuth({
  clientId: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  redirectUri: 'your-script-uri',
  scope: ['https://www.googleapis.com/auth/contacts']
});

// Use methods
if (!auth.getToken()) {
  auth.signIn();
} else {
  console.log(`Token: ${auth.getToken()}`);
}
```

## Methods

### constructor(options)

While creating a new instance, the constructor method is called.

Options:
- clientId - `string` to receive from the [Google API console](https://console.developers.google.com/)
- clientSecret - `string` to receive from the [Google API console](https://console.developers.google.com/)
- redirectUri - `string` to configure in the [Google API console](https://console.developers.google.com/) (not required for Electron)
- scope - `string/array` one as string or more as array, see [overview at Google](https://developers.google.com/identity/protocols/googlescopes) (optional)
- onTokenChange - `function` which is called on every token change (optional)

Example:
```js
const auth = new GoogleAuth({
  clientId: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  redirectUri: 'your-script-uri',
  scope: ['https://www.googleapis.com/auth/contacts'],
  onTokenChange: (token) => {
    // you can update the Token for other wrappers now
  }
});
```

### getToken()

Returns token or null. Use this function to check if the user is signed-in or not.

### signIn(callback)

Starts the sign-in process. In the browser with redirect, in Electron within a new browser window.

After successful sign-in, the credentials are stored in the local storage and restored after reload.

The callback function is optional.

Example:
```js
auth.signIn((error) => {
  if (error) console.error(error);
  else console.log('signed-in');
})
```

### signOut(callback)

Removes the credentials from the instance and from the local storage.
