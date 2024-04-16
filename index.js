const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Function to fetch and parse the webpage
async function fetchComic(comicNumber) {
  try {
    const response = await axios.get(`https://xkcd.com/${comicNumber}/`);
    const $ = cheerio.load(response.data);

    // Get the comic image URL
    const comicImageUrl = $('#comic img').attr('src');
    const comicTitle = $('#comic img').attr('title');

    return { imageUrl: comicImageUrl, title: comicTitle };
  } catch (error) {
    console.error(`Error fetching comic ${comicNumber}:`, error);
    return null;
  }
}

// Function to sanitize title for use as a filename
function sanitizeFilename(title) {
  return title.replace(/[^\w\s]/gi, '_'); // Replace non-alphanumeric characters with underscores
}

// Function to download the image
async function downloadImage(url, title) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const sanitizedTitle = sanitizeFilename(title);
    const imagePath = path.join(__dirname, `${sanitizedTitle}.png`);
    fs.writeFileSync(imagePath, response.data);
    return imagePath;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

// Main function to scrape and download comics in a range
async function scrapeAndDownloadComics(startComic, endComic) {
  for (let i = startComic; i <= endComic; i++) {
    const comic = await fetchComic(i);
    if (comic && comic.imageUrl) {
      const imagePath = await downloadImage(comic.imageUrl, comic.title);
      if (imagePath) {
        console.log(`Comic ${i} downloaded:`, imagePath);
      } else {
        console.log(`Failed to download comic ${i}.`);
      }
    } else {
      console.log(`Comic ${i} not found.`);
    }
  }
}

// Set the range of comics to scrape
const startComicNumber = 1; // Start from the first comic
const endComicNumber = 999; // Scrape up to the 10th comic

// Run the main function to scrape and download comics in the specified range
scrapeAndDownloadComics(startComicNumber, endComicNumber);
