# Contributing to Common Setup

Thank you for your interest in contributing to Common Setup! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Submit a pull request

## Development Setup

1. Ensure you have the required tools installed (Git, your preferred editor)
2. Follow the setup instructions in the README.md
3. Familiarize yourself with the project structure

## Contribution Guidelines

### Code Style

- Follow existing code conventions and patterns
- Keep commits focused and atomic
- Write clear, descriptive commit messages

### Pull Requests

- Create a descriptive title and description
- Reference any related issues
- Ensure all tests pass (if applicable)
- Keep PRs focused on a single change

### Adding New Commands

When adding new Claude commands:

1. Create a new `.md` file in `.claude/commands/`
2. Follow the existing command structure
3. Update the README.md to include your new command
4. Test the command thoroughly

### Code Quality Standards

JavaScript/TypeScript Specific Guidelines:

- Use TypeScript with strict mode enabled
- Follow ESLint configuration rules
- Format code with Prettier before committing
- Use modern ES6+ syntax (async/await, destructuring, etc.)
- Avoid using `any` type; prefer proper type definitions
- Write unit tests for new functionality
- Document complex functions with JSDoc comments

### React Component Guidelines

- Use functional components with hooks
- Follow React hooks rules (no hooks in loops/conditions)
- Keep components small and focused (Single Responsibility)
- Use proper prop types with TypeScript interfaces
- Implement error boundaries for component errors
- Optimize re-renders with useMemo/useCallback when needed

### Reporting Issues

- Use clear, descriptive titles
- Provide steps to reproduce
- Include relevant error messages or logs
- Specify your environment details

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Maintain a positive and collaborative environment

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.