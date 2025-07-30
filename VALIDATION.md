# Code Validation & Quality System

This document describes the comprehensive validation system for the Isntgram project.

## Available Scripts

### Quick Validation (Recommended for Development)

```bash
npm run validate
```

Runs: `lint:strict` + `type-check` + `format:check`

### Auto-fix Common Issues

```bash
npm run validate:fix
```

Runs: `lint:fix` + `format` + then `validate`

### Full Quality Check (Pre-commit/CI)

```bash
npm run validate:full
```

Runs: `lint:strict` + `type-check:strict` + `format:check` + `mdlint` + `test:unit`

### Individual Commands

#### Linting

- `npm run lint` - Basic ESLint check
- `npm run lint:strict` - ESLint with zero warnings allowed
- `npm run lint:fix` - Auto-fix ESLint issues

#### TypeScript

- `npm run type-check` - TypeScript compilation check
- `npm run type-check:strict` - TypeScript with strict mode

#### Formatting

- `npm run format` - Auto-format with Prettier
- `npm run format:check` - Check if formatting is correct

#### Documentation

- `npm run mdlint` - Lint Markdown files
- `npm run mdlint:fix` - Auto-fix Markdown issues

#### Testing

- `npm run test:unit` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## Code Quality Standards

### ESLint Configuration

Our ESLint setup includes:

- **TypeScript-specific rules**: No `any`, prefer nullish coalescing, optional chaining
- **React Hooks**: Proper hooks usage and dependency arrays
- **Accessibility**: JSX a11y rules for inclusive design
- **Code Style**: Consistent formatting with Prettier integration
- **Security**: No eval, script URLs, or unsafe patterns

### TypeScript Configuration

- **Strict Mode**: Full type safety enabled
- **No Unused Variables**: Catches dead code
- **No Fallthrough**: Switch statement safety
- **Consistent Casing**: File name enforcement

### Key Rules

1. **No `any` types** - Use proper TypeScript types
2. **Prefer `??` over `||`** - Safer null/undefined handling
3. **Use optional chaining** - `obj?.prop` instead of `obj && obj.prop`
4. **No non-null assertions** - Avoid `!` operator when possible
5. **Consistent formatting** - Prettier enforced

## Integration with VS Code

The validation system integrates with:

- **VS Code Problems Panel**: TypeScript errors show in real-time
- **ESLint Extension**: Inline warnings and errors
- **Prettier Extension**: Auto-format on save

## Workflow Recommendations

### During Development

```bash
# Quick check before committing
npm run validate

# Fix formatting and auto-fixable issues
npm run validate:fix
```

### Before Pull Request

```bash
# Comprehensive quality check
npm run validate:full
```

### Continuous Integration

The `validate:full` script is perfect for CI/CD pipelines as it:

- Ensures zero lint warnings/errors
- Validates TypeScript compilation
- Checks code formatting
- Runs all tests
- Validates documentation

## Current Status

✅ **ESLint**: Configured with strict TypeScript rules  
✅ **TypeScript**: Strict mode enabled  
✅ **Prettier**: Code formatting enforced  
✅ **Testing**: Vitest configured  
🔄 **Current Issues**: 44 lint issues (mostly style improvements)

## Fixing Remaining Issues

The remaining 44 lint issues are primarily:

1. **Nullish Coalescing**: Replace `||` with `??` for null/undefined checks
2. **Non-null Assertions**: Remove `!` operators where possible
3. **Type Annotations**: Remove unnecessary type annotations

These can be gradually fixed or temporarily disabled for specific cases if needed.
