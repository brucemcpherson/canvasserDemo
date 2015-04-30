/**
 * this is a shape wrapper object - one of these is needed for each shape on the canvas
 * they are addede via Canvasser so unlikly to be created directly
 * @param {object} shape the shape object .. should be {shape:..., data:... anything else.. not used by canvasser}, will be added to the defaultShape
 * @param {Canasser} canvasser the Canvasser parent object
 * @param {number} index - the index number to resolve plot order when z-index matches
 * @return {CanvasserShape} the completed shape
 */
var CanvasserShape = function (shape, canvasser,index) {
  
  'use strict';
  var self = this;
  
 /**
  * backlink to parent canvasser
  * @type {Canvasser}
  */
  Object.defineProperty (self , "canvasser", { 
    value:canvasser
  }); 
  
 /**
  * shape index - resolves sorting if z-values are equal
  * @type {number}
  */
  Object.defineProperty (self , "index", { 
    value:index
  }); 
  
 /**
  * shape name - can be useful for debugging
  * @type {number}
  */
  Object.defineProperty (self , "name", { 
    value:'shape-'+index.toString(),
    writable:true
  }); 
  
 /**
  * the shape property is merged with the default item
  * @type {object}
  */
  Object.defineProperty (self , "item", { 
    value:extend( clone(shape) || {} , clone(self.canvasser.defaultItem)),
    writable:true
  }); 
  
  
  /**
  * can make a save of origina.current values
  * @type {object}
  */
  Object.defineProperty (self , "save", { 
    value:function () {
      self.item.original = clone(self.item.shape);
    },
    writable:true
  });
  // handy for a reset
  self.save();
  
 /**
  * reset back to orogina;/saved values
  * @type {object}
  */
  Object.defineProperty (self , "restore", { 
    value:function () {
      self.item.shape = clone(self.item.original);
    },
    writable:true
  });
  
  /**
  * paint a shape - takes care of translations, then calls user definabel onPaint
  */
  
  self.paint = function() {
   
    var canvasser = self.canvasser;
    var ctx = canvasser.context;
    var shape = self.item.shape;
  
    // save context
    ctx.save();
    
    // do any translating for dragee
    if (self.canvasser.dragging && canvasser.dragging.index === self.index) {

        // always show dragee on top
        ctx.globalCompositeOperation = "source-over";
        var props = canvasser.mouse.getProperties();
        
        // the shape being dragged recorded the initial mouse position when it was selected.
        // we just need to draw it again in the new spot, translated by the difference between here and there
       ctx.translate( 
         props.window.x - canvasser.dragging.dragee.start.x,
         props.window.y - canvasser.dragging.dragee.start.y
       );
    
    }
    // paint the object
    self.onPaint(self);
    
    // get context back
    ctx.restore();
  };
 /**
  * the shape property is merged with the default item
  * @type {function}
  */
  Object.defineProperty (self , "onPaint", { 
    value:function (canvasserShape) { 
      self.canvasser.onPaint (canvasserShape);
    },
    writable:true
  });  
  
  /**
  * user configurable drag end
  * @type {function}
  */
  Object.defineProperty (self , "onDragEnd", { 
    value:function (dragee , focus) { 
      self.canvasser.onDragEnd(dragee, focus);
    },
    writable:true
  }); 
   /**
  * user configurable drag start
  * @type {function}
  */
  Object.defineProperty (self , "onDragStart", { 
    value:function (focus) { 
      self.canvasser.onDragEnd(focus);
    },
    writable:true
  }); 
 /**
  * called when a shape enter event is detected
  * @type {function}
  */
  Object.defineProperty (self , "onShapeEnter", { 
    value:function (canvasserShape) { 
      self.canvasser.onShapeEnter(canvasserShape);
    },
    writable:true
  }); 
  
   /**
  * called when a shape exit event is detected
  * @type {function}
  */
  Object.defineProperty (self , "onShapeExit", { 
    value:function (canvasserShape) { 
      self.canvasser.onShapeExit(canvasserShape);
    },
    writable:true
  }); 
  
 
  
};
