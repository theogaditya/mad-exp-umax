# Deployment Guide

## Vercel Deployment

### Environment Variables Required:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A strong secret for JWT token signing
- `REDIS_URL`: Redis connection string (optional)

### Build Process:
The project is configured to automatically run `prisma generate` during build to ensure the Prisma client is properly generated with the latest schema.

### Files Added for Deployment:
- `vercel.json`: Vercel configuration
- `package.json`: Updated with postinstall and build scripts
- `prisma/schema.prisma`: Contains the latest schema with password field

### Troubleshooting:
If you encounter Prisma client issues during deployment:
1. Ensure `DATABASE_URL` is set correctly
2. Check that the database schema matches the Prisma schema
3. The build process will automatically run `prisma generate`
