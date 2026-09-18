const request = require('supertest');

const mockUser = {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
};

jest.mock('./schemas/userschema', () => mockUser);

const { app } = require('./server');

describe('user API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET / serves the index page', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
        expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('POST /submit saves the submitted user', async () => {
        mockUser.create.mockResolvedValue({ username: 'Ada', email: 'ada@example.com' });

        const response = await request(app)
            .post('/submit')
            .send({ username: 'Ada', email: 'ada@example.com' });

        expect(response.status).toBe(200);
        expect(response.text).toContain('User saved successfully');
        expect(mockUser.create).toHaveBeenCalledWith({
            username: 'Ada',
            email: 'ada@example.com',
        });
    });

    test('POST /submit returns 500 when saving fails', async () => {
        mockUser.create.mockRejectedValue(new Error('database unavailable'));

        const response = await request(app).post('/submit').send({ username: 'Ada' });

        expect(response.status).toBe(500);
        expect(response.text).toBe('Error saving user');
    });

    test('GET /users returns all users', async () => {
        const users = [{ username: 'Ada', email: 'ada@example.com' }];
        mockUser.find.mockResolvedValue(users);

        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(users);
    });

    test('GET /users returns 500 when fetching fails', async () => {
        mockUser.find.mockRejectedValue(new Error('database unavailable'));

        const response = await request(app).get('/users');

        expect(response.status).toBe(500);
        expect(response.text).toBe('Error fetching users');
    });

    test('DELETE /users/:id deletes an existing user', async () => {
        mockUser.findByIdAndDelete.mockResolvedValue({ _id: 'user-1' });

        const response = await request(app).delete('/users/user-1');

        expect(response.status).toBe(200);
        expect(response.text).toBe('User deleted successfully');
        expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith('user-1');
    });

    test('DELETE /users/:id returns 404 when the user does not exist', async () => {
        mockUser.findByIdAndDelete.mockResolvedValue(null);

        const response = await request(app).delete('/users/missing');

        expect(response.status).toBe(404);
        expect(response.text).toBe('User not found');
    });

    test('PUT /users/:id updates an existing user', async () => {
        const updatedUser = { _id: 'user-1', username: 'Grace' };
        mockUser.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const response = await request(app)
            .put('/users/user-1')
            .send({ username: 'Grace' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedUser);
        expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
            'user-1',
            { username: 'Grace' },
            { new: true },
        );
    });

    test('PUT /users/:id returns 404 when the user does not exist', async () => {
        mockUser.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .put('/users/missing')
            .send({ username: 'Grace' });

        expect(response.status).toBe(404);
        expect(response.text).toBe('User not found');
    });

    test('PUT /users/:id returns 500 when updating fails', async () => {
        mockUser.findByIdAndUpdate.mockRejectedValue(new Error('database unavailable'));

        const response = await request(app)
            .put('/users/user-1')
            .send({ username: 'Grace' });

        expect(response.status).toBe(500);
        expect(response.text).toBe('Error updating user');
    });
});
