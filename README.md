eert
====

Takes tree text output and generates a directory structure

## Install

```
npm install -g eert
```

## Usage

```
cat <tree-out> | eert
```

This will generate the tree structure with empty files in `tmp` in the current working directory.

Or to specify an output directory:

```
cat <tree-out> | eert my-directory
```
