#!/bin/bash
# =============================================================================
# Claude Code Environment Setup
# =============================================================================
# This script installs and configures all tools referenced in the workflow.
# Run once per machine. Requires: Node.js 18+, npm, git.
#
# Usage:
#   chmod +x env-setup.sh
#   ./env-setup.sh
# =============================================================================

set -e

echo "============================================"
echo "  Claude Code Environment Setup"
echo "============================================"
echo ""

# ------------------------------------
# 1. Claude Code CLI
# ------------------------------------
echo "[1/8] Installing Claude Code CLI..."
if command -v claude &>/dev/null; then
  echo "  Claude Code already installed: $(claude --version 2>/dev/null || echo 'installed')"
else
  npm install -g @anthropic-ai/claude-code
  echo "  Claude Code installed."
fi
echo ""

# ------------------------------------
# 2. Context7 MCP — Live library documentation
# ------------------------------------
echo "[2/8] Configuring Context7 MCP..."
# Context7 provides up-to-date docs for libraries and frameworks.
# Package: @upstash/context7-mcp (https://github.com/upstash/context7)
if claude mcp list 2>/dev/null | grep -q "context7"; then
  echo "  Context7 MCP already configured."
else
  claude mcp add context7 -- npx -y @upstash/context7-mcp 2>/dev/null || {
    echo "  Note: claude mcp add failed. Add manually:"
    echo "    claude mcp add context7 -- npx -y @upstash/context7-mcp"
  }
  echo "  Context7 MCP configured."
fi
echo ""

# ------------------------------------
# 3. Puppeteer MCP — Isolated browser testing
# ------------------------------------
echo "[3/8] Configuring Puppeteer MCP..."
# Package: @modelcontextprotocol/server-puppeteer
# Runs in a separate browser isolated from your existing sessions.
if claude mcp list 2>/dev/null | grep -q "puppeteer"; then
  echo "  Puppeteer MCP already configured."
else
  claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer 2>/dev/null || {
    echo "  Note: claude mcp add failed. Add manually:"
    echo "    claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer"
  }
  echo "  Puppeteer MCP configured."
fi
echo ""

# ------------------------------------
# 4. Vercel Agent Browser — Context-efficient browser testing
# ------------------------------------
echo "[4/8] Installing Agent Browser..."
# Package: agent-browser (https://github.com/vercel-labs/agent-browser)
# Uses accessibility tree — ~200-400 tokens vs full DOM.
if command -v agent-browser &>/dev/null; then
  echo "  Agent Browser already installed."
else
  npm install -g agent-browser 2>/dev/null && {
    echo "  Agent Browser installed. Running setup..."
    agent-browser install 2>/dev/null || {
      echo "  Note: agent-browser install (Chromium download) failed."
      echo "  Run 'agent-browser install' manually after setup."
    }
  } || {
    echo "  Note: agent-browser install failed."
    echo "  Install manually: npm install -g agent-browser && agent-browser install"
    echo "  See https://github.com/vercel-labs/agent-browser for details."
  }
fi
echo ""

# ------------------------------------
# 5. Git worktree check
# ------------------------------------
echo "[5/8] Verifying git worktree support..."
if git --version &>/dev/null; then
  echo "  Git $(git --version | cut -d' ' -f3) — worktree support available."
else
  echo "  WARNING: Git not found. Install git to use worktree features."
fi
echo ""

# ------------------------------------
# 6. TypeScript strict mode template
# ------------------------------------
echo "[6/8] Creating TypeScript strict mode template..."
TSCONFIG_TEMPLATE="tsconfig.strict.json"
if [ ! -f "$TSCONFIG_TEMPLATE" ]; then
  cat > "$TSCONFIG_TEMPLATE" << 'TSEOF'
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
TSEOF
  echo "  Created $TSCONFIG_TEMPLATE"
else
  echo "  $TSCONFIG_TEMPLATE already exists."
fi
echo ""

# ------------------------------------
# 7. Claude Code hooks setup
# ------------------------------------
echo "[7/8] Setting up Claude Code hooks..."
HOOKS_DIR=".claude/hooks"
if [ -f "$HOOKS_DIR/protect-tests.sh" ]; then
  chmod +x "$HOOKS_DIR/protect-tests.sh"
  echo "  Test protection hook is ready."
else
  echo "  Note: Run this script from your project root where .claude/ exists."
fi
echo ""

# ------------------------------------
# 8. MCP Tool Search (on-demand tool loading)
# ------------------------------------
echo "[8/8] Verifying MCP Tool Search configuration..."
# Tool Search is enabled via ENABLE_TOOL_SEARCH env var in .claude/settings.json.
# Prevents MCP tool schemas from bloating the context window.
# Accepted values: "true", "auto", "auto:N" (threshold %), "false"
SETTINGS_FILE=".claude/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
  if grep -q 'ENABLE_TOOL_SEARCH' "$SETTINGS_FILE" 2>/dev/null; then
    echo "  MCP Tool Search already configured in $SETTINGS_FILE."
  else
    echo "  Note: ENABLE_TOOL_SEARCH not found in $SETTINGS_FILE."
    echo "  Add to settings.json: \"env\": { \"ENABLE_TOOL_SEARCH\": \"true\" }"
  fi
else
  echo "  Note: $SETTINGS_FILE not found. Copy the .claude/ directory from the template first."
fi
echo ""

# ------------------------------------
# Create docs/ placeholder
# ------------------------------------
mkdir -p docs
echo "  Created docs/ directory (for PRD, architecture, decision, features.json)."
echo ""

# ------------------------------------
# Summary
# ------------------------------------
echo "============================================"
echo "  Setup Complete"
echo "============================================"
echo ""
echo "Installed/configured:"
echo "  - Claude Code CLI"
echo "  - Context7 MCP (live library docs)         — @upstash/context7-mcp"
echo "  - Puppeteer MCP (isolated browser testing)  — @modelcontextprotocol/server-puppeteer"
echo "  - Agent Browser (context-efficient testing)  — agent-browser"
echo "  - Git worktree support verified"
echo "  - TypeScript strict mode template"
echo "  - Test protection hook (exit code 2)"
echo "  - MCP Tool Search (ENABLE_TOOL_SEARCH=true)"
echo ""
echo "Next steps:"
echo "  1. Copy the .claude/ directory into your project root"
echo "  2. Run the context generation prompt (templates/context-generation-prompt.md)"
echo "  3. Generate user stories (templates/user-story-template.md)"
echo "  4. Start implementing features"
echo ""
echo "For the full workflow, see CLAUDE.md"
