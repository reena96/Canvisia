# Canvisia Documentation

This directory contains all project documentation for Canvisia.

## Directory Structure

```
docs/
├── README.md                          # This file
├── AI_DEVELOPMENT_PROCESS.md          # AI development workflow and guidelines
│
├── AI_Development_Log/                # Historical development logs
│   ├── Week_1_Log.md
│   └── ...
│
├── bugfix/                            # Bug documentation and learnings
│   ├── pr4.md                         # PR #4 bugfixes and learnings
│   ├── pr5.md                         # PR #5 bugfixes and learnings
│   ├── ...
│   ├── pr15.md                        # PR #15 bugfixes (AI Manipulation)
│   └── pr16.md                        # PR #16 bugfixes (AI Layout)
│
├── planning/                          # Architecture and planning documents
│   ├── ARCHITECTURE_DIAGRAMS.md       # System architecture diagrams
│   ├── Canvisia-Agent-Architecture.md # AI agent architecture
│   ├── Canvisia-Agent-PRD.md          # AI agent product requirements
│   └── Canvisia-PRD.md                # Main product requirements
│
├── setup/                             # Setup and configuration guides
│   ├── dev-login-setup.md             # Development login configuration
│   ├── ENV_SETUP_QUICKSTART.md        # Quick start environment setup
│   ├── SECURITY_GUIDE.md              # Security best practices
│   └── TEST_ACCOUNTS_SETUP.md         # Test account configuration
│
├── tasks/                             # Task lists and validation
│   ├── TASK_LIST.md                   # Original task list
│   ├── TASK_LIST_WITH_TESTS.md        # Enhanced with test requirements
│   ├── TASK_LIST_AI_AGENT_WITH_TESTS.md # AI agent tasks with tests
│   ├── newFeatures/                   # New feature specifications
│   │   └── ...
│   └── validation/                    # Validation guides for PRs
│       ├── PR14_VALIDATION_GUIDE.md   # PR #14 validation checklist
│       └── PR16_VALIDATION_GUIDE.md   # PR #16 validation checklist
│
└── testing/                           # Testing documentation
    └── ...
```

## Documentation Guidelines

### Location
**All documentation MUST be written to this directory (`/docs/`) and NOT to `/canvisia/docs/`.**

The `/canvisia/docs/` directory is deprecated and should remain empty.

### File Organization

#### Bugfix Documentation (`bugfix/`)
- One markdown file per PR: `pr{number}.md`
- Documents bugs encountered, root causes, fixes, and learnings
- Follow the established format from existing PR documentation
- Include code examples, console outputs, and before/after comparisons

#### Planning Documentation (`planning/`)
- Architecture documents
- Product requirements (PRDs)
- Design specifications
- System diagrams

#### Setup Documentation (`setup/`)
- Environment configuration guides
- Security guidelines
- Test account setup
- Development workflows

#### Task Documentation (`tasks/`)
- Master task lists
- Feature specifications
- Validation guides for completed PRs

#### Testing Documentation (`testing/`)
- Test strategies
- Test coverage reports
- Testing best practices

## Recent Moves (October 18, 2025)

The following files were moved from `/canvisia/docs/` to `/docs/`:

1. **Validation folder**: `canvisia/docs/tasks/validation/` → `docs/tasks/validation/`
   - PR14_VALIDATION_GUIDE.md
   - PR16_VALIDATION_GUIDE.md

2. **Dev login setup**: `canvisia/docs/dev-login-setup.md` → `docs/setup/dev-login-setup.md`

3. **Bugfix documentation**: `canvisia/docs/bugfix/pr15.md` → `docs/bugfix/pr15.md` (merged version)

All duplicate files in `/canvisia/docs/` have been removed. The old location should remain empty.

## Contributing to Documentation

When creating new documentation:

1. ✅ **DO**: Write to `/docs/` directory
2. ❌ **DON'T**: Write to `/canvisia/docs/` directory
3. ✅ **DO**: Follow existing directory structure
4. ✅ **DO**: Use markdown formatting
5. ✅ **DO**: Include code examples and console outputs
6. ✅ **DO**: Document lessons learned and best practices

## Documentation Standards

### Bugfix Documentation Template
```markdown
# PR #{number}: {Title} - Bugfixes and Learnings

## Overview
Brief description of the PR and what it implemented.

**Date:** YYYY-MM-DD
**Status:** ✅ Completed / 🚧 In Progress
**Branch:** `feature/branch-name`
**Testing:** X tests passing

## Bugfixes

### Bug #1: {Title}
**Severity:** High/Medium/Low - {Impact description}

**Problem**: What went wrong

**Root Cause**: Why it happened

**Solution**: How it was fixed

**Files Changed**:
- `path/to/file.ts` - What changed

**Learning**: Key takeaway

---

## Summary
Key achievements and critical lessons
```

## Questions?

For questions about documentation organization or standards, refer to existing documentation in the `bugfix/` folder (pr4.md through pr16.md) for examples of comprehensive documentation.
