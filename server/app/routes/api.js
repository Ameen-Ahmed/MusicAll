const router = require('express').Router();
const spotify = require('../controllers/spotify');
const youtube = require('../controllers/youtube');
const itunes = require('../controllers/itunes');
const soundcloud = require('../controllers/soundcloud');
const audiomack = require('../controllers/audiomack');


router.post('/spotify', (req, res, next) => {
  next();
}, spotify.search);

router.post('/youtube', (req, res, next) => {
  next();
}, youtube.search);

router.post('/itunes', (req, res, next) => {
  next();
}, itunes.search);

router.post('/soundcloud', (req, res, next) => {
  next();
}, soundcloud.search);

router.post('/audiomack', (req, res, next) => {
  next();
}, audiomack.search);

module.exports = router;
