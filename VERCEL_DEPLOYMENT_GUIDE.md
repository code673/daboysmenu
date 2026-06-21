# 🚀 Daboy's Menu - Vercel Deployment Guide

## Prerequisites
Before deploying to Vercel, make sure you have:
- Git installed ([Download](https://git-scm.com/))
- GitHub account ([Create one](https://github.com/signup))
- Vercel account ([Sign up free](https://vercel.com/signup))
- MongoDB Atlas account (optional, for cloud database)

---

## Step 1: Prepare Your Project for Vercel

### 1.1 Install Vercel CLI (Optional but recommended)
```bash
npm install -g vercel
```

### 1.2 Update `server.js` for Vercel (Allow no database connection initially)
The server is already configured to work in fallback mode using localStorage. ✅

### 1.3 Create `vercel.json` configuration file
In your project root directory, create a file named `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 1.4 Update `package.json` (Ensure correct start script)
Make sure your `package.json` has:
```json
{
  "name": "daboysmenu",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "multer": "^1.4.5-lts.2"
  }
}
```

---

## Step 2: Push Your Code to GitHub

### 2.1 Initialize Git Repository
```bash
cd "d:\Daboy's Menu"
git init
```

### 2.2 Create `.gitignore` file
Create a file named `.gitignore`:
```
node_modules/
.env
.env.local
.DS_Store
*.log
```

### 2.3 Add and Commit Your Code
```bash
git add .
git commit -m "Initial commit: Daboy's Menu Application"
```

### 2.4 Create Repository on GitHub
1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `daboysmenu`
3. Follow GitHub's instructions to push your local repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/daboysmenu.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Search for your `daboysmenu` repository
5. Click **"Import"**
6. Configure project settings:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: Leave empty or `npm run build`
   - **Output Directory**: `./public` (or leave empty)
   - **Environment Variables**: Leave empty for now (we'll use localStorage)
7. Click **"Deploy"**

✅ Your app will be live in 1-2 minutes!

### Option B: Deploy via Vercel CLI

1. Open terminal and login to Vercel:
```bash
vercel login
```

2. Deploy your project:
```bash
vercel
```

3. Follow the prompts:
   - Confirm project name
   - Set production environment (yes)
   - Create project (yes)

---

## Step 4: Access Your Deployed App

After deployment, Vercel will provide you with a URL like:
```
https://daboysmenu.vercel.app
```

Your app is now live! 🎉

---

## Step 5: Optional - Connect MongoDB Atlas (For Production Database)

### 5.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster:
   - Choose **M0 Sandbox** (free tier)
   - Select your region
   - Create cluster

### 5.2 Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Drivers"** → **"Node.js"**
3. Copy the connection string
4. Replace `<password>` with your database password

### 5.3 Add Environment Variable to Vercel
1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add new variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
4. Save and redeploy:
```bash
vercel --prod
```

---

## Step 6: Update Code and Redeploy

Whenever you make changes to your code:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically redeploy your app! 🔄

---

## Troubleshooting

### Issue: Build fails with "Cannot find module"
**Solution**: Make sure all dependencies are installed:
```bash
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push origin main
```

### Issue: Static files not loading (CSS/JS)
**Solution**: Ensure `express.static()` is configured correctly in `server.js`:
```javascript
app.use(express.static(path.join(__dirname, '.')));
```

### Issue: CORS errors in browser console
**Solution**: CORS is already configured in your `server.js`. No action needed.

### Issue: Orders/Products not persisting
**Current Behavior**: Uses browser localStorage (cleared on cache/new browser)
**Production Solution**: Connect MongoDB Atlas for persistent storage (see Step 5)

---

## File Structure for Deployment

```
daboysmenu/
├── server.js                 # Express server (main entry point)
├── package.json             # Dependencies
├── package-lock.json        # Dependency lock
├── vercel.json             # Vercel configuration
├── .gitignore              # Files to ignore in Git
├── index.html              # Customer page
├── admin.html              # Admin panel
├── style.css               # Styling
├── script.js               # Frontend logic
├── models/
│   └── Product.js          # MongoDB model
├── routes/
│   └── products.js         # API routes
└── README.md               # Project documentation
```

---

## Performance Tips

1. **Optimize Images**: Compress product images before uploading
2. **Caching**: Vercel automatically caches static assets
3. **Database**: Use MongoDB Atlas free tier for production
4. **Environment Variables**: Never commit sensitive data
5. **Error Monitoring**: Use Vercel Analytics to monitor errors

---

## Domain Configuration (Optional)

To use a custom domain:

1. Register a domain (e.g., [Namecheap](https://www.namecheap.com/))
2. In Vercel dashboard: **Project Settings** → **Domains**
3. Add your domain
4. Follow Vercel's DNS configuration instructions
5. Wait 24-48 hours for DNS propagation

---

## Summary

✅ **Deployed URL**: `https://daboysmenu.vercel.app` (example)
✅ **Features Working**:
- Customer product ordering with modal
- Admin panel for product management
- Customer orders tracking
- Auto-calculation of totals
- Responsive mobile design

🎉 **Your app is now live on the internet!**

For questions, check [Vercel Documentation](https://vercel.com/docs)
