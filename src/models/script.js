var jsdom = require('jsdom');                                                                                                                                             
$ = require('jquery')(new jsdom.JSDOM().window);   

// will execute the if block if the window object does exist as a top level variable
if (typeof window !== "undefined") {
try {
	var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	// create a SpeechRecognition object
	var recognition = new SpeechRecognition();
  }
  catch(e) {
	console.error(e);
	$('.no-browser-support').show();
	$('.output').hide();
  }
}

  // $() = jQuery Selectors
  var noteTextarea = $('#note-textarea');
  var instructions = $('#recording-instructions');
  var notesList = $('ul#notes');
  var noteContent = '';
  
  // get all notes from previous sessions and display them
  var notes = getAllNotes();
  renderNotes(notes);
  
  /*-----------------------------
		Speech Recognition 
  ------------------------------*/

  // set the language to english
  recognition.lang = 'en-EN';
  
  // false = speech recognition will stop after a few seconds of silence
  // true = when the user stops talking, speech recognition will continue until we stop it
  recognition.continuous = true;
  
  // to retrieve results, starts an input when the recognition identifies a word and returns it with the word it identified before
  // called every time the Speech APi captures a line 
  recognition.onresult = function(event) {
  
	// event is a SpeechRecognitionEvent object, it holds all the lines we have captured so far
	// event.resultIndex = read-only, returns the lowest index value result in the array that has actually changed 
	var current = event.resultIndex;
  
	// event.results = read-only, returns an object representing all the speech recognition results for the current session
	// [current] = returns an object representing all the speech recognition results for the current session
	// .transcript = read-only, returns a string containing the transcript of the recognized word
	var transcript = event.results[current][0].transcript;
  
	// add the current transcript to the contents of our Note
	noteContent += transcript;
	// returns or sets the value attribute of the selected elements
	noteTextarea.val(noteContent);
  };
  
    // perform an action when the recognition starts
	recognition.onstart = function() { 
	// overwrites or returns the text content of the selected elements
	instructions.text('Voice recognition activated. Try speaking into the microphone.');
  }

//  recognition.onspeechend = function() {
// 	instructions.text('You were quiet for a while so voice recognition turned itself off.');
//   }
  
  recognition.onerror = function(event) {
	if(event.error == 'no-speech') {
	  instructions.text('No speech was detected. Try again.');  
	};
  }  
  
//   JSON Test
//   let noteJSON = JSON.parse(noteContent);
//   console.log("JSON Object:",noteJSON);

  /*-----------------------------
		Buttons and input 
  ------------------------------*/
  
  // on() = attaches one or more event handlers for the selected and child elements
  $('#start-record-btn').on('click', function(e) {

	// .length() = not empty
	if (noteContent.length) {
	  noteContent += ' ';
	}
	// start listening
	recognition.start();
  });
  
  $('#pause-record-btn').on('click', function(e) {
	// stop listening
	recognition.stop();
	instructions.text('Voice recognition paused.');
  });
  
	// Sync the text inside the text area with the noteContent variable.
  	noteTextarea.on('input', function() {
	noteContent = $(this).val();
  })
  
  $('#save-note-btn').on('click', function(e) {
	recognition.stop();
  
	// not not empty = empty
	if(!noteContent.length) {
	  instructions.text('Could not save empty note. Please start to speak :)');
	}
	else {
	  // save note to localStorage
	  // the key is the dateTime with seconds, the value is the content of the note
	  // Date() = new current date object, toLocaleString() = way of time display  
	  saveNote(new Date().toLocaleString(), noteContent);
  
	  // Reset variables and update UI.
	  noteContent = '';
	  renderNotes(getAllNotes());
	  noteTextarea.val('');
	  instructions.text('Note saved successfully.');
	}
		
  })
  
  notesList.on('click', function(e) {
	e.preventDefault();
	var target = $(e.target);
  
	// delete the selected note
	// hasClass = return true if the class is assigned to an element
	if(target.hasClass('delete-note')) {
	// siblings() = returns all sibling elements (with same parent) of the selected element
	  var dateTime = target.siblings('.date').text();  
	  deleteNote(dateTime);
	  target.closest('.note').remove();
	}
  });
  
  /*-----------------------------
		Helper Functions 
  ------------------------------*/
  
  function renderNotes(notes) {
	var html = '';
	if(notes.length) {
	  notes.forEach(function(note) {
		html+= `<li class="note">
		  <p class="header">
			<span class="date">${note.date}</span>
			<a href="#" class="delete-note" title="Delete">Delete</a>
		  </p>
		  <p class="content">${note.content}</p>
		</li>`;    
	  });
	}
	else {
	  html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
	}
	// html() = sets or returns the content (innerHTML) of the selected elements
	notesList.html(html);
  }
  
  function saveNote(dateTime, content) {
	// localStorage = an HTML5 web storage object for storing data on the client 
	// setItem() = when passed a key name and value, will add that key to the given Storage object, or update that key's value if it already exists
	localStorage.setItem('note-' + dateTime, content);
  }
  
  function getAllNotes() {
	var notes = [];
	var key;
	for (var i = 0; i < localStorage.length; i++) {

	// key() = returns an integer representing the number of data items stored in the Storage object
	  key = localStorage.key(i);
	  console.log(i)
	  console.log(key)

	// substring() = extracts a part of a string
	  if(key.substring(0,5) == 'note-') {
		
	// push() = adds new items to the end of an array
		notes.push({
		  date: key.replace('note-',''),
		  content: localStorage.getItem(localStorage.key(i))
		});
	  } 
	}
	console.log(notes)
	return notes;
  }
  
  function deleteNote(dateTime) {
	// removeItem() = wen passed a key name, will remove that key from the storage
	localStorage.removeItem('note-' + dateTime); 
  }

    /*-----------------------------
		Save Data 
  ------------------------------*/

  // fs module = for reading and writing files
  const fs = require('fs');

  const saveData = (notes) => {
		const finished = (error) => {
			if(error){
			  console.error(error)
			  return;
			}
		}

		const jsonData = JSON.stringify(notes)
		fs.writeFile('result.json', jsonData, finished)
  }

  saveData(notes)