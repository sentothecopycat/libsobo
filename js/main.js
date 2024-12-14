import { fetchBooksFromGitHub } from './fetch.js';
import { displayBooks } from './rendering.js';
import { debouncedFilterBooks } from './utilities.js';

let books = []; // Global storage for all books
let filteredBooks = []; // Filtered books for search functionality

// Initialize the application
async function initialize() {
    books = await fetchBooksFromGitHub(); // Fetch all books
    filteredBooks = [...books]; // Initially, filtered books are all books
    displayBooks(filteredBooks); // Display the books
}

// Attach event listener for search input
document.getElementById('searchBox').addEventListener('input', () => debouncedFilterBooks(books, filteredBooks, displayBooks));

// Start the app
initialize();
