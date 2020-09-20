var maps = []; //array to store images
var mapFocus = 0; //number in array to focus
var mapImages = [];

//these generated dynamically to fit screen
var canvasW = 0;
var canvasH = 0;

var offX = 0; //margin with edge of canvas

//interface interactivity vars
var dragging = false;
var drawTrias = false;
var gridColsDefault = 5;
var gridRowsDefault = 5;

var mode = "stretching";

new p5();

setup = function() {
  // create canvas
  noLoop();
  var c = createCanvas(document.getElementById("leftCanv").offsetWidth,document.getElementById("leftCanv").offsetHeight, WEBGL);

  c.parent("leftCanv");
  background('#fff');

  //text('Drag and drop a map or other image here', width/4, height/2);
  c.drop(gotFile);
};

draw = function(){};

gotFile = function(file) {
  if (file.type === 'image') {
    // Create an image DOM element and add to maps array
    // console.log("We're currently seeing: "+file.data)
    loadImage(file.data,addMap);//callback to addMap once image loaded
    mapImages.push(file.data);
    //console.log('map focus: ' + mapFocus);
  } else {
    console.log('Not an image file!');
  }
};

addMap = function(imgLoaded){
  if(maps.length > 0){
    offX = maps[mapFocus].img.width + 50;
  }
  append(maps,new Map('map'+maps.length,1,imgLoaded,offX, maps.length));
  mapFocus = maps.length - 1; //change focus to last uploaded map
  maps[mapFocus].makeNew();
};

function mousePressed(){
  if(mode == 'stretching' || mode == 'moving'){
    maps[mapFocus].dragLock();
  } else if(mode == 'splittingH' || mode == 'splittingV'){
    //console.log('split');
    maps[mapFocus].split();
  }
}

function mouseDragged(){
  if(mode == 'stretching' || mode == 'moving'){
    if(dragging){
      maps[mapFocus].dragging();
    } else {
      maps[mapFocus].selectionBox();
    }
  } else if(mode == 'splittingH' || mode == 'splittingV'){

  } else if(mode == 'moveMap'){
    maps[mapFocus].dragMap();
  }
}

function mouseReleased(){
  if(mode == 'stretching' || mode == 'moving'){
    dragging = false;
    maps[mapFocus].display();
  } else if(mode == 'splitting'){

  }
}

function mouseWheel(event){
  maps[mapFocus].zoom(event.delta);
  return false;
}

function mX(){
  var x = (mouseX - maps[mapFocus].offSetX);
  return x;
}

function mY(){
  var y = (mouseY - maps[mapFocus].offSetX);
  return y;
}

//map class, contains main data structure
function Map(name, opac, img, xoff, id){
	this.name = name;
	this.opac = opac;
	this.img = img;
	this.id = id;
	this.offSetXcorner = 0 - canvasW/2; //WEBGL centers (0,0) on screen, canvasW/2 returns image to top left
	this.offSetYcorner = 0 - canvasH/2;
  this.offSetX = 20; //offset away from the corner, must be calculated with mouse positions
  this.offSetY = 20;
  this.gridNodes = [];
  this.draggingNodes = [];
  this.trias = [];
  this.gridCols = 5;
  this.gridRows = 5;
  this.mouseXpos;
  this.mouseYpos;
  var imgH = this.img.height;
  var imgW = this.img.width;

  this.makeNew = function(){
   //this.gridNodes = [];
    clear();
    this.gridNodes = [];
    var boxW = this.img.width/this.gridCols;
    var boxH = this.img.height/this.gridRows;
    console.log('boxW: ' + boxW + ' boxH: ' + boxH);
    console.log('cols: ' + this.gridCols + ' rows: ' + this.gridRows);
    //squares
    for(var x = 0; x < this.gridCols; x++){
      for(var y = 0; y < this.gridRows;y++){
        var xx = x*boxW;
        var yy = y*boxH;

        this.gridNodes.push([xx, yy,xx, yy]);
        this.gridNodes.push([xx+boxW, yy,xx+boxW, yy]);
        this.gridNodes.push([xx+boxW, yy+boxH,xx+boxW, yy+boxH]);
        this.gridNodes.push([xx, yy+boxH,xx, yy+boxH]);
      }
    }

    console.log(this.gridNodes.length);
		this.display();
	}

	this.display = function(){
		//scale(this.zoomScroll);
    stroke(100);
    noFill();
    clear();

		push();
      translate(this.offSetXcorner+this.offSetX,this.offSetYcorner+this.offSetY);
      textureMode(IMAGE);
      texture(this.img);
      this.drawMesh();
      fill(0,0);
      this.drawNodes();
      if(drawTrias){
        fill(0,0);
        this.drawMesh();
        this.drawNodes();
      }
      pop();
	};

  this.drawMesh = function(){
    //console.log(this.gridNodes);

      for(var i = 0; i < this.gridCols*this.gridRows*4; i+=4){
        beginShape();
        vertex(this.gridNodes[i][0],this.gridNodes[i][1],this.gridNodes[i][2],this.gridNodes[i][3]);
        vertex(this.gridNodes[i+1][0],this.gridNodes[i+1][1],this.gridNodes[i+1][2],this.gridNodes[i+1][3]);
        vertex(this.gridNodes[i+2][0],this.gridNodes[i+2][1],this.gridNodes[i+2][2],this.gridNodes[i+2][3]);
        vertex(this.gridNodes[i+3][0],this.gridNodes[i+3][1],this.gridNodes[i+3][2],this.gridNodes[i+3][3]);
        vertex(this.gridNodes[i][0],this.gridNodes[i][1],this.gridNodes[i][2],this.gridNodes[i][3]);
        endShape();
      }
    }

  this.drawNodes = function(){
    for (var i = 0; i < this.gridNodes.length;i++){
      ellipse(this.gridNodes[i][0], this.gridNodes[i][1],5,5);
    }
  }

  this.zoom = function(z){
    for (var i = 0; i < this.gridNodes.length;i++){
      if(z < 0){
        this.gridNodes[i][0] *= 1.6;
        this.gridNodes[i][1] *= 1.6;
      } else if(z > 0){
        this.gridNodes[i][0] *= 0.625;
        this.gridNodes[i][1] *= 0.625;
      }
    }
    this.display();
  }

  this.dragLock = function(){
    this.mouseXpos = mouseX;
    this.mouseYpos = mouseY;
    //determines which nodes are locked for dragging and adds them to the draggingNodes array
    this.draggingNodes = []; //clear array first

    for (var i = 0; i < this.gridNodes.length; i++){
      if (dist(mX(), mY(), this.gridNodes[i][0], this.gridNodes[i][1]) < 10){
        dragging = true;
        console.log('true');
        this.draggingNodes.push([i,mouseX-this.gridNodes[i][0],mouseY-this.gridNodes[i][1]]); //[node#,diffX,diffY]
      }
    }
  };

  this.dragging = function(nodeNo){
    for(var i = 0; i < this.draggingNodes.length; i++){
      this.gridNodes[this.draggingNodes[i][0]][0] = mouseX - this.draggingNodes[i][1];
      this.gridNodes[this.draggingNodes[i][0]][1] = mouseY - this.draggingNodes[i][2];
      //if moving mode, then uvs need to be adjusted
      if(mode == 'moving'){
        this.gridNodes[this.draggingNodes[i][0]][2] = (mouseX - this.draggingNodes[i][1]);
        this.gridNodes[this.draggingNodes[i][0]][3] = (mouseY - this.draggingNodes[i][2]);
      }
    }
    this.display();
  };

  this.selectionBox = function(){
    if(this.draggingNodes.length == 0){
      this.display();

      push();
      translate(this.offSetXcorner,this.offSetYcorner);
      rect(this.mouseXpos,this.mouseYpos,mouseX-this.mouseXpos, mouseY-this.mouseYpos);
      pop();
    }
  }

  this.dragMap = function(){
    this.offSetX = mouseX - this.offSetX;
    this.offSetY = mouseY - this.offSetY;
    this.display();
  }

  this.split = function(){
    var splitNodes = [];
    //find nodes close to click and store in splitNodes
    for (var i = 0; i < this.gridNodes.length; i++){
      if (dist(mX(), mY(), this.gridNodes[i][0], this.gridNodes[i][1]) < 10){
        splitNodes.push(i);
      }
    }

    if(mode == 'splittingH' && splitNodes.length > 1){
      for(var i = 0; i < splitNodes.length; i++){
        if(i < splitNodes.length/2){
          this.gridNodes[splitNodes[i]][0] -= 10;
        } else {
          this.gridNodes[splitNodes[i]][0] += 10;
        }
      }
    }

    if(mode == 'splittingV' && splitNodes.length > 1){
      for(var i = 0; i < splitNodes.length; i++){
        if(i % 2 == 0){
          this.gridNodes[splitNodes[i]][1] -= 10;
        } else {
          this.gridNodes[splitNodes[i]][1] += 10;
        }
      }
    }

    this.display();
  }

  this.changeColNum = function(no){
    this.gridCols = no;
    //console.log("ht" + no)
    this.makeNew();
  }

  this.changeRowNum = function(no){
    this.gridRows = no;
    this.makeNew();
  }

};
window.onload = function() {
	canvasW = document.getElementById('leftCanv').clientWidth;
	canvasH = document.getElementById('leftCanv').clientHeight;
};
