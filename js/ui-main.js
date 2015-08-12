var nodeRadius = 65;
var panSpeed = 20;
var center = new Point($(document).width() / 2, $(document).height() / 2);

var nodePath = new Path({
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

function onFrame(event) {

  if (nodePath.segments.length > 0){
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

      var arc = currentNode.children['arc'];
      arc.removeSegments(1);
      var nxt = getCreateArcInfo(event.time, center);
      arc.arcTo(nxt.through, nxt.to);

    }
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
    return;
  }
  tooltip.visible = true;
  tooltip.position = event.point;
}
function onMouseDrag(event) {
  tooltip.position = event.point;
}

function onMouseUp(event) {
  return;

  nodePath.add(event.point);
  currentNode = new Group([
    new Path.Circle({
      center: event.point,
      radius: nodeRadius,
      strokeWidth: 2,
      strokeColor: 'white'
    }),
    new Path({
      name: 'arc',
      segments: [ event.point - [0, nodeRadius] ],
      strokeWidth: 7,
      strokeColor: 'white'
    }),
    new PointText({
      point: event.point - [0, 0.1 * nodeRadius],
      name: 'text',
      justification: 'center',
      fontSize: 25,
      fillColor: 'white',
      content: 'Node'
    }),
    new PointText({
      point: event.point + [0, 0.3 * nodeRadius],
      name: 'text',
      justification: 'center',
      fontSize: 15,
      fillColor: 'white',
      content: 'Node'
    })
  ]);
  currentNode.data = {
    point: event.point,
    elapsedTime: 0
  };
  //nodeSymbol.definition.children['text'].content = 'New node ' + i;
  //currentNode.children[2].content = 'New node ' + i;
}

function onNextSong(){
  console.log('NEXT SONG', playerInfo.nextSong);

  if (playerInfo.nextSong){
    nodePath.add(tooltip.position);
  }

  // Debug
  setTimeout(onNextSong, 15000)
}
setTimeout(onNextSong, 0)