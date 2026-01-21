import request from 'supertest';
import app from './app.ts'; 

describe('GET /', () => {
  it('should return hello message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hello from Jenil");
  });
});