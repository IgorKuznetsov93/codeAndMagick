const { Router } = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const { MongoError } = require('mongodb');
const asyncHandler = require('express-async-handler');
const NotFoundError = require('../error/not-found-error');
const ValidationError = require('../error/validation-error');
const createStreamFromBuffer = require('../util/buffer-to-stream')
const logger = require('../logger');
const Colors = require('../data/Colors');


const wizardsRouter = new Router();

const toPage = async (cursor, skip = 0, limit = 20) => ({
    data: await (cursor.skip(skip).limit(limit).toArray()),
    skip,
    limit,
    total: await cursor.count(),
});

const upload = multer({ storage: multer.memoryStorage() });

wizardsRouter.use(bodyParser.json());

wizardsRouter.use(cors());

wizardsRouter.get('/', asyncHandler(async (req, res) => {
    const { skip, limit } = req.query;
    res.send(toPage(await wizardsRouter.wizardsStore.getAllWizards(), skip, limit));
}));

wizardsRouter.get(':name', asyncHandler(async (req, res) => {
    const wizardName = req.params.name;
    const wizard = await wizardsRouter.wizardsStore.getWizard(wizardName);
    if (!wizard) {
        throw new NotFoundError(`Wizard with name "${wizardName}" not found`);
    }
    res.send(wizard);
}));

wizardsRouter.post('', upload.single('avatar'), asyncHandler(async (req, res) => {
    const {
        userName, coatColor, eyeColor, fireballColor,
    } = req.body;
    let avatar = req.file;

    logger.info('Received data from user: ', {
        userName, coatColor, eyeColor, fireballColor, avatar,
    });

    if (!userName || userName.length < 1) {
        throw new ValidationError('userName must be defined and greater than 1 symbols');
    }
    if (!coatColor || Colors.COAT.indexOf(coatColor) === -1) {
        throw new ValidationError(`coatColor must be defined and be one of the values: ${Colors.COAT}`);
    }
    if (!eyeColor || Colors.EYES.indexOf(eyeColor) === -1) {
        throw new ValidationError(`eyeColor must be defined and be one of the values: ${Colors.EYES}`);
    }
    if (!fireballColor || Colors.FIREBALL.indexOf(fireballColor) === -1) {
        throw new ValidationError(`fireballColor must be defined and be one of the values: ${Colors.FIREBALL}`);
    }

    if (avatar) {
        const avatarInfo = {
            path: `/api/wizards/${userName}/avatar`,
            mimetype: avatar.mimetype,
        };
        await wizardsRouter.imageStore.save(avatarInfo.path, createStreamFromBuffer(avatar.buffer));
        avatar = avatarInfo;
    }
    res.send(await wizardsRouter.wizardsStore.save({
        userName, coatColor, eyeColor, fireballColor, avatar,
    }));
}));

wizardsRouter.get('/:name/avatar', asyncHandler(async (req, res) => {
    const wizardName = req.params.name;

    const wizard = await wizardsRouter.wizardsStore.getWizard(wizardName);

    if (!wizard) {
        throw new NotFoundError(`Wizard with name "${wizardName}" not found`);
    }

    const { avatar } = wizard;

    if (!avatar) {
        throw new NotFoundError(`Wizard with name "${wizardName}" didn't upload avatar`);
    }

    const { info, stream } = await wizardsRouter.imageStore.get(avatar.path);

    if (!info) {
        throw new NotFoundError('File was not found');
    }

    res.set('content-type', avatar.mimetype);
    res.set('content-length', info.length);
    res.status(200);
    stream.pipe(res);
}));

wizardsRouter.use((error, req, res, next) => {
    let data = error;
    if (error instanceof ValidationError) {
        data = error.errors;
    } else if (error instanceof MongoError) {
        data = {};
        if (error.code === 11000) {
            data.code = 400;
            data.errorMessage = 'Дубликат существущего персонажа';
        } else {
            data.code = 501;
            data.errorMessage = error.message;
        }
    }
    res.status(data.code || 400);
    res.send(data);
});


module.exports = (wizardStore, imageStore) => {
    wizardsRouter.wizardsStore = wizardStore;
    wizardsRouter.imageStore = imageStore;
    return wizardsRouter;
};
