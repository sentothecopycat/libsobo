import { getBookCover } from './utilities.js';

// Fetch covers for books without an image
export async function fetchCovers(bookList) {
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
