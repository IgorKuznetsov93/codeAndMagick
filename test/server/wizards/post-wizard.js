const request = require('supertest');
const mockWizardsRouter = require('./mock-wizards-router');
const app = require('express')();

app.use('/api/wizards', mockWizardsRouter);

describe('POST /api/wizards', () => {
    it('should consume JSON', () => request(app).post('/api/wizards')
        .send({
            userName: 'Гендальф Серый',
            coatColor: 'rgb(56, 159, 117)',
            eyeColor: 'red',
            fireballColor: '#5ce6c0',
        })
        .expect(200, {
            userName: 'Гендальф Серый',
            coatColor: 'rgb(56, 159, 117)',
            eyeColor: 'red',
            fireballColor: '#5ce6c0',
        }));

    it('should consume JSON with avatar', () => request(app).post('/api/wizards')
        .field('userName', 'Гендальф Серый')
        .field('coatColor', 'rgb(56, 159, 117)')
        .field('eyeColor', 'red')
        .field('fireballColor', '#5ce6c0')
        .attach('avatar', 'test/fixtures/keks.png')
        .expect(200, {
            userName: 'Гендальф Серый',
            coatColor: 'rgb(56, 159, 117)',
            eyeColor: 'red',
            fireballColor: '#5ce6c0',
            avatar: {
                path: '/api/wizards/Гендальф Серый/avatar',
                mimetype: 'image/png',
            },
        }));

    it('should fail if username is invalid', () => request(app).post('/api/wizards')
        .field('userName', 'Г')
        .field('coatColor', 'rgb(56, 159, 117)')
        .field('eyeColor', 'red')
        .field('fireballColor', '#5ce6c0')
        .attach('avatar', 'test/fixtures/keks.png')
        .expect(400));
});
