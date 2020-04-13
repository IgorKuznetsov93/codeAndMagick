const { MongoClient } = require('mongodb');
const logger = require('../logger');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';

module.exports = MongoClient.connect(url).then((client) => client.db('code-and-magick')).catch((e) => {
    logger.error('Failed to connect to MongoDB', e);
    process.exit(1);
});
