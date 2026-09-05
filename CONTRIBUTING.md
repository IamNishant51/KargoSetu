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
