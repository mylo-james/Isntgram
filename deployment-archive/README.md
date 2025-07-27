# Deployment Archive

## July 27, 2025 - Modernization Simplification

This directory contains archived deployment configurations that we've moved away from during the Phase 2 modernization.

### Heroku (archived)

- `heroku-command.txt` - Docker build/deploy commands for Heroku
- `heroku.yml` - Heroku container configuration
- **Reason for removal**: Moving to Firebase hosting for better performance and modern deployment experience

### Docker (archived)

- `Dockerfile` - Multi-stage build (Node.js + Python)
- `.dockerignore` - Docker ignore patterns
- **Reason for removal**: Simplifying deployment with Firebase native tooling, removing container complexity

### Firebase Benefits (our new approach)

- Native React hosting with global CDN
- Simpler deployment workflow (`firebase deploy`)
- Better integration with modern web standards
- More cost-effective scaling
- Built-in CI/CD with GitHub Actions

These files are preserved for reference but are no longer part of the active deployment strategy.
