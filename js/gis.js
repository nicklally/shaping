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
  } else if(mode == 'splitting'){
    //console.log('split');
    maps[mapFocus].split();
  }
}

function mouseDragged(){
  if(mode == 'stretching' || mode == 'moving'){
    if(dragging){
      maps[mapFocus].dragging();
    }
  } else if(mode == 'splitting'){

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
  this.gridCols = 10;
  this.gridRows = 10;
  var imgH = this.img.height;
  var imgW = this.img.width;

  this.makeNew = function(){
   //this.gridNodes = [];
    clear();
    this.gridNodes = [];
    var boxW = int(this.img.width/this.gridCols*2);
    var boxH = int(this.img.height/this.gridRows);

    for (var x = 0; x < imgW; x += boxW/2){
      for (var y = 0; y <= imgH; y += boxH){
        this.gridNodes.push([x,y,x/imgW,y/imgH]);
        if((x+boxW/2) <= imgW){
          this.gridNodes.push([x+boxW/2,y,(x+boxW/2)/imgW,y/imgH]);
        }
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
    for (var x = 0; x < this.gridCols; x++){
      for (var y = 0; y < this.gridRows*2;y++){
        vertex(this.gridNodes[x*(this.gridRows*2+2)+y][0], this.gridNodes[x*(this.gridRows*2+2)+y][1], this.gridNodes[x*(this.gridRows*2+2)+y][2], this.gridNodes[x*(this.gridRows*2+2)+y][3]);
        vertex(this.gridNodes[x*(this.gridRows*2+2)+1+y][0], this.gridNodes[x*(this.gridRows*2+2)+1+y][1], this.gridNodes[x*(this.gridRows*2+2)+1+y][2], this.gridNodes[x*(this.gridRows*2+2)+1+y][3]);
        vertex(this.gridNodes[x*(this.gridRows*2+2)+2+y][0], this.gridNodes[x*(this.gridRows*2+2)+2+y][1], this.gridNodes[x*(this.gridRows*2+2)+2+y][2], this.gridNodes[x*(this.gridRows*2+2)+2+y][3]);
        //console.log(x*(this.gridRows*2+2)+y);
      }
    }
    //console.log(this.gridNodes);
  };

  this.drawNodes = function(){
    for (var i = 0; i < this.gridNodes.length;i++){
      ellipse(this.gridNodes[i][0], this.gridNodes[i][1],5,5);
    }
  }

/*  this.reDraw = function(){
    push();
		translate(this.offSetX,this.offSetY);
    clear();
    beginShape(TRIANGLES);
    textureMode(NORMAL);
    texture(this.img);
    for (var x = 0; x < this.gridCols; x++){
      for (var y = 0; y < this.gridRows*2;y++){
        vertex(this.gridNodes[x*(this.gridRows*2+2)+y][0], this.gridNodes[x*(this.gridRows*2+2)+y][1], this.gridNodes[x*(this.gridRows*2+2)+y][2], this.gridNodes[x*(this.gridRows*2+2)+y][3]);
        vertex(this.gridNodes[x*(this.gridRows*2+2)+1+y][0], this.gridNodes[x*(this.gridRows*2+2)+1+y][1], this.gridNodes[x*(this.gridRows*2+2)+1+y][2], this.gridNodes[x*(this.gridRows*2+2)+1+y][3]);
        vertex(this.gridNodes[x*(this.gridRows*2+2)+2+y][0], this.gridNodes[x*(this.gridRows*2+2)+2+y][1], this.gridNodes[x*(this.gridRows*2+2)+2+y][2], this.gridNodes[x*(this.gridRows*2+2)+2+y][3]);
        //console.log(x*(this.gridRows*2+2)+y);
      }
    }
    endShape();

    for (var i = 0; i < this.gridNodes.length;i++){
      ellipse(this.gridNodes[i][0], this.gridNodes[i][1],5,5);
    }
    pop();
  }
*/
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
    if(splitNodes.length  > 1){
      this.gridNodes[splitNodes[0]][0] -= 10;
      this.gridNodes[splitNodes[1]][0] += 10;
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
