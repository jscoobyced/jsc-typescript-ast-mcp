# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides TypeScript AST (Abstract Syntax Tree) analysis capabilities. It's built using the `@modelcontextprotocol/sdk` and integrates with `ts-morph` to analyze TypeScript code.

## Architecture

The project has a simple architecture:
- Main entry point: `src/index.ts` - Sets up the MCP server and registers tools
- Tool implementation: `src/ts-morph/index.ts` - Implements the `find_reference` tool using ts-morph
- The server is designed to run as an MCP server over stdio

## Key Files

- `src/index.ts`: Main server entry point that initializes the MCP server and registers tools
- `src/ts-morph/index.ts`: Implements the find_reference tool using ts-morph library
- `tsconfig.json`: TypeScript compilation configuration
- `package.json`: Project metadata and scripts
- `.env.example`: Example environment variables file
- `.mcp.example.json`: Example MCP configuration file

## Development Commands

- `yarn build`: Compiles TypeScript to JavaScript in the `dist` directory
- `yarn test:mcp`: Runs the MCP server with the inspector
- `yarn format`: Formats code using Prettier

## How to Run

The server is designed to run as an MCP server over stdio. You can run it with:

```bash
yarn build
yarn test:mcp
```

The server provides a single tool: `find_reference` which takes a file path, class name, and method name as input and returns references to that method.

## Dependencies

- `@modelcontextprotocol/sdk`: For MCP protocol implementation
- `ts-morph`: For TypeScript AST parsing and analysis
- `zod`: For input validation
- `dotenv`: For environment variable loading

## Environment Variables

- `PROJECT_TSCONFIG_PATH`: Path to the tsconfig.json file to use for project analysis (defaults to 'tsconfig.json')

## Setup

1. Copy `.env.example` to `.env` and update the `PROJECT_TSCONFIG_PATH` to point to your project's tsconfig.json
2. Run `yarn install` to install dependencies
3. Run `yarn build` to compile the TypeScript code
4. Run `yarn test:mcp` to test the MCP server