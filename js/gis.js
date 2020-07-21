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
var gridColsDefault = 20;
var gridRowsDefault = 10;

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
    }
  } else if(mode == 'splittingH' || mode == 'splittingV'){

  }
}

function mouseReleased(){
  if(mode == 'stretching' || mode == 'moving'){
    dragging = false;
    maps[mapFocus].display();
  } else if(mode == 'splitting'){

  }
}

//map class, contains main data structure
function Map(name, opac, img, xoff, id){
	this.name = name;
	this.opac = opac;
	this.img = img;
	this.id = id;
	this.offSetX = 0 - canvasW/2; //WEBGL centers (0,0) on screen, canvasW/2 returns image to top left
	this.offSetY = 0 - canvasH/2;
  this.gridNodes = [];
  this.draggingNodes = [];
  this.trias = [];
  this.gridCols = 5;
  this.gridRows = 5;
  var imgH = this.img.height;
  var imgW = this.img.width;

  this.makeNew = function(){
   //this.gridNodes = [];
    clear();
    this.gridNodes = [];
    var boxW = int(this.img.width/this.gridCols);
    var boxH = int(this.img.height/this.gridRows);

    for (var x = 0; x < imgW - boxW; x += boxW){
      for (var y = 0; y < imgH; y += boxH){
        //top left triangle of box
        this.gridNodes.push([x,y,x/imgW,y/imgH]);
        this.gridNodes.push([x+boxW,y,(x+boxW)/imgW,y/imgH]);
        this.gridNodes.push([x,y+boxH,x/imgW,(y+boxH)/imgH]);

        //bottom right triangle of box
        this.gridNodes.push([x+boxW,y,(x+boxW)/imgW,y/imgH]);
        this.gridNodes.push([x,y+boxH,x/imgW,(y+boxH)/imgH]);
        this.gridNodes.push([x+boxW,y+boxH,(x+boxW)/imgW,(y+boxH)/imgH]);
      }
    }
    //console.log(this.gridNodes.length);
		this.display();
	}

	this.display = function(){
		//scale(this.zoomScroll);
    stroke(100);
    noFill();
    clear();

		push();
		  translate(this.offSetX,this.offSetY);
      textureMode(NORMAL);
      texture(this.img);

      beginShape(TRIANGLES);
      this.drawMesh();
      endShape();

      this.drawNodes();
  pop();

    if(drawTrias){
      push();
      translate(this.offSetX,this.offSetY);
      fill(0,0);
      beginShape(TRIANGLES);
      this.drawMesh();
      endShape();

      this.drawNodes();
      pop();
    }
	};

  this.drawMesh = function(){
    //console.log(this.gridNodes);
    beginShape(TRIANGLES);
    //draws six triangles at a time (two for each box)
    for(var i = 0; i < this.gridCols*this.gridRows*6; i+=6){
        vertex(this.gridNodes[i][0],this.gridNodes[i][1],this.gridNodes[i][2],this.gridNodes[i][3]);
        vertex(this.gridNodes[i+1][0],this.gridNodes[i+1][1],this.gridNodes[i+1][2],this.gridNodes[i+1][3]);
        vertex(this.gridNodes[i+2][0],this.gridNodes[i+2][1],this.gridNodes[i+2][2],this.gridNodes[i+2][3]);
        vertex(this.gridNodes[i+3][0],this.gridNodes[i+3][1],this.gridNodes[i+3][2],this.gridNodes[i+3][3]);
        vertex(this.gridNodes[i+4][0],this.gridNodes[i+4][1],this.gridNodes[i+4][2],this.gridNodes[i+4][3]);
        vertex(this.gridNodes[i+5][0],this.gridNodes[i+5][1],this.gridNodes[i+5][2],this.gridNodes[i+5][3]);
      }
  };

  this.drawNodes = function(){
    for (var i = 0; i < this.gridNodes.length;i++){
      ellipse(this.gridNodes[i][0], this.gridNodes[i][1],5,5);
    }
  }

  this.dragLock = function(){
    //determines which nodes are locked for dragging and adds them to the draggingNodes array
    this.draggingNodes = []; //clear array first

    push();
		translate(this.offSetX,this.offSetY);
    for (var i = 0; i < this.gridNodes.length; i++){
      if (dist(mouseX, mouseY, this.gridNodes[i][0], this.gridNodes[i][1]) < 10){
        dragging = true;
        this.draggingNodes.push([i,mouseX-this.gridNodes[i][0],mouseY-this.gridNodes[i][1]]); //[node#,diffX,diffY]
      }
    }
    pop();
  };

  this.dragging = function(nodeNo){
    for(var i = 0; i < this.draggingNodes.length; i++){
      this.gridNodes[this.draggingNodes[i][0]][0] = mouseX - this.draggingNodes[i][1];
      this.gridNodes[this.draggingNodes[i][0]][1] = mouseY - this.draggingNodes[i][2];
      //if moving mode, then uvs need to be adjusted
      if(mode == 'moving'){
        this.gridNodes[this.draggingNodes[i][0]][2] = (mouseX - this.draggingNodes[i][1])/imgW;
        this.gridNodes[this.draggingNodes[i][0]][3] = (mouseY - this.draggingNodes[i][2])/imgH;
      }
    }
    this.display();
  };

  this.split = function(){
    var splitNodes = [];
    //find nodes close to click and store in splitNodes
    for (var i = 0; i < this.gridNodes.length; i++){
      if (dist(mouseX, mouseY, this.gridNodes[i][0], this.gridNodes[i][1]) < 10){
        splitNodes.push(i);
      }
    }
    //console.log(splitNodes);
    //take two nodes and offset them horizontally
    //console.log(splitNodes);

    if(mode == 'splittingH' && splitNodes.length > 1){
      for(var i = 0; i < splitNodes.length; i++){
        if(i < splitNodes.length/2){
          this.gridNodes[splitNodes[i]][0] -= 10;
        } else {
          this.gridNodes[splitNodes[i]][0] += 10;
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
