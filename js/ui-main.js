var nodeRadius = 65;
var panSpeed = 20;
var center = new Point($(document).width() / 2, $(document).height() / 2);

var nodePath = new Path({
  segments: [center],
  strokeWidth: 4,
  strokeColor: '#fff',
  strokeJoin: 'round'
});
var tooltip = new Path.Circle({
  radius: nodeRadius,
  fillColor: 'green',
  visible: false
});

// Setup Parallax
//$('#parallax').parallax();

globals.initUI = function() {
  createNode(center, playInfo.currentSong.title, playInfo.currentSong.artist);
}

function onFrame(event) {
  var seg = nodePath.segments[nodePath.segments.length - 1];
    var dv = center - seg.point;
    if (dv.length > panSpeed){
      project.activeLayer.translate(dv.normalize() * panSpeed);

      //$('.bg-tile1').css({ 'transf' translate()} { left: $('.bg-tile1').offset().left - 10 });
      //var x = $('.bg-tile1').data('translateX') || 0;
      //x += dv.x;
      //$('.bg-tile1').animate({ 'transform': 'translateX(400px)' });
      //$('.bg-tile1').animate({ transform: 'rotate(90deg)' }, 'slow'); //{ transform: 'translateX(100px)' });​
      //$('.bg-tile1').data('translateX', x);
    }
    else {
      if (dv.length > 0)
        project.activeLayer.translate(dv);

      // Pulsating scale
      //var sine = 1 + 0.002 * Math.sin(3 * event.time);
      //currentNode.scale(sine);

      // Update node
      var progress = currentNode.children['progress'];
      progress.removeSegments(1);
      var arcInfo = getCreateArcInfo(2 * Math.PI * playInfo.playhead, center);
      progress.arcTo(arcInfo.through, arcInfo.to);

    }
}
function getCreateArcInfo(degrees,center){
  return {
      from: {
          x: center.x,
          y: center.y - nodeRadius
      },
      through: {
          x: center.x + Math.sin(degrees/2) * nodeRadius,
          y: center.y - Math.cos(degrees/2) * nodeRadius
      },
      to: {
          x: center.x + Math.sin(degrees) * nodeRadius,
          y: center.y - Math.cos(degrees) * nodeRadius
      },
  }
}
function onMouseDown(event) {
  if (tooltip.visible && event.item == tooltip){
    tooltip.visible = false;
    playInfo.nextSong = undefined;
    return;
  }
  tooltip.visible = true;
  tooltip.position = event.point;
  playInfo.nextSong = getClosestSong(event.point.x, event.point.y);
}
function onMouseDrag(event) {
  tooltip.position = event.point;
  playInfo.nextSong = getClosestSong(event.point.x, event.point.y);
}
function onMouseUp(event) {
}

globals.onSongEnd = function(){
  if (playInfo.nextSong){
    nodePath.add(tooltip.position);
    createNode(tooltip.position, playInfo.nextSong.title, playInfo.nextSong.artist);
  }
  else{
    // Reset node
    var progress = currentNode.children['progress'];
    progress.removeSegments(1);
    var arcInfo = getCreateArcInfo(0, center);
    progress.arcTo(arcInfo.through, arcInfo.to);

    var songLabel = currentNode.children['song'];
    var artistLabel = currentNode.children['artist'];
    songLabel.content = 'Slut.'; // playInfo.currentSong.song;
    artistLabel.content = 'Slut.'; // playInfo.currentSong.artist;
  }
}

function createNode(point, song, artist){
  currentNode = new Group([
      new Path.Circle({
        center: point,
        radius: nodeRadius,
        strokeWidth: 2,
        strokeColor: 'white'
      }),
      new Path({
        name: 'progress',
        segments: [ point - [0, nodeRadius] ],
        strokeWidth: 7,
        strokeColor: 'white'
      }),
      new PointText({
        point: point - [0, 0.1 * nodeRadius],
        name: 'song',
        justification: 'center',
        fontSize: 25,
        fillColor: 'white',
        content: song
      }),
      new PointText({
        point: point + [0, 0.3 * nodeRadius],
        name: 'artist',
        justification: 'center',
        fontSize: 15,
        fillColor: 'white',
        content: artist
      })
    ]);
    currentNode.data = {
      point: point,
      elapsedTime: 0
    };
}