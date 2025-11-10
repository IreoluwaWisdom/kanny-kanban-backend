import request from 'supertest';
import app from '../server';
import prisma from '../config/database';
import jwt from 'jsonwebtoken';

describe('Column API', () => {
  let authToken: string;
  let userId: string;
  let boardId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'columntest@example.com',
        password: 'hashedpassword',
        name: 'Column Test User',
      },
    });
    userId = user.id;

    // Generate token
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '15m' }
    );

    // Create a board for the user
    const board = await prisma.board.create({
      data: {
        name: 'Columns Board',
        userId: user.id,
      },
    });
    boardId = board.id;
  });

  afterAll(async () => {
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/boards/:boardId/columns', () => {
    it('creates a new column', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/columns`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Backlog' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Backlog');
      expect(res.body.boardId).toBe(boardId);
    });

    it('requires authentication', async () => {
      await request(app)
        .post(`/api/boards/${boardId}/columns`)
        .send({ name: 'Unauthorized' })
        .expect(401);
    });
  });

  describe('PUT /api/boards/columns/:id', () => {
    it('updates a column name', async () => {
      const col = await prisma.column.create({
        data: { name: 'Old', boardId, position: 0 },
      });

      const res = await request(app)
        .put(`/api/boards/columns/${col.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New' })
        .expect(200);

      expect(res.body.name).toBe('New');
    });
  });

  describe('DELETE /api/boards/columns/:id', () => {
    it('deletes a column', async () => {
      const col = await prisma.column.create({
        data: { name: 'To Delete', boardId, position: 0 },
      });

      await request(app)
        .delete(`/api/boards/columns/${col.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const exists = await prisma.column.findUnique({ where: { id: col.id } });
      expect(exists).toBeNull();
    });
  });
});

