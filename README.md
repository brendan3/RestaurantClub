# 🍽️ RestaurantClub

**Tagline:** "Who's picking this time?"

A social tracking app for restaurant clubs - keep track of whose turn it is to pick the restaurant!

---

## 🚀 Project Status

✅ **Web App**: Running locally on `http://localhost:5000`  
✅ **iOS Wrapper**: Swift files ready in `ios/` folder  
✅ **Deployment**: Configured for Railway/Render/Vercel  
✅ **Development Setup**: Cursor + SweetPad ready to go  

---

## 📁 Project Structure

```
RestaurantClub/
├── client/                    # Frontend (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # App pages
│   │   └── App.tsx          # Main app component
│   └── index.html
│
├── server/                   # Backend (Express + TypeScript)
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   └── storage.ts           # Database interface
│
├── shared/                   # Shared types & schemas
│   └── schema.ts            # Database schema (Drizzle ORM)
│
├── ios/                      # iOS app files (Swift + SwiftUI)
│   └── RestaurantClubiOS/
│       └── RestaurantClubiOS/
│           ├── RestaurantClubiOSApp.swift
│           ├── ContentView.swift
│           ├── WebView.swift
│           └── Configuration.swift
│
├── package.json             # Dependencies & scripts
├── vite.config.ts          # Vite configuration
└── drizzle.config.ts       # Database configuration
```

---

## 🛠️ Tech Stack

### Web App
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Express, TypeScript, Node.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **UI Components**: Radix UI, Shadcn/ui
- **Routing**: Wouter
- **State**: TanStack Query

### iOS App
- **Language**: Swift
- **Framework**: SwiftUI
- **Web Integration**: WKWebView
- **Development**: Xcode + SweetPad (in Cursor)

---

## 🏃 Quick Start

### Web App Development

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### iOS App Development

See **[IOS_SETUP_GUIDE.md](IOS_SETUP_GUIDE.md)** for complete instructions.

**Quick version:**
1. Deploy web app (see [DEPLOYMENT.md](DEPLOYMENT.md))
2. Create Xcode project
3. Copy Swift files from `ios/` folder
4. Update production URL in `Configuration.swift`
5. Build & run!

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| **[IOS_SETUP_GUIDE.md](IOS_SETUP_GUIDE.md)** | Complete iOS app setup walkthrough |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deploy web app to Railway/Render/Vercel |
| **[SWEETPAD_SETUP.md](SWEETPAD_SETUP.md)** | Configure SweetPad for Swift in Cursor |
| **[ios/README.md](ios/README.md)** | iOS-specific details |

---

## 🎯 Development Workflow

### For Web Development (TypeScript)
1. Edit files in `client/`, `server/`, `shared/`
2. Changes hot-reload automatically
3. Test at `http://localhost:5000`

### For iOS Development (Swift)
1. **Option A**: Use Xcode exclusively
2. **Option B**: Use Cursor + SweetPad for editing, Xcode for building
3. **Option C**: Use SweetPad for everything (build, run, edit)

**Recommended**: Cursor + SweetPad for editing, Xcode for project settings

---

## 🚢 Deployment

### Web App

**Railway** (Recommended):
```bash
# 1. Go to railway.app
# 2. Deploy from GitHub
# 3. Add PostgreSQL database
# 4. Done! Get your URL
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for other options (Render, Vercel).

### iOS App

**TestFlight**:
1. Archive in Xcode
2. Upload to App Store Connect
3. Add testers
4. Send invites

**App Store**:
1. Complete listing
2. Submit for review
3. Wait for approval (1-3 days)

---

## 📦 Scripts

```bash
# Development
npm run dev              # Start dev server (client + server)
npm run dev:client       # Start only Vite dev server

# Build
npm run build           # Build for production

# Production
npm start               # Run production server

# Database
npm run db:push         # Push schema changes to database

# Type checking
npm run check           # Run TypeScript compiler
```

---

## 🔧 Environment Variables

### Required for Production

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=5000                    # Auto-set by hosting providers
NODE_ENV=production          # Auto-set by hosting providers
```

### Local Development

No environment variables needed! The app uses in-memory storage for development.

---

## 🎨 Features (Current)

- ✅ Modern, responsive UI
- ✅ Full TypeScript support
- ✅ PostgreSQL database ready
- ✅ iOS app wrapper ready
- ✅ Mobile-friendly design

---

## 🎯 Next Steps

1. **Deploy the web app** → [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Create iOS project** → [IOS_SETUP_GUIDE.md](IOS_SETUP_GUIDE.md)
3. **Install SweetPad** → [SWEETPAD_SETUP.md](SWEETPAD_SETUP.md)
4. **Build features** → Start coding!

---

## 🐛 Troubleshooting

### Server won't start
- ✅ Check port 5000 isn't in use: `lsof -i :5000`
- ✅ Kill existing process: `kill -9 <PID>`

### iOS app can't connect
- ✅ Make sure dev server is running
- ✅ Check URL in `Configuration.swift`
- ✅ Verify Info.plist allows local networking

### Database errors
- ✅ Make sure `DATABASE_URL` is set (production only)
- ✅ Run `npm run db:push` to sync schema

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt for your own use!

---

## 📞 Support

- Check the guides in this repo
- Review the [iOS Setup Guide](IOS_SETUP_GUIDE.md)
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for hosting issues

---

## 🎉 You're All Set!

Everything is ready to go:
- ✅ Web app running locally
- ✅ iOS Swift files generated
- ✅ Deployment configs ready
- ✅ SweetPad guide available

**Next:** Follow [IOS_SETUP_GUIDE.md](IOS_SETUP_GUIDE.md) to create your iPhone app!

