# Product Manager Portfolio

Next.js portfolio with editable content for:

- Home
- About
- Interests
- Projects
- Blog
- Contact

The admin panel lives at `/admin`. Set these Vercel environment variables before deploying:

```bash
ADMIN_PASSWORD=your-long-password
SESSION_SECRET=random-32-character-secret
BLOB_READ_WRITE_TOKEN=token-from-vercel-blob
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## Vercel Setup

1. Create a Vercel project from this repository.
2. In Vercel Storage, create a Blob store and connect it to the project.
3. Add the environment variables above.
4. Deploy.
5. Visit `/admin`, sign in, and edit your portfolio content.

Without `BLOB_READ_WRITE_TOKEN`, local edits are stored in `data/site-content.local.json`.
