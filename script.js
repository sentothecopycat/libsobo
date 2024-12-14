// Global Variables
const repoOwner = 'sentothecopycat'; // Replace with your GitHub username
const repoName = 'libsobo';         // Replace with your repository name
const folderPath = 'EN';           // Root folder containing author folders

let books = []; // Array to store all books
let collections = []; // Array to store collections
let filteredItems = []; // Combined array of books and collections for filtering
let searchTimeout = null; // For debounced search

// Fetch books and collections from GitHub API
async function fetchBooksAndCollections() {
    try {
        const authors = await fetchFolderContents(folderPath);
        for (const author of authors) {
            if (author.type === 'dir') {
                const authorName = formatName(author.name);
                const types = await fetchFolderContents(author.url);
                for (const type of types) {
                    if (type.type === 'dir') {
                        const items = await fetchFolderContents(type.url);
                        for (const item of items) {
                            if (item.type === 'dir') {
                                await processItem(item, authorName, type.name);
                            }
                        }
                    }
                }
            }
        }
        filteredItems = [...books, ...collections]; // Combine books and collections for filtering
        displayItems(filteredItems);
        fetchCovers(books); // Fetch covers for individual books
    } catch (error) {
        console.error("Error fetching books and collections:", error);
    }
}

// Fetch folder contents from GitHub API
async function fetchFolderContents(urlOrPath) {
    const url = urlOrPath.startsWith('http') ? urlOrPath : `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${urlOrPath}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
    return await response.json();
}

// Process an item (book or collection)
async function processItem(item, authorName, typeName) {
    const contents = await fetchFolderContents(item.url);
    const subfolders = contents.filter(file => file.type === 'dir');
    const bookFile = contents.find(file => file.name.match(/\.(epub|pdf|mobi)$/));
    const imageFile = contents.find(file => file.name.match(/\.(jpg|png|jpeg)$/));

    if (subfolders.length > 0) {
        // Treat as a collection
        const collectionBooks = [];
        for (const subfolder of subfolders) {
            const subfolderContents = await fetchFolderContents(subfolder.url);
            const subBookFile = subfolderContents.find(file => file.name.match(/\.(epub|pdf|mobi)$/));
            const subImageFile = subfolderContents.find(file => file.name.match(/\.(jpg|png|jpeg)$/));
            if (subBookFile) {
                collectionBooks.push({
                    name: formatName(subfolder.name),
                    path: subBookFile.download_url,
                    author: authorName,
                    type: `${typeName} - Volume`,
                    format: subBookFile.name.split('.').pop().toUpperCase(),
                    cover: subImageFile ? subImageFile.download_url : null
                });
            }
        }
        collections.push({
            name: formatName(item.name),
            author: authorName,
            type: `${typeName} - Collection`,
            books: collectionBooks,
            cover: imageFile ? imageFile.download_url : null
        });
    } else if (bookFile) {
        // Treat as an individual book
        books.push({
            name: formatName(item.name),
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

// Display books and collections in the list
function displayItems(itemArray) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = itemArray.map((item, index) => {
        if (item.books) {
            // Display as a collection
            return `
                <li>
                    <img src="${item.cover || 'https://via.placeholder.com/50x70?text=Collection'}" alt="Cover">
                    <a href="#" onclick="viewCollection(${index})">${item.name} (${item.type})</a>
                    <span>- ${item.author}</span>
                </li>
            `;
        } else {
            // Display as an individual book
            return `
                <li>
                    <img src="${item.cover || 'https://via.placeholder.com/50x70?text=Loading...'}" alt="Cover" data-book="${item.name}">
                    <a href="#" onclick="openPreviewPage(${index})">${item.name} (${item.type})</a>
                    <span>- ${item.author} | ${item.format}</span>
                </li>
            `;
        }
    }).join('');
}

// View a collection (show books inside the collection)
function viewCollection(index) {
    const collection = collections[index];
    const collectionPage = window.open('', '_blank');
    collectionPage.document.write(`
        <html>
        <head><title>${collection.name} - Collection</title></head>
        <body>
            <h1>${collection.name}</h1>
            <p><strong>Author:</strong> ${collection.author}</p>
            <p><strong>Type:</strong> ${collection.type}</p>
            <h2>Books:</h2>
            <ul>
                ${collection.books.map(book => `
                    <li>
                        <img src="${book.cover || 'https://via.placeholder.com/50x70?text=Loading...'}" alt="Cover">
                        <a href="${book.path}" download>${book.name} (${book.format})</a>
                    </li>
                `).join('')}
            </ul>
        </body>
        </html>
    `);
    collectionPage.document.close();
}

// Open a new page with book preview
function openPreviewPage(index) {
    const book = filteredItems[index];
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

// Filter items based on search query
function filterItems() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    filteredItems = [...books, ...collections].filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        (item.format && item.format.toLowerCase().includes(query))
    );
    displayItems(filteredItems);
    fetchCovers(filteredItems.filter(item => !item.books)); // Fetch covers for individual books only
}

// Debounce for search input
function debouncedFilterItems() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterItems, 300);
}

// Initialize script when the page loads
fetchBooksAndCollections();
