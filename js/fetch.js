import { fetchFolderContents, processBookFolder } from './processing.js';

// Fetch all books from GitHub API
export async function fetchBooksFromGitHub() {
    const repoOwner = 'sentothecopycat'; // Replace with your GitHub username
    const repoName = 'libsobo';         // Replace with your repository name
    const folderPath = 'EN';           // Root folder containing author folders

    let books = [];

    try {
        const authors = await fetchFolderContents(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
        for (const author of authors) {
            if (author.type === 'dir') {
                const authorName = author.name.replace(/_/g, ' ');
                const types = await fetchFolderContents(author.url);
                for (const type of types) {
                    if (type.type === 'dir') {
                        const bookFolders = await fetchFolderContents(type.url);
                        for (const bookFolder of bookFolders) {
                            if (bookFolder.type === 'dir') {
                                const book = await processBookFolder(bookFolder, authorName, type.name);
                                if (book) books.push(book);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching books:', error);
    }

    return books;
          }
