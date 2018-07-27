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

    var json;
    var imageArray = new Array();

    var page = 0;

	function updateLinks(){
        ip = window.location.hostname;
		getImageInfoLink = "http://" + ip + ":4434/bootstrap/v1/images/" + userName;
		uploadLink       = "http://" + ip + ":4434/bootstrap/v1/images/" + userName;
		deletionLink     = "http://" + ip + ":4434/bootstrap/v1/images/" + userName; // + "?imageName=";   // + Name=bild1, bild2,...
		setMetaDataLink  = "http://" + ip + ":4434/bootstrap/v1/images/" + userName; // + "?imageName=";   // + $imageName/metadata"
        graphicsLink     = "http://" + ip + ":4434/bootstrap/v1/webclient/graphics/";
        logoutLink       = "http://" + ip + ":4434/bootstrap/v1/webclient/";
	}

	function updateAuthentication(){
		var userNameAndPwBase64 = userName + ":" + password;
		userNameAndPwBase64 = btoa(userNameAndPwBase64);
		auth = "Basic " + userNameAndPwBase64;
	}

	function getImageInfo(){

	    userName = document.getElementById("userName").value
		password = document.getElementById("password").value
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
                document.getElementById("LoginButton").innerHTML="Logout";
                document.getElementById("LoginButton").setAttribute("onClick", "logout()");
                createImages();
			}
		});
        request.send();
	}


	function createNavi(){
		if(json == null || !loggedIn){
			return;
		}

        document.getElementById("userData").outerHTML="";

		var uploadButton = document.createElement("BUTTON");
        uploadButton.innerHTML = "Upload";
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
		

		for(var i = 0  + page * 16; i <= 15 * (page + 1) + page; i++) {
			if(json[i] == null){
				break;
            }
            
            var imageContainer = document.createElement("A");
            imageContainer.setAttribute("href", json[i].imageSource);
            imageContainer.innerHTML = "<img class='picture' src=" + json[i].imageSource + ">"

            document.getElementById("pictureDiv").appendChild(imageContainer);
        }
    }
    
    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
      }

   /* function getImage(linkToImage){
        var request = new XMLHttpRequest();
		
		request.open("GET", linkToImage);
		request.setRequestHeader("Authorization", auth);

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
				var image = request.response;
                imageArray.push(image);
			}
		});
        request.send();
    } */


    function logout(){
        window.location.href = logoutLink;
    }