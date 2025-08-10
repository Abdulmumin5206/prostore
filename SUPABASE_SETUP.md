# Supabase Authentication Setup

## Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project

## Configuration Steps

### 1. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

### 2. Create Environment File
Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Enable Email Authentication
1. In your Supabase dashboard, go to Authentication > Providers
2. Make sure Email provider is enabled
3. Configure any additional settings as needed

### 4. Create Admin User
1. Sign up through your app at `/signup` with username "admin" and any password
2. Go to Supabase dashboard > Authentication > Users
3. Find your user and set their role to "admin" if needed

**Quick Test:**
- Username: `admin`
- Password: `password123`
- This will create an account with email `admin@example.com`

## Available Routes

- `/signup` - User registration
- `/signin` - User login  
- `/admin` - Protected admin dashboard (requires authentication)

## Features

- ✅ Simple username-based registration and login (no email required)
- ✅ Protected admin route
- ✅ Automatic redirects for unauthenticated users
- ✅ Clean, responsive UI with Tailwind CSS
- ✅ Dark mode support
- ✅ TypeScript support

## Security Notes

- The admin route is protected and only accessible to authenticated users
- Passwords are handled securely by Supabase
- Session management is automatic
- No hardcoded credentials in the code 