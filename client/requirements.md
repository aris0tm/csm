## Packages
framer-motion | For smooth page transitions and terminal-like animations
prism-react-renderer | For beautiful syntax highlighting of generated Terraform/Shell code
clsx | For conditional class merging (if not already present)
tailwind-merge | For merging tailwind classes safely (if not already present)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
  sans: ["'Inter'", "sans-serif"],
}
API Endpoints:
GET /api/deployments - List deployments
POST /api/deployments - Create deployment (generates files)
GET /api/deployments/:id - Get deployment details
