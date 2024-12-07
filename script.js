let books = [];

// Load metadata.json
fetch('EN/metadata.json')
  .then(response => response.json())
  .then(data => books = data)
  .catch(error => console.error("Error loading metadata:", error));

// Search function
function searchBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const results = books.filter(book =>
    book.title.toLowerCase().includes(query) || 
    book.author.toLowerCase().includes(query)
  );

  displayResults(results);
}

// Display search results
function displayResults(results) {
  const table = document.getElementById('resultsTable');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = ''; // Clear previous results

  if (results.length === 0) {
    table.style.display = 'none';
    alert('No books found!');
    return;
  }

  results.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.format.toUpperCase()}</td>
      <td><a href="${book.path}" download>Download</a></td>
    `;
    tbody.appendChild(row);
  });

  table.style.display = 'table';
      }
