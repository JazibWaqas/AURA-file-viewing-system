const algoliasearch = require('algoliasearch');

let client = null;
let algoliaIndex = null;

if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY && process.env.ALGOLIA_INDEX_NAME) {
  try {
    client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
    algoliaIndex = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
  } catch (error) {
    console.warn('Algolia initialization failed:', error.message);
  }
} else {
  console.warn('Algolia environment variables not set. Search will fall back to in-memory filtering.');
}

module.exports = { client, algoliaIndex }; 