# 🔐 secret-linter

[![CI](https://github.com/lwensveen/secret-linter/actions/workflows/ci.yml/badge.svg)](https://github.com/lwensveen/secret-linter/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/secret-linter)](https://www.npmjs.com/package/secret-linter)
[![downloads](https://img.shields.io/npm/dw/secret-linter)](https://www.npmjs.com/package/secret-linter)
[![size](https://img.shields.io/bundlephobia/minzip/secret-linter)](https://bundlephobia.com/package/secret-linter)
[![codecov](https://codecov.io/gh/lwensveen/secret-linter/branch/main/graph/badge.svg)](https://codecov.io/gh/lwensveen/secret-linter)
[![docs](https://img.shields.io/badge/docs-%E2%9C%93-blue)](https://lwensveen.github.io/secret-linter/)
[![license](https://img.shields.io/npm/l/secret-linter)](LICENSE)

A tool to scan your repository for hard-coded secrets and optionally redact them.

## Installation

Install `secret-linter` via npm:

```bash
npm install -g secret-linter
```

## Usage

Scan your repository for hard-coded secrets:

```bash
npx secret-linter .
```

Automatically redact detected secrets:

```bash
npx secret-linter . --fix
```

## Features

- **Fast Scanning**: Quickly identifies hard-coded secrets in your codebase.
- **Automatic Redaction**: Use the `--fix` flag to automatically redact sensitive information.
- **Lightweight**: Easy to integrate into your development workflow.

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/lwensveen/secret-linter).

## Support

If you encounter issues or have questions, file an issue on the [GitHub repository](https://github.com/lwensveen/secret-linter/issues).