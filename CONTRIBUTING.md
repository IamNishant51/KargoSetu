# Contributing to KargoSetu

First off, thank you for considering contributing to KargoSetu! It's people like you that make open-source software such a great community.

This document provides guidelines and a workflow for contributing to the project.

## Workflow for Contributing

### 1. Local Setup

To get started, fork the repository and clone it to your local machine. Navigate to the project directory and install the necessary dependencies:

```bash
make install
```

### 2. Formatting and Linting

Before committing your changes, ensure that your code follows our style guidelines. We enforce code quality through formatting and linting. Run the following commands to format and lint your code:

```bash
make format
make lint
```

### 3. Running Tests

We rely on tests to keep the codebase stable. Make sure your changes don't break existing functionality and add new tests if applicable. Run the test suite using:

```bash
make test
```

### 4. Submitting a Pull Request

Once you're ready to submit your changes:

1. Commit your changes with clear, descriptive commit messages.
2. Push your branch to your fork.
3. Open a Pull Request (PR) against the main branch of the upstream repository.
4. Please ensure you fill out the details required in our **Pull Request Template**. It helps reviewers understand the context, testing done, and the scope of your changes.

We look forward to your contributions!


---

### Potential Judge Questions

As a technical judge evaluating your project's engineering practices based on your `CONTRIBUTING.md` file, here are 10 probing questions regarding your contribution workflow:

1. **Underlying Dependencies:** When a contributor runs `make install`, what specific package managers or environment setup scripts are being abstracted away, and does this command also handle database seeding or environment variable configuration for local development?
2. **Cross-Platform Compatibility:** You are using a `Makefile` to standardize your workflow (`make install`, `make test`, etc.). How does this setup behave for contributors who might be developing on Windows machines, and have you accounted for cross-platform compatibility?
3. **Automated CI/CD Enforcement:** The guide instructs contributors to manually run `make lint` and `make test` before committing. Have you implemented a Continuous Integration (CI) pipeline (e.g., GitHub Actions) to strictly enforce these checks when a PR is opened, in case a contributor forgets?
4. **Pre-commit Hooks:** To ensure your style guidelines are consistently met, have you configured pre-commit hooks (like Husky or pre-commit) to automatically run `make format` and `make lint` during the commit process itself?
5. **Linting and Formatting Rules:** What specific underlying tools (e.g., Prettier, ESLint, Black, SonarQube) are triggered by `make format` and `make lint`, and how did you decide on the specific ruleset being enforced for KargoSetu?
6. **Testing Scope:** The documentation mentions running `make test` to ensure existing functionality isn't broken. Does this command run only unit tests, or does it also execute integration and end-to-end tests that require mocked external services?
7. **Test Coverage Thresholds:** You ask contributors to "add new tests if applicable." Do you have an automated minimum test coverage threshold that will cause the build to fail if a contributor adds new features without adequate tests?
8. **Commit Message Standards:** You request "clear, descriptive commit messages." Do you enforce a standardized convention (such as Conventional Commits) to help automate semantic versioning and changelog generation, or is it currently left to the subjective judgment of the reviewer?
9. **Pull Request Template Requirements:** You explicitly highlight a **Pull Request Template** that asks for "testing done." What specific evidence are you requiring in this template (e.g., before/after screenshots, test execution logs, coverage reports) to verify that the contributor thoroughly tested their code?
10. **Branching Strategy:** The workflow directs PRs to be opened directly against the `main` branch. Are you practicing trunk-based development, and if so, how are you handling staging environments or feature-flagging to ensure that `main` is always in a deployable, production-ready state?
