var maps = []; //array to store images
var mapFocus = 0; //number in array to focus
var mapImages = [];

//these generated dynamically to fit screen
var canvasW = 0;
var canvasH = 0;

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
  var c = createCanvas(document.getElementById("leftCanv").offsetWidth,document.getElementById("leftCanv").offsetHeight, WEBGL);

  c.parent("leftCanv");
  background('#ddd');

  //text('Drag and drop a map or other image here', width/4, height/2);
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
	this.offSetX = xoff - canvasW/2; //WEBGL centers (0,0) on screen, canvasW/2 returns image to top left
	this.offSetY = 50 - canvasH/2;
  this.gridNodes = [];
  gridCols = 10;
  gridRows = 10

  this.makeNew = function(){
    var boxW = int(this.img.width/gridCols*2);
    var boxH = int(this.img.height/gridRows);
    var imgH = this.img.height;
    var imgW = this.img.width;

    for (var x = 0; x <= imgW; x += boxW/2){
      for (var y = 0; y <= imgH; y += boxH){
        this.gridNodes.push([x,y,x/imgW,y/imgH]);
        if((x+boxW/2) <= imgW){
          this.gridNodes.push([x+boxW/2,y,(x+boxW/2)/imgW,y/imgH]);
        }
      }
    }
		this.display();
	}

	this.display = function(){
		//scale(this.zoomScroll);
		push();
		translate(this.offSetX + dragOffX,this.offSetY + dragOffY);
		//image(this.img,0,0,this.img.width,this.img.height);
    beginShape(TRIANGLES);
    stroke(100);
    noFill();
    //texture(this.img);
    textureMode(NORMAL);
    console.log(this.gridNodes);
    for (var i = 0; i < this.gridNodes.length-2;i++){
      vertex(this.gridNodes[i][0], this.gridNodes[i][1], this.gridNodes[i][2], this.gridNodes[i][3]);
      vertex(this.gridNodes[i+1][0], this.gridNodes[i+1][1], this.gridNodes[i+1][2], this.gridNodes[i+1][3]);
      vertex(this.gridNodes[i+2][0], this.gridNodes[i+2][1], this.gridNodes[i+2][2], this.gridNodes[i+2][3]);
    }
    /*for(var x = 0; x <= this.img.width; x += this.img.width/50){
      for(var y = 0; y <= this.img.height; y+= this.img.height/50){
        vertex(int(x),int(y),x/this.img.width,y/this.img.height);
        vertex(int(x+this.img.width/50+25),int(y),(x+this.img.width/50+25)/this.img.width,y/this.img.height)
        console.log(int(x) + " " + int(y) + " " + x/this.img.width + " " + y/this.img.height);
      }
    }*/
    endShape();

    for (var i = 0; i < this.gridNodes.length;i++){
      ellipse(this.gridNodes[i][0], this.gridNodes[i][1],5,5);
    }

    pop();
	};
};
window.onload = function() {
	canvasW = document.getElementById('leftCanv').clientWidth;
	canvasH = document.getElementById('leftCanv').clientHeight;
};
