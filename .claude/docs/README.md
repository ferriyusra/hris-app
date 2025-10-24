# Common Setup

A collection of common setup scripts and configurations for development environments.

## Overview

This repository contains shared setup tools and configurations to streamline development workflows.

## Structure

- `.claude/` - Claude AI assistant configurations and commands
  - `commands/` - Custom commands and scripts
  - `hooks/` - Git and workflow hooks
  - `scripts/` - Utility scripts
  - `agents/` - Specialized AI agents (javascript-pro, code-review-expert)
  - `docs/` - Project documentation and contributing guides

## Getting Started

### Claude Setup

1. Copy `./.claude/commands/sync-setup.md` to your local project `./.claude/commands/sync-setup.md`
2. Restart Claude Code
3. Run Claude command `/sync-setup`

This will synchronize all configurations, agents, hooks, and documentation from the common-setup repository.

## Available Commands

- `sync-setup` - Synchronize setup configurations from common-setup repository
- `update-openapi` - Update OpenAPI/Swagger API specifications
- `vulnerabilities-check` - Check for vulnerabilities in dependencies and codebase

## Available Agents

- `javascript-pro` - Expert JavaScript/TypeScript programming assistance
- `code-review-expert` - Comprehensive code review for JS/TS applications

## Tech Stack

This setup is optimized for:

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Node.js, Express, NestJS
- **Testing**: Jest, Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **HRIS Domain**: Human Resource Information Systems

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

[Add your license information here]