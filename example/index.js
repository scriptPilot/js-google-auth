/**
 * Load modules
 */

import Auth from '../';
import $ from 'jquery';

/**
 * Load configuration
 * (Workaround with fs-extra, as there is an issue with JSON load by Parcel Bundler)
 */

import config from './config.json';

/**
 * Google authentication object
 */

const auth = new Auth();
auth.setClientId(config.googleClientId);
auth.setRedirectUri(config.googleRedirectUri);
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
