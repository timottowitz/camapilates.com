# Autonomous Blog Writer - External Audit Brief

**System:** LLM-powered autonomous blog content generation
**Version:** 1.0.0
**Date:** October 1, 2025
**Audit Type:** Bug and Error Detection

---

## 🎯 Audit Objective

Identify bugs, errors, edge cases, and potential failure points in the autonomous blog writer system before production deployment.

---

## 📋 System Overview

### Purpose
Automated generation of SEO-optimized blog content (1,500-2,000 words) in Spanish for the Mexican Pilates market using GPT-4o and GPT-4o-mini.

### Architecture
```
Dashboard (React UI)
    ↓
Convex Backend (topic discovery, queue management)
    ↓
File System (research files, TODO queue)
    ↓
autonomous-blog-writer/ (CLI - THIS AUDIT SCOPE)
    ├── config.js (configuration loader)
    ├── agents/content-writer.js (LLM content generation)
    └── pipeline/run.js (orchestration)
    ↓
Output: Markdown files with frontmatter
```

### Key Dependencies
- **Node.js 18+** (ES modules)
- **OpenAI API** (GPT-4o, GPT-4o-mini)
- **MCP SDK** (@modelcontextprotocol/sdk)
- **AI SDK** (Vercel ai package)
- **dotenv** (environment configuration)

---

## 🔍 Audit Scope

### In Scope (Priority Files)

#### 1. Configuration System
**File:** `config.js` (7KB, 198 lines)
**Critical:** YES
**Purpose:** Centralized configuration loader

**Areas to audit:**
- Environment variable parsing and validation
- Path resolution (PROJECT_ROOT auto-detection)
- API key validation (format, presence)
- Type coercion (parseInt, parseFloat)
- Default value fallbacks
- Array parsing (MARKETS split)

**Known concerns:**
- Auto-detection relies on `__dirname` and `resolve(__dirname, '..')`
- No validation for directory existence
- Silent failures if .env missing

#### 2. Content Generation Agent
**File:** `agents/content-writer.js` (24KB, 772 lines)
**Critical:** YES
**Purpose:** Multi-pass LLM blog generation

**Areas to audit:**
- **Pass 1 - Outline Generation (lines 228-302):**
  - JSON parsing from LLM response
  - Handling malformed JSON
  - Missing required fields in outline
  - Token limit handling (maxTokens: 2500)

- **Pass 2 - Section Generation (lines 308-376):**
  - Loop iteration over outline.sections
  - Shortcode injection logic
  - Token calculation (word_count_target * 2)
  - Missing sections in outline

- **Pass 3 - FAQ Generation (lines 382-446):**
  - JSON parsing fallback (extractFallbackFAQs)
  - Regex extraction (questionPattern)
  - Empty FAQ array handling
  - Min/max FAQ count validation

- **Pass 4 - Content Polish (lines 452-495):**
  - Content truncation (researchContent.slice(0, 3000))
  - Large content handling
  - Markdown preservation

- **File Operations:**
  - Race conditions (concurrent writes)
  - File existence checks (fileExists)
  - Directory creation (recursive: true)
  - File encoding (utf-8)
  - Path traversal vulnerabilities

- **API Calls:**
  - Timeout handling (no timeout configured)
  - Rate limiting
  - Error retries (none implemented)
  - Token limit exceeded errors
  - API key rotation

- **Metadata Parsing (lines 501-525):**
  - Regex matching failures
  - TODO file parsing
  - Missing metadata fields
  - Category extraction edge cases

**Known concerns:**
- No retry logic for failed API calls
- No explicit timeout on generateText calls
- JSON parsing assumes valid response
- File writes not atomic
- No locking mechanism for concurrent access

#### 3. Pipeline Runner
**File:** `pipeline/run.js` (5KB, 177 lines)
**Critical:** MEDIUM
**Purpose:** CLI entry point and orchestration

**Areas to audit:**
- Argument parsing (preset vs number)
- Validation bounds (1-50 blogs)
- Configuration validation before execution
- Child process spawning (security)
- Environment variable injection
- Process exit code handling

**Known concerns:**
- Currently delegates to old scripts (line 113)
- Child process spawn without input sanitization
- No validation of pipelineScript path existence

---

## 🐛 Critical Bug Categories to Check

### 1. Data Validation & Parsing

**Research file parsing:**
```javascript
// config.js lines 501-525
const titleMatch = researchContent.match(/^#\s*(.+?)(?:\s*—\s*Research|\s*\(MX)?$/m);
```
- What if research file has no H1?
- What if multiple H1s exist?
- Unicode handling in regex

**Keywords extraction:**
```javascript
// config.js lines 548-561
keywords.push(...primaryMatch[1].split(',').map(k => k.trim()).filter(Boolean));
```
- What if keywords section missing?
- What if empty array after filtering?
- What if malformed CSV?

**TODO category extraction:**
```javascript
// config.js lines 527-541
for (const line of lines) {
  if (line.includes(slug)) return currentCategory;
}
```
- What if slug appears in comment?
- What if partial slug match?
- What if slug not found?

### 2. API Error Handling

**No retry logic:**
```javascript
// agents/content-writer.js lines 287-295
const result = await generateText({
  model: openai(CONFIG.OPENAI_MODEL_FAST),
  // ... no timeout, no retry
});
```

**Error scenarios to test:**
- Rate limit (429)
- Timeout (network)
- Invalid API key (401)
- Insufficient credits (402)
- Model not found (404)
- Token limit exceeded (400)
- Malformed response (200 but invalid JSON)

### 3. File System Operations

**Race conditions:**
```javascript
// agents/content-writer.js lines 192-193
await fs.mkdir(CONFIG.BLOG_OUTPUT_DIR, { recursive: true });
await fs.writeFile(blogFile, final, 'utf-8');
```
- What if multiple processes write same file?
- What if directory creation fails?
- What if disk full?

**Path traversal:**
```javascript
// agents/content-writer.js line 139
const blogFile = path.join(CONFIG.BLOG_OUTPUT_DIR, `${slug}.md`);
```
- What if slug contains `../`?
- What if slug is `/etc/passwd`?
- What if slug has null bytes?

### 4. Memory & Performance

**Large content handling:**
```javascript
// agents/content-writer.js line 473
${researchContent.slice(0, 3000)}...
```
- What if researchContent > 100MB?
- Memory leak in loop?
- Buffer overflow risk?

**Token limits:**
```javascript
// agents/content-writer.js line 365
maxTokens: Math.ceil(sectionPlan.word_count_target * 2)
```
- What if word_count_target is 10,000?
- What if model max tokens exceeded?
- Cost control?

### 5. Configuration Issues

**Missing environment variables:**
```javascript
// config.js lines 51-52
OPENAI_API_KEY: process.env.OPENAI_API_KEY,
OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
```
- What if OPENAI_API_KEY undefined?
- What if empty string?
- What if contains newlines?

**Type coercion bugs:**
```javascript
// config.js line 58
WORD_TARGET: parseInt(process.env.CONTENT_WORD_TARGET || '1800'),
```
- What if env var is "abc"?
- What if negative number?
- What if scientific notation (1e6)?

**Array parsing:**
```javascript
// config.js line 70
MARKETS: (process.env.CONTENT_MARKETS || 'CDMX,Guadalajara,Monterrey').split(',').map(s => s.trim()),
```
- What if empty string?
- What if only commas ","?
- What if trailing comma "A,B,"?

---

## 🔴 High-Priority Test Cases

### Test Case 1: Malformed Research File
**Input:** Research file with no H1, no keywords section
**Expected:** Graceful fallback or clear error
**Current behavior:** Unknown (likely crash)

### Test Case 2: API Rate Limit
**Input:** Generate 100 blogs rapidly
**Expected:** Queue, retry, or clear error
**Current behavior:** Unknown (likely fails silently)

### Test Case 3: Disk Full
**Input:** Write blog when disk at 100% capacity
**Expected:** Error message, rollback
**Current behavior:** Unknown (likely partial write)

### Test Case 4: Invalid JSON from LLM
**Input:** LLM returns text instead of JSON
**Expected:** Retry or fallback
**Current behavior:** Crash (lines 298-301)

### Test Case 5: Concurrent Writes
**Input:** Two processes generate same slug simultaneously
**Expected:** Lock or error
**Current behavior:** Race condition (last write wins)

### Test Case 6: Malicious Slug
**Input:** Slug = `../../../etc/passwd`
**Expected:** Reject or sanitize
**Current behavior:** Unknown (path traversal risk)

### Test Case 7: Missing TODO File
**Input:** TODO_FILE path doesn't exist
**Expected:** Clear error
**Current behavior:** Crash on fs.readFile (line 507)

### Test Case 8: Empty Research File
**Input:** Research file exists but is 0 bytes
**Expected:** Error or skip
**Current behavior:** Unknown (likely generates generic content)

### Test Case 9: Network Timeout
**Input:** OpenAI API takes >10 minutes
**Expected:** Timeout and error
**Current behavior:** Hangs indefinitely (no timeout)

### Test Case 10: Invalid API Key
**Input:** OPENAI_API_KEY = "invalid"
**Expected:** Fail fast with clear message
**Current behavior:** Fails on first API call

---

## 📊 Error Handling Assessment

### Current State

**Error handling present:**
- ✅ Try-catch in MCP tool handler (lines 105-128)
- ✅ File existence checks (fileExists function)
- ✅ JSON parse fallback for FAQs (lines 438-445)
- ✅ Config validation (validateConfig function)

**Error handling missing:**
- ❌ No retry logic for API calls
- ❌ No timeout on generateText
- ❌ No file write atomicity
- ❌ No concurrent access protection
- ❌ No input sanitization for slugs
- ❌ No graceful degradation for partial failures
- ❌ No circuit breaker for API failures
- ❌ No disk space checks
- ❌ No memory limit checks
- ❌ No rate limit handling

---

## 🔒 Security Concerns

### 1. Path Traversal (HIGH)
**Location:** `agents/content-writer.js` line 139
```javascript
const blogFile = path.join(CONFIG.BLOG_OUTPUT_DIR, `${slug}.md`);
```
**Risk:** User-controlled slug could write to arbitrary locations
**Mitigation needed:** Sanitize slug, validate no `..` or `/`

### 2. API Key Exposure (MEDIUM)
**Location:** `.env` file checked into git
**Risk:** API key in version control
**Mitigation needed:** Verify .gitignore, rotate keys

### 3. Command Injection (LOW)
**Location:** `pipeline/run.js` line 113
```javascript
const child = spawn('node', [pipelineScript, blogCount.toString(), logLevel], {
```
**Risk:** If pipelineScript path manipulated
**Mitigation needed:** Validate script path exists and is trusted

### 4. Denial of Service (MEDIUM)
**Location:** Large loop without limits
**Risk:** Malicious research file causes infinite loop or memory exhaustion
**Mitigation needed:** Content size limits, iteration limits

---

## 🧪 Recommended Testing Approach

### Phase 1: Unit Tests
- Config parsing edge cases
- Metadata extraction
- Keyword extraction
- File path sanitization
- Type coercion

### Phase 2: Integration Tests
- Full blog generation happy path
- API failure scenarios
- File system errors
- Concurrent access

### Phase 3: Load Tests
- 100 blogs in sequence
- 10 blogs in parallel
- Rate limit handling
- Memory profiling

### Phase 4: Security Tests
- Path traversal attempts
- Malicious slugs
- Large payload attacks
- API key rotation

---

## 📝 Expected Deliverables

1. **Bug Report:**
   - List of all bugs found (critical/high/medium/low)
   - Reproduction steps for each
   - Affected code locations (file:line)

2. **Error Scenarios:**
   - Edge cases not handled
   - Missing validation
   - Silent failures

3. **Security Assessment:**
   - Vulnerabilities found
   - Risk level for each
   - Recommended fixes

4. **Recommendations:**
   - Priority fixes (P0/P1/P2)
   - Architecture improvements
   - Testing gaps

---

## 🔧 Tools & Environment

### Setup
```bash
cd /Users/m3max361tb/Documents/Code/Pilates_Reformer/autonomous-blog-writer
npm install
cp .env.example .env
# Add test API key to .env
npm run validate
```

### Test Execution
```bash
# Validate config
npm run config

# Test single blog
npm run test

# Check logs
tail -f ../logs/*.log
```

### Key Paths
- **Config:** `autonomous-blog-writer/config.js`
- **Agent:** `autonomous-blog-writer/agents/content-writer.js`
- **Runner:** `autonomous-blog-writer/pipeline/run.js`
- **Env:** `autonomous-blog-writer/.env`
- **Research:** `../blog-planning/research/`
- **Output:** `../src/content/blog/`
- **Queue:** `../blog-planning/BLOG_TODO.md`

---

## 📚 Reference Documentation

1. **README:** `autonomous-blog-writer/README.md` - Complete usage guide
2. **Architecture:** `AUTONOMOUS_BLOG_WRITER_PORTABLE.md` - System overview
3. **Changelog:** `autonomous-blog-writer/CHANGELOG.md` - Recent changes
4. **Installation:** `autonomous-blog-writer/INSTALLATION.md` - Setup guide

---

## 🎯 Success Criteria

Audit is complete when:
- [ ] All critical bugs identified
- [ ] All high-priority test cases executed
- [ ] Security vulnerabilities documented
- [ ] Recommendations prioritized
- [ ] Reproduction steps provided for each bug
- [ ] Risk assessment completed

---

## 📞 Contact

**Codebase Owner:** CAMA Pilates Development Team
**Audit Date:** October 2025
**Audit Scope:** autonomous-blog-writer/ module only (CLI system)

---

**Note:** The React dashboard (`src/pages/AdminBlogWriter.tsx`) and Convex backend are **out of scope** for this audit. Focus only on the `autonomous-blog-writer/` folder (CLI content generation system).
