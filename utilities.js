// Fetch folder contents from GitHub API
export async function fetchFolderContents(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
    return await response.json();
}

// Format names by replacing underscores with spaces
export function formatName(name) {
    return name.replace(/_/g, ' ');
}

// Debounce for search input
export function debouncedFilterBooks(books, filteredBooks, displayBooks) {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        const query = document.getElementById('searchBox').value.toLowerCase();
        filteredBooks = books.filter(book =>
            book.name.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.type.toLowerCase().includes(query) ||
            book.format.toLowerCase().includes(query)
        );
        displayBooks(filteredBooks);
    }, 300);
}

// Fetch cover from Google Books API or fallback to placeholder
export async function getBookCover(bookTitle) {
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
