console.log("Hi");

var startSong = "spotify:track:6WRjufZUoxjaUNKOJ6QhWp"; //Queen of Peace - Florence

var endpoint = "http://developer.echonest.com/api/v4/artist/similar";
var playlist = "http://developer.echonest.com/api/v4/playlist/static";

jQuery.ajaxSettings.traditional = true;

callEndpoint(
    playlist,
    {
      bucket: ["audio_summary", "id:spotify", "tracks"],
      song_id: startSong,
      results: 15,
      adventurousness: 0.2,
      type: "artist-radio",
    },
    function(data) {
      var songs = data.response.songs;

      songs.map(function(song) {
        //main = document.body.getElementsByTagName("main");
        console.log(song.title + " - " + song.artist_name + "  dance: " + song.audio_summary.danceability);

      })

      playSong(songs[2].tracks[0].foreign_id);
      return console.log(data);
    });


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


