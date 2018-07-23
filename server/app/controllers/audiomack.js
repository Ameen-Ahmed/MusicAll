const request = require('request');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const credentials = {
  CONSUMER_KEY: process.env.AUDIOMACK_CONSUMER_KEY,
  SECRET_KEY: process.env.AUDIOMACK_SECRET_KEY,
};


function parseTrack(response) {
  const response_items = [];
  JSON.parse(response)['results'].forEach(element => {
    response_items.push({
      Song: element['title'],
      Artist: element['artist'],
      Link: `https://audiomack.com/song/${element['uploader']['url_slug']}/${element['url_slug']}`,
      Image: element['image']
    });
  });
  return response_items;
}

function parseAlbum(response) {
  const response_items = [];
  JSON.parse(response)['results'].forEach(element => {
    response_items.push({
      Album: element['title'],
      Artist: element['artist'],
      Link: `https://audiomack.com/album/${element['uploader']['url_slug']}/${element['url_slug']}`,
      Image: element['image']
    });
  });
  return response_items;
}

function parseArtist(response) {
  const response_items = [];
  JSON.parse(response)['results'].forEach(element => {
    response_items.push({
      Artist: element['name'],
      Link: `https://audiomack.com/artist/${element['url_slug']}`,
      Image: element['image']
    });
  });
  return response_items;
}

function parseResponse(response, type) {
  switch (type) {
  case 'song':
    return parseTrack(response);
  case 'album':
    return parseAlbum(response);
  case 'artist':
    return parseArtist(response);
  default:
    return;
  }
}

function search(req, res) {
  const oauth = OAuth({
    consumer: {
      key: credentials.CONSUMER_KEY,
      secret: credentials.SECRET_KEY
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
  });

  const request_data = {
    url: `https://api.audiomack.com/v1/search?q=${req.body.query}&show=${req.body.type}s&limit=${req.body.limit}`,
    method: 'GET',
    data: { oauth_callback: 'oob' }
  };

  request({
    url: request_data.url,
    // NOTE: qs parameters don't seem to work with the use of the Request API and OAuth: https://github.com/request/request/issues/204
    method: request_data.method,
    headers: oauth.toHeader(oauth.authorize(request_data))
  }, function (error, response, body) {
    const parsedResponse = parseResponse(body, req.body.type);
    const finalResponse = { data: parsedResponse, Platform: 'audiomack' };
    res.send(finalResponse);
  });
}

module.exports = {
  search
};
