# Contributing to LocaleDB

Thank you for your interest in contributing to LocaleDB! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Data Contributions](#data-contributions)
- [Translation Contributions](#translation-contributions)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Ways to Contribute

There are several ways you can contribute to LocaleDB:

1. **Fix or Update Country Data** - Correct inaccuracies in locale data
2. **Add New Countries** - Help add missing countries or territories
3. **Improve Translations** - Add or improve translations in the 11 supported languages
4. **Improve Website** - Enhance UI/UX, fix bugs, add features
5. **Report Issues** - Submit bug reports or feature requests
6. **Documentation** - Improve documentation, add examples

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git

### Installation

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/localedb.git
cd localedb
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
```

4. Build the data files:
```bash
pnpm build:data
```

5. Start the development server:
```bash
pnpm dev
```

The site will be available at `http://localhost:3000`

## Project Structure

```
LocaleDB/
├── data/                      # Static JSON data files
│   ├── countries/             # Country-specific data files
│   ├── currencies/            # Currency data files
│   ├── languages/             # Language data files
│   ├── cldr/                  # CLDR data sources
│   └── overrides/             # Manual data corrections
├── messages/                  # i18n translation files (11 languages)
├── scripts/                   # Data generation and build scripts
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── [locale]/          # Locale-based routing
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   ├── lib/                   # Data loading functions
│   └── types/                 # TypeScript type definitions
└── docs/                      # Documentation
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use a descriptive branch name:
- `fix/incorrect-tr-currency`
- `feat/add-country-search`
- `docs/update-readme`
- `i18n/add-spanish-translations`

### 2. Make Your Changes

- Follow the existing code style
- Write clear commit messages
- Test your changes locally
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run the development server
pnpm dev

# Build the project
pnpm build

# Lint your code (if applicable)
pnpm lint
```

## Data Contributions

### Fixing Country Data

1. Locate the country file in `data/countries/{CODE}.json` (e.g., `TR.json` for Turkey)
2. Make your corrections
3. Ensure the JSON is valid
4. Test by rebuilding:
```bash
pnpm build:data
pnpm dev
```

### Data Override System

For manual corrections, use the override system:

1. Create or edit `data/overrides/{CODE}.json`
2. Add only the fields you want to override:
```json
{
  "currency": {
    "symbol": "₺",
    "example": "1.234,56 ₺"
  }
}
```

The build system will merge overrides with the base data.

### Data Schema

All country data must follow the `CountryLocaleData` schema defined in `src/types/country.ts`. Key sections include:

- `basics`: Name, capital, population, etc.
- `codes`: ISO codes, BCP-47, etc.
- `currency`: Formatting rules, symbols
- `dateTime`: Date and time formats
- `numberFormat`: Number formatting rules
- `phone`: Phone number formatting
- `addressFormat`: Address templates
- `locale`: RTL, measurement system, etc.

## Translation Contributions

LocaleDB supports 11 languages. To contribute translations:

1. Locate the translation file in `messages/{locale}.json` (e.g., `tr.json` for Turkish)
2. Add or update translation keys
3. Follow the existing structure
4. Test the translation by switching languages in the UI

### Translation Guidelines

- Use native speakers when possible
- Keep translations concise and clear
- Maintain consistency with UI terminology
- Test RTL languages (Arabic) carefully
- Preserve placeholders: `{count}`, `{name}`, etc.

Example structure:
```json
{
  "countries": {
    "title": "Browse Countries",
    "subtitle": "Explore localization data for {count} countries",
    "search": "Search countries..."
  }
}
```

## Pull Request Process

1. **Update your fork** with the latest changes from the main repository:
```bash
git remote add upstream https://github.com/ozkurkculer/localedb.git
git fetch upstream
git rebase upstream/main
```

2. **Push your changes**:
```bash
git push origin feature/your-feature-name
```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what was changed and why
   - Reference to any related issues
   - Screenshots (for UI changes)
   - Test results

4. **Wait for review**. Maintainers will:
   - Review your code
   - Request changes if needed
   - Merge once approved

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`pnpm build` succeeds)
- [ ] New code has appropriate comments
- [ ] Documentation updated (if applicable)
- [ ] Translation files updated (for UI changes)
- [ ] Commit messages are clear and descriptive

## Style Guide

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing code patterns
- Use functional components in React
- Prefer `async/await` over promises
- Use meaningful variable names

### File Naming

- Use kebab-case for files: `country-grid-client.tsx`
- Use PascalCase for components: `CountryGridClient`
- Use camelCase for functions: `getCountryIndex`

### CSS

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use semantic color tokens: `bg-background`, `text-foreground`
- Avoid custom CSS when possible

### Commit Messages

Follow conventional commits:
```
type(scope): description

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes
- `i18n`: Translation updates

Examples:
```
feat(countries): add continent filter
fix(currency): correct TRY symbol position
docs(readme): update installation instructions
i18n(tr): add Turkish translations for countries page
```

## Questions or Need Help?

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers

## License

By contributing to LocaleDB, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to LocaleDB! 🌍
