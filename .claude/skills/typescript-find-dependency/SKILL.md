---
name: typescript-find-dependency
description: Find all files that import a specified library in a TypeScript project using the `typescript-ast` MCP server. Return a list of file paths where the dependency is used.
argument-hint: Requires 1 argument: the dependency name.
---

# The Job

You will use the `typescript-ast` MCP server to find all files that import a specific dependency in a TypeScript project. The MCP server provides an API to analyze TypeScript code and retrieve information about imports.

**IMPORTANT**: never run your own search via `grep` or `find` or any other tool. You must use the MCP server to find the files, otherwise you will not be able to find all files and you will not be able to complete the job.
