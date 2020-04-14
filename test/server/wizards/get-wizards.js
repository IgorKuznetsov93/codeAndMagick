const request = require('supertest');
const assert = require('assert');
const mockWizardsRouter = require('./mock-wizards-router');
const app = require('express')();

app.use('/api/wizards', mockWizardsRouter);

describe('GET /api/wizards', () => {
    it('respond with json', () => request(app)
        .get('/api/wizards')
        .set('Accept', 'application/json')
        .expect(200)
        .then((response) => {
            const page = response.body;
            assert.equal(page.total, 17);
            assert.equal(page.data.length, 17);
            assert.equal(Object.keys(page.data[0]).length, 5);
        }));

    it('find wizard by name', () => request(app)
        .get(`/api/wizards/${encodeURIComponent('дамблдор')}`)
        .expect(200)
        .then((response) => {
            const wizard = response.body;
            assert.equal(wizard.name, 'Дамблдор');
        }));

    it('unknown address should respond with 404', () => request(app)
        .get('/api/wizardsaaa')
        .set('Accept', 'application/json')
        .expect(404));
});
