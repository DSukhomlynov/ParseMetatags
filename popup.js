let parse = document.getElementById("parse"); //get the button

parse.addEventListener("click", async () => { // when the button is pressed - find the active tab and run the desired function
  var headings = [];
  document.getElementById('results').innerHTML = "";//clearing the output area

  var tabs = await chrome.tabs.query({});//Run a tab query with execution pending
    tabs.forEach(function (tab) {//Bypass all tabs open in the browser
      chrome.scripting.executeScript({ //Implementing the script
        target: { tabId: tab.id },
        args: [tab.id, headings],
        function: parseMetatags, // Calling the function for getting meta tags on the page
      },
        (injectionResults) => { // Response processing
          if(injectionResults){
            var el = document.getElementById('results'); //Getting the area to write
            for (const frameResult of injectionResults){ // Page enumeration
              var arr = JSON.parse(frameResult.result); // decode the data
              for (let i = arr.length - 1; i >= 0; i -= 1) { // Displaying the results
                var insert = "<p>" + arr[i] + "</p>";
                el.insertAdjacentHTML('afterbegin', insert);
              }
            }
          }
        });
    });
});

function parseMetatags(tabID, headings) { //Main parsing
  var nameTag = '';
  var title = '';
  var separator = '-----------------------------------';
  var tag_names = {
    h1:1,
    h2:1,
    h3:1,
    h4:1,
    h5:1,
    h6:1
  };

  title = document.getElementsByTagName("title")[0].innerHTML;//Get the title of the page
  headings.push( separator ); // Put in arrow
  headings.push( title );

  walk( document.body ); // Recursive parsing

  function walk( root ) { // Recursive tree traversal function
    if( root.nodeType === 1 && root.nodeName !== 'script' ) { // Checking for the presence
      if( tag_names.hasOwnProperty(root.nodeName.toLowerCase()) ) { // Checking for a tag
        nameTag = root.textContent.replace(/\s+/g, ' ').trim() // Getting content
        nameTag = root.nodeName + " : " + nameTag; // Form a record
        headings.push( nameTag ); // push
      } else { // Recursion
        for( var i = 0; i < root.childNodes.length; i++ ) {
          walk( root.childNodes[i] );
        }
      }
    }
  }

  console.log(headings); // Console output

  return JSON.stringify(headings); // Encrypt and return
}

