# TypeScript AST MCP Server

A Model Context Protocol (MCP) server that provides TypeScript AST (Abstract Syntax Tree) analysis capabilities. This server allows you to find references for classes and methods, analyze component trees, and find dependencies in TypeScript code using the ts-morph library.

## Features

- **MCP Server**: Implements the Model Context Protocol for integration with AI assistants
- **TypeScript Analysis**: Uses ts-morph for powerful TypeScript AST parsing and analysis
- **Reference Finding**: Find all references to a given class method in your codebase
- **Dependency Finding**: Use the `find_dependency` tool to list all files that import a specified library.
- **Component Tree Analysis**: Use the `component_tree` tool to analyze React component structures in your codebase.
- The tools are part of the MCP server and can be invoked via Claude Code or other MCP clients.

## Prerequisites

- Node.js (version compatible with the project)
- Yarn package manager

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   yarn install
   ```

3. Copy the example configuration files:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your project's tsconfig path:
   ```bash
   PROJECT_TSCONFIG_PATH=/path/to/your/project/tsconfig.json
   ```

## How to Run

### Build the project:

```bash
yarn build
```

### Test the MCP server:

```bash
yarn test:mcp
```

This will start the MCP server that can be connected to by MCP-compatible clients.

## Installing in Claude Code

To use this MCP server in Claude Code:

1. **Build the server**:
   ```bash
   yarn build
   ```
2. **Configure Claude Code**:

- Copy the `.mcp.example.json` to `.mcp.json` (or update your existing one with the content of the MCP configuration)
- Edit your `.claude/settings.local.json` and add the MCP section (or the subset needed if you already have some MCPs configured)

```
  “enableAllProjectMcpServers”: true,
  “enabledMcpjsonServers”: [
    “typescript-ast”
  ]
```

- Start Claude Code
- Type the `/mcp` command and check the MCP is connected

## Development

### Update the code:

1. Make changes to the TypeScript source files in `src/`
2. Build the project:
   ```bash
   yarn build
   ```
3. Test the changes:
   ```bash
   yarn test:mcp
   ```

### Environment Variables

The server uses the following environment variable:

- `PROJECT_TSCONFIG_PATH`: Path to the tsconfig.json file to use for project analysis (defaults to 'tsconfig.json')

### Example Configuration Files

- `.env.example`: Example environment variables file
- `.mcp.example.json`: Example MCP configuration file (if applicable)

## Tool Descriptions

The server provides three tools:

### 1. `find_reference`
Find all references to a given class method in your codebase.

- **Input**:
  - `filePath`: Path to the file
  - `className`: Name of the class
  - `methodName`: Name of the method
- **Output**: List of file paths with line numbers where the method is referenced

### 2. `find_dependency`
List all files that import a specified library.

- **Input**:
  - `dependencyName`: Name of the dependency to search for
- **Output**: List of file paths that import the specified dependency

### 3. `component_tree`
Analyze React component structures in your codebase.

- **Input**:
  - `entryFilePath`: Path to the entry file
  - `maxDepth`: Maximum depth of the component tree (default: 3)
  - `data-id` (optional): Attribute name to capture into `TreeNode.dataId` (example: `data-attribute-id`)
- **Output**: JSON representation of the component tree structure, including optional element metadata such as `props`, `dataId`, and `onClick`

## License

MIT
