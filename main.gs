
function canvasserDemo () {
  
  var cv = new Canvasser (document.getElementById("canvas"));
  var block = document.getElementById("block");
  
  // a completely default shape
  cv.addShape();
  
  // some modifications
  cv.addShape({shape:{ x:20, y:10 , width:20, color:'green', z:150 }});
  cv.addShape({shape:{ x:40, y:60 , width:30, color:'yellow', z:50  }});
  
  // when we are not over any shape, turn them all gray
  cv.onShapeExit = function(cs) { 
    block.style.background = 'gray' ;
  };
  
  // when we enter a shape, turn box the same color as the shape
  cv.onShapeEnter = function(cs) { 
      block.style.background = cs.item.shape.color ;
  };
  
  // some data in here
  var blue = cv.addShape({ 
      shape:{x:90, y:30,width:60,height:60,color:'blue',z:50},
      data: {block:'blueblock',something:'blue data'}
  });

  // can copy another
  var pink = cv.addShape(blue.item.shape);
  
  // can tweak it directly
  pink.item.shape.x += pink.item.shape.width;
  pink.item.shape.color = "pink";
  
  // can assign the data directly
  pink.item.data.block = 'pinkblock';
  pink.item.data.something = 'pink data';

  // exchange data when drag ends
  blue.onDragEnd = function (shape, isOver) {
    
    // the element for the dragged item
    var block = document.getElementById(shape.item.data.block);
    block.innerHTML = shape.item.data.something;
    
    if (isOver && isOver.item.data) {
      //then we are positioned over another shape
      var blockOver = document.getElementById(isOver.item.data.block);
      if(blockOver) {
        blockOver.innerHTML = isOver.item.data.something;
        block.innerHTML += "/" + isOver.item.data.something;
      }
    }

  };
  
  // pink will use the same
  pink.onDragEnd = blue.onDragEnd;
  
  // how to do text, and to use the swap position rather than place
  cv.addShape({shape:{x:100,y:100,color:"indigo",width:60,height:40,mode:cv.ENUMS.MODES.SWAP,text:{content:'i will swap'}}});

  // how to do text, and to use the swap position rather than place
  cv.addShape({shape:{x:150,y:110,z:10,color:"lemonchiffon",width:60,height:40,dragz:cv.ENUMS.LAYERS.UNCHANGED,
     text:{fillStyle:'black',content:'i keep z pos'}}});
  
  cv.paintAll();
}
