# Security Policy

## Reporting Security Issues

If you believe you have found a security vulnerability in this repository, please report it through coordinated disclosure.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please email [andrew@altude.so](mailto:andrew@altude.so).

Include as much of the following as you can:

- Type of issue (e.g., injection, XSS, key exposure)
- Full paths of affected source files
- Steps to reproduce
- Proof-of-concept or exploit code (if possible)
- Impact assessment

## Security Considerations

This is a **demo application** intended as a reference implementation. If adapting this code for production:

- Never commit `.env` files or API keys to version control
- Validate all transaction parameters server-side before relay
- Use environment-specific Dynamic project settings (separate dev/prod)
- Monitor relay usage and implement rate limiting
- Review [Dynamic's security docs](https://docs.dynamic.xyz) for wallet integration best practices

