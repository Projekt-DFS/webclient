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
		deletionLink     = "http://" + ip + ":4434/bootstrap/v1/images/" + userName; // + "?imageName=";   // + Name=bild1, bild2,...
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
			userName = document.getElementById("userName").value
			password = document.getElementById("password").value
		}
		

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
                document.getElementById("LoginButton").innerHTML="Logout";
                document.getElementById("LoginButton").setAttribute("onClick", "logout()");
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


		var arrowLeft = document.createElement("IMG");
		var arrowRight = document.createElement("IMG");
		arrowLeft.setAttribute("class", "arrow");
        arrowRight.setAttribute("class", "arrow");
        arrowLeft.setAttribute("onClick", "goLeft()");
		arrowRight.setAttribute("onClick", "goRight()");
		arrowLeft.setAttribute("src", graphicsLink + "arrow_left.png");
		arrowRight.setAttribute("src", graphicsLink + "arrow_right.png");
		document.getElementById("navigator").appendChild(arrowRight);
		document.getElementById("navigator").appendChild(arrowLeft);
	}

	function uploadImage() {
		var file = document.getElementById('upload-input').files[0];
		var reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = function () {
			var baseToImageSource = reader.result.substring(23, reader.result.length);
			var request = new XMLHttpRequest();
			
			request.open("POST", uploadLink);
			request.setRequestHeader("Authorization", auth);
			request.setRequestHeader("Content-Type", "application/json");



			jsonString = {
				"imageSource":baseToImageSource,
				"imageName":"eduard232.jpg"
			}

			request.addEventListener('load', function(event) {
				if (request.status != 201){
					alert("Upload failed"+ request.status);
				}
				else{
					alert("Upload successful :-)");
					getImageInfo();
				}
			});
			request.send(JSON.stringify(jsonString));
			};

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
		
		for(var i = 0  + page * 16; i < 16 * (page + 1) + page; i++) {
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
		imgTag.setAttribute("onClick", "setImageSource(" + i + ")");
		
		var imageContainer = document.createElement("A");
		imageContainer.innerHTML = imgTag.outerHTML;
		document.getElementById("pictureDiv").appendChild(imageContainer);	

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