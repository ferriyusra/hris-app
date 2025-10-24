Sync Claude Setup Standards

# Sync Setup Command - Synchronize with Common Setup
Use minimum bash commands if possible

## Step 1: Clone Common Setup Repository
1. Clean any existing temp directory: `rm -rf .claude/temp`
2. Clone the common-setup repository using SSH: `git clone git@bitbucket.org:my-repo/common-setup.git .claude/temp/common-setup`

## Step 2: Sync Claude Configuration Files
1. Create necessary directories if doesnt exist:
   - `mkdir -p .claude/docs`
   - `mkdir -p .claude/hooks`
   - `mkdir -p .claude/commands`
   - `mkdir -p .claude/scripts`

2. Sync settings.json (merge with existing):
   - Check if both files exist:
     - Project: `.claude/settings.json`
     - Common: `.claude/temp/common-setup/.claude/settings.json`
   - If common settings exists:
     - Read and parse both JSON files
     - Deep merge settings, prioritizing project-specific values
     - Preserve any project-specific custom settings
     - Write merged result back to `.claude/settings.json`
   - Report which settings were updated

3. Sync hooks (check and update):
   - List existing hooks: `ls -la .claude/hooks/`
   - List common hooks: `ls -la .claude/temp/common-setup/.claude/hooks/`
   - For each hook in common-setup:
     - If hook doesn't exist locally: Copy it
     - If hook exists locally: Replace it
   - Report: New hooks added, hooks replaced

4. Sync commands (selective update):
   - List existing commands: `ls -la .claude/commands/`
   - List common commands: `ls -la .claude/temp/common-setup/.claude/commands/`
   - For each command in common-setup:
     - If command doesn't exist locally: Copy it
     - If command exists locally: Replace it
   - Report: New commands added, commands replaced

5. Sync scripts (selective update):
   - List existing scripts: `ls -la .claude/scripts/`
   - List common scripts: `ls -la .claude/temp/common-setup/.claude/scripts/`
   - For each script in common-setup:
     - If script doesn't exist locally: Copy it
     - If script exists locally: Replace it
   - Report: New scripts added, scripts replaced

## Step 6: Update API Documentation
1. Check if the project uses OpenAPI/Swagger specification
   - Check if `openapi.yaml` or `swagger.json` exists in the project root or docs folder
   - If doesn't exist: Create a basic OpenAPI 3.0 spec template for the HRIS API
   - Run command `.claude/commands/update-openapi.md` to make or update API documentation

## Step 7: Update ESLint Configuration
1. Check `.eslintrc.json` or `.eslintrc.js` configuration
   - If file doesn't exist locally: Copy it from `.claude/temp/common-setup/linters/.eslintrc.json`
   - If file exists locally:
      - Compare file checksums
      - If different: Keep local version but notify user of available updates
      - Report ESLint configuration changes

## Step 8: Update TypeScript Configuration
1. Check `tsconfig.json` configuration
   - If file doesn't exist locally: Copy it from `.claude/temp/common-setup/linters/tsconfig.json`
   - If file exists locally:
      - Compare file checksums
      - If different: Keep local version but notify user of available updates
      - Report TypeScript configuration changes

## Step 9: Update Prettier Configuration
1. Check `.prettierrc` or `.prettierrc.json` configuration
   - If file doesn't exist locally: Copy it from `.claude/temp/common-setup/linters/.prettierrc`
   - If file exists locally:
      - Compare file checksums
      - If different: Keep local version but notify user of available updates
      - Report Prettier configuration changes

## Step 10: Update Package Scripts
1. Check project `package.json` scripts section
   - If file doesn't exist locally: Copy template from `.claude/temp/common-setup/package.json`
   - If file exists locally:
      - Compare scripts section
      - If different: Keep local version but notify user of recommended scripts
      - Report package.json script changes


## Step 11: Copy and Analyze Documentation
1. Read documentation from `.claude/docs`
2. Extract and understand key guidelines from docs:
   - Development setup requirements
   - Code standards and formatting rules (JavaScript/TypeScript, React, Node.js)
   - Git workflow and branching strategy
   - PR process and review requirements
   - Testing requirements (Jest, Vitest, React Testing Library)
   - Project context (use case, structure, architecture, tech stack)
   - HRIS-specific domain knowledge


## Step 12: Update CLAUDE.md
1. Update CLAUDE.md to include any missing:
   - Code standards specific to JavaScript/TypeScript and React
   - Git workflow requirements
   - Testing requirements and frameworks
   - PR process details
   - API integration patterns
   - State management patterns
2. Ensure CLAUDE.md remains specific to current project while incorporating common standards
3. Add HRIS domain-specific guidelines if applicable

## Step 13: Clean Up
1. Clean up temporary clone: `rm -rf .claude/temp`
2. Report results:
   - Confirm all files synced successfully
   - List updates made to CLAUDE.md
   - List any new hooks, commands, or scripts added
   - List configuration files updated (ESLint, TypeScript, Prettier)
   - Highlight any conflicts between project-specific and organization-wide guidelines
   - Note any manual interventions required