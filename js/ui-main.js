var nodeRadius = 65;
var panSpeed = 20;
var center = new Point($(document).width() / 2, $(document).height() / 2);

var tooltipWidth = 160;
var tooltipHeight = 80;
var tooltipCornerRadius = 40;

var nodePath = new Path({
  segments: [center],
  strokeWidth: 4,
  strokeColor: '#fff',
  strokeJoin: 'round',
  opacity: 0.3
});
var tooltip = new Group({
  children: [
    new Path.Circle({
      name: 'circle',
      center: [0, 0],
      radius: 30,
      strokeWidth: 2,
      strokeColor: 'white',
      opacity: 0.5,
      visible: false
    }),
    new PointText({
      name: 'label',
      point: [-50, 0],
      justification: 'right',
      fontSize: 18,
      fillColor: 'white'
    })
  ],
  pivot: [0, 0],
  visible: false
});

globals.initUI = function() {
  currentNode = createNode(center,
    playInfo.currentSong.title, playInfo.currentSong.artist);
}

function onFrame(event) {
  if (globals.beginning){
    return;
  }

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
  updateTooltip(event.point);
  tooltip.visible = true;
}
function onMouseDrag(event) {
  updateTooltip(event.point);
}
function onMouseUp(event) {
  tooltip.children['circle'].visible = true;
}

function updateTooltip(point){
  tooltip.position = point;
  playInfo.nextSong = getClosestSong(point.x, point.y);
  tooltip.children['label'].content = 
    'Songs along the lines of\n' + 
    playInfo.nextSong.title + ' by ' + playInfo.nextSong.artist;
  tooltip.children['circle'].visible = false;
}

globals.onSongEnd = function(){
  // Reset progress on node
  var progress = currentNode.children['progress'];
  progress.removeSegments(1);
  if (playInfo.nextSong){ // Transition to new node
    nodePath.add(tooltip.position);
    currentNode = createNode(tooltip.position, playInfo.nextSong.title, playInfo.nextSong.artist);
    tooltip.visible = false;
  }
  else{ // Update song info on current node
    var songLabel = currentNode.children['song'];
    var artistLabel = currentNode.children['artist'];
    songLabel.content = playInfo.currentSong.title;
    artistLabel.content = playInfo.currentSong.artist;
  }
}

function createNode(point, song, artist){
  var node = new Group([
      new Path.Circle({
        center: point,
        radius: nodeRadius,
        strokeWidth: 2,
        strokeColor: 'white',
        opacity: 0.5
      }),
      new Path({
        name: 'progress',
        segments: [ point - [0, nodeRadius] ],
        strokeWidth: 7,
        strokeColor: 'white',
        opacity: 0.6
      }),
      new PointText({
        point: point - [0, 0.1 * nodeRadius],
        name: 'song',
        justification: 'center',
        fontSize: 16,
        fillColor: 'white',
        content: song
      }),
      new PointText({
        point: point + [0, 0.3 * nodeRadius],
        name: 'artist',
        justification: 'center',
        fontSize: 10,
        fillColor: 'white',
        content: artist
      })
    ]);
    node.data = {
      point: point,
      elapsedTime: 0
    };
    return node;
}