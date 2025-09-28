# CAMA Pilates Blog Agents

## Overview
This directory contains specialized AI agents for blog content creation and optimization for the CAMA Pilates website. These agents work with Claude Code to automate research, writing, and enhancement of SEO-optimized content for the Mexican Pilates market.

## Available Agents

### 1. Blog Writer (`blog_writer`)
Autonomous blog post creation following CAMA Pilates template system.

**Usage:**
```
> Use the blog_writer agent to write the next priority post
> Have blog_writer create an article about reformer maintenance
```

**Capabilities:**
- Checks TODO list for priority posts
- Completes research phase (1000+ words)
- Writes SEO-optimized posts (1500-2500 words)
- Updates status tracking automatically

### 2. Blog Researcher (`blog_researcher`)
Deep research specialist for blog topics with Mexican market focus.

**Usage:**
```
> Use blog_researcher to research pilates for seniors
> Have the researcher investigate reformer pricing in Mexico
```

**Capabilities:**
- Mexican market pricing and availability research
- Scientific/medical study analysis
- Competitor content gap identification
- User intent and FAQ planning

### 3. Book Researcher (`book_researcher`)
Discovers unique, viral-worthy topics from Pilates book library.

**Usage:**
```
> Use book_researcher to find unique topics from our books
> Have book_researcher discover viral content ideas
```

**Capabilities:**
- Mines expert knowledge from 5+ Pilates books
- Generates viral title variations
- Identifies content competitors can't replicate
- Cross-references with SEO keywords

### 4. Blog Enhancer (`blog_enhancer`)
Enhances existing blog posts with fresh research and optimization.

**Usage:**
```
> Use blog_enhancer to improve the reformer buying guide
> Have the enhancer update our top posts with 2025 data
```

**Capabilities:**
- Expands content by 30-50%
- Updates with 2024-2025 data
- Adds new sections and FAQ questions
- Strengthens SEO and product integration

## How to Invoke Agents

### Method 1: Natural Language Request
Simply ask Claude to use a specific agent:
```
"Use the blog_writer agent to write the next blog post"
"Have the blog_researcher investigate pilates for pregnancy"
```

### Method 2: Direct Agent Invocation
Claude Code will recognize agent requests and delegate automatically:
```
"blog_writer: create the next priority post"
"book_researcher: find viral topics about reformer maintenance"
```

### Method 3: Task Delegation
Claude can automatically delegate to the appropriate agent based on the task:
```
"Research and write a blog post about pilates for seniors"
(Claude will use blog_researcher then blog_writer automatically)
```

## File Structure

```
.claude/
├── agents/
│   ├── blog_writer.md       # Blog writing agent
│   ├── blog_researcher.md    # Research agent
│   ├── book_researcher.md    # Book mining agent
│   └── blog_enhancer.md      # Enhancement agent
├── agents.json              # Agent configuration
└── README.md               # This file

blog-planning/
├── BLOG_TODO.md            # Priority queue
├── research/               # Research files
├── archive/                # Original versions
└── ENHANCEMENT_LOG.md      # Enhancement tracking
```

## Workflow Integration

### New Blog Creation Flow
1. Check TODO list: `blog-planning/BLOG_TODO.md`
2. Research phase: Agent creates research file
3. Writing phase: Agent creates blog post
4. Status update: 🔬 → 📝 → ✅

### Blog Enhancement Flow
1. Analyze existing post
2. Deep research for updates
3. Expand and optimize content
4. Archive original version

## Agent Capabilities

All agents have access to:
- **WebSearch**: Current information and research
- **Read/Write**: File system access
- **MultiEdit**: Batch editing capability
- **Grep/Glob**: Content search and discovery

## Best Practices

1. **Always check TODO list** before creating new content
2. **Complete research** before writing (minimum 1000 words)
3. **Follow templates** for consistency
4. **Update status** markers in real-time
5. **Focus on Mexican market** with local data
6. **Natural CAMA integration** without forced promotion

## Configuration

Agents are configured in `.claude/agents.json` with:
- Description and keywords
- Auto-invocation settings
- Tool permissions
- Example usage patterns

## Troubleshooting

If agents aren't recognized:
1. Ensure `.claude/` directory exists
2. Check agent file paths in `agents.json`
3. Verify agent markdown files are properly formatted
4. Restart Claude Code session if needed

## Updates and Maintenance

To modify agent behavior:
1. Edit the agent's markdown file in `.claude/agents/`
2. Update system prompt and instructions
3. Adjust tool permissions if needed
4. Test with example requests

## Support

For issues or improvements:
- Check `AGENTS.md` for main documentation
- Review `blog-planning/README.md` for workflow details
- Examine existing blog posts for template examples