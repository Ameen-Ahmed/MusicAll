const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const path = require('path');


function parseTrack(response) {
  const response_items = [];
  response.forEach(element => {
    response_items.push({
      Song: element['snippet']['title'],
      Artist: element['snippet']['channelTitle'],
      Link: `https://www.youtube.com/watch?v=` + element['id']['videoId'],
      Image: element['snippet']['thumbnails']['medium']['url']
    });
  });
  return response_items;
}

function parseAlbum(response) {
  const response_items = [];
  response.forEach(element => {
    response_items.push({
      Album: element['snippet']['title'],
      Artist: element['snippet']['channelTitle'],
      Link: `https://www.youtube.com/playlist?list=` + element['id']['playlistId'],
      Image: element['snippet']['thumbnails']['medium']['url']
    });
  });
  return response_items;
}

function parseArtist(response) {
  const response_items = [];
  response.forEach(element => {
    response_items.push({
      Artist: element['snippet']['title'],
      Link: `https://www.youtube.com/channel/` + element['id']['channelId'],
      Image: element['snippet']['thumbnails']['medium']['url']
    });
  });
  return response_items;
}

function parseResponse(response, type) {
  switch (type) {
  case 'video':
    return parseTrack(response);
  case 'playlist':
    return parseAlbum(response);
  case 'channel':
    return parseArtist(response);
  default:
    return;
  }
}


// If modifying these scopes, delete your previously saved credentials
// at ./credentials/youtube-nodejs.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const CREDENTIALS_DIR = path.join(__dirname, 'credentials');
const TOKEN_PATH = path.join(CREDENTIALS_DIR, 'youtube-nodejs.json');

function normalizeParameters(parameters) {
  parameters['maxResults'] = parameters['limit'];
  parameters['q'] = parameters['query'];
  parameters['part'] = 'snippet';
  if (parameters['type'] == 'artist') {
    parameters['type'] = 'channel';
  } else if (parameters['type'] == 'song') {
    parameters['type'] = 'video';
  } else {
    parameters['type'] = 'playlist';
  }
  delete parameters['query'];
  delete parameters['limit'];
  return parameters;
}


// Load client secrets from a local file.
async function search(req, res) {
  fs.readFile(path.join(CREDENTIALS_DIR, 'client_secret.json'), function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), req.body, res, searchListByKeyword);
  });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, requestData, res, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, requestData, res, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, requestData, res);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, requestData, res, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, requestData);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(CREDENTIALS_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}


function searchListByKeyword(auth, requestData, res) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData);
  parameters = normalizeParameters(parameters);
  parameters['auth'] = auth;
  service.search.list(parameters, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    const parsedResponse = parseResponse(response.data.items, parameters['type']);
    const finalResponse = { data: parsedResponse, Platform: 'youtube' };
    res.send(finalResponse);
  });
}

module.exports = {
  search,
};
