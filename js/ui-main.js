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

    function onFrame(event) {
      if (nodePath.segments.length > 0){
        var seg = nodePath.segments[nodePath.segments.length - 1];
        var dv = center - seg.point;
        if (dv.length > 1){
          project.activeLayer.translate(dv.normalize()); 
        }
        else {
          currentNode.scale(1.001);
        }
      }
    }
    function onMouseUp(event) {
      nodePath.add(event.point);
      currentNode = nodeSymbol.place(event.point);

      //currentNode.children['outer'].from = event.downPoint;
      //currentNode.children['outer'].to = event.point;
    }