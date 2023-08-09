let isPopupOpen = false;
let validInputs = [];
let supplements = [];

// Fetch the valid inputs from the server when the page loads.
window.onload = function() {
  fetch('http://localhost:3000/ingredients/')
    .then(response => response.json())
    .then(data => {
      validInputs = data.map(ingredient => ingredient.name);
    })
    .catch(error => console.error('Error:', error));
  document.getElementById('addSupplementButton').addEventListener('click', function(event) {
    event.stopPropagation();
    openPopup();
  });

  document.getElementById('closePopupButton').addEventListener('click', function(event) {
    event.stopPropagation();
    closePopup();
  });

  document.getElementById('addSupplementForm').addEventListener('submit', addSupplement);
}


document.getElementById('downloadTableButton').addEventListener('click', function() {
  html2canvas(document.querySelector("#supplementContainer"))
  .then(canvas => {
      // Create a new canvas
      let newCanvas = document.createElement('canvas');
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;

      // Get the 2D context of the new canvas
      let ctx = newCanvas.getContext('2d');

      // Draw a white rectangle
      ctx.fillStyle = '#F7F7F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the original canvas onto the new one
      ctx.drawImage(canvas, 0, 0);

      // Create the download link using the new canvas
      let link = document.createElement('a');
      link.download = 'supplementTable.png';
      link.href = newCanvas.toDataURL();
      link.click();
  });
});



function openPopup() {
  let popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('hidden');
    isPopupOpen = true;
  } else {
    console.log("Cannot find element with id 'popup'");
  }
}

function closePopup() {
  let popup = document.getElementById('popup');
  if (popup) {
    popup.classList.add('hidden');
    isPopupOpen = false;
  } else {
    console.log("Cannot find element with id 'popup'");
  }
}

// Event listener for the supplement name input field
document.getElementById('supplementName').addEventListener('input', function() {
  let supplementName = document.getElementById('supplementName');
  let suggestionBox = document.getElementById('suggestionBox'); 
  supplementName.addEventListener('input', function() {
      let inputValue = this.value;
      suggestionBox.innerHTML = '';
  
      if (!inputValue) {
          suggestionBox.style.display = 'none'; // hide the box if the input is empty
          return
      } else {
          suggestionBox.style.display = 'block'; // show the box if the input is not empty
      }
  
      let suggestions = validInputs.filter(function(input) {
          return input.toLowerCase().startsWith(inputValue.toLowerCase());
      });
  
      suggestions.forEach(function(suggestion) {
          let suggestionElement = document.createElement('div');
          suggestionElement.textContent = suggestion;
          suggestionElement.addEventListener('click', function(event) {
              supplementName.value = this.textContent;
              // Fetch the data for the selected supplement
              fetch('http://localhost:3000/ingredients/' + encodeURIComponent(supplementName.value))
              .then(response => response.json())
              .then(data => {
                // Set the unit of the supplement
                let supplementUnit = document.getElementById('supplementUnit');
                supplementUnit.value = data.unit;
                supplementUnit.disabled = true;
              })
              .catch(error => console.error('Error:', error));
              suggestionBox.innerHTML = '';
              supplementName.value = this.textContent;
              event.stopPropagation();  // Stop the click event from bubbling up to the body
              suggestionBox.style.display = 'none'; // hide the box after a suggestion is clicked
          });
          suggestionBox.appendChild(suggestionElement);
      });
  });
});
//OCR
// Add event listener to the file input
// document.getElementById('fileUploader').addEventListener('change', runOCR);

// // Define the OCR function
// function runOCR(event) {
//   const file = event.target.files[0];
//   Tesseract.recognize(
//       file,
//       'eng',
//       { logger: m => console.log(m) }
//   ).then(({ data }) => {
//       if (data && data.text) {
//           console.log(data.text);
//       } else {
//           console.error('OCR failed: Unexpected result structure.');
//       }
//   }).catch(error => {
//       console.error('OCR failed: An error occurred during processing.', error);
//   });
// }

// Function to add a new supplement
function addSupplement(event) {
  event.preventDefault();

  let supplementName = document.getElementById('supplementName');
  let supplementAmount = document.getElementById('supplementAmount');
  let supplementUnit = document.getElementById('supplementUnit');

  // Check if the entered supplement name is valid
  if (!validInputs.includes(supplementName.value)) {
    alert('Please enter a valid supplement name from the suggestions.');
    return;  // Stop the function if the name is not valid
  }

  let supplement = {
    name: supplementName.value,
    amount: supplementAmount.value,
    unit: supplementUnit.value
  };
  
  supplements.push(supplement);
  updateSupplementList();

  // Clear the input fields
  supplementName.value = '';
  supplementAmount.value = '';
  supplementUnit.value = '';
}

function updateSupplementList() {
    const supplementContainer = document.getElementById('supplementContainer');
    supplementContainer.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    const headerName = document.createElement('th');
    const headerAmount = document.createElement('th');
    const headerFDALimit = document.createElement('th');

    headerName.textContent = 'Supplement';
    headerAmount.textContent = 'Amount';
    headerFDALimit.textContent = 'FDA Limit (%)';

    headerRow.appendChild(headerName);
    headerRow.appendChild(headerAmount);
    headerRow.appendChild(headerFDALimit);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    for (const supplement of supplements) {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const amountCell = document.createElement('td');
        const fdaLimitCell = document.createElement('td');

        const supplementNameLink = document.createElement('a');
        supplementNameLink.href = 'https://examine.com/search/?q=' + encodeURIComponent(supplement.name);
        supplementNameLink.textContent = supplement.name;
        supplementNameLink.target = '_blank';

        supplementNameLink.addEventListener('mouseover', function() {
            fetch('http://localhost:3000/ingredients/' + encodeURIComponent(supplement.name))
            .then(response => response.json())
            .then(data => {
                // Display the fetched data in a tooltip
                supplementNameLink.title = data.description;
            })
            .catch(error => console.error('Error:', error));
        });

        nameCell.appendChild(supplementNameLink);
        nameCell.appendChild(supplementNameLink);
        amountCell.textContent = `${supplement.amount} ${supplement.unit}`;

        // Create a progress bar
        const progressBar = document.createElement('progress');
        progressBar.max = 100;  // Set the max value to 100 to represent 100%

        fetch('http://localhost:3000/ingredients/' + encodeURIComponent(supplement.name) + '/fda-limit')
        .then(response => response.json())
        .then(data => {
            if (data.FDA_limit !== null) {
                let percentage = (supplement.amount / data.FDA_limit) * 100;
                progressBar.value = percentage <= 100 ? percentage : 100; // Limit the progress bar to 100

                progressBar.title = `${supplement.amount} / ${data.FDA_limit}`;

                // If the calculated percentage is 100 or more, add the 'exceeded' class
                if (percentage >= 100) {
                    progressBar.classList.add('exceeded');
                }

                fdaLimitCell.appendChild(progressBar);
            }
        })
        .catch(error => console.error('Error:', error));


        fdaLimitCell.appendChild(progressBar);

        row.appendChild(nameCell);
        row.appendChild(amountCell);
        row.appendChild(fdaLimitCell);

        tbody.appendChild(row);
        
    } 
    document.getElementById('downloadTableButton').style.visibility = 'visible';
    table.appendChild(tbody);
    supplementContainer.appendChild(table);
}


document.body.onclick = function(event) {
    if (!isPopupOpen) return;
    const isClickInside = document.getElementById('popup').contains(event.target);
    if (!isClickInside) closePopup();
};

document.getElementById('ShareButton').addEventListener('click', function() {
    const shareInputContainer = document.getElementById('shareInputContainer');
    shareInputContainer.classList.remove('hidden');
});

document.getElementById('submitButton').addEventListener('click', function() {
    const username = document.getElementById('usernameInput').value;
    if (username) {
        // Make a POST request with the username (or any other action you want to perform)
        postDataToServer(username);
    } else {
        alert("Please enter a username!");
    }
});

// function postDataToServer(username) {
//     // Example of sending the username to a server endpoint
//     fetch('http://localhost:3000/share', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username: username })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);  // Process the response if needed
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// }
