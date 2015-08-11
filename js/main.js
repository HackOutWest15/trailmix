var startSong = "spotify:track:6WRjufZUoxjaUNKOJ6QhWp"; // Queen of Peace - Florence
//var startSong = "spotify:track:77jVczOFXfbdugN4djsIqs"; // Shoreline
//var startSong = "spotify:track:2sNvitW3TxiTeC9xT9f2ZZ"; // Kygo - Firestone

var playlist = "http://developer.echonest.com/api/v4/playlist/static";

jQuery.ajaxSettings.traditional = true;

var globals = {};
var currentSong = {};
var main = document.getElementsByTagName("main");
var nextSongs = [];

// Start
getSongs(startSong);


function getStartInfo() {
  callEndpoint(
  "http://developer.echonest.com/api/v4/track/profile",
  {
    bucket: ["audio_summary"],
    id: startSong,
  },
  function(data) {
    var song = data.response.track;
    currentSong = {
        title: song.title,
        artist: song.artist_name,
        spotify_uri: startSong,
        danceability: song.audio_summary.danceability,
        energy: song.audio_summary.energy,
        duration: song.audio_summary.duration,
    };
  });
}
getStartInfo();

function getMax(col, prop) {
  var max = 0;
  col.map(function(obj) {
    if (obj[prop] > max) {
      max = obj[prop];
    }
  });
  return max;
}

function getMin(col, prop) {
  var max = 1;
  col.map(function(obj) {
    if (obj[prop] < max) {
      max = obj[prop];
    }
  });
  return max;
}

function plotSongs() {
  nextSongs.map(function(song) {
    diff = songDifference(song);
  });

  globals.addPoint(0,0, 'red')

  maxX = getMax(nextSongs, 'danceability');
  minX = getMin(nextSongs, 'danceability');
  maxY = getMax(nextSongs, 'energy');
  minY = getMin(nextSongs, 'energy');
  console.logMin

  nextSongs.map(function(song) {
    diff = songDifference(song);

    var x = diff[0];
    var y = diff[1];
    console.log("before "+x+"   "+y);

    if (x <= 0) { x /= minX } else { x /= maxX }
    if (y <= 0) { y /= minY } else { y /= maxY }

    console.log("after "+x+"   "+y);
    globals.addPoint(x, y);
  });
}

function songDifference(song) {
  song.diff = [
    currentSong.danceability - song.danceability,
    currentSong.energy - song.energy
    ];
  return song.diff;
}


function vecDistance(a, b){
  return Math.pow((a[0]-b[0]), 2) + Math.pow((a[1] - b[1]), 2)
}

function processSongs() {

  nextSongs.map(function(song) {
    globals.addPoint(song.danceability, song.energy);
  });
}

function getSongs(s) {
  callEndpoint(
    playlist,
    {
      bucket: ["audio_summary", "id:spotify", "tracks"],
      song_id: s,
      results: 50,
      adventurousness: 0.2,
      type: "artist-radio",
    },

    function(data) {
      var songs = data.response.songs;

      nextSongs = [];

      songs = songs.filter(function(song) {
        if (song.tracks.length > 0) {
          return true;
        } else {
          return false;
        }
      });

      songs.map(function(song) {

        nextSongs.push({
          title: song.title,
          artist: song.artist_name,
          spotify_uri: song.tracks[0].foreign_id,
          danceability: song.audio_summary.danceability,
          energy: song.audio_summary.energy,
          duration: song.audio_summary.duration,
        });
      })

      console.log(data);
    });
}

function getImage(song, element) {
  // Get the album art using spotify's api.
  var trackID = song.match(/track\:(.*)/)[1]; //strip the "spotify:" part.
  var reqURL = 'https://api.spotify.com/v1/tracks/' + trackID;
  $.ajax({
    url: reqURL,
    success: function(data) {
      var imgURL = data.album.images[0].url;
      element.src = imgURL;
    },
  });
}

// Play a song using spotify.
function playSong(songId) {
  var link = document.createElement('a');
  link.href = songId;
  link.click();
  window.focus();
}

// Helper function which calls a given endpoint with my Echo Nest api key.
// JSONP!
function callEndpoint(endp, data, successFn) {
  data.api_key = getEchoNestApiKey();
  data.format = 'jsonp';
  $.ajax({
    url: endp,
    data: data,
    dataType: 'jsonp',
    success: successFn,
    error: function(jqxhr, stat) {
      console.log(stat);
      console.log(jqxhr);
    },
  });
}

function getEchoNestApiKey() {
  return window.echo_nest_api_key;
}

