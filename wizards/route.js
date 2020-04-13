const { Router } = require('express');

const wizardsRouter = new Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');

const toPage = async (cursor, skip = 0, limit = 20) => ({
    data: await (cursor.skip(skip).limit(limit).toArray()),
    skip,
    limit,
    total: await cursor.count(),
});

wizardsRouter.use(bodyParser.json());

wizardsRouter.use((req, res, next) => {
    cors();
    next();
});

wizardsRouter.get('/', asyncHandler(async (req, res) => {
    const { skip, limit } = req.query;
    res.send(toPage(await wizardsRouter.wizardsStore.getAllWizards(), skip, limit));
}));

module.exports = (wizardStore, imageStore) => {
    wizardsRouter.wizardsStore = wizardStore;
    wizardsRouter.imageStore = imageStore;
    return wizardsRouter;
};
