# Shared Images Monorepo

Welcome to the `shared-images` repository! This monorepo centrally manages the lifecycle, versioning, and continuous deployment of various internal applications and extended third-party base images.

## 🌟 Key Features

### 1. Flat Repository Structure
To maximize CI/CD path-filtering simplicity, every service, application, or extended base image resides in its own dedicated directory directly at the repository root.

**Current Images:**
- `elastic-alertmanager-connector`
- `hoppscotch`
- `pgadmin`
- `scaler`
- `sftpgo`
- `sftpgo-node-exporter`

### 2. Pull Request Quality Gate
All code and configurations are automatically linted and formatted to maintain high code quality standards.
- **Python**: Enforced using `ruff` (the fastest Python linter & formatter).
- **Dockerfiles**: Enforced using `hadolint` (natively running via NPM to ensure strict Dockerfile best practices).
- **Everything Else**: Enforced using `prettier` (Markdown, JSON, YAML).
- **Ownership Validation (New Feature)**: A dedicated CI job ensures that every new root-level directory is explicitly mapped to a team owner in `ownership.json`.
- **CI Integration**: The `.github/workflows/pr-checks.yaml` runs on all Pull Requests to automatically block unformatted code or missing ownership metadata.

*Local Command:* Run `npm run lint` or `npm run format` locally before you commit to fix issues!

### 3. Local Commit Policy Enforcement (Husky & Commitlint)
We enforce strict **Conventional Commits** using Husky pre-commit hooks to automate changelog generation.

**Dynamic Scope Enforcement (Edge Case Feature):**
We utilize a dynamic scope-resolution script. Your commit message scope **MUST** match exactly one of the root directory names, or the keyword `global`.

*Example Valid Commits:*
- `feat(pgadmin): added a new user config`
- `chore(global): update prettier configuration`

*Example Invalid Commit (Will be blocked by Husky):*
- `feat(db): added a new user config` (Blocked: "db" is not a root directory).

### 4. Unified CI/CD Release Pipeline (`release-please`)
We use Google's `release-please` action to automate semantic versioning and changelog generation for the entire monorepo.
- **Independent Versioning**: Each directory is versioned independently based on the commits that touched it.

### 5. Dynamic Team Ownership & Image Tagging
Docker builds and registry pushes are handled dynamically in `.github/workflows/release-please.yaml`.
- **Matrix Builds**: Images are only built and pushed for the directories that were actually modified in a release.
- **Team Ownership (Edge Case Feature)**: The image tagging includes the team owner dynamically retrieved from `ownership.json`.
- **Tag Format**: `[REGISTRY]/[TEAM]/[IMAGE_NAME]:[VERSION]` and `[REGISTRY]/[TEAM]/[IMAGE_NAME]:latest`.
