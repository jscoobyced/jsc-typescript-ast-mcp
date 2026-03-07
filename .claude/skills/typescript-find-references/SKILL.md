---
name: typescript-find-references
description: When asked to find references to a method in a TypeScript class, use the `typescript-ast` MCP server to find all references to that method in the codebase. Idnetify the proper file path, class name and method name from the question, then use the MCP server to find all references to that method in the codebase. Return a list of file paths and line numbers where the method is referenced.
argument-hint: Requires 3 arguments: the file path, the class name and the method name.
---

# The Job

You will use the `typescript-ast` MCP server to find all references to a specific method in a TypeScript class. The MCP server provides an API to analyze TypeScript code and retrieve information about symbols, including their references.

**IMPORTANT**: never run your own search via `grep` or `find` or any other tool. You must use the MCP server to find the references, otherwise you will not be able to find all references and you will not be able to complete the job.
