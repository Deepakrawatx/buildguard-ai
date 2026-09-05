# BuildGuard AI — Public Demo Mode

This version removes login completely for easy client demos.

- Dashboard opens directly
- New projects save in browser localStorage
- Refresh keeps projects on the same browser
- Reset Demo restores the sample portfolio
- Upload Document stores only file metadata locally
- Supabase is not used, so private database/storage is not exposed

## Deploy
Replace the existing GitHub repository files with these files. Vercel will redeploy automatically.

No environment variables are required for this demo build.

For paying clients, use the authenticated Supabase version so each company's data stays private.
