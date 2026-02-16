#!/bin/bash
# Hook: Protect test files from modification
# Exit code 2 = blocking error (agent must correct itself)
# Exit code 0 = allowed (proceed)
#
# This hook is triggered on PreToolUse for Edit and Write tools.
# It reads the tool input from stdin (JSON) and checks if the target
# file path is inside a test directory or is a test file.

INPUT=$(cat)

# Extract the file path from the tool input JSON
FILE_PATH=$(echo "$INPUT" | grep -oE '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Check if the path contains test-related directories or filenames
if echo "$FILE_PATH" | grep -qiE '(/__tests__/|/tests?/|\.test\.|\.spec\.|\.tests\.|test_|_test\.)'; then
  echo "BLOCKED: Modifications to test files are not allowed." >&2
  echo "File: $FILE_PATH" >&2
  echo "Fix the implementation to pass the tests — do not modify the tests." >&2
  exit 2
fi

exit 0
