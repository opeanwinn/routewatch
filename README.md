# routewatch

A CLI tool to visualize and diff Next.js app router structures across branches.

## Installation

```bash
npm install -g routewatch
```

## Usage

Visualize the current branch's app router structure:

```bash
routewatch show
```

Diff the app router structure between two branches:

```bash
routewatch diff main feature/new-routes
```

Example output:

```
  app/
    layout.tsx
    page.tsx
+   dashboard/
+     page.tsx
-   profile/
-     page.tsx
    api/
      route.ts
```

### Options

| Flag | Description |
|------|-------------|
| `--json` | Output result as JSON |
| `--depth <n>` | Limit tree depth |
| `--ignore <glob>` | Ignore matching paths |

## Requirements

- Node.js 18+
- A Next.js project using the App Router (`/app` directory)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)