center = new Point($(document).width() / 2, $(document).height() / 2);
var nodePath = new Path({
  strokeWidth: 10,
  strokeColor: '#fa7'
});

var nodeGroup = new Group([
  new Path.Circle({
    name: 'inner',
    radius: 40,
    strokeWidth: 2,
    strokeColor: 'white'
  }),
  new Path.Arc({
    name: 'outer',
    strokeWidth: 7,
    strokeColor: 'white'
  }),
  new PointText({
    justification: 'center',
    fontSize: 25,
    fillColor: 'white',
    content: 'Text'
  })
]);
var nodeSymbol = new Symbol(nodeGroup);

//var progress = new Size(30, 100);
//var progressRect = new Path.Rectangle(new Point(0, 0), progress);
//progressRect.fillColor = 'blue';
//globals.rect = progressRect;

//function onFrame(event) {
  //progressRect.width = globals.playhead;
//}

function onMouseUp(event) {
  nodePath.add(event.point);
  currentNode = nodeSymbol.place(event.point);

  //currentNode.children['outer'].from = event.downPoint;
  //currentNode.children['outer'].to = event.point;
}



globals.addPoint = function addPoint(x, y, color) {
  color = color || 'black';

  x *= 0.5;
  x += 0.5;
  x *= view.size.width;

  y *= 0.5;
  y += 0.5;
  y *= view.size.height;

  var myCircle = new Path.Circle(new Point(x, y), 5);
  myCircle.fillColor = color;
}

globals.clear = function() {
  project.clear();
};
