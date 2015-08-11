console.log("Hi");

var endpoint = "http://developer.echonest.com/api/v4/artist/similar";

function callEcho() {
  $.ajax({
    url: endpoint,
    data: {
      api_key: getEchoNestApiKey(),
      name: "Todd Terje",
    },
    success: function(data, stat) {
      for(var i = 0; i < 10; i++) {
        console.log(data.response.artists[i].name);
      }

    },
  });
}

function getEchoNestApiKey() {
  return window.localStorage.getItem('echo-nest_api-key');
}


