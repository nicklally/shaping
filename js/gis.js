var maps = []; //array to store images
var mapFocus = 0; //number in array to focus
var mapImages = [];
var c;
//these generated dynamically to fit screen
var canvasW = 0;
var canvasH = 0;

var offX = 0; //margin with edge of canvas

//interface interactivity vars
var dragging = false;
var drawTrias = true;
var selecting = false;
var selected = false;

var gridColsDefault = 4;
var gridRowsDefault = 4;

var mode = "moving";

new p5();

setup = function() {
  // create canvas
  noLoop();
  var c = createCanvas(document.getElementById("leftCanv").offsetWidth,document.getElementById("leftCanv").offsetHeight, WEBGL);

  c.parent("leftCanv");
  background("#fff");
  angleMode(DEGREES);
  c.drop(gotFile);
};

draw = function(){};

gotFile = function(file) {
  if (file.type === "image") {
    // Create an image DOM element and add to maps array
    // console.log("We"re currently seeing: "+file.data)
    loadImage(file.data,addMap);//callback to addMap once image loaded
    mapImages.push(file.data);
    //console.log("map focus: " + mapFocus);
  } else {
    console.log("Not an image file!");
  }
};

addMap = function(imgLoaded){
  if(maps.length > 0){
    offX = maps[mapFocus].img.width + 50;
  }
  append(maps,new Map("map"+maps.length,1,imgLoaded,offX, maps.length));
  mapFocus = maps.length - 1; //change focus to last uploaded map
  maps[mapFocus].makeNew();
};

function mousePressed(){
  if(mode == "stretching" || mode == "moving"){
    if(selecting){
      maps[mapFocus].checkSelected();
    } else {
      maps[mapFocus].dragLock();
    }
  } else if(mode == "splittingH" || mode == "splittingV"){
    //console.log("split");
    maps[mapFocus].split();
  } else if(mode == "expanding"){
    maps[mapFocus].expand(1);
  } else if(mode == "contracting"){
    maps[mapFocus].expand(-1);
  }
}

function mouseDragged(){
  if(mode == "stretching" || mode == "moving"){
    if(dragging && !selecting){
      maps[mapFocus].dragging();
    } else if (selecting){
      maps[mapFocus].draggingSelection();
    } else if (!dragging && !selecting){
        maps[mapFocus].selectionBox();
    }
  } else if(mode == "splittingH" || mode == "splittingV"){

  } else if(mode == "moveMap"){
    maps[mapFocus].dragMap();
  }
}

function mouseReleased(){
  if(mode == "stretching" || mode == "moving"){
    if(dragging == false){
      maps[mapFocus].checkSelected();
      maps[mapFocus].selection([maps[mapFocus].mouseXpos-maps[mapFocus].offSetX,maps[mapFocus].mouseYpos-maps[mapFocus].offSetY,mX(), mY()]);
      maps[mapFocus].display();
    } else {
      dragging = false;
      maps[mapFocus].display();
    }
  } else if(mode == "splitting"){

  } else {
    //console.log(maps[mapFocus].selectionBox());

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
  var y = (mouseY - maps[mapFocus].offSetY);
  return y;
}

function exportLineString(cs){
  //cs[0]=latMin [1]=latMax [2]=lonMin [3]=lonMax
  var g = maps[mapFocus].gridNodes;
  var gO = maps[mapFocus].gridNodesOG;
  console.log(g);
  console.log(gO);
  var expNodes = [];
  var iW = maps[mapFocus].img.width;
  var iH = maps[mapFocus].img.height;

  if(g.length != gO.length){
    console.log("Grids do not match!");
  }
  for(var i = 0; i < g.length; i++){
    var x1 = (cs[3] - cs[2])*(gO[i][0]/iW) + cs[2]; //(lonMax - lonMin)*(pixX/pixW) + lonMin
    var x2 = (cs[3] - cs[2])*(g[i][0]/iW) + cs[2]; //transformed value
    var y1 = (cs[1] - cs[0])*((iH-gO[i][1])/iH) + cs[0]; //(latMax - latMin)*((pixH-pixY)/pixH) + latMin
    //console.log(cs[1] + ' ' + cs[0] + ' ' + gO[i][1]);
    var y2 = (cs[1] - cs[0])*((iH-g[i][1])/iH) + cs[0]; //transformed values
    expNodes.push([x1,x2,y1,y2]);
  }
  //remove duplicates from https://stackoverflow.com/questions/44014799/javascript-how-to-remove-duplicate-arrays-inside-array-of-arrays
  var expNodesOut = expNodes.filter(( t={}, a=> !(t[a]=a in t) ));
  console.log(expNodesOut);
  convertToGeojson(expNodesOut);
}

function gcp(cs){
  //cs[0]=latMin [1]=latMax [2]=lonMin [3]=lonMax
  var g = maps[mapFocus].gridNodes;
  var gO = maps[mapFocus].gridNodesOG;
  console.log(g);
  console.log(gO);
  var expNodes = [];
  var iW = maps[mapFocus].img.width;
  var iH = maps[mapFocus].img.height;

  if(g.length != gO.length){
    console.log("Grids do not match!");
  }
  for(var i = 0; i < g.length; i++){
    var x1 = gO[i][0]; //original pixel x
    var x2 = (cs[3] - cs[2])*(g[i][0]/iW) + cs[2]; //transformed value
    var y1 = -1*gO[i][1]; //original pixel y (negative for gcp standard)
    //console.log(cs[1] + ' ' + cs[0] + ' ' + gO[i][1]);
    var y2 = (cs[1] - cs[0])*((iH-g[i][1])/iH) + cs[0]; //transformed values
    expNodes.push([x1,x2,y1,y2]);
  }
  console.log(expNodes);
  //remove duplicates from https://stackoverflow.com/questions/44014799/javascript-how-to-remove-duplicate-arrays-inside-array-of-arrays
  var expNodesOut = expNodes.filter(( t={}, a=> !(t[a]=a in t) ));

  var tx = '';
  tx += 'mapX,mapY,pixelX,pixelY,enable\n';
  for(var i = 0; i < expNodesOut.length; i++){
    tx+=expNodesOut[i][1] + ',' + expNodesOut[i][3] + ',' + expNodesOut[i][0] + ',' + expNodesOut[i][2] + ',1\n';
  }
  exportFile(tx,'points');
}

function convertToGeojson(nodes){
  var tx = ' ';
  tx += '{"type":"FeatureCollection","features":[\n';
  for(var i = 0; i < nodes.length; i++){
    tx += '{"type":"Feature","properties":{"fid":"' + i + '"}, "geometry":{"type":"LineString","coordinates":[['+nodes[i][0]+','+nodes[i][2]+'],['+nodes[i][1]+','+nodes[i][3]+']]}}';
    if(i != nodes.length -1){
      tx += ',';
    }
    tx += '\n';
  }
  tx += ']}';
exportFile(tx,'geojson');
}

function exportFile(ex,fType){
  //following adapted from https://stackoverflow.com/questions/15547198/export-html-table-to-csv
  var filename = 'export_' + new Date().toLocaleDateString() + '.' + fType;
  var link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', 'data:text/' + fType + ';charset=utf-8,' + encodeURIComponent(ex));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  this.gridNodesOG = [];
  this.gridNodes = [];
  this.draggingNodes = [];
  this.prevNodes = []; //for undo function
  this.trias = [];
  this.gridCols = 4;
  this.gridRows = 4;
  this.mouseXpos;
  this.mouseYpos;
  var imgH = this.img.height;
  var imgW = this.img.width;

  this.makeNew = function(){
   //this.gridNodes = [];
    clear();
    this.gridNodes = [];
    this.gridNodesOG = [];
    var boxW = this.img.width/this.gridCols;
    var boxH = this.img.height/this.gridRows;
    //console.log("boxW: " + boxW + " boxH: " + boxH);
    //console.log("cols: " + this.gridCols + " rows: " + this.gridRows);
    //squares
    for(var x = 0; x < this.gridCols; x++){
      for(var y = 0; y < this.gridRows;y++){
        var xx = x*boxW;
        var yy = y*boxH;

        this.gridNodes.push([xx, yy,xx, yy]);
        this.gridNodes.push([xx+boxW, yy,xx+boxW, yy]);
        this.gridNodes.push([xx+boxW, yy+boxH,xx+boxW, yy+boxH]);
        this.gridNodes.push([xx, yy+boxH,xx, yy+boxH]);

        this.gridNodesOG.push([xx, yy]);//save original grid to calculate transformations later
        this.gridNodesOG.push([xx+boxW, yy]);
        this.gridNodesOG.push([xx+boxW, yy+boxH]);
        this.gridNodesOG.push([xx, yy+boxH]);

      }
    }
    //console.log(this.gridNodes);
    //console.log(this.gridNodesOG);
		this.display();
	}

	this.display = function(){
		//scale(this.zoomScroll);
    stroke(100);
    strokeWeight(1);
    noFill();
    clear();

		push();
      translate(this.offSetXcorner+this.offSetX,this.offSetYcorner+this.offSetY);
      textureMode(IMAGE);
      texture(this.img);
      this.drawMesh();
      fill(0,0);
      //this.drawNodes();
      if(drawTrias){
        fill(0,0);
        this.drawMesh();
        this.drawNodes();
      }
      if(selecting){
        this.drawSelections();
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

this.drawSelections = function(){
  //console.log(this.draggingNodes);
  for(var i = 0; i < this.draggingNodes.length; i++){
    fill(255,0,0);
    ellipse(this.gridNodes[this.draggingNodes[i][0]][0],this.gridNodes[this.draggingNodes[i][0]][1],5,5);
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
        console.log("true");
        this.draggingNodes.push([i,mouseX-this.gridNodes[i][0],mouseY-this.gridNodes[i][1]]); //[node#,diffX,diffY]
      }
    }
  };

  this.dragging = function(nodeNo){
    for(var i = 0; i < this.draggingNodes.length; i++){
      this.gridNodes[this.draggingNodes[i][0]][0] = mouseX - this.draggingNodes[i][1];
      this.gridNodes[this.draggingNodes[i][0]][1] = mouseY - this.draggingNodes[i][2];
      //if moving mode, then uvs need to be adjusted
      if(mode == "moving"){
        this.gridNodes[this.draggingNodes[i][0]][2] = (mouseX - this.draggingNodes[i][1]);
        this.gridNodes[this.draggingNodes[i][0]][3] = (mouseY - this.draggingNodes[i][2]);
        this.gridNodesOG[this.draggingNodes[i][0]][0] = mouseX - this.draggingNodes[i][1];
        this.gridNodesOG[this.draggingNodes[i][0]][1] = mouseY - this.draggingNodes[i][2];
      }
    }
    this.display();
  };

  this.draggingSelection = function(){
    for(var i = 0; i < this.draggingNodes.length; i++){
      this.gridNodes[this.draggingNodes[i][0]][0] = mouseX - this.draggingNodes[i][1];
      this.gridNodes[this.draggingNodes[i][0]][1] = mouseY - this.draggingNodes[i][2];
    }
    this.display();
  }

  this.checkSelected = function(){
     var trues = [];
     if(this.draggingNodes.length > 0){
      for(var i = 0; i < this.draggingNodes.length; i++){
          if(dist(this.gridNodes[this.draggingNodes[i][0]][0],this.gridNodes[this.draggingNodes[i][0]][1], mX(),mY()) < 10){
            trues.push(1);
          }
      }
      if(trues.length == 0){
         selecting = false;
         this.draggingNodes = [];
         console.log("zzzz");
      }
      this.display();
  }
}

  this.selectionBox = function(){
    if(this.draggingNodes.length == 0){
      this.display();
      push();
      translate(this.offSetXcorner,this.offSetYcorner);
      rect(this.mouseXpos,this.mouseYpos,mouseX-this.mouseXpos, mouseY-this.mouseYpos);
      pop();
    }
  }

  this.selection = function(rCords){ //receives coordinates of selection box
    for (var i = 0; i < this.gridNodes.length; i++){
      if (this.gridNodes[i][0] > rCords[0] && this.gridNodes[i][0] < rCords[2]){
        if(this.gridNodes[i][1] > rCords[1] && this.gridNodes[i][1] < rCords[3]){
            this.draggingNodes.push([i,mouseX-this.gridNodes[i][0],mouseY-this.gridNodes[i][1]]);
        }
      }
  }
  if(this.draggingNodes.length == 0){
    selecting = false;
  } else {
    selecting = true;
  }
}

  this.dragMap = function(){
    this.offSetX = mX();
    this.offSetY = mY();
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

    if(mode == "splittingH" && splitNodes.length > 1){
      for(var i = 0; i < splitNodes.length; i++){
        if(i < splitNodes.length/2){
          this.gridNodes[splitNodes[i]][0] -= 10;
        } else {
          this.gridNodes[splitNodes[i]][0] += 10;
        }
      }
    }

    if(mode == "splittingV" && splitNodes.length > 1){
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

  this.expand = function(sign){ //positive sign = expand, negative = contract
    var exMag = document.getElementById("magnitude").value;
    var exRad = document.getElementById("radius").value
    this.prevNodes = []; //clear array first
    this.prevNodes = this.gridNodes;
    for (var i = 0; i < this.gridNodes.length; i++){
      if (dist(mX(), mY(), this.gridNodes[i][0], this.gridNodes[i][1]) < exRad){
        let dir = createVector(this.gridNodes[i][0], this.gridNodes[i][1]);
        let origin = createVector(mX(),mY());
        let distance = dir.dist(origin);
        dir.sub(origin);
        dir.normalize();
        console.log(dir);
        dir.mult(sin(distance/exRad*180)*exMag*sign);
//        dir.mult(sin(distance/100*180)*30);
        this.gridNodes[i][0] += dir.x;
        this.gridNodes[i][1] += dir.y;
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

  this.undo = function(){
    //should use prevNodes
    this.display();
  }

};
window.onload = function() {
	canvasW = document.getElementById("leftCanv").clientWidth;
	canvasH = document.getElementById("leftCanv").clientHeight;
};
