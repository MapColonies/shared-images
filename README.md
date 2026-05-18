# Shared Images Monorepo

Welcome to the `shared-images` repository! This monorepo centrally manages the lifecycle, versioning, and continuous deployment of various internal applications and extended third-party base images.

## 🌟 Key Features

### 1. Repository Structure
Every service, application, or extended base image resides in its own dedicated directory under the `images/` folder. This allows for clear separation of concerns and independent building.

### 2. Pull Request Quality Gate
All code and configurations are automatically linted and formatted to maintain high code quality standards.
- **MegaLinter**: We use MegaLinter to aggregate and run multiple linters natively in our CI/CD pipeline, catching syntax and style issues.
- **Ownership Validation**: A dedicated CI job ensures that every image directory under `images/` is explicitly mapped to a team owner in `ownership.json`.
- **CI Integration**: The `.github/workflows/pr-checks.yaml` runs on all Pull Requests to automatically block unformatted code or missing ownership metadata.

*Local Command:* Run `npm run lint` or `npm run format` locally before you commit to fix issues!

### 3. Local Commit Policy Enforcement (Husky & Commitlint)
We enforce strict **Conventional Commits** using Husky pre-commit hooks to automate changelog generation.

**Dynamic Scope Enforcement:**
We utilize a dynamic scope-resolution script in `commitlint.config.js`. Your commit message scope **MUST** match exactly one of the directory names inside `images/`, or the keyword `global`.

*Example Valid Commits:*
- `feat(pgadmin): added a new user config`
- `chore(global): update prettier configuration`

*Example Invalid Commit (Will be blocked by Husky):*
- `feat(db): added a new user config` (Blocked: "db" is not a valid directory in `images/`).

### 4. Unified CI/CD Release Pipeline (`release-please`)
We use Google's `release-please` action to automate semantic versioning and changelog generation for the entire monorepo.
- **Independent Versioning**: Each directory under `images/` is versioned independently based on the commits that touched it.

### 5. Dynamic Team Ownership & Image Tagging
Docker builds and registry pushes are handled dynamically in `.github/workflows/release-please.yaml`.
- **Matrix Builds**: Images are only built and pushed for the directories that were actually modified in a release.
- **Team Ownership**: The image tagging includes the team owner dynamically retrieved from `ownership.json`.
- **Tag Format**: `[REGISTRY]/[TEAM]/[IMAGE_NAME]:[VERSION]` and `[REGISTRY]/[TEAM]/[IMAGE_NAME]:latest`.

### 6. Automated Helm Chart Updates
When a new version of an image is released, an automated GitHub Actions job (`update-helm-chart` in `release-please.yaml`) executes a custom script (`.github/scripts/update-chart.js`).
- This script scans an external Helm charts repository.
- It finds any Helm charts or chart dependencies matching the updated image name.
- It automatically updates `values.yaml` tags (or `appVersion` in `Chart.yaml`) and creates a Pull Request in the Helm charts repository.
