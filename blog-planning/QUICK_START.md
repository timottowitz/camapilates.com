# CAMA Pilates Blog System - Quick Start Guide

## 🚀 Immediate Actions (After System Restart)

### 1. Check Current Status
```bash
# Read the master TODO list to see current pipeline
Read: /blog-planning/BLOG_TODO.md
```

### 2. Choose Your Agent

#### Option A: Discover New Unique Topics
```bash
Task: "Discover unique blog topics from books_MD knowledge base"
Agent: general-purpose
```
**What it does**: Finds viral-worthy topics from expert Pilates books that competitors can't replicate

#### Option B: Continue Existing Pipeline
```bash
Task: "Write next priority blog post using established patterns"
Agent: general-purpose
```
**What it does**: Takes next priority post and either researches it or writes it based on current status

## 📊 Status Codes Quick Reference
- **🔬** = Needs research (Agent will research it)
- **📝** = Research complete, ready to write (Agent will write blog post)
- **✅** = Published and complete

## 🔧 System Architecture Quick Map

```
/blog-planning/
├── BLOG_TODO.md           ← Check this first
├── SYSTEM_INSTRUCTIONS.md ← Complete instructions
├── keyword-clusters.md    ← SEO intelligence
└── research/              ← Research templates

/books_MD/                 ← Expert knowledge base
├── Joseph Pilates books
└── Modern expert books

/src/content/blog/         ← Published blog posts
```

## 🎯 Quality Standards

### Research Phase
- ✅ 1000+ words per research file
- ✅ Mexican market data included
- ✅ CAMA product integration planned

### Writing Phase
- ✅ 1500-2500 words final blog
- ✅ Proper shortcodes: `<see-also />`, `<hub-list />`
- ✅ FAQ section for SEO
- ✅ Mexican cultural context

## 🔥 Current Pipeline Status

**Ready to Write (📝)**: 19 posts with completed research
**Need Research (🔬)**: Various topics available
**Unique Topics**: Available from books_MD knowledge base

## 💡 Pro Tips

1. **Always start with BLOG_TODO.md** - It shows what needs to be done
2. **Use book research agent** - For unique content competitors can't copy
3. **Mexican market focus** - Every post targets Mexican Pilates market
4. **CAMA integration** - Natural product placement in every post
5. **Trust the agents** - They handle the complete workflow autonomously

## 🆘 Troubleshooting

**Problem**: "No posts to work on"
**Solution**: Use book research agent to discover new topics

**Problem**: "Research file missing"
**Solution**: Agent will create template automatically

**Problem**: "Don't know current status"
**Solution**: Read BLOG_TODO.md first

---

**Remember**: The system is designed to work autonomously. Just choose your agent and let it run the complete workflow!

*For complete details, see SYSTEM_INSTRUCTIONS.md*