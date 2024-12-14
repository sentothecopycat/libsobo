import { fetchFolderContents } from './utilities.js';

// Process a single book folder to extract book and image data
export async function processBookFolder(bookFolder, authorName, typeName) {
    const files = await fetchFolderContents(bookFolder.url);
    const bookFile = files.find(file => file.name.match(/\.(epub|pdf|mobi)$/));
    const imageFile = files.find(file => file.name.match(/\.(jpg|png|jpeg)$/));

    if (bookFile) {
        return {
            name: bookFolder.name.replace(/_/g, ' '),
            path: bookFile.download_url,
            author: authorName,
            type: typeName,
            format: bookFile.name.split('.').pop().toUpperCase(),
            cover: imageFile ? imageFile.download_url : null
        };
    }

    return null;
                                }
