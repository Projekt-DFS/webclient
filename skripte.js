	var getImageInfoLink;
	var uploadLink;
	var deletionLink;
	var setMetaDataLink;
	var graphicsLink;

	var userName;
	var password;
	var ip;
    var auth = "";
    
    var loggedIn = false;

    var json = new Array();

	var page = 0;

	var images = new Array();


	//Image-Objekt
	function Image(json){
		this.created = json.created,
		this.location = json.location,
		this.thumbnail = json.thumbnail,
		this.imageSource = json.imageSource,
		this.imageName = json.imageName,
		this.metaData = json.metaData,
		this.owner = json.owner,
		this.tagList = json.tagList,
		this.thumbnailBlobUrl = "",
		this.imageSourceBlobUrl = ""
	} 

	//Links
	function updateLinks(){
        ip = window.location.hostname;
		getImageInfoLink = "http://" + ip + ":4434/bootstrap/v1/images/" + userName;
		uploadLink       = "http://" + ip + ":4434/bootstrap/v1/images/" + userName;
		deletionLink     = "http://" + ip + ":4434/bootstrap/v1/images/" + userName + "?imageName="; // + "?imageName=";   // + Name=bild1, bild2,...
		setMetaDataLink  = "http://" + ip + ":4434/bootstrap/v1/images/" + userName; // + "?imageName=";   // + $imageName/metadata"
        graphicsLink     = "http://" + ip + ":4434/bootstrap/v1/webclient/graphics/";
        logoutLink       = "http://" + ip + ":4434/bootstrap/v1/webclient/";
	}



//---------------Funktionen---------------//	
	function updateAuthentication(){
		var userNameAndPwBase64 = userName + ":" + password;
		userNameAndPwBase64 = btoa(userNameAndPwBase64);
		auth = "Basic " + userNameAndPwBase64;
	}

	function getImageInfo(){
		
		if(!loggedIn){
			userName = document.getElementById("userName").value;
			password = document.getElementById("password").value;
		}

		userName = "user2";
		password = "password";
		

		updateLinks();
		updateAuthentication();

		var request = new XMLHttpRequest();
		
		request.open("GET", getImageInfoLink);
		request.setRequestHeader("Authorization", auth);

		request.addEventListener('load', function(event) {
			if (request.status != 200){
				if(request.status == 401){
					alert(request.status + " Wrong Login")
				}
				else{
					alert("Error, Server down or badIP");
				}
			}
			else{
				json = JSON.parse(request.responseText);
                loggedIn = true;
                createNavi();
                createImages();
			}
		});
        request.send();
	}

	function createNavi(){
		if(json == null || !loggedIn || document.getElementById("upload") != null){
			return;
		}

		if(!loggedIn){	
			document.getElementById("userData").outerHTML="";
		}

		document.getElementById("userData").innerHTML = null;

		var uploadButton = document.createElement("BUTTON");
		
		uploadButton.setAttribute("id", "upload");
		uploadButton.setAttribute("onclick", "document.getElementById('upload-input').click();");
		uploadButton.innerHTML = "Upload";
		
		var uploadInput = document.createElement("INPUT");
		uploadInput.setAttribute("type", "file");
		uploadInput.setAttribute("id", "upload-input");
		uploadInput.setAttribute("style", "display: none;");
		uploadInput.setAttribute("accept", "image/jpeg, image/png");
		uploadInput.setAttribute("onchange", "uploadImage()");	
		uploadInput.setAttribute("multiple", "true");	
		uploadButton.innerHTML = uploadInput.outerHTML + "Upload";
		document.getElementById("navigator").appendChild(uploadButton);

		var deleteButton = document.createElement("BUTTON");
		deleteButton.setAttribute("id", "delete");
		deleteButton.setAttribute("onclick", "deleteMarkedImages()");
		deleteButton.innerHTML = "Delete";
		document.getElementById("navigator").appendChild(deleteButton);

		var refreshButton = document.createElement("BUTTON");
		refreshButton.setAttribute("id", "refresh");
		refreshButton.setAttribute("onclick", "getImageInfo()");
		refreshButton.innerHTML = "Refresh";
		document.getElementById("navigator").appendChild(refreshButton);

		var arrowLeft = document.createElement("IMG");
		var arrowRight = document.createElement("IMG");
		arrowLeft.setAttribute("class", "arrow");
        arrowRight.setAttribute("class", "arrow");
        arrowLeft.setAttribute("onClick", "goLeft()");
		arrowRight.setAttribute("onClick", "goRight()");
		arrowLeft.setAttribute("src", graphicsLink + "arrow_left.png");
		arrowRight.setAttribute("src", graphicsLink + "arrow_right.png");

		var arrowDiv = document.createElement("DIV");
		arrowDiv.setAttribute("id", "arrowDiv");
		arrowDiv.appendChild(arrowLeft);
		arrowDiv.appendChild(arrowRight);
		document.getElementById("navigator").appendChild(arrowDiv);

		document.getElementById("navigator").setAttribute("class", "navi sticky");

		document.getElementById("LoginButton").innerHTML="Logout";
		document.getElementById("LoginButton").setAttribute("onClick", "logout()");
		document.getElementById("LoginButton").setAttribute("class", "logout");
		
	}

	function createImages(){

        if(!document.contains(document.getElementById("pictureDiv"))){
            var div = document.createElement("DIV");
            div.setAttribute("class", "pictures");
            div.setAttribute("id", "pictureDiv");
            document.body.appendChild(div);
        }
        else{
            document.getElementById("pictureDiv").innerHTML = null;
        }
		
		for(var i = 0  + page * 16; i < 16 * (page + 1); i++) {
			if(json[i] == null){
				break;
			}

			var image = new Image(json[i]);
			images.push(image);
			getThumbnailToUrl(json[i].imageSource, i);
		}
		
	}


	function getThumbnailToUrl(linkToImage, i){
        var request = new XMLHttpRequest();
		
		request.open("GET", linkToImage, true);
		request.setRequestHeader("Authorization", auth);
		request.responseType = "arraybuffer";

		thumbnailUrl = null;

		request.addEventListener('load', function(event) {
			if (request.status != 200){
				if(request.status == 401){
					alert(request.status + " Wrong Login")
				}
				else{
					alert("Internal error");
				}
			}
			else{
				var blob = new Blob([request.response], {type: "image/jpeg"});
				var url = URL.createObjectURL(blob);
				images[i].thumbnailBlobUrl = url;
				showImage(i);
			}
		});
		request.send();
	} 

	function showImage(i){
		var imgTag = document.createElement("IMG");
		imgTag.setAttribute("class", "picture");
		imgTag.setAttribute("src", images[i].thumbnailBlobUrl);
		imgTag.setAttribute("onClick", "markImage(" + i + ")");
		imgTag.setAttribute("id", "img_" + i);
		
		var imageContainer = document.createElement("A");
		imageContainer.innerHTML = imgTag.outerHTML;
		document.getElementById("pictureDiv").appendChild(imageContainer);	
		
	}


	function uploadImage() {
		var fileArray = document.getElementById('upload-input').files;

		for(var i = 0; i < fileArray.length; i++){
			readAndUpload(fileArray[i]);
		}	
	}


	function readAndUpload(file) {
		var name = file.name;

		var reader = new FileReader();  
		reader.onload = function (e) {

			var baseToImageSource = e.target.result.substring(23, reader.result.length);
			var request = new XMLHttpRequest();
			
			request.open("POST", uploadLink);
			request.setRequestHeader("Authorization", auth);
			request.setRequestHeader("Content-Type", "application/json");


			jsonString = {
				"imageSource":baseToImageSource,
				"imageName":name 
			}

			request.addEventListener('load', function(event) {
				if (request.status != 200){
					console.log("Upload failed \nStatus Code: "+ request.status);
				}
				else{
					console.log("Upload successful :-)");
				}
			});
			request.send(JSON.stringify(jsonString));
		};
		reader.readAsDataURL(file);
	}

	function markImage(i){
		var img = document.getElementById("img_" + i);
		img.setAttribute("class", "picture marked");
		img.setAttribute("onclick", "unmarkImage(" + i + ")");
		img.setAttribute("value", i);
	}

	function unmarkImage(i){
		var img = document.getElementById("img_" + i);
		img.setAttribute("class", "picture");
		img.setAttribute("onclick", "markImage(" + i + ")");
		img.removeAttribute("value");
	}

	function deleteMarkedImages(){
		var markedImages = document.getElementsByClassName("picture marked");
		
		var requestLink = deletionLink;
		var queryString = "";

		for(var i = 0; i < markedImages.length; i++){
			var value = markedImages[i].getAttribute("value");
			
			queryString += images[value].imageName;

			if(i != markedImages.length - 1){
				queryString += ",";
			}
		}

		requestLink += queryString;

		console.log(requestLink);

		var request = new XMLHttpRequest();
			
		request.open("DELETE", requestLink);
		request.setRequestHeader("Authorization", auth);

		request.addEventListener('load', function(event) {
			if (request.status != 204){
				console.log("Deletion failed\nStatus Code: "+ request.status);
			}
			else{
				console.log("Deletion successful");
				getImageInfo();
			}
		});
		request.send();
	}

	function goLeft(){
        if(page==0){
            return;
        }
        page--;
        createImages();
    }

    function goRight(){
        if(page >= json.length / 16 -1){
            return;
        }
        page++;
        createImages();
	}
	
    function logout(){
		loggedIn = false;
		page = 0;
        window.location.href = logoutLink;
	}

	function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
      }