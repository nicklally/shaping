var maps = []; //array to store images
var mapFocus = 0; //number in array to focus
var mapImages = [];

//these generated dynamically to fit screen
var canvasW = 0;
var canvasH = 0;

var offX = 30; //margin with edge of canvas

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

draw = function(){
  //clear();
  /*background('#fff');
  if(maps.length > 0){
    for(var i = 0; i < maps[mapFocus].gridNodes.length; i++){
      maps[mapFocus].gridNodes[i][0] += random(-1,1);
      maps[mapFocus].gridNodes[i][1] += random(-1,1);

    }
    maps[mapFocus].display();*/
    //console.log('ht');
};

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
  maps[mapFocus].dragLock();
}

function mouseDragged(){
  if(dragging){
    maps[mapFocus].dragging();
  }
}

function mouseReleased(){
  dragging = false;
  maps[mapFocus].reDraw();
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
  this.gridCols = 20;
  this.gridRows = 20;

  this.makeNew = function(){
   //this.gridNodes = [];
    var boxW = int(this.img.width/this.gridCols*2);
    var boxH = int(this.img.height/this.gridRows);
    var imgH = this.img.height;
    var imgW = this.img.width;

    for (var x = 0; x < imgW; x += boxW/2){
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
    background('#fff');
		push();
		translate(this.offSetX,this.offSetY);
		//image(this.img,0,0,this.img.width,this.img.height);
    beginShape(TRIANGLES);
    stroke(100);
    noFill();

    textureMode(NORMAL);
    texture(this.img);
    //console.log(this.gridNodes);

    //plots triangles
    /*
    for(var i = 0; i < this.gridNodes.length-2; i++){
      vertex(this.gridNodes[i][0],this.gridNodes[i][1],this.gridNodes[i][2],this.gridNodes[i][3]);
      vertex(this.gridNodes[i+1][0],this.gridNodes[i+1][1],this.gridNodes[i+1][2],this.gridNodes[i+1][3]);
      vertex(this.gridNodes[i+2][0],this.gridNodes[i+2][1],this.gridNodes[i+2][2],this.gridNodes[i+2][3]);
    }*/


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
	};

  this.reDraw = function(){
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
    }
    this.reDraw();
  };

};
window.onload = function() {
	canvasW = document.getElementById('leftCanv').clientWidth;
	canvasH = document.getElementById('leftCanv').clientHeight;
};
