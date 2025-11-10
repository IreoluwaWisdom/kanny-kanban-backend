import request from 'supertest';
import app from '../server';
import prisma from '../config/database';

describe('Auth flow', () => {
  beforeAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('signup -> me -> refresh -> logout -> refresh fails', async () => {
    // Signup
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'flow@example.com', password: 'password123', name: 'Flow User' })
      .expect(201);

    const accessToken = signup.body.accessToken as string;
    const cookies = signup.headers['set-cookie'];
    expect(cookies).toBeDefined();

    // Me
    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.email).toBe('flow@example.com');

    // Refresh with cookie
    const refresh = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies)
      .expect(200);
    expect(refresh.body).toHaveProperty('accessToken');

    // Logout
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies)
      .expect(200);

    // Refresh should now fail
    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies)
      .expect(401);
  });
});

