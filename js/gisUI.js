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
	console.log(mode);
}
