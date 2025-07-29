# HTML to Vega-Lite Examples

## 🤝 Contributing

We welcome contributions! To get started, please review the following guidelines and resources:

### 1. Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to foster a welcoming and respectful community.

### 2. How to Contribute

- **Bug Reports & Feature Requests:**  
    Open an issue describing the problem or feature. Include steps to reproduce, expected behavior, and relevant context.

- **Pull Requests:**  
    1. Fork the repository and create a new branch for your changes.
    2. Write clear, concise commit messages.
    3. Add or update tests for your changes.
    4. Ensure all tests pass (`yarn test`).
    5. Update documentation as needed (README, examples, API docs).
    6. Submit a pull request with a description of your changes.

### 3. Project Structure

Refer to [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for a detailed overview of the codebase, including:

- **Core Modules:**  
    - `src/converter/` – HTML parsing and conversion logic  
    - `src/strategies/` – Tag strategies and custom extensions  
    - `src/utils/` – Utility functions and helpers

- **Examples:**  
    - `examples/` – Browser and Node.js usage samples

- **Tests:**  
    - `test/` – Unit and integration tests

### 4. Adding New Tag Strategies

To add support for a new HTML tag or custom formatting:

1. Implement a new strategy class in `src/strategies/`.
2. Register your strategy in the converter (see "Strategy Management" in API docs).
3. Add usage examples in `examples/` and update the README.
4. Document your strategy in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### 5. Documentation

- Update the README and relevant `.md` files for any user-facing changes.
- Add or update JSDoc comments for public APIs.
- For architectural changes, update [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### 6. Testing

- Run `yarn test` to execute all tests.
- Add tests for new features or bug fixes in the `test/` directory.
- Ensure code coverage does not decrease.

### 7. Commit & PR Standards

- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
- Reference related issues in your PR description.

---

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
