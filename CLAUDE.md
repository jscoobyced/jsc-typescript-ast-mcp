# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides TypeScript AST (Abstract Syntax Tree) analysis capabilities. It's built using the `@modelcontextprotocol/sdk` and integrates with `ts-morph` to analyze TypeScript code.

## Architecture

The project has a simple architecture:

- Main entry point: `code/src/index.ts` - Sets up the MCP server and registers tools
- Tool implementation: `code/src/ts-morph/index.ts` - Implements the `find_reference` tool using ts-morph
- The server is designed to run as an MCP server over stdio

## Key Files

- `code/src/index.ts`: Main server entry point that initializes the MCP server and registers tools
- `code/src/ts-morph/index.ts`: Implements the find_reference tool using ts-morph library
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

The server provides two tools:
- `find_reference` – finds all references to a given method in a TypeScript class.
- `find_dependency` – lists all files that import a specified library.
Both tools use the `typescript-ast` MCP server to analyze the codebase.

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
