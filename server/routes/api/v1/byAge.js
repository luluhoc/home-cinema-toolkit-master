import express from 'express';
import axios from 'axios';
import normalizeUrl from 'normalize-url';
import low from 'lowdb';
// DB CONFIG

const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db/byAge.json');
const db = low(adapter);

// router
const router = express.Router();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(function(){
  if (typeof Object.defineProperty === 'function'){
    try{Object.defineProperty(Array.prototype,'sortBy',{value:sb}); }catch(e){}
  }
  if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

  function sb(f){
    for (var i=this.length;i;){
      var o = this[--i];
      this[i] = [].concat(f.call(o,o,i),o);
    }
    this.sort(function(a,b){
      for (var i=0,len=a.length;i<len;++i){
        if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
      }
      return 0;
    });
    for (var i=this.length;i;){
      this[--i]=this[i][this[i].length-1];
    }
    return this;
  }
})();

router.post('/', async (req, res) => {
  db.read()
  console.log('Start');
  const {
    radarrUrl, radarrApi, v3,
  } = req.body;
  const apiUrl = normalizeUrl(`${radarrUrl}${v3 ? '/api/v3/movie' : '/api/movie'}`);

  const radarrGet = {
    method: 'get',
    url: `${apiUrl}`,
    headers: {
      'User-Agent': 'request',
      'X-Api-Key': radarrApi,
    },
  };

  let movies;
  const moviesOmdb = [];
  db.unset('movies').write();
  db.set('movies', []).write();

  try {
    const moviesFromRadarr = await axios(radarrGet);
    movies = moviesFromRadarr.data;
    db.set('movies', movies);
    console.log(movies[5].added);
    const newArr = movies.sortBy(function(o){ return o.added });
    console.log(newArr[0])
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
  console.log('Sending movies to Frontend');

});

router.post('/diskspace', async (req, res) => {
  db.read()
  console.log('Start');
  const {
    radarrUrl, radarrApi, v3,
  } = req.body;
  const apiUrl = normalizeUrl(`${radarrUrl}${v3 ? '/api/v3/diskspace' : '/api/diskspace'}`);

  const radarrGet = {
    method: 'get',
    url: `${apiUrl}`,
    headers: {
      'User-Agent': 'request',
      'X-Api-Key': radarrApi,
    },
  };

  try {
    const diskspace = await axios(radarrGet);
    
    console.log(diskspace)
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
  console.log('Sending movies to Frontend');

});

module.exports = router;