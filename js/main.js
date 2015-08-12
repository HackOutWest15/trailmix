var startSong = "spotify:track:6WRjufZUoxjaUNKOJ6QhWp"; // Queen of Peace - Florence
//var startSong = "spotify:track:77jVczOFXfbdugN4djsIqs"; // Shoreline
//var startSong = "spotify:track:2sNvitW3TxiTeC9xT9f2ZZ"; // Kygo - Firestone

var playlist = "http://developer.echonest.com/api/v4/playlist/static";

jQuery.ajaxSettings.traditional = true;

var globals = {};
globals.playhead = 0;
var currentSong = {};
var main = document.getElementsByTagName("main");
var nextSongs = [];

// Start
window.onload = function() {
  getStartInfo();
  getSongs(startSong);
}

window.onclick = function(e) {

  closestSong = getClosestSong(e.pageX, e.pageY);

  playSong(closestSong.spotify_uri);

  console.log(closestSong.title + " - " + closestSong.artist);
  getSongs(closestSong.spotify_uri);
}

function getClosestSong(x, y) {
  var cW = $('body').innerWidth();
  var cH = $('body').innerHeight();

  var x = (x / cW) * 2 - 1;
  var y = (y / cH) * 2 - 1;

 var closestSong = false;
  var dist = 2;

  nextSongs.map(function(song) {
    if (vecDistance(song, x, y) < dist) {
      closestSong = song;
      dist = vecDistance(song, x, y);
    }

  });

  return closestSong;
}

function vecDistance(song, x, y){
  return Math.sqrt(Math.pow((song.x - x), 2) + Math.pow((song.y - y), 2));
}


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
  //globals.clear();
  nextSongs.map(songDifference);

  globals.addPoint(0,0, 'red')

  maxX = getMax(nextSongs, 'diffDanceability');
  minX = Math.abs(getMin(nextSongs, 'diffDanceability'));
  maxY = getMax(nextSongs, 'diffEnergy');
  minY = Math.abs(getMin(nextSongs, 'diffEnergy'));

  nextSongs.map(function(song) {

    var x = song.diffDanceability;
    var y = song.diffEnergy;

    if (x <= 0) { x /= minX } else { x /= maxX }
    if (y <= 0) { y /= minY } else { y /= maxY }

    song.x = x;
    song.y = y;
    globals.addPoint(x, y);
  });
}



function songDifference(song) {
  song.diffDanceability = currentSong.danceability - song.danceability;
  song.diffEnergy = currentSong.energy - song.energy;
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

      plotSongs();
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
  var trackID = songId.match(/track\:(.*)/)[1]; //strip the "spotify:" part.
  var reqURL = 'https://api.spotify.com/v1/tracks/' + trackID;
  $.ajax({
    url: reqURL,
    success: function(data) {
      var audioURL = data.preview_url;
      (function() {
        $(".playing").remove()

        var element = document.createElement("audio");
        element.className = "playing";
        element.src = audioURL;
        element.play();

        globals.playhead = 0;
        setInterval(function() { globals.playhead += 0.1 }, 100);

        element.hidden = true;
        document.body.appendChild(element);
      })();
    },
  });
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

