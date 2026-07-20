# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Git Workflow
This repository follows a simplified Git Flow model:
- `main`: Production-ready stable code
- `develop`: Integration branch for new features
- `feature/nombre-tarea`: Feature branches created from `develop`

Standard development workflow:
```bash
# Update local develop branch
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name

# After making changes, push and create a pull request
git push -u origin feature/your-feature-name
```

Pull requests trigger the validation workflow (see `.github/workflows/verificar.yml`) which runs on `develop` and `main` branches.

### Available Scripts
This repository currently contains documentation and CI configuration only. Refer to the README.md for detailed workflow instructions.

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── verificar.yml      # CI workflow for syntax validation
├── .gitignore                 # AL/Dynamics 365 Business Central specific ignores
├── .git/                      # Git repository data
└── README.md                  # Workflow and branching strategy documentation
```

## Architecture Overview

Based on the README documentation, this repository manages:
- **Order management system**
- **Truck fleet management**

The system follows a structured branching model to ensure stability in the production environment (`main` branch). All feature development occurs in short-lived branches branching from `develop`, which serves as the integration branch for testing.

Note: The actual source code for the application is not present in this repository snapshot; the focus is on version control practices and CI validation.
