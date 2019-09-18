window.onload = function () {
	//fucntion to get current datetime	
	 function currentDate() {
        var date = new Date();
        var t = date.toLocaleTimeString();
        var d = date.toLocaleDateString();
        return d + " " + t; // datum + tid endast
    }
	
	//Firebase Connectivity
	var config = {
		apiKey: "AIzaSyBv1LQpgo-fi7poT357kujwOP9_r-TnhbI",
		authDomain: "search-d74a2.firebaseapp.com",
		databaseURL: "https://search-d74a2.firebaseio.com/",
    storageBucket: "bucket.appspot.com"
	};
	firebase.initializeApp(config);
	var database = firebase.database();
	
	//Function to send message
	function send(text){
		var jsonVariable = {};
		jsonVariable[text] = text+"#"+currentDate();
		firebase.database().ref('search').update(jsonVariable);
	}
	
	//Function to hit suggestion api 
	function jsonp(url) {
	  return new Promise(function(resolve, reject) {
		var s = document.createElement('script');
		var f="jsonp"+(+new Date()), b=document.body;
		window[f] = d=>{ delete window[f]; b.removeChild(s); resolve(d); };
		s.src=`${url}${url.includes('?')?'&':'?'}callback=${f}&v=1.0`;
		b.appendChild(s);
	  })
	}
	
	// Fucntion to hit 
	function serTextValue(id){
		var data = document.getElementById(id).innerHTML;
		document.getElementById("search_bar").value = data;
		send(data);
		getSearch();
		var mainDiv = document.getElementById("suggestion");
		mainDiv.innerHTML = "";
	}

	// Async function to call jsonp function to avoid crossorigion issue
	async function sendForSuggestion(text) {
		var mainDiv = document.getElementById("suggestion");
		let data = await jsonp("http://suggestqueries.google.com/complete/search?client=firefox&q="+text);
		if (data == null || data == undefined){	   
		}else{
			datalist = data[1];
			mainDiv.innerHTML = "";
		    for (const [key, value] of Object.entries(datalist)) {
				var li = document.createElement('li');
				li.innerText = value;
				li.setAttribute('id', key+"_search");
				li.addEventListener('click', () => {serTextValue(key+"_search")});
				mainDiv.appendChild(li);
			} 
		}
	}
		
	//Function to get suggestion according to entered text
	function like(text){
		var mainDiv = document.getElementById("suggestion");
		mainDiv.innerHTML = "";
		if(text == '' || text == undefined){
			 return;
		}
			sendForSuggestion(text);
	}
	getValues();
	
	// Get the result entered text
	function getSearch() {
		var text = document.getElementById("search_bar").value;
		  var xhttp = new XMLHttpRequest();
		  xhttp.onreadystatechange=function() {
			if (this.readyState == 4 && this.status == 200) {
				var text = this.responseText;
				var datalist = JSON.parse(text);
				var data = datalist.items;
				var mainDiv = document.getElementById("commentSection");
				mainDiv.innerHTML = "";
					if(data == undefined || data == null){
						var h5Tag = document.createElement('h5');
						h5Tag.innerText = "No Result Found";
						mainDiv.appendChild(h5Tag);
					}else{
						for(var i = 0; i < data.length; i++){
							var loopdiv = document.createElement('div');
							var aTag = document.createElement('a');
							var br = document.createElement('br');
							var p = document.createElement('p');
							aTag.setAttribute('href',data[i].formattedUrl);
							aTag.innerText = data[i].htmlTitle;
							p.innerText = data[i].htmlSnippet;
							loopdiv.appendChild(aTag);
							loopdiv.appendChild(br);
							loopdiv.appendChild(p);
							mainDiv.appendChild(loopdiv);
						}
					}						  
			}
		  };
		  xhttp.open("GET", "https://www.googleapis.com/customsearch/v1?key=AIzaSyDsMeoKOMfmiNg3gyKHjwFFk_T2Ary2F4o&cx=017576662512468239146:omuauf_lfve&q="+text, true);
		  xhttp.send();
	}
	
	document.getElementById("search_bar").addEventListener("keyup", keyEvents);
	// Function for checking the typed text
	function keyEvents(e){
		var text = document.getElementById("search_bar").value;
		like(text);
		if (e.keyCode == 13) {
			if(text == '' || text == null){
				
			}else{
				send(text);
				getSearch();
			}
		}
	}
	
	document.getElementById("clearAll").addEventListener("click", clearAllFunction);
	// Function to clear all search history
	function clearAllFunction(e){
		e.preventDefault();
		var get = firebase.database().ref('search').remove();
		if(get){
			getValues();
		}
	}
} 
	//Function to get search history values in the search section
	function getValues(){
		firebase.database().ref('search').on("value", function(snapshot) {
		   var data = snapshot.val();
		   var mainDiv = document.getElementById("historySection");
		
		   if (data == null || data == undefined){
			 	mainDiv.innerHTML = "";
		   }else{
			  	mainDiv.innerHTML = "";
			   count = 0;
			   for (const [key, value] of Object.entries(data)) {
					var item = value.split('#');
					count++;					
							var loopdiv = document.createElement('h4');
							var br = document.createElement('br');
							var span = document.createElement('span');
							var span2 = document.createElement('span');
							var span3 = document.createElement('span');
							var itag = document.createElement('i');
							loopdiv.innerText = item[0];
							span.setAttribute('class', 'close cus_close');
							span.addEventListener('click', () => {deleteit(count)});
							itag.setAttribute('class', 'fa fa-close');
							span.appendChild(itag);
							loopdiv.appendChild(span);
							
							span2.setAttribute('class', 'cus_time');
							span2.innerText = item[1];
							loopdiv.appendChild(span2);
							
							span3.setAttribute('id', count);
							span3.setAttribute('style', 'display:none');
							span3.innerText = key;
							loopdiv.appendChild(span3);
							
							mainDiv.appendChild(loopdiv);
				}
		   }
		   
		}, function (error) {
		   console.log("Error: " + error.code);
		});
	
	}
	
	// function to delete one search
	function deleteit(id){
		var data = document.getElementById(id).innerHTML;
		var element = document.getElementById(id);
		element.parentNode.removeChild(element);
		firebase.database().ref('search').child(data).remove();
		getValues();
		
	}
	
