# Contributing to Whack-a-Mole

Thank you for your interest in contributing! 🎯 This project welcomes contributions of all kinds — bug fixes, documentation improvements, tests, features, design improvements, and more.

Please read this document to get started and make sure your contribution follows the repository's workflow and standards.

---

## Table of contents

1. [How to fork & create a branch](#how-to-fork--create-a-branch)
2. [Clone the repo locally](#clone-the-repo-locally)
3. [Run the project locally](#run-the-project-locally)
4. [Coding standards & tests](#coding-standards--tests)
5. [Commit messages & branch naming](#commit-messages--branch-naming)
6. [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
7. [Opening issues](#opening-issues)
8. [Code of Conduct](#code-of-conduct)
9. [Maintainers & contact](#maintainers--contact)

---

## How to fork & create a branch

1. Click the **Fork** button on the top-right of the repository page to make your own copy under your GitHub account.
2. In your forked repo, create a new branch for your work. Use a descriptive branch name (see branch naming below).

```bash 
# example
git checkout -b feat/add-mobile-touch
```

---

## Clone the repo locally

Clone your fork (replace `<your-username>`):

```bash
git clone https://github.com/<your-username>/whack-a-mole.git
cd whack-a-mole
```

Add the original repo as an upstream remote so you can keep your fork in sync:

```bash
git remote add upstream https://github.com/piyushkdas0611/whack-a-mole.git
git fetch upstream
```

Before starting work, make sure your local `main` is up to date:

```bash
git checkout main
git pull upstream main
```

---

## Run the project locally

The project is plain HTML/CSS/JS with tests using Node tools. Quick ways to run locally:

* Open `index.html` directly in a browser.
* Or use a simple local server (recommended for APIs or fetch usage):

```bash
# using Python 3
python3 -m http.server 8080
# or using npm's http-server (install if needed)
npx http-server -c-1 .
```

Install dev dependencies (for tests):

```bash
npm install
```

Run tests (see README for test scripts):

```bash
npm test
npm run test:functions
npm run vitest
```

---

## Coding standards & tests

* Follow the existing code style in the repo. If adding a new file, try to match indentation and naming.
* Keep functions small and focused.
* Add comments where logic is non-obvious.
* Avoid leaving `console.log` statements in committed code unless they are for debugging and removed later.
* Write tests for new features or bug fixes. The repo already has unit and integration tests — aim to keep tests green.

If you want, open an issue first to discuss larger changes.

---

## Commit messages & branch naming

**Branch name conventions (examples):**

* `feat/<short-description>` — new feature
* `fix/<short-description>` — bug fix
* `docs/<short-description>` — docs only
* `test/<short-description>` — tests
* `chore/<short-description>` — maintenance

**Commit message style (recommended — Conventional Commits):**

* `feat: add mobile touch support`
* `fix: correct scoring when timer ends`
* `docs: update README run instructions`
* `test: add unit test for whack logic`

Write clear messages. One short summary line + optional body.

---

## Submitting a Pull Request (PR)

1. Make your changes on a branch in your fork (not directly on `main`).
2. Push the branch to your GitHub fork: `git push origin your-branch-name`.
3. Open a Pull Request against the upstream repository's `main` branch.

**PR checklist (please include before requesting review):**

* [ ] Branch name follows convention
* [ ] Tests added/updated and passing
* [ ] Lint/format (if present) 
* [ ] README or docs updated if behavior changed
* [ ] Screenshots / GIF for UI changes
* [ ] Link to related issue (if any)

**How to auto-close an issue:** include `Closes #<issue-number>` in the PR description.

**Suggested PR title:** `docs: add CONTRIBUTING.md` (or `feat:` / `fix:` as appropriate)

**Suggested PR description template:**

```
## Summary
Short description of what this PR does.

## Related Issue
Closes #<issue-number> (if applicable)

## How to test
Steps to reproduce and test the changes.

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
```

---

## Opening issues

When opening a new issue, please include:

* A clear and descriptive title.
* Steps to reproduce the problem.
* Expected vs actual behavior.
* Browser / OS / Node version if relevant.
* Screenshots or GIFs if it helps.

If you want to propose a feature, describe the proposal and possible implementation ideas.

---

## Code of Conduct

Be respectful and constructive. This project follows a simple code of conduct:

* Treat others with respect.
* No harassment, hate, or abusive language.
* Help newcomers when possible.

Follow for  projects [Code of Conduct](./CodeofConduct.md)

---

## Hacktoberfest note

If you want to contribute for Hacktoberfest, please ensure your PRs are meaningful, include tests/documentation where appropriate, and follow the repository guidelines.

---

## Maintainers & contact

If you need help, open an issue and mention `@piyushkdas0611` ,  Piyush K. Das. For questions before starting bigger work, please open a discussion or an issue describing your plan.

---

Thanks again for considering contributing — we appreciate your time and help! ❤️

*This file was created to help contributors get started quickly.*
