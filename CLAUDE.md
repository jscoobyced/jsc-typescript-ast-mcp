# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides TypeScript AST (Abstract Syntax Tree) analysis capabilities. It's built using the `@modelcontextprotocol/sdk` and integrates with `ts-morph` to analyze TypeScript code.

## Architecture

The project has a simple architecture:

- Main entry point: `code/src/index.ts` - Sets up the MCP server and registers tools
- Tool implementations:
  - `code/src/ts-morph/references.ts` - Implements the `find_reference` tool using ts-morph
  - `code/src/ts-morph/dependency.ts` - Implements the `find_dependency` tool
  - `code/src/ts-morph/componentTree.ts` - Implements the `component_tree` tool
- The server is designed to run as an MCP server over stdio

## Key Files

- `code/src/index.ts`: Main server entry point that initializes the MCP server and registers tools
- `code/src/ts-morph/references.ts`: Implements the find_reference tool using ts-morph library
- `code/src/ts-morph/dependency.ts`: Implements the find_dependency tool
- `code/src/ts-morph/componentTree.ts`: Implements the component_tree tool
- `code/src/ts-morph/utils/extractJsx.ts`: Utility for extracting JSX information including onClick handlers
- `code/src/ts-morph/utils/props.ts`: Utility for extracting props and onClick information
- `code/src/ts-morph/utils/types.ts`: Type definitions including TreeNode and OnClickInfo
- `code/tsconfig.json`: TypeScript compilation configuration
- `code/package.json`: Project metadata and scripts
- `code/.env.example`: Example environment variables file
- `code/.mcp.example.json`: Example MCP configuration file

## Development Commands

- `yarn --cwd code build`: Compiles TypeScript to JavaScript in the `dist` directory
- `yarn --cwd code test:mcp`: Runs the MCP server with the inspector
- `yarn --cwd code format`: Formats code using Prettier

## How to Run

The server is designed to run as an MCP server over stdio. You can run it with:

```bash
yarn --cwd code build
yarn --cwd code test:mcp
```

The server provides three tools:
- `find_reference` – finds all references to a given method in a TypeScript class.
- `find_dependency` – lists all files that import a specified library.
- `component_tree` – analyzes React component structures in your codebase.
All tools use the `typescript-ast` MCP server to analyze the codebase.

## Dependencies

- `@modelcontextprotocol/sdk`: For MCP protocol implementation
- `ts-morph`: For TypeScript AST parsing and analysis
- `zod`: For input validation
- `dotenv`: For environment variable loading

## Environment Variables

- `PROJECT_TSCONFIG_PATH`: Path to the tsconfig.json file to use for project analysis (defaults to 'tsconfig.json')

## Setup

1. Change to the `code` directory:

```
cd code
```

2. Copy `.env.example` to `.env` and update the `PROJECT_TSCONFIG_PATH` to point to your project's tsconfig.json
3. Run `yarn install` to install dependencies
4. Run `yarn build` to compile the TypeScript code
5. Run `yarn test:mcp` to test the MCP server
