Contributing Guide (JavaScript/TypeScript)

Welcome to our HRIS application! We appreciate your interest in contributing. This guide will help you get started with contributing to our JavaScript/TypeScript-based full-stack application.

🚀 Getting Started

1. Fork the Repository

Click the "Fork" button at the top of the repository page on Bitbucket.

2. Clone Your Fork

git clone <https://bitbucket.org/my-repo/[repository-name]>
cd [repository-name]

3. Add Upstream Remote

git remote add upstream <https://bitbucket.org/my-repo/[repository-name].git>

🧰 Development Setup

Prerequisites

Node.js 18.x or newer

npm or yarn or pnpm

Git

Your favorite code editor (VSCode, IntelliJ, Cursor, etc.)

TypeScript 5.x or newer

Configuration

1. Install Dependencies

npm install
# or
yarn install
# or
pnpm install

2. Environment Configuration
Create a `.env` file in the project root with your local configuration:

cp .env.example .env

Update `.env` with your local values (database, ports, API keys, etc.)
Check the `config/` directory for environment-specific configurations.

3. Run the Application

Development mode:
npm run dev
# or
yarn dev

Build for production:
npm run build

Start production server:
npm start

🧼 Code Standards

Formatting and Style

Always format code with Prettier before committing (configured in `.prettierrc`)

Use ESLint for code quality checks: `npm run lint`

Follow TypeScript strict mode with no implicit `any`

Use modern ES6+ syntax (async/await, destructuring, arrow functions)

Naming Conventions

Variables and Functions: Use camelCase

const userName = "John";
function getUserData() {}
const handleClick = () => {};

Components and Classes: Use PascalCase

class UserService {}
function UserProfile() {}
const ButtonComponent = () => {};

Files: Use kebab-case or PascalCase depending on content

user-service.ts (utilities/services)
UserProfile.tsx (React components)
database-config.ts (configuration)
api-client.ts (API clients)

🌱 Git Workflow

Branching Strategy

Always branch from master

Use descriptive branch names:

feature/[description] - New features

fix/[description] - Bug fixes

chore/[description] - Maintenance tasks

refactor/[description] - Code improvements

Commit Messages

Follow Conventional Commits format with your JIRA ticket:

feat: EB-XXX add user authentication endpoint
fix: EB-XXX resolve database connection timeout
chore: EB-XXX update dependencies
refactor: EB-XXX improve error handling in service layer

✅ Pull Request Process

1. Create Pull Requests

Create two PRs simultaneously:

One targeting the uat branch

One targeting the master branch

2. Add Reviewers

For UAT branch: Add another backend developer as reviewer

For Master branch: Add team lead, senior engineer, or head of department

3. PR Best Practices

Keep PRs focused and small (ideally < 500 lines)

Write clear descriptions explaining what and why

Ensure all tests pass

Wait for CI/CD pipeline to complete

Address review comments promptly

🧪 Testing

Before submitting your PR:

Run all tests: `npm test` or `yarn test`

Run tests in watch mode: `npm run test:watch`

Check code coverage: `npm run test:coverage`

Run type checking: `npm run type-check` or `tsc --noEmit`

Ensure no linting errors: `npm run lint`

Fix auto-fixable lint issues: `npm run lint:fix`

Testing Best Practices

Write unit tests for utility functions and services

Write integration tests for API endpoints

Write component tests for React components using React Testing Library

Aim for at least 80% code coverage

Mock external dependencies and API calls

Use meaningful test descriptions

📝 Documentation

Update relevant documentation when making changes

Add comments for complex logic

Keep README files up to date

Document API changes

🙏 Thank You!

Your contributions make our project better. We appreciate your time and effort in following these guidelines!

For questions or help, reach out to the backend team on our internal chat channels.