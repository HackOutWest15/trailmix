console.log("Hi");

var startSong = "spotify:track:6WRjufZUoxjaUNKOJ6QhWp"; //Queen of Peace - Florence

var endpoint = "http://developer.echonest.com/api/v4/artist/similar";
var playlist = "http://developer.echonest.com/api/v4/playlist/static";

jQuery.ajaxSettings.traditional = true;


var main = document.getElementsByTagName("main");

//callEndpoint(
    //playlist,
    //{
      //bucket: ["audio_summary", "id:spotify", "tracks"],
      //song_id: startSong,
      //results: 15,
      //adventurousness: 0.2,
      //type: "artist-radio",
    //},
    //function(data) {
      //var songs = data.response.songs;

      //var div = $("<div id=\"songs\"><div>");
      //songs.map(function(song) {
        //var span = document.createElement('div');
        //span.innerText = song.title;
        //span.onclick = function() {alert(song.artist_name);};
        //div.append(span);
        //console.log(song.title + " - " + song.artist_name + "  dance: " + song.audio_summary.danceability);

      //})
      
      //$('main').append(div);

      ////playSong(songs[2].tracks[0].foreign_id);
      //return console.log(data);
    //});

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

      songs.map(function(song) {
        var span = document.createElement('div');
        span.innerText = song.title + " - " + song.artist_name + "  dance: " + song.audio_summary.danceability;

        span.onclick = function() {
          getSongs(song.tracks[0].foreign_id);
          playSong(song.tracks[0].foreign_id);
        };

        div.append(span);
        //console.log(song.title + " - " + song.artist_name + "  dance: " + song.audio_summary.danceability);

      })

      $('main').append(div);

      //playSong(songs[2].tracks[0].foreign_id);
      return console.log(data);
    });
}

getSongs(startSong);

function getImage(song, element) {
  console.log(song);
  var trackID = song.match(/track\:(.*)/)[1];
  var reqURL = 'https://api.spotify.com/v1/tracks/' + trackID;
  $.ajax({
    url: reqURL,
    success: function(data) {
      console.log(data.album.images[0].url);
      element.src = data.album.images[0].url;
    },
  });

}

function playSong(songId) {
  var link = document.createElement('a');
  link.href = songId;
  link.click();
}

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

// Test function
//function callEcho(name) {
  //$.ajax({
    //url: endpoint,
    //data: {
      //api_key: getEchoNestApiKey(),
      //name: name,
    //},
    //success: function(data, stat) {
      //for(var i = 0; i < 10; i++) {
        //console.log(data.response.artists[i].name);
      //}

    //},
  //});
//}

function getEchoNestApiKey() {
  return window.localStorage.getItem('echo-nest_api-key');
}


