let isPopupOpen = false;
let validInputs = [];
let supplements = [];



// Fetch the valid inputs from the server when the page loads.
window.onload = function() {
    fetch('localhost:3000/users')
    .then(response => response.json())
    .then(user => {
        if (user && user.ingredients) {
            updateSupplementList(user.ingredients);
        }
    })
    .catch(error => {
        console.error('Error fetching users:', error);
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
document.getElementById('fileUploader').addEventListener('change', runOCR);

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


const supplementContainer = document.getElementById('supplementContainer');
supplementContainer.innerHTML = '';

const table = document.createElement('table');
const thead = document.createElement('thead');
const tbody = document.createElement('tbody');
const headerRow = document.createElement('tr');
const headerName = document.createElement('th');
const headerAmount = document.createElement('th');

headerName.textContent = 'Supplement';
headerAmount.textContent = 'Amount';

headerRow.appendChild(headerName);
headerRow.appendChild(headerAmount);

thead.appendChild(headerRow);
table.appendChild(thead);

for (const [name, amount] of Object.entries(ingredientsData)) {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const amountCell = document.createElement('td');

    nameCell.textContent = name;
    amountCell.textContent = `${amount}`;

    row.appendChild(nameCell);
    row.appendChild(amountCell);

    tbody.appendChild(row);
}

table.appendChild(tbody);
supplementContainer.appendChild(table);




document.getElementById('ShareButton').addEventListener('click', function() {
    const shareInputContainer = document.getElementById('shareInputContainer');
    shareInputContainer.classList.remove('hidden');
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
