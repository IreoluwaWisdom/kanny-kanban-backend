# Prisma Setup Guide for Supabase

## Step 1: Get Your Supabase Database Connection String

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **Database** in the settings menu
4. Scroll down to **Connection string** section
5. Select **URI** tab
6. Copy the connection string - it will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password (the one you set when creating the project)

## Step 2: Create .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```

3. Generate strong JWT secrets (you can use an online generator or run):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET

4. Fill in the rest of the `.env` file with your values

## Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the Prisma Client based on your schema.

## Step 4: Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted:
- **Migration name**: Enter a descriptive name like `init` or `initial_schema`
- Prisma will create the migration files and apply them to your Supabase database

## Step 5: Verify Migration

You can verify the migration worked by:

1. **Using Prisma Studio** (visual database browser):
   ```bash
   npm run prisma:studio
   ```
   This will open a browser at `http://localhost:5555` where you can see your tables

2. **Or check in Supabase Dashboard**:
   - Go to **Table Editor** in your Supabase dashboard
   - You should see tables: `User`, `RefreshToken`, `Board`, `Column`, `Card`

## Troubleshooting

### Connection Error
- Make sure your Supabase database password is correct
- Check that your IP is allowed in Supabase (Settings > Database > Connection pooling)
- Try using the connection pooler URL if direct connection fails

### Migration Fails
- Make sure the database is empty or you're okay with Prisma managing it
- Check that you have the correct permissions on the database
- Verify the connection string format is correct

### Reset Database (if needed)
⚠️ **Warning**: This will delete all data!

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed scripts (if any)

## Next Steps

After migrations are complete:
1. Start your backend server: `npm run dev`
2. Test the connection by hitting the health endpoint: `http://localhost:3001/health`
3. Try creating a user via the signup endpoint

