var startSong = "spotify:track:6WRjufZUoxjaUNKOJ6QhWp"; // Queen of Peace - Florence
//var startSong = "spotify:track:77jVczOFXfbdugN4djsIqs"; // Shoreline
//var startSong = "spotify:track:2sNvitW3TxiTeC9xT9f2ZZ"; // Kygo - Firestone

const playlist = "http://developer.echonest.com/api/v4/playlist/static";

// Needed to make the api requests work.
jQuery.ajaxSettings.traditional = true;

var globals = {};
globals.playhead = 0;
var playInfo = {
  playhead: 0,
  currentSong: {},
  nextSongs: [],
};


// Start
window.onload = function() {
  getStartInfo();
  getSongs(startSong);
}

function click(e) {
  closestSong = getClosestSong(e.pageX, e.pageY);

  playSong(closestSong.spotify_uri);

  console.log(closestSong.title + " - " + closestSong.artist);
  //getSongs(closestSong.spotify_uri);
}

function getClosestSong(x, y) {
  var cW = $('body').innerWidth();
  var cH = $('body').innerHeight();

  var x = (x / cW) * 2 - 1;
  var y = (y / cH) * 2 - 1;

  var closestSong = false;
  var dist = 2;

  playInfo.nextSongs.map(function(song) {
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
    playInfo.currentSong = {
        title: song.title,
        artist: song.artist_name,
        spotify_uri: startSong,
        paramX: song.audio_summary.energy,
        paramY: song.audio_summary.tempo,
    };
  });
}

// This should be a reduce, not a map. What was I thinking?
function getMax(col, prop) {
  var max = -1e9; // This is WRONG. But it works in this case.
  col.map(function(obj) {
    if (obj[prop] >= max) {
      max = obj[prop];
    }
  });
  return max;
}

// This should be a reduce, not a map. What was I thinking?
function getMin(col, prop) {
  var min = 1e9; // This is WRONG. But it works in this case.
  col.map(function(obj) {
    if (obj[prop] <= min) {
      min = obj[prop];
    }
  });
  return min;
}

function plotSongs() {
  playInfo.nextSongs.map(songDifference);

  maxX = getMax(playInfo.nextSongs, 'diffParamX');
  minX = Math.abs(getMin(playInfo.nextSongs, 'diffParamX'));
  maxY = getMax(playInfo.nextSongs, 'diffParamY');
  minY = Math.abs(getMin(playInfo.nextSongs, 'diffParamY'));

  playInfo.nextSongs.map(function(song) {

    var x = song.diffParamX;
    var y = song.diffParamY;

    if (x <= 0) { x /= minX } else { x /= maxX }
    if (y <= 0) { y /= minY } else { y /= maxY }

    song.x = x * -1; // The energy axis was in the wrong direction.
    song.y = y;
    //globals.addPoint(x, y);
  });
}


function songDifference(song) {
  song.diffParamX = playInfo.currentSong.paramX - song.paramX;
  song.diffParamY = playInfo.currentSong.paramY - song.paramY;
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

      playInfo.nextSongs = [];

      songs = songs.filter(function(song) {
        if (song.tracks.length > 0) {
          return true;
        } else {
          return false;
        }
      });

      songs.map(function(song) {

        playInfo.nextSongs.push({
          title: song.title,
          artist: song.artist_name,
          spotify_uri: song.tracks[0].foreign_id,
          paramX: song.audio_summary.energy,
          paramY: song.audio_summary.tempo,
        });
      })

      window.onclick = click; // workaround. Only needs to be set the first time.
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
  const playDuration = 20;
  var intervalID;

  playInfo.playhead = 0;

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
        console.log(audioURL);
        if (audioURL) {
          element.src = audioURL;
          element.play();

          setTimeout(function() {
            playInfo.playhead = 0;
            clearInterval(intervalID);
            element.pause();

          }, playDuration * 1000);

          intervalID = setInterval(function() { playInfo.playhead += 0.1 }, 100);

          element.hidden = true;
          document.body.appendChild(element);
        }
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

