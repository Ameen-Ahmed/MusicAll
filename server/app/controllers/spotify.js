const request = require('request');

const credentials = {
  client_id: process.env.SPOTIFY_CLIENT_ID,
  client_secret: process.env.SPOTIFY_CLIENT_SECRET
};


function normalizeParameters(parameters) {
  if (parameters['type'] == 'song') {
    parameters['type'] = 'track';
  } parameters['limit'];
  return parameters;
}

function parseTrack(response) {
  const response_items = [];
  JSON.parse(response)['tracks']['items'].forEach(element => {
    response_items.push({
      Song: element['name'],
      Artist: element['artists'][0]['name'],
      Link: element['external_urls']['spotify'],
      Image: element['album']['images'][1]['url']
    });
  });
  return response_items;
}

function parseAlbum(response) {
  const response_items = [];
  JSON.parse(response)['albums']['items'].forEach(element => {
    response_items.push({
      Album: element['name'],
      Artist: element['artists'][0]['name'],
      Link: element['external_urls']['spotify'],
      Image: element['images'][1]['url']
    });
  });
  return response_items;
}

function parseArtist(response) {
  const response_items = [];
  JSON.parse(response)['artists']['items'].forEach(element => {
    try {
      response_items.push({
        Artist: element['name'],
        Link: element['external_urls']['spotify'],
        Image: element['images'][1]['url']
      });
    } catch (error) {
      return;
    }

  });
  return response_items;
}

function parseResponse(response, type) {
  switch (type) {
  case 'track':
    return parseTrack(response);
  case 'album':
    return parseAlbum(response);
  case 'artist':
    return parseArtist(response);
  default:
    return;
  }
}

function get_token() {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(credentials.client_id + ':' +
      credentials.client_secret).toString('base64');

    var opts = {
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + payload
      },
      body: "grant_type=client_credentials"
    };
    request(opts, (err, res, body) => {
      if (err) {
        console.log('ERROR:', err);
        console.log('STATUS:', res.statusCode);
        reject(err);
      }
      resolve(JSON.parse(body).access_token);
    });
  });
}

async function search(req, res) {
  const token = await get_token();
  var opts = {
    url: `https://api.spotify.com/v1/search`,
    qs: {
      query: req.body.query,
      type: req.body.type,
      limit: req.body.limit,
    },
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token
    }
  };
  opts['qs'] = normalizeParameters(opts['qs']);
  request(opts, function (err, resp, body) {
    if (err) {
      console.log('ERROR:', err);
      console.log('STATUS:', resp.statusCode);
    }
    const parsedResponse = parseResponse(body, opts['qs']['type']);
    const finalResponse = { data: parsedResponse, Platform: 'spotify' };
    res.send(finalResponse);
  });
}

module.exports = {
  search
};
