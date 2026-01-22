#!/bin/bash

# JiraBranchNameR Installer
INSTALL_DIR="$HOME/.jira-branch-namer"
REPO_URL="https://github.com/ekaradzha-qb/Jira-Branch-Namer"

echo "================================"
echo "  JiraBranchNameR Installer"
echo "================================"
echo ""

# Check for command line arguments first
BROWSER=""
SOURCE=""

for arg in "$@"; do
    case $arg in
        --chrome) BROWSER="chrome" ;;
        --edge) BROWSER="edge" ;;
        --local) SOURCE="local" ;;
        --github) SOURCE="github" ;;
        --help|-h)
            echo "Usage: ./install.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --chrome    Install for Chrome"
            echo "  --edge      Install for Edge"
            echo "  --github    Download from GitHub"
            echo "  --local     Use local files"
            exit 0
            ;;
    esac
done

# Interactive prompts if not provided via arguments
if [[ -z "$SOURCE" ]]; then
    echo "Select installation source:"
    echo "  1) Download from GitHub (recommended)"
    echo "  2) Use local files"
    echo ""
    printf "Enter choice [1-2]: "
    read source_choice
    case $source_choice in
        1) SOURCE="github" ;;
        2) SOURCE="local" ;;
        *) SOURCE="github" ;;
    esac
    echo ""
fi

if [[ -z "$BROWSER" ]]; then
    echo "Select your browser:"
    echo "  1) Chrome"
    echo "  2) Edge"
    echo ""
    printf "Enter choice [1-2]: "
    read browser_choice
    case $browser_choice in
        1) BROWSER="chrome" ;;
        2) BROWSER="edge" ;;
        *) BROWSER="chrome" ;;
    esac
    echo ""
fi

# Set browser-specific values
if [[ "$BROWSER" == "edge" ]]; then
    BROWSER_NAME="Edge"
    EXTENSIONS_URL="edge://extensions"
else
    BROWSER_NAME="Chrome"
    EXTENSIONS_URL="chrome://extensions"
fi

echo "Installing JiraBranchNameR for $BROWSER_NAME..."
echo ""

# Create installation directory
mkdir -p "$INSTALL_DIR"

if [[ "$SOURCE" == "github" ]]; then
    echo "Downloading from GitHub..."

    if command -v git &> /dev/null; then
        rm -rf "$INSTALL_DIR/extension" "$INSTALL_DIR/temp" 2>/dev/null
        if git clone --depth 1 "$REPO_URL.git" "$INSTALL_DIR/temp" 2>&1; then
            mv "$INSTALL_DIR/temp/extension" "$INSTALL_DIR/extension"
            rm -rf "$INSTALL_DIR/temp"
        else
            echo "Error: Failed to clone repository."
            echo "Make sure the repository is accessible or use --local"
            exit 1
        fi
    elif command -v curl &> /dev/null && command -v unzip &> /dev/null; then
        rm -rf "$INSTALL_DIR/extension" "$INSTALL_DIR/temp.zip" 2>/dev/null
        if curl -sL "$REPO_URL/archive/refs/heads/main.zip" -o "$INSTALL_DIR/temp.zip"; then
            unzip -q "$INSTALL_DIR/temp.zip" -d "$INSTALL_DIR"
            mv "$INSTALL_DIR/Jira-Branch-Namer-main/extension" "$INSTALL_DIR/extension"
            rm -rf "$INSTALL_DIR/Jira-Branch-Namer-main" "$INSTALL_DIR/temp.zip"
        else
            echo "Error: Failed to download from GitHub."
            exit 1
        fi
    else
        echo "Error: git or (curl + unzip) required for GitHub download."
        echo "Use --local option instead."
        exit 1
    fi
else
    echo "Using local files..."
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    if [[ -d "$SCRIPT_DIR/extension" ]]; then
        rm -rf "$INSTALL_DIR/extension" 2>/dev/null
        cp -r "$SCRIPT_DIR/extension" "$INSTALL_DIR/"
    else
        echo "Error: extension folder not found in $SCRIPT_DIR"
        exit 1
    fi
fi

if [[ ! -d "$INSTALL_DIR/extension" ]]; then
    echo "Error: Installation failed."
    exit 1
fi

echo ""
echo "SUCCESS!"
echo ""
echo "Extension installed to: $INSTALL_DIR/extension"
echo ""
echo "Complete the installation:"
echo "  1. Open $BROWSER_NAME → $EXTENSIONS_URL"
echo "  2. Enable 'Developer mode' (top right)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select: $INSTALL_DIR/extension"
echo ""

# Try to open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ "$BROWSER" == "edge" ]]; then
        open -a "Microsoft Edge" "$EXTENSIONS_URL" 2>/dev/null
    else
        open -a "Google Chrome" "$EXTENSIONS_URL" 2>/dev/null
    fi
fi

echo "Done!"
