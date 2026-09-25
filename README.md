# Internal Partial Indexing Tooling

Partial indexing is not yet active on all plans and will need to be enabled on your Project.

Note that these commands will execute on the `production` dataset by default. To run on another dataset, use the `--dataset` option.

## Command-line tool usage

1. Run `npm install` to install dependencies
2. Define a token (e.g. from `sanity debug --secrets`): `export SANITY_TOKEN=…`

## Commands

### `check`

Check what the attribute count _would_ be once a new partial indexing setting is applied.

**Syntax**

```sh
node run.mjs check --project-id <PROJECT-ID> --dataset [DATASET] [partial-indexing-options]
```

### `apply`

Apply the new partial indexing settings.
Requires at least one of the partial indexing options to be set.

**Syntax**

```sh
node run.mjs apply --project-id <PROJECT-ID> --dataset [DATASET] [partial-indexing-options]
```

### Partial indexing options

- `--max-field-depth <N>`: The maximum indexed field depth.
- `--exclude-field-path <FIELD_PATH>`: Field paths to exclude from indexing (e.g. "comments.text"). Can be applied multiple times.
- `--include-field-path <FIELD_PATH>`: Field paths to include in indexing (e.g. "title", "author.name"). Can be applied multiple times.

### Help

See also `node run.mjs --help` for additional options.

## Examples

#### `check`

```sh

#  Returns the current attribute count, with settings as they are now
node run.mjs check --project-id <PROJECT-ID>

# Check attribute count with a max field depth of 2
node run.mjs check --project-id <PROJECT-ID> --max-field-depth 2

# Check attribute count when excluding a field
node run.mjs check --project-id <PROJECT-ID> --exclude-field-path "comments.text"

# Check attribute count when setting a low max field depth but including a specific field
node run.mjs check --project-id <PROJECT-ID> --max-field-depth 1 --include-field-path "author.name" --include-field-path "author.age"
```

> [!IMPORTANT]
> When checking new partial indexing settings, it is assumed that the previous settings are not applied. This means that if you have previously aplied an exclusion of a field path, it will not be considered when checking new settings unless you include it again.

#### `apply`

```sh
# Apply a max field depth of 2
node run.mjs apply --project-id <PROJECT-ID> --max-field-depth 2

# Exclude a field path from indexing
node run.mjs apply --project-id <PROJECT-ID> --exclude-field-path "comments.text"

# Include a field path in indexing, even with a low max field depth
node run.mjs apply --project-id <PROJECT-ID> --max-field-depth 1 --include-field-path "title"

# Remove partial indexing
node run.mjs apply --project-id <PROJECT-ID> --max-field-depth 0
```

> [!CAUTION]
> When applying new partial indexing settings the previous settings will be completely replaced.

### Library

See [index.mjs](index.mjs).
