const puppeteer = require('puppeteer');


function normalizeParameters(parameters) {
  switch (parameters['type']) {
  case 'song':
    parameters['type'] = 'sounds';
    break;
  case 'album':
    parameters['type'] = 'albums';
    break;
  case 'artist':
    parameters['type'] = 'people';
    break;
  default:
    break;
  }
  return parameters;
}
async function parseTrack(page) {
  const selector = 'a.sound__coverArt';
  const page_items = await page.$$eval(selector, (anchors) => {
    return anchors.map((anchor) => {
      let image;
      try {
        image = anchor.innerHTML.match(/(https:\/\/).+?jpg/g)[0];
      } catch (error) {
        image = '';
      }
      const song = anchor.innerHTML.match(/(aria-label=).+?(?=" aria-role)/gm)[0].slice(12);
      return {
        Song: song,
        Link: anchor.href,
        Image: image
      };
    });
  });
  return page_items;
}

async function parseAlbum(page) {
  const selector = 'a.sound__coverArt';
  const page_items = await page.$$eval(selector, (anchors) => {
    return anchors.map((anchor) => {
      let image;
      try {
        image = anchor.innerHTML.match(/(https:\/\/).+?jpg/g)[0];
      } catch (error) {
        image = '';
      }
      const album = anchor.innerHTML.match(/(aria-label=).+?(?=" aria-role)/gm)[0].slice(12);
      return {
        Album: album,
        Link: anchor.href,
        Image: image
      };
    });
  });
  return page_items;
}
async function parseArtist(page) {
  const selector = 'a.userItem__coverArt';
  const page_items = await page.$$eval(selector, (anchors) => {
    return anchors.map(anchor => {
      const image = anchor.innerHTML.match(/(https:\/\/).+?jpg/g)[0];
      const artist = anchor.innerHTML.match(/(aria-label=).+?(?=" aria-role)/gm)[0].slice(12, -9);
      return {
        Artist: artist,
        Link: anchor.href,
        Image: image
      };
    });
  });
  return page_items;
}
async function parsePage(page, type) {
  switch (type) {
  case 'sounds':
    return parseTrack(page);
  case 'albums':
    return parseAlbum(page);
  case 'people':
    return parseArtist(page);
  default:
    return;
  }
}

async function search(req, res) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const parameters = normalizeParameters(req.body);
  await page.goto(
    `https://soundcloud.com/search/${parameters['type']}?q=${parameters['query']}`);

  let page_items = await parsePage(page, parameters['type']);
  await browser.close();

  page_items = page_items.slice(0, req.body.limit);
  const finalResponse = { data: page_items, Platform: 'soundcloud' };
  res.send(finalResponse);
}

module.exports = {
  search
};
