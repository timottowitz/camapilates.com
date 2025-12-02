# Autonomous Blog System - Integration Guide

**For main project developers**

---

## 🎯 What is it?

The `autonomous-blog-system/` directory contains a **fully isolated, self-contained blog content generation system**. It operates independently with its own writer module, Convex backend, data storage, and configuration.

---

## 📁 Location

**⚠️ IMPORTANT: The autonomous-blog-system has been moved OUTSIDE this project!**

```
/Documents/Code/
├── Pilates_Reformer/              ← This project (Pilates website)
│   └── autonomous-blog-writer/    ← Original (still here)
│
└── autonomous-blog-system/         ← NEW LOCATION (completely separate)
    ├── writer/
    ├── convex-backend/
    ├── scripts/
    └── data/
```

The system is now **100% decoupled** from the Pilates website project.

---

## 🚀 Quick Start

```bash
# Navigate to the separate directory
cd ../autonomous-blog-system  # From Pilates_Reformer/

# OR absolute path
cd /Users/m3max361tb/Documents/Code/autonomous-blog-system

./validate.sh              # Check setup
cd writer && npm install   # Install dependencies
cd ../convex-backend && npm install
```

**Full documentation:** See `../autonomous-blog-system/README.md`

---

## 📊 Key Differences

### Original (`autonomous-blog-writer/`)
- Integrated with main project
- Uses main Convex backend
- Writes to `src/content/blog/`

### Isolated (`autonomous-blog-system/`)
- **Fully independent**
- **Separate Convex deployment**
- Writes to `data/blogs/` (can sync to main)
- No cross-contamination

---

## 🔄 When to Use Which?

- **Original:** Quick production content generation
- **Isolated:** Testing, batch processing, independent workflows

---

**For complete documentation, see `autonomous-blog-system/README.md`**
