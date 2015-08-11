var startSong = "spotify:track:6WRjufZUoxjaUNKOJ6QhWp"; //Queen of Peace - Florence

var playlist = "http://developer.echonest.com/api/v4/playlist/static";

jQuery.ajaxSettings.traditional = true;

var main = document.getElementsByTagName("main");
var nextSongs = [];

// Start
getSongs(startSong);


function vecDistance(a, b){
  return Math.pow((a[0]-b[0]), 2) + Math.pow((a[1] - b[1]), 2)
}

function getSongs(s) {
  callEndpoint(
    playlist,
    {
      bucket: ["audio_summary", "id:spotify", "tracks"],
      song_id: s,
      results: 15,
      adventurousness: 0.2,
      type: "artist-radio",
    },

    function(data) {
      var songs = data.response.songs;

      var div = $("<div class=\"songs\"><div>");

      var img = document.createElement("img");
      getImage(s, img);
      div.append(img);

      nextSong = [];

      songs.map(function(song) {
        var span = document.createElement('div');
        span.innerText = song.title + " - " + song.artist_name + "  dance: " + song.audio_summary.danceability + "  eng: " + song.audio_summary.energy;

        span.onclick = function() {
          getSongs(song.tracks[0].foreign_id);
          playSong(song.tracks[0].foreign_id);
        };

        div.append(span);

        nextSongs.push({
          title: song.title,
          artist: song.artist_name,
          spotify_uri: song.tracks[0].foreign_id,
          danceablility: song.audio_summary.danceability,
          energy: song.audio_summary.energy,
          duration: song.audio_summary.duration,
        });
      })

      $('main').append(div);

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

