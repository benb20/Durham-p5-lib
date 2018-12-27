/**
 * 
 * The p5.EasyCam library - Easy 3D CameraControl for p5.js and WEBGL.
 *
 *   Copyright 2018 by Thomas Diewald (https://www.thomasdiewald.com)
 *
 *   Source: https://github.com/diwi/p5.EasyCam
 *
 *   MIT License: https://opensource.org/licenses/MIT
 * 
 * 
 * explanatory notes:
 * 
 * p5.EasyCam is a derivative of the original PeasyCam Library by Jonathan Feinberg 
 * and combines new useful features with the great look and feel of its parent.
 * 
 * 
 */
 
//
// This example shows how to render a scene using a custom shader for lighting.
//
// Per Pixel Phong lightning:
//
// The lighting calculations for the diffuse and specular contributions are
// all done in the fragment shader, per pixel.
//
// Light-positions/directions are transformed to camera-space before they are 
// passed to the shader.
//

// NOTES
// Could include a clickable form with information about each planet


var easycam;
var phongshader;


// material defs
var matWhite  = { diff:[1   ,1   ,1   ], spec:[1,1,1], spec_exp:200.0 };
var matDark   = { diff:[0.2 ,0.3 ,0.4 ], spec:[1,1,1], spec_exp:400.0 };
var matRed    = { diff:[1   ,0.05,0.01], spec:[1,0,0], spec_exp:400.0 };
var matBlue   = { diff:[0.01,0.05,1   ], spec:[0,0,1], spec_exp:400.0 };
var matGreen  = { diff:[0.05,1   ,0.01], spec:[0,1,0], spec_exp:400.0 };
var matYellow = { diff:[1   ,1   ,0.01], spec:[1,1,0], spec_exp:400.0 };

var materials = [ matWhite, matRed, matBlue, matGreen, matYellow ];

// these later should use an updated constructor method, i.e:
// var mercury = new planet(radius, colour, pos) where:
// var mercury = new planet()

var mercury; // gray 4880KM (diameter)
var venus; // pale yellow 12104KM
var earth; // blue with white clouds 12756KM 
var mars; // reddish brown 6794KM
var jupiter; // orange and white bands 142,984KM
var saturn; // pale gold 108728KM
var uranus; // pale blue 51118KM
var neptune; // pale blue 49632KM 


function Planet(radius) {
  this.radius = radius;
  //this.colour = colour;

}



// light defs

var ambientlight = { col : [0,0,0] };

var directlights = [
  { dir:[-1,-1,0], col:[0,0,0] },
];

var pointlights = [
  { pos:[0,0,0,1], col:[1.00, 1.00, 1.00], rad:450 },
  { pos:[0,0,0,1], col:[1.00, 0.00, 0.40], rad:200 },
  { pos:[0,0,0,1], col:[0.00, 0.40, 1.00], rad:200 },
  { pos:[0,0,0,1], col:[1.00, 0.40, 0.00], rad:300 },
  { pos:[0,0,0,1], col:[0.10, 0.40, 1.00], rad:300 },
];


// geometry
  var torus_def = {
  r1 : 100,
  r2 : 15,
};

function setup () {
  
  pixelDensity(1);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
 
  //var phong_vert = document.getElementById("phong.vert").textContent;
  //var phong_frag = document.getElementById("phong.frag").textContent;
  
  phongshader = new p5.Shader(this._renderer, phong_vert, phong_frag);
  
  
  var state1 = {
    distance : 2000,
    center   : [0,0,0],
    rotation : [1,1,0,0],
  };
    
  var state2 = {
    distance: 400,
    center  : [0, 0, 60],
    rotation: [0.81146751, 0.5188172, 0.127647, -0.2367598],
  };
  
  console.log(Dw.EasyCam.INFO); //easycam info
  
  // initialise camera
  easycam = new Dw.EasyCam(this._renderer, state1); // easycame is a p5.js library used for easy 3D camera control
  //https://github.com/diwi/p5.EasyCam review easycam here
  

  // set some new state, animated
  easycam.setState(state2, 1500);
  
  easycam.state_reset = state2;
  easycam.setDefaultInterpolationTime(1000); //
}



function windowResized() {
	if(!easycam) return; //easycam has a boolean value?
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0,0,windowWidth, windowHeight]);
}


function draw () {
  if(!easycam) return;
  
  setShader(phongshader);
 
  setAmbientlight(phongshader, ambientlight);
  addDirectlight(phongshader, directlights, 0);
 
  // projection
  perspective(60 * PI/180, width/height, 1, 20000);
  
  // clear BG
  background(0);
  noStroke();
 
  push();  
  {
    
    var ang1 = map(mouseX, 0, width, -1, 1);
    var ang = sin(frameCount * 0.01) * 0.2;
    var ty = torus_def.r1 * 2 + (1-abs(ang)) * 100;
    
    //This is the point white light from above
    push();  
      rotateX( (ang+1) * PI/2);
      translate(0, ty, 0);
      addPointLight(phongshader, pointlights, 0); //instead of this we could implement new pointlight?
    pop();
    

    //This is the blue light being rotating around the ground
    push();  
      rotateZ(frameCount * 0.02);
      translate(180, 0, 10);
      addPointLight(phongshader, pointlights, 4);
    pop();
    
    
  }
  pop();
  
 
  //////////////////////////////////////////////////////////////////////////////
  //
  // scene, material-uniforms
  //
  //////////////////////////////////////////////////////////////////////////////
  
  // reset shader, after fill() was used previously
  setShader(phongshader);
  
  // ground  
  push();  
  translate(0, 0, 0);
  setMaterial(phongshader, matWhite);
  box(1000, 1000, 10);
  pop();

}



function setShader(shader){
  shader.uniforms.uUseLighting = true; // required for p5js
  this.shader(shader);
}


function setMaterial(shader, material){
  shader.setUniform('material.diff'    , material.diff);
  shader.setUniform('material.spec'    , material.spec);
  shader.setUniform('material.spec_exp', material.spec_exp);
}


function setAmbientlight(shader, ambientlight){
  shader.setUniform('ambientlight.col', ambientlight.col);
}


var m4_modelview = new p5.Matrix();
var m3_directions = new p5.Matrix('mat3');

function addDirectlight(shader, directlights, idx){ //idx is an index number
  
  // inverse transpose of modelview matrix for transforming directions
  // its probably faster however to transform a startpoint and endpoint
  // using the modelviewmat and creating a direction from that.
  // TODO: profiling
  m4_modelview.set(easycam.renderer.uMVMatrix);
  m3_directions.inverseTranspose(m4_modelview);
  
  var light = directlights[idx]; //access the array at index idx to provide a certain colour
  
  // normalize direction
  var [x,y,z] = light.dir;
  var mag = Math.sqrt(x*x + y*y + z*z); // should not be zero length
  var light_dir = [x/mag, y/mag, z/mag];
  
  // transform to camera-space
  light_dir = mult(m3_directions, light_dir);
  
  // set shader uniforms
  shader.setUniform('directlights['+idx+'].dir', light_dir);
  shader.setUniform('directlights['+idx+'].col', light.col);
}


function addPointLight(shader, pointlights, idx){ //initialises a pointlight (idx = index)
  
  var light = pointlights[idx];
  
  light.pos_cam = mult(easycam.renderer.uMVMatrix, light.pos);
  
  shader.setUniform('pointlights['+idx+'].pos', light.pos_cam);
  shader.setUniform('pointlights['+idx+'].col', light.col);
  shader.setUniform('pointlights['+idx+'].rad', light.rad);
  
  var col = light.col;
  
  // display it as a filled sphere
  fill(col[0]*255, col[1]*255, col[2]*255);
  sphere(2);
}









//
// transforms a vector by a matrix (m4 or m3)
//
function mult(mat, vSrc, vDst){
  
  vDst = ((vDst === undefined) || (vDst.constructor !== Array)) ? [] : vDst;
  
  var x ,y ,z, w;
  
  if(vSrc instanceof p5.Vector){
    x = vSrc.x
    y = vSrc.y;
    z = vSrc.z;
    w = 1;
  } else if(vDst.constructor === Array){
    x = vSrc[0];
    y = vSrc[1];
    z = vSrc[2];
    w = vSrc[3]; w = (w === undefined) ? 1 : w;
  } else {
    console.log("vSrc must be a vector");
  }
  
  if(mat instanceof p5.Matrix){
    mat = mat.mat4 || mat.mat3;
  }
  
  if(mat.length === 16){
    vDst[0] = mat[0]*x + mat[4]*y + mat[ 8]*z + mat[12]*w,
    vDst[1] = mat[1]*x + mat[5]*y + mat[ 9]*z + mat[13]*w,
    vDst[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
    vDst[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w; 
  } 
  else if(mat.length === 9) {
    vDst[0] = mat[0]*x + mat[3]*y + mat[6]*z,
    vDst[1] = mat[1]*x + mat[4]*y + mat[7]*z,
    vDst[2] = mat[2]*x + mat[5]*y + mat[8]*z;
  }
 
  return vDst;
}







(function () {
 
  var loadJS = function(filename){
    var script = document.createElement("script");
    script.setAttribute("type","text/javascript");
    script.setAttribute("src", filename);
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  loadJS("https://rawgit.com/diwi/p5.EasyCam/master/p5.easycam.js");
 
  document.oncontextmenu = function() { return false; }
  document.onmousedown   = function() { return false; }
 
})();



