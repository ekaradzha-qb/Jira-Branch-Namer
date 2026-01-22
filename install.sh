#!/bin/bash

# JiraBranchNameR Installer
INSTALL_DIR="$HOME/.jira-branch-namer"
REPO_URL="https://github.com/ekaradzha-qb/Jira-Branch-Namer"

echo "================================"
echo "  JiraBranchNameR Installer"
echo "================================"
echo ""

echo "Select installation source:"
echo "  1) Download from GitHub (recommended)"
echo "  2) Use local files"
echo ""
printf "Enter choice [1-2]: "
read source_choice </dev/tty

echo ""

echo "Select your browser:"
echo "  1) Chrome"
echo "  2) Edge"
echo ""
printf "Enter choice [1-2]: "
read browser_choice </dev/tty

echo ""

# Set source
case $source_choice in
    1) SOURCE="github" ;;
    2) SOURCE="local" ;;
    *) SOURCE="github" ;;
esac

# Set browser
case $browser_choice in
    1)
        BROWSER_NAME="Chrome"
        EXTENSIONS_URL="chrome://extensions"
        ;;
    2)
        BROWSER_NAME="Edge"
        EXTENSIONS_URL="edge://extensions"
        ;;
    *)
        BROWSER_NAME="Chrome"
        EXTENSIONS_URL="chrome://extensions"
        ;;
esac

echo "Installing JiraBranchNameR for $BROWSER_NAME..."
echo ""

# Create installation directory
mkdir -p "$INSTALL_DIR"

if [[ "$SOURCE" == "github" ]]; then
    echo "Downloading from GitHub..."

    if command -v git &> /dev/null; then
        rm -rf "$INSTALL_DIR/JiraBranchNameR" "$INSTALL_DIR/temp" 2>/dev/null
        if git clone --depth 1 "$REPO_URL.git" "$INSTALL_DIR/temp" 2>&1; then
            mv "$INSTALL_DIR/temp/JiraBranchNameR" "$INSTALL_DIR/JiraBranchNameR"
            rm -rf "$INSTALL_DIR/temp"
        else
            echo "Error: Failed to clone repository."
            exit 1
        fi
    elif command -v curl &> /dev/null && command -v unzip &> /dev/null; then
        rm -rf "$INSTALL_DIR/JiraBranchNameR" "$INSTALL_DIR/temp.zip" 2>/dev/null
        curl -sL "$REPO_URL/archive/refs/heads/main.zip" -o "$INSTALL_DIR/temp.zip"
        unzip -q "$INSTALL_DIR/temp.zip" -d "$INSTALL_DIR"
        mv "$INSTALL_DIR/Jira-Branch-Namer-main/JiraBranchNameR" "$INSTALL_DIR/JiraBranchNameR"
        rm -rf "$INSTALL_DIR/Jira-Branch-Namer-main" "$INSTALL_DIR/temp.zip"
    else
        echo "Error: git or (curl + unzip) required."
        exit 1
    fi
else
    echo "Using local files..."
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    if [[ -d "$SCRIPT_DIR/JiraBranchNameR" ]]; then
        rm -rf "$INSTALL_DIR/JiraBranchNameR" 2>/dev/null
        cp -r "$SCRIPT_DIR/JiraBranchNameR" "$INSTALL_DIR/"
    else
        echo "Error: extension folder not found in $SCRIPT_DIR"
        exit 1
    fi
fi

if [[ ! -d "$INSTALL_DIR/JiraBranchNameR" ]]; then
    echo "Error: Installation failed."
    exit 1
fi

echo ""
echo "SUCCESS!"
echo ""
echo "Extension installed to: $INSTALL_DIR/JiraBranchNameR"
echo ""
echo "Complete the installation:"
echo "  1. Open $BROWSER_NAME → $EXTENSIONS_URL"
echo "  2. Enable 'Developer mode' (top right)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select: $INSTALL_DIR/JiraBranchNameR"
echo ""

# Try to open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ "$BROWSER_NAME" == "Edge" ]]; then
        open -a "Microsoft Edge" "$EXTENSIONS_URL" 2>/dev/null
    else
        open -a "Google Chrome" "$EXTENSIONS_URL" 2>/dev/null
    fi
fi

echo "Done!"
