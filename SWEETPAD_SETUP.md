# 🍬 SweetPad Setup Guide for Cursor

SweetPad brings Xcode's Swift development tools into Cursor (and VS Code). This lets you stay in one editor for both TypeScript and Swift!

---

## 📥 Installation

### 1. Install SweetPad Extension

**In Cursor:**
1. Press **⌘⇧X** (or click Extensions icon)
2. Search for **"SweetPad"**
3. Click **Install** on the extension by **sweetpad**
4. Wait for installation to complete

**Or via command line:**
```bash
cursor --install-extension sweetpad.sweetpad
```

---

## ⚙️ Configuration

### 2. Open Your iOS Project in Cursor

You need to open the iOS project folder (the one with `.xcodeproj`):

```bash
# After you create the Xcode project, open it in Cursor:
cursor ~/RestaurantClubiOS
```

### 3. Select Your Xcode Workspace

1. Press **⌘⇧P** (Command Palette)
2. Type: `SweetPad: Select Xcode Workspace`
3. Navigate to your `.xcodeproj` file:
   ```
   ~/RestaurantClubiOS/RestaurantClubiOS.xcodeproj
   ```
4. Select it

SweetPad will now index your project and set up Swift language support!

---

## 🎯 What SweetPad Gives You

### ✅ Features Available in Cursor

- **Swift Syntax Highlighting** - Proper Swift code coloring
- **Code Completion** - IntelliSense for Swift APIs
- **Build Commands** - Build your app from Cursor
- **Run on Simulator** - Launch your app without opening Xcode
- **Error Highlighting** - See Swift compiler errors inline
- **Go to Definition** - Jump to Swift declarations
- **Symbol Search** - Find Swift types, functions, etc.

### ❌ What You Still Need Xcode For

- **Project Creation** - Initial Xcode project setup
- **Signing & Capabilities** - Code signing, entitlements, etc.
- **SwiftUI Previews** - Live preview canvas
- **Interface Builder** - Storyboard/XIB editing
- **Asset Management** - Adding images, icons (easier in Xcode)
- **Simulator Management** - Creating/managing simulators

---

## 🚀 Using SweetPad

### Build Your App

**Command Palette** (⌘⇧P):
```
SweetPad: Build
```

Or use the keyboard shortcut (if configured).

### Run on Simulator

**Command Palette** (⌘⇧P):
```
SweetPad: Run
```

This will:
1. Build your app
2. Launch the simulator
3. Install and run your app

### Select Simulator

**Command Palette** (⌘⇧P):
```
SweetPad: Select Simulator
```

Choose from available simulators (iPhone 15 Pro, iPad, etc.)

### Clean Build

**Command Palette** (⌘⇧P):
```
SweetPad: Clean
```

Equivalent to Xcode's "Clean Build Folder"

---

## 🔧 Recommended Workflow

### For TypeScript/Web Development
**Use Cursor exclusively:**
- Edit `client/`, `server/`, `shared/` folders
- Run `npm run dev`
- Use Cursor's terminal

### For Swift/iOS Development
**Use Cursor + SweetPad + Xcode together:**

1. **Edit Swift code**: Use Cursor with SweetPad
   - Open iOS project folder in Cursor
   - Edit `.swift` files
   - Get AI assistance from Cursor

2. **Build & Run**: Use SweetPad commands
   - Build: `⌘⇧P` → `SweetPad: Build`
   - Run: `⌘⇧P` → `SweetPad: Run`

3. **Project Settings**: Use Xcode
   - Open `.xcodeproj` in Xcode
   - Configure signing, capabilities, etc.
   - Add assets (app icons, images)

4. **Preview SwiftUI**: Use Xcode
   - Open file in Xcode
   - Press **⌥⌘↵** for preview canvas

### Multi-Window Setup

**Option 1: Side-by-side**
- Left monitor: Cursor (editing Swift)
- Right monitor: Xcode (previews, simulator)

**Option 2: Single monitor**
- Cursor full screen for editing
- Switch to Xcode (⌘Tab) for previews/settings

---

## 🎨 Cursor Settings for Swift

Add these to your Cursor settings for better Swift development:

**File** → **Preferences** → **Settings** (or `settings.json`):

```json
{
  "[swift]": {
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "editor.formatOnSave": true
  },
  "files.associations": {
    "*.swift": "swift"
  }
}
```

---

## 🐛 Troubleshooting

### SweetPad Not Working

**Problem**: No code completion, errors not showing

**Solutions**:
1. Make sure you selected the `.xcodeproj` file:
   - **⌘⇧P** → `SweetPad: Select Xcode Workspace`
2. Restart Cursor
3. Check SweetPad is enabled:
   - Extensions → SweetPad → Make sure it's enabled
4. Check Xcode Command Line Tools are installed:
   ```bash
   xcode-select --install
   ```

### Build Fails in SweetPad

**Problem**: Build works in Xcode but not in Cursor

**Solutions**:
1. Clean build: **⌘⇧P** → `SweetPad: Clean`
2. Make sure you're in the iOS project folder (not the web app folder)
3. Check the Output panel for error details:
   - **View** → **Output** → Select "SweetPad"

### Can't Find Simulator

**Problem**: No simulators available

**Solutions**:
1. Open Xcode → **Window** → **Devices and Simulators**
2. Create a simulator if none exist
3. Restart Cursor

### Code Completion Not Working

**Problem**: No autocomplete suggestions

**Solutions**:
1. Wait for indexing to complete (check status bar)
2. Save the file (**⌘S**)
3. Restart Swift Language Server:
   - **⌘⇧P** → `SweetPad: Restart Language Server`

---

## 📚 Useful Commands

All available via **⌘⇧P** (Command Palette):

| Command | Description |
|---------|-------------|
| `SweetPad: Select Xcode Workspace` | Choose your Xcode project |
| `SweetPad: Build` | Build the app |
| `SweetPad: Run` | Build and run on simulator |
| `SweetPad: Clean` | Clean build folder |
| `SweetPad: Select Simulator` | Choose which simulator to use |
| `SweetPad: Restart Language Server` | Fix code completion issues |

---

## 💡 Pro Tips

1. **Use Cursor for editing, Xcode for project management**
   - This is the sweet spot for productivity

2. **Keep both open**
   - Xcode for previews and settings
   - Cursor for actual coding

3. **AI assistance**
   - Use Cursor's AI to help write Swift code
   - Ask questions about SwiftUI, UIKit, etc.

4. **Version control**
   - Use Cursor's built-in Git features for both web and iOS code

5. **Terminal in Cursor**
   - Run web app dev server in Cursor terminal
   - Use Xcode/SweetPad for iOS builds

---

## 🎯 Quick Start Checklist

- [ ] Install SweetPad extension in Cursor
- [ ] Create iOS project in Xcode
- [ ] Open iOS project folder in Cursor
- [ ] Run `SweetPad: Select Xcode Workspace`
- [ ] Select your `.xcodeproj` file
- [ ] Try building: `SweetPad: Build`
- [ ] Try running: `SweetPad: Run`
- [ ] Edit Swift code and see autocomplete working!

---

## 🔗 Resources

- **SweetPad GitHub**: [github.com/sweetpad-dev/sweetpad](https://github.com/sweetpad-dev/sweetpad)
- **VS Code Marketplace**: Search "SweetPad"
- **Issues/Support**: GitHub Issues on the SweetPad repo

---

## 🎉 You're Ready!

You now have a unified development environment:
- ✅ Cursor for TypeScript (web app)
- ✅ Cursor + SweetPad for Swift (iOS app)
- ✅ Xcode for project management
- ✅ AI assistance for both!

**Happy coding!** 🚀

