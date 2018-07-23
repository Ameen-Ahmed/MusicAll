const request = require('request');

function normalizeParameters(parameters) {
  if (parameters['entity'] == 'artist') {
    parameters['entity'] = 'musicArtist';
  }
  else if (parameters['entity'] == 'track') {
    parameters['entity'] = 'song';
  }
  return parameters;
}

function parseTrack(response) {
  const response_items = [];
  JSON.parse(response)['results'].forEach(element => {
    response_items.push({
      Song: element['trackName'],
      Artist: element['artistName'],
      Link: element['trackViewUrl'],
      Image: element['artworkUrl100']
    });
  });
  return response_items;
}

function parseAlbum(response) {
  const response_items = [];
  JSON.parse(response)['results'].forEach(element => {
    response_items.push({
      Album: element['collectionName'],
      Artist: element['artistName'],
      Link: element['collectionViewUrl'],
      Image: element['artworkUrl100']
    });
  });
  return response_items;
}

function parseArtist(response) {
  const response_items = [];
  JSON.parse(response)['results'].forEach(element => {
    response_items.push({
      Artist: element['artistName'],
      Link: element['artistLinkUrl'],
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
  case 'musicArtist':
    return parseArtist(response);
  default:
    return;
  }
}

async function search(req, res) {
  var opts = {
    url: "https://itunes.apple.com/search",
    qs: {
      term: req.body.query,
      media: 'music',
      entity: req.body.type,
      limit: req.body.limit,
      country: 'US',
    },
    method: "GET",
  };
  opts['qs'] = normalizeParameters(opts['qs']);
  request(opts, function (err, resp, body) {
    if (err) {
      console.log('ERROR:', err);
      console.log('STATUS:', res.statusCode);
    }
    const parsedResponse = parseResponse(body, opts['qs']['entity']);
    const finalResponse = { data: parsedResponse, Platform: 'itunes' };
    res.send(finalResponse);
  });
}

module.exports = {
  search
};
