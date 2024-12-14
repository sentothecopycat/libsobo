import { fetchCovers } from './covers.js';

// Display books in the list
export function displayBooks(bookArray) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = bookArray.map((book, index) => `
        <li>
            <img src="https://via.placeholder.com/50x70?text=Loading..." alt="Cover" data-book="${book.name}">
            <a href="#" onclick="openPreviewPage(${index})">${book.name} (${book.type})</a>
            <span>- ${book.author} | ${book.format}</span>
        </li>
    `).join('');

    fetchCovers(bookArray); // Fetch covers dynamically
}

// Open a new page with book preview
export function openPreviewPage(index, books) {
    const book = books[index];
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <html>
        <head><title>${book.name} - Preview</title></head>
        <body>
            <h1>${book.name}</h1>
            <img src="${book.cover || 'https://via.placeholder.com/300x400?text=No+Cover'}" alt="Book Cover">
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Type:</strong> ${book.type}</p>
            <p><strong>Format:</strong> ${book.format}</p>
            <button onclick="window.location.href='${book.path}'">Download</button>
        </body>
        </html>
    `);
    previewWindow.document.close();
}
