var maps = []; //array to store images
var mapFocus = 0; //number in array to focus
var mapImages = [];

//these generated dynamically to fit screen
var canvaswidth = 0;
var canvasheight = 0;

//interface interactivity vars
var dragDiffX = 0;
var dragDiffY = 0;
var dragOffX = 0;
var dragOffY = 0;
var dragging = false;

new p5();

setup = function() {
  // create canvas
  noLoop();

  var c = createCanvas(document.getElementById("leftCanv").offsetWidth,document.getElementById("leftCanv").offsetHeight);
  c.parent("leftCanv");
  background('#fff');

  text('Drag and drop a map or other image here', width/4, height/2);

  c.drop(gotFile);
};

draw = function(){};

gotFile = function(file) {
  //console.log(file);
  if (file.type === 'image') {
    // Create an image DOM element and add to maps array
    // console.log("We're currently seeing: "+file.data)
    loadImage(file.data,addMap);//callback to addMap once image loaded
    //array mapImages holds map images for three.js access
    //images also added to Map objects
    //double storage should be consolidated in future versions
    //currently unable to access img file from Map class for three.js, possible because
    //stored as a p5 filetype (using file.data might fix)
    mapImages.push(file.data);
    //console.log('map focus: ' + mapFocus);
  } else {
    console.log('Not an image file!');
  }
};

addMap = function(imgLoaded){
  var offX = 30; //margin with edge of canvas
  if(maps.length > 0){
    offX = maps[mapFocus].img.width + 50;
  }
  append(maps,new Map('map'+maps.length,1,imgLoaded,offX, maps.length));
  mapFocus = maps.length - 1; //change focus to last uploaded map
  maps[mapFocus].makeNew();
};

//map class, contains main data structure
function Map(name, opac, img, xoff, id){
	this.name = name;
	this.opac = opac;
	this.img = img;
	this.id = id;
	this.offSetX = xoff;
	this.offSetY = 50;

  this.makeNew = function(){
    //insert triangulation code
		this.display();
	}

	this.display = function(){
		//scale(this.zoomScroll);
		push();
		translate(this.offSetX + dragOffX,this.offSetY + dragOffY);
		image(this.img,0,0,this.img.width,this.img.height);
    pop();
	};
};
window.onload = function() {
	canvaswidth = document.getElementById('leftCanv').clientWidth;
	canvasheight = document.getElementById('leftCanv').clientHeight;
};
