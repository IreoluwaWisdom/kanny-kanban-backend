import request from 'supertest';
import app from '../server';
import prisma from '../config/database';
import jwt from 'jsonwebtoken';

describe('Board API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'boardtest@example.com',
        password: 'hashedpassword',
        name: 'Board Test User',
      },
    });
    userId = user.id;

    // Generate token
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/boards/current', () => {
    it('should get or create current board', async () => {
      const response = await request(app)
        .get('/api/boards/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('columns');
      expect(Array.isArray(response.body.columns)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/boards/current')
        .expect(401);
    });
  });

  describe('GET /api/boards', () => {
    it('should get all boards for user', async () => {
      const response = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

