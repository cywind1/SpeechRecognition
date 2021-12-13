// check if the target word is in the given string (transcript)

    function countScore(transcript,target){
    let score = 0;
    if (transcript.includes(target))
	    score += 20;
    return score;
    }

// count the number of occurrence of a target word in the given string (transcript)
     
    function countOccurrences(transcript,target) {
        // split the string by spaces in a
    let a = transcript.split(" ");
  
    // search for pattern in a
    let count = 0;
    for (let i = 0; i < a.length; i++)
    {
    // if match found, increase count
    if (target==(a[i]))
        count++;
    }
  
    return count;
    }
    // Driver code
    let transcript = notes;
    // call target words from Datamuse API
    let target = "";
    document.write(countOccurrences(transcript,target));