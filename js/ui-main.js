nodeRadius = 65;
panSpeed = 20;
center = new Point($(document).width() / 2, $(document).height() / 2);

var nodePath = new Path({
  strokeWidth: 10,
  strokeColor: '#fa7'
});

function onFrame(event) {
  if (nodePath.segments.length > 0){
    var seg = nodePath.segments[nodePath.segments.length - 1];
    var dv = center - seg.point;
    if (dv.length > panSpeed){

      project.activeLayer.translate(dv.normalize() * panSpeed);

      //$('.bg-tile1').css({ 'transf' translate()} { left: $('.bg-tile1').offset().left - 10 });

      $('.bg-tile1').css('transform', 'translateX(' + 10 + 'px)');

    }
    else {
      if (dv.length > 0)
        project.activeLayer.translate(dv);

      // Pulsating scale
      var sine = 1 + 0.002 * Math.sin(3 * event.time);
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
function onMouseUp(event) {
  nodePath.add(event.point);

  data = {
    point: event.point,
    elapsedTime: 0
  };
  var arcStart = event.point - [0, nodeRadius];
  currentNode = new Group([
    new Path.Circle({
      center: event.point,
      radius: nodeRadius,
      strokeWidth: 2,
      strokeColor: 'white'
    }),
    new Path({
      name: 'arc',
      segments: [ arcStart ],
      strokeWidth: 7,
      strokeColor: 'white'
    }),
    new PointText({
      point: event.point,
      name: 'text',
      justification: 'center',
      fontSize: 25,
      fillColor: 'white',
      content: 'Node'
    })
  ]);
  currentNode.data = data;
  // getCreateArcInfo(0, event.point)

  //currentNode.children['outer'].from = event.downPoint;
  //currentNode.children['outer'].to = event.point;
  //

  
  //nodeSymbol.definition.children['text'].content = 'New node ' + i;
  //currentNode.children[2].content = 'New node ' + i;
}
function onMouseMove(event){

}