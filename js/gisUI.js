function triangles(obj){
	if(!obj.checked){
		drawTrias = false;
	} else {
		drawTrias = true;
	}// UI FUNCTIONS HERE
  maps[mapFocus].display();
};

function changeCols(obj){
  maps[mapFocus].changeColNum(obj.value);
  console.log(obj.value);
};

function changeRows(obj){
  maps[mapFocus].changeRowNum(obj.value);
};

function uimode(obj){
	mode = obj.value;
}

function exportLS(){
  var corners = [];
	corners.push(parseFloat(document.getElementById("latMin").value));
	corners.push(parseFloat(document.getElementById("latMax").value));
	corners.push(parseFloat(document.getElementById("lonMin").value));
	corners.push(parseFloat(document.getElementById("lonMax").value));
	exportLineString(corners);
}

function exportGCPs(){
  var corners = [];
	corners.push(parseFloat(document.getElementById("latMin").value));
	corners.push(parseFloat(document.getElementById("latMax").value));
	corners.push(parseFloat(document.getElementById("lonMin").value));
	corners.push(parseFloat(document.getElementById("lonMax").value));
	gcp(corners);
}
