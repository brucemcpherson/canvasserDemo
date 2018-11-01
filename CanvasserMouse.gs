/**
 * manage the mouse position
 * @param {Canasser} canvasser the conttrolling object
 * @return {CanvasserMouse}
 */
function CanvasserMouse(canvasser) {
   
    'use strict';
    
    var self = this;
    var mouse_ = {window:{x:undefined,y:undefined}};
    
     /**
  * backlink to parent canvasser
  * @type {Canvasser}
  */
  Object.defineProperty (self , "canvasser", { 
    value:canvasser
  }); 
  
    
  self.getProperties = function() {
     
   // use current current mouse position to calculate this stuff
   var pos = {
      window:mouse_.window,
      canvas:{ 
        x:mouse_.window.x - self.canvasser.bounds.left,
        y:mouse_.window.y - self.canvasser.bounds.top
      },
      focus: null
    };
    
    // get the current shape focus. which will be sorted in painted order
    if (!isUndefined(pos.window.x)) {
      pos.focus = self.canvasser.shapes.reduce (function (p,c) {
        var shape = c.item.shape;
        
        // only worls for rectangles for now
        return (pos.canvas.x >= shape.x && pos.canvas.x < shape.x + shape.width && 
            pos.canvas.y >= shape.y && pos.canvas.y < shape.y + shape.height) ? c : p;

      },undefined);
     
    }
    
    return pos;
  };
   
   self.setProperties = function(e) {
    mouse_ = {
      window: {
        x:e.clientX,
        y:e.clientY
      }
    };
    return self;
   };

  /**
   * whether the mouse is currently positioned over the canvas
   * @type {boolean}
   */ 
  Object.defineProperty (self , "isOutsideCanvas", { 
    get: function () { 
      var bounds = self.canvasser.bounds;
      var properties = self.getProperties();
      return (
        typeof properties.window.x === typeof undefined ||
        properties.window.x < bounds.left || 
        properties.window.y < bounds.top ||
        properties.window.x > bounds.right ||
        properties.window.y > bounds.bottom 
        
      );
    }
  });
  
}
 

