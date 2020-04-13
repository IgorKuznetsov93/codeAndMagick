const express = require('express');
const wizardStore = require('./wizards/store');
const imageStore = require('./images/store');
const wizardsRouter = require('./wizards/route')(wizardStore, imageStore);
const logger = require('./logger');

const app = express();
app.use(express.static('static'));

app.use('/api/wizards', wizardsRouter);

const HOSTNAME = 'localhost';
const PORT = 3000;

const serverAddress = `http://${HOSTNAME}:${PORT}`;

app.listen(PORT, HOSTNAME, () => {
    logger.info(`Server running at ${serverAddress}/`);
});

module.exports = {
    app,
};
