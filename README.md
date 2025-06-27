# 🔐 secret-linter
[![codecov](https://codecov.io/gh/lwensveen/secret-linter/branch/main/graph/badge.svg)](https://codecov.io/gh/lwensveen/secret-linter)

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