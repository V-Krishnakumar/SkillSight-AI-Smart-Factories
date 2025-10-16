# 🚀 Quick Setup Guide - Supabase Configuration

## Step 1: Set Up Supabase Database Tables

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `kequigxmxlocgrzmlvyt`
3. **Go to SQL Editor** (left sidebar)
4. **Copy and paste the entire contents** of `supabase_setup.sql` file
5. **Click "Run"** to execute the SQL script

This will create:
- ✅ `workers` table with sample data
- ✅ `assignments` table for task assignments
- ✅ Proper indexes and policies

## Step 2: Verify Environment Variables

Your `.env.local` file should contain:
```
VITE_SUPABASE_URL=https://kequigxmxlocgrzmlvyt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcXVpZ3hteGxvY2dyem1sdnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjM4MjIsImV4cCI6MjA3NjEzOTgyMn0.ak7cc10jAJZsd6Aow_nyF7UtS01NwZhKbxepXRm_4no
```

## Step 3: Restart Development Server

1. **Stop the current server** (Ctrl+C in terminal)
2. **Start it again**:
   ```bash
   npm run dev
   ```

## Step 4: Test the Connection

1. **Open browser**: http://localhost:8080
2. **Go to Manager Dashboard** → **Test Assignment** tab
3. **Click "Test Supabase Connection"** button
4. **Check browser console** for debug output

## Expected Debug Output

You should see in the browser console:
```
🔍 Supabase Debug Info:
VITE_SUPABASE_URL: https://kequigxmxlocgrzmlvyt.supabase.co
VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Supabase credentials configured successfully
```

## Troubleshooting

### If you still see "Supabase is not configured":

1. **Check file location**: Make sure `.env.local` is in the project root
2. **Restart server**: Stop and start `npm run dev` again
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
4. **Check console**: Look for the debug output above

### If you see "assignments table does not exist":

1. **Run the SQL script** in Supabase SQL Editor
2. **Verify tables exist** in Supabase Table Editor
3. **Check RLS policies** are enabled

## Next Steps

Once Supabase is working:
1. **Test Assignment**: Click "Test Automated Assignment"
2. **View Results**: Check the Task Assignment tab
3. **Worker Dashboard**: See assigned tasks for workers

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify the SQL script ran successfully in Supabase
3. Make sure both servers are running (ML server + Frontend)
