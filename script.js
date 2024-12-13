// Global Variables
const repoOwner = 'sentothecopycat'; // Replace with your GitHub username
const repoName = 'libsobo';         // Replace with your repository name
const folderPath = 'EN';           // Root folder containing author folders

let books = []; // Array to store all books
let filteredBooks = []; // Array to store the current filtered books
let searchTimeout = null; // For debounced search

// Fetch books from GitHub API
async function fetchBooksFromGitHub() {
    try {
        const authors = await fetchFolderContents(folderPath);
        for (const author of authors) {
            if (author.type === 'dir') {
                const authorName = formatName(author.name);
                const types = await fetchFolderContents(author.url);
                for (const type of types) {
                    if (type.type === 'dir') {
                        const bookFolders = await fetchFolderContents(type.url);
                        for (const bookFolder of bookFolders) {
                            if (bookFolder.type === 'dir') {
                                await processBookFolder(bookFolder, authorName, type.name);
                            }
                        }
                    }
                }
            }
        }
        filteredBooks = [...books]; // Initialize filtered books
        displayBooks(filteredBooks);
        fetchCovers(filteredBooks);
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

// Fetch folder contents from GitHub API
async function fetchFolderContents(urlOrPath) {
    const url = urlOrPath.startsWith('http') ? urlOrPath : `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${urlOrPath}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
    return await response.json();
}

// Process individual book folder
async function processBookFolder(bookFolder, authorName, typeName) {
    const files = await fetchFolderContents(bookFolder.url);
    const bookFile = files.find(file => file.name.match(/\.(epub|pdf|mobi)$/));
    const imageFile = files.find(file => file.name.match(/\.(jpg|png|jpeg)$/));

    if (bookFile) {
        books.push({
            name: formatName(bookFolder.name),
            path: bookFile.download_url,
            author: authorName,
            type: typeName,
            format: bookFile.name.split('.').pop().toUpperCase(),
            cover: imageFile ? imageFile.download_url : null
        });
    }
}

// Format names by replacing underscores with spaces
function formatName(name) {
    return name.replace(/_/g, " ");
}

// Fetch covers for books without an image
async function fetchCovers(bookList) {
    const coverPromises = bookList.map(async (book) => {
        if (!book.cover) {
            book.cover = await getBookCover(book.name);
        }
        updateCover(book);
    });
    await Promise.all(coverPromises);
}

// Update book cover dynamically
function updateCover(book) {
    const imgElement = document.querySelector(`[data-book="${book.name}"]`);
    if (imgElement) imgElement.src = book.cover;
}

// Fetch cover from Google Books API or fallback to placeholder
async function getBookCover(bookTitle) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}`);
        const data = await response.json();
        if (data.items && data.items[0].volumeInfo.imageLinks) {
            return data.items[0].volumeInfo.imageLinks.thumbnail;
        }
    } catch (error) {
        console.error("Error fetching cover from Google Books API:", error);
    }
    return "https://via.placeholder.com/50x70?text=No+Cover";
}

// Display books in the list
function displayBooks(bookArray) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = bookArray.map((book, index) => `
        <li>
            <img src="https://via.placeholder.com/50x70?text=Loading..." alt="Cover" data-book="${book.name}">
            <a href="#" onclick="openPreviewPage(${index})">${book.name} (${book.type})</a>
            <span>- ${book.author} | ${book.format}</span>
        </li>
    `).join('');
}

// Open a new page with book preview
function openPreviewPage(index) {
    const book = filteredBooks[index];
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

// Filter books based on search query
function filterBooks() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    filteredBooks = books.filter(book => 
        book.name.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.type.toLowerCase().includes(query) ||
        book.format.toLowerCase().includes(query)
    );
    displayBooks(filteredBooks);
    fetchCovers(filteredBooks);
}

// Debounce for search input
function debouncedFilterBooks() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterBooks, 300);
}

// Initialize script when the page loads
fetchBooksFromGitHub();
