

var Canvasser = function (canvas) {
  'use strict';
  
  var self = this;

   Object.defineProperty (self , "ENUMS", { 
      value : {  
        // types of shapes supported         
        TYPES: {
          RECTANGLE:1
        },
        
        // default layer parameters 
        LAYERS: {
          ZINDEX:100,
          ONTOP:-2,
          UNCHANGED:-1
        },
        
        // dragging inserting modes
        MODES: {
          SHUFFLE:1,     // everything on the same layer budges down to make room for dragged shape
          SWAP:2,        // items swap positions
          PLACE:3        // dragged item just sits where it landed
        },
        
        FILLS: {
          requestAnimationFrame: window.requestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame,     // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        }
      }  
   });
   
  // SETTINGS for this object
  Object.defineProperty (self , "SETTINGS", { 
    writeable:true,
    value:{

      CURSORS: {
        normal:'default',
        drag:'move',
        eyeDropGrab:'-webkit-grab',
        eyeDrop:'cell',
        out:'not-allowed',
        active:'pointer'
      },

      DEFAULTS: {
        ZINDEX:self.ENUMS.LAYERS.ZINDEX,
        
        ITEM: {
          shape: {
            x:0,
            y:0,
            z:self.ENUMS.LAYERS.ZINDEX,
            height: 50,
            width: 50,
            color: 'black',
            border: {
              width: 2,
              color: 'gray'
            },
            text: {
              content:'',
              font: '10px sans-serif',
              textAlign:'center',
              textBaseline:'alphabetic',
              direction:'inherit',
              fillStyle:'white'
            },
            type:self.ENUMS.TYPES.RECTANGLE,        // for now only do rectangles .. will add an enum for later
            center:false,  // whether the co-ords apply to the center (normally top left) TODO
            visible:true,  // whether to display TODO
            draggable:true,// whether item should be considered for dragging TODO
            mode:self.ENUMS.MODES.PLACE, // how to handle a dragged item
            dragz:self.ENUMS.LAYERS.ONTOP
          },
          data:{        // this can be used to carry around any user required properties
          }
        }
      }
    }
  }); 

  /**
   * the default template for shapes will be added to the shape passed.
   * @type {object}
   */
  Object.defineProperty (self , "defaultItem", { 
    value:self.SETTINGS.DEFAULTS.ITEM,
    writable:true
  });
  
  /**
   * the default template for shapes will be added to the shape passed.
   * @type {object}
   */
  Object.defineProperty (self , "onPaint", { 
    value:function (canvasserShape) {
          
      // these are the things likley to be needed for plotting/ delaing wiht the shape
      var ctx = canvasserShape.canvasser.context;
      var shape = canvasserShape.item.shape;
      var data = canvasserShape.item.data;
      
      if (shape.type === self.ENUMS.TYPES.RECTANGLE) {
        ctx.fillStyle = shape.color;
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        // draw a border if needed
        if (shape.border) {
          ctx.beginPath();
          ctx.lineWidth = shape.border.width;
          ctx.strokeStyle = shape.border.color;
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
          ctx.stroke();
        }
        // add some text if needed
        if (shape.text && shape.text.content) {
          ['font', 'textAlign', 'textBaseline' , 'direction' , 'fillStyle'].forEach (function(d) {
            if (shape.text[d]) ctx[d] = shape.text[d];
          });
          ctx.fillText (shape.text.content,shape.x + shape.width/2 , shape.y + shape.height/2, shape.width);
        }

      }
      else {
        throw 'unknown shape type ' + JSON.stringify(canvasserShape.item);
      }
    },
    writable:true
  });
  
  //----- properties -----------
  /**
   * the canvas element to operate on
   * @type {HTMLCanvasElement}
   */
  Object.defineProperty (self , "canvas", { 
    value:canvas
  });
  
  /**
  * the context object
  * @type {CanvasRenderingContext2D}
  */
  Object.defineProperty (self , "context", { 
    value: self.canvas.getContext("2d")
  });
  
  /**
  * whether dragging is in progress 
  * @type {object}
  */
  Object.defineProperty (self , "dragging", { 
    value: null,
    writable:true
  });
  
  /**
  * add a shape to the shapes known on this canvas
  * @type {object}
  */
  self.addShape = function (shape) {
    
    var cs = new CanvasserShape (shape , self , 1 + self.shapes.reduce(function(p,c) {
      return Math.max (p,c.index);  
    },-1));
    
    self.shapes.push(cs);
    return cs;
  };
  
  /**
  * paint all the shapes associated with this canvas
  * @return  {undefined | CanvasserShape } shape the the point is over
  */
  self.paintAll = function () {
    
    // clear existing canvas content
    self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
    
    // need to sort in Z order
    self.shapes.sort (function(a,b) {
      
      // if its being dragged then always on top
      if (a.dragee) return 1;
      if (b.dragee) return -1;
      
      // now do a regular comparison
      var d = a.item.shape.z - b.item.shape.z;
      return d ? d : a.item.index - b.item.index  ; 
      
    })
    .forEach (function (d) {
      d.paint();
    });
    
    // if this is part of an animation, do it again
    if (self.animating) { 
      self.ENUMS.FILLS.requestAnimationFrame.call (window, self.paintAll);
    }
    
    return self;
  };

  
  /**
  * the current mouse positions relative to the window and to the canvas
  * @type {object}
  */ 
  Object.defineProperty (self , "mouse", { 
    value: new CanvasserMouse (self),
    writable:true
  });

  /**
  * the canvas bounds
  * @type {DOMRect}
  */ 
  Object.defineProperty (self , "bounds", { 
    get: function () { 
      return self.canvas.getBoundingClientRect();
    }
  });
  

  /**
   * the shapes
   * @type {object[]}
   */
  Object.defineProperty (self , "shapes", { 
    value:[],
    writable:true
  });

  

  /**
  * set the canvas cursor style
  * @param {string} the cursor style to set
  */
  self.setCanvasCursor = function (cursor) {
    self.canvas.style.cursor = cursor;
  };


  //---- user callbacks for additional actions - showing skeletons

    /**
   * what to do if a mouse down is detected inside canvas
   * @type {function}
   */ 
  Object.defineProperty (self , "defaulPainter", { 
    value: function (canvasserShape) { 
      // these are the things you might need access to
      var shape = canvasserShape.item.shape;
      var canvas = cannvasserShape.canvas;
      var ctx = canvas.context;
      var data = canvasserShape.item.data;
      
      // this is the plotting - any saving and restoring and tranlation for dragging are already done
      ctx.fillStyle = shape.color;
      ctx.fillRect (shape.x, shape.y, shape.width, shape.height);
      if (shape.border) {
        ctx.beginPath();
        ctx.lineWidth = shape.border.width;
        ctx.strokeStyle = shape.border.color;
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.stroke();
      }
    },
    writable: true
  });
  /**
   * what to do if a mouse down is detected inside canvas
   * @type {function}
   */ 
  Object.defineProperty (self , "onMouseDown", { 
    value: function () { 
        self.dragStart();
    },
    writable: true
  });
  
  /**
   * default user function
   * @type {function}
   */ 
  Object.defineProperty (self , "onDragStart", { 
    value: function (canvasserShape) { 
      // nothing special to do
    },
    writable: true
  });
   /**
  * called when a shape enter event is detected
  * @type {function}
  */
  Object.defineProperty (self , "onShapeEnter", { 
    value:function (canvasserShape) { 
     
    },
    writable:true
  }); 
  
   /**
  * called when a shape exit event is detected
  * @type {function}
  */
  Object.defineProperty (self , "onShapeExit", { 
    value:function (canvasserShape) { 
     
    },
    writable:true
  }); 
  /**
   * what to do if a mouse up is detected inside canvas
   * @type {function}
   */ 
  Object.defineProperty (self , "onMouseUp", { 
    value: function () { 
      if (!self.dragging) {
        
      }
      else {
        self.dragEnd();
      }
    },
    writable: true
  });
  
    /**
   * what to do if entering canvas is detected
   * @type {function}
   */ 
  Object.defineProperty (self , "dragStart", { 
    value: function () { 
      
      // find out what shape is to be dragged
      var props = self.mouse.getProperties();
      
      // note where we started dragging it
      props.focus.dragee = {
        start:  { 
          x:props.window.x,
          y:props.window.y
        }
      };
      
      // note that we are actually dragging
      self.dragging = props.focus;

      // cursor indicates drag is in process
      self.setCanvasCursor (self.SETTINGS.CURSORS.drag);
      
      // kick off animation
      self.animating = true;
      self.paintAll();
      
      // user function
      props.focus.onDragStart(props.focus);
    },
    writable: true
  });
  
  /**
   * what to do if entering canvas is detected
   * @type {function}
   */ 
  Object.defineProperty (self , "onDragEnd", { 
    value: function () {
      // nothing special to do here
    }, 
    writable:true });
  
  /**
   * what to do if entering canvas is detected
   * @type {function}
   */ 
  Object.defineProperty (self , "dragEnd", { 
    value: function () { 
      
      // ending of drag detected
      self.animating = false;
      
      // need to change the active position to where we've dragged it to
      // but need to snap to grid

      var props = self.mouse.getProperties();
      var dragee = self.dragging.dragee;
      var shape = self.dragging.item.shape;
      var originalPos = {
        x : shape.x,
        y : shape.y,
        z : shape.z
      };
      
      if (shape.mode === self.ENUMS.MODES.PLACE || shape.mode === self.ENUMS.MODES.SWAP) {
        
        // mode is PLACE - just dump it where it lands, and leave  other shapes as they are
        shape.x += (props.window.x  - dragee.start.x);
        shape.y += (props.window.y  - dragee.start.y);
        
        // make sure it still fits
        tameShape(shape);
        
        // swap them round
        if(shape.mode === self.ENUMS.MODES.SWAP && props.focus) {
          ['x','y','z'].forEach (function(d){
            props.focus.item.shape[d] = originalPos[d];
          });
        }
      
      }

      else if (shape.mode === self.ENUMS.MODES.SHUFFLE) { 
        throw 'shuffle not yet implemented';
      }

      else {
        throw 'unknown mode ' + JSON.stringify(shape);
      }
      
      // fix up Z layer
      if (shape.dragz !== self.ENUMS.LAYERS.UNCHANGED) {
        if (shape.dragz === self.ENUMS.LAYERS.ONTOP) {
          shape.z = self.shapes.reduce(function(p,c) {
            return isUndefined(p) ? c.item.shape.z : Math.max (p,c.item.shape.z);  
          },undefined) +1 ;  
        }
        else {
          shape.z= shape.dragz;
        }
      }
      // call user function
      self.dragging.onDragEnd(self.dragging , props.focus);
      
      // clear drag as done
      self.dragging.dragee = null;
      self.dragging = null;

      // repaint
      self.paintAll();
      
      // finishing drag - whatever is moving is in its normal position
      self.setCanvasCursor (self.SETTINGS.CURSORS.normal);
     
    },
    writable: true
  });

  // make sure it still fits on canvas and adjust if needed
  function tameShape (shape) {
    if (shape.x < 0) shape.x = 0;
    if (shape.x + shape.width > self.canvas.width) shape.x = canvas.width - shape.x;
    if (shape.y < 0) shape.y = 0;
    if (shape.y + shape.height > self.canvas.height) shape.y = canvas.height - shape.y;
    return shape;
  }
  
  /**
   * what to do if entering canvas is detected
   * @type {function}
   */ 
  Object.defineProperty (self , "onCanvasEnter", { 
    value: function (canvasser) { 
      
      // curssors shows we can do something
      if (canvasser.dragging) {
        
        // if we're sti;; dragging
        canvasser.setCanvasCursor (canvasser.SETTINGS.CURSORS.drag);
      
      }
      else {
        
        canvasser.setCanvasCursor (canvasser.SETTINGS.CURSORS.active);
      }
      
    },
    writable: true
  });
  
  /**
   * what to do if exiting canvas is detected
   * @type {function}
   */ 
  Object.defineProperty (self , "onCanvasExit", { 
    value: function (canvasser) { 

     // cursor gets reset
     canvasser.setCanvasCursor (canvasser.SETTINGS.CURSORS.normal);
     
    },
    writable: true
  });
  
  //----- events ---

  /**
   * window events - mouse move
   * @type {boolean}
   */ 
  window.addEventListener ("mousemove", function (e) {
    
    // keep the old one save
    var oldMouse = self.mouse;
    var wasOutside = !oldMouse || oldMouse.isOutsideCanvas;
    var oldProps = oldMouse ? oldMouse.getProperties() : null;
    var oldFocus = (!wasOutside && oldProps) ? oldProps.focus : null;
    
    // set the new position
    self.mouse = new CanvasserMouse(self).setProperties(e);
    var newProps = self.mouse.getProperties();
    var isOutside = self.mouse.isOutsideCanvas;
    var newFocus = !isOutside ? newProps.focus : null;
    
    // if we're exiting a shape
    if (oldFocus  && (!newFocus || newFocus.index !== oldFocus.index)) {
      oldFocus.onShapeExit (oldFocus);
    }
  
    //maybe we're leaving the canvas
    if (isOutside && !wasOutside) {
      self.onCanvasExit (self); 
    }
    
    //maybe we're entering a canvas
    if (wasOutside && !isOutside) {
      self.onCanvasEnter (self);   
    }
  
    //maybe we're entering a new shape
    if (newFocus  && (!oldFocus || oldFocus.index !== newFocus.index)) { 
      newFocus.onShapeEnter (newFocus);
    }
    
   
    
  },false);
  
  canvas.addEventListener ("mousedown" , function (e) {
    self.onMouseDown();
  }, false);
  
  window.addEventListener ("mouseup" , function (e) {
    self.onMouseUp();  
  }, false);
  
  
};
