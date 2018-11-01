

function extend () {
  // we have a variable number of arguments
  if (!arguments.length) {
    // default with no arguments is to return undefined 
    return undefined;
  }
  
  // validate we have all objects
  var extenders = [],targetOb;
  for (var i = 0; i < arguments.length; i++) {
    if(arguments[i]) {
      if (!isObject(arguments[i])) {
        throw 'extend arguments must be objects not ' + arguments[i];
      }
      if (i ===0 ) {
        targetOb = arguments[i];
      } 
      else {
        extenders.push (arguments[i]);
      }
    }
  }
  
  // set defaults from extender objects
  extenders.forEach(function(d) {
      recurse(targetOb, d);
  });
  
  return targetOb;
 
  // run do a deep check
  function recurse(tob,sob) {
    Object.keys(sob).forEach(function (k) {
    
      // if target ob is completely undefined, then copy the whole thing
      if (isUndefined(tob[k])) {
        tob[k] = sob[k];
      }
      
      // if source ob is an object then we need to recurse to find any missing items in the target ob
      else if (isObject(sob[k])) {
        recurse (tob[k] , sob[k]);
      }
      
    });
  }
}
function clone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}
/** 
* isObject
* check if an item is an object
* @memberof DbAbstraction
* @param {object} obj an item to be tested
* @return {boolean} whether its an object
*/
function isObject (obj) {
  return obj === Object(obj);
}

/** 
 * check if item is undefined
 * @param {*} item the item to check
 * @return {boolean} whether it is undefined
 **/
function isUndefined (item) {
  return typeof item === 'undefined';
}

