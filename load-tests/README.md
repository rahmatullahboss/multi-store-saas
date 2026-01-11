# Load Testing

This directory contains k6 scripts for load testing the application.

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) must be installed.

## Running Tests

Run the test against your local development server or staging environment.

```bash
k6 run basic-flow.js
```

**Note:** Update the `BASE_URL` in `basic-flow.js` if you are testing a deployed environment (e.g., Cloudflare Pages URL).
