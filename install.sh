#!/bin/bash

# JiraBranchNameR Installer
INSTALL_DIR="$HOME/.jira-branch-namer"
REPO_URL="https://github.com/ekaradzha-qb/Jira-Branch-Namer"

echo "================================"
echo "  JiraBranchNameR Installer"
echo "================================"
echo ""

# Source selection
echo "Select installation source:"
echo "1) Download from GitHub (recommended)"
echo "2) Use local files (if already downloaded)"
echo ""
read -p "Enter choice [1-2]: " source_choice

echo ""

# Browser selection
echo "Select your browser:"
echo "1) Chrome"
echo "2) Edge"
echo ""
read -p "Enter choice [1-2]: " browser_choice

case $browser_choice in
    1)
        BROWSER="Chrome"
        EXTENSIONS_URL="chrome://extensions"
        ;;
    2)
        BROWSER="Edge"
        EXTENSIONS_URL="edge://extensions"
        ;;
    *)
        echo "Invalid choice. Defaulting to Chrome."
        BROWSER="Chrome"
        EXTENSIONS_URL="chrome://extensions"
        ;;
esac

echo ""
echo "Installing JiraBranchNameR for $BROWSER..."

# Create installation directory
mkdir -p "$INSTALL_DIR"

case $source_choice in
    1)
        # Download from GitHub
        echo "Downloading from GitHub..."

        if command -v git &> /dev/null; then
            # Use git clone
            rm -rf "$INSTALL_DIR/extension" 2>/dev/null
            git clone --depth 1 "$REPO_URL.git" "$INSTALL_DIR/temp" 2>/dev/null
            mv "$INSTALL_DIR/temp/extension" "$INSTALL_DIR/extension"
            rm -rf "$INSTALL_DIR/temp"
        elif command -v curl &> /dev/null; then
            # Use curl to download ZIP
            curl -sL "$REPO_URL/archive/refs/heads/main.zip" -o "$INSTALL_DIR/temp.zip"
            unzip -q "$INSTALL_DIR/temp.zip" -d "$INSTALL_DIR"
            rm -rf "$INSTALL_DIR/extension" 2>/dev/null
            mv "$INSTALL_DIR/Jira-Branch-Namer-main/extension" "$INSTALL_DIR/extension"
            rm -rf "$INSTALL_DIR/Jira-Branch-Namer-main" "$INSTALL_DIR/temp.zip"
        elif command -v wget &> /dev/null; then
            # Use wget to download ZIP
            wget -q "$REPO_URL/archive/refs/heads/main.zip" -O "$INSTALL_DIR/temp.zip"
            unzip -q "$INSTALL_DIR/temp.zip" -d "$INSTALL_DIR"
            rm -rf "$INSTALL_DIR/extension" 2>/dev/null
            mv "$INSTALL_DIR/Jira-Branch-Namer-main/extension" "$INSTALL_DIR/extension"
            rm -rf "$INSTALL_DIR/Jira-Branch-Namer-main" "$INSTALL_DIR/temp.zip"
        else
            echo "Error: git, curl, or wget is required to download from GitHub."
            echo "Please install one of these tools or use option 2 (local files)."
            exit 1
        fi
        ;;
    2)
        # Use local files
        SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
        if [[ -d "$SCRIPT_DIR/extension" ]]; then
            cp -r "$SCRIPT_DIR/extension" "$INSTALL_DIR/"
        else
            echo "Error: extension folder not found in $SCRIPT_DIR"
            echo "Please run this script from the repository directory or choose option 1."
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice. Using GitHub download."
        # Download from GitHub (same as option 1)
        if command -v git &> /dev/null; then
            rm -rf "$INSTALL_DIR/extension" 2>/dev/null
            git clone --depth 1 "$REPO_URL.git" "$INSTALL_DIR/temp" 2>/dev/null
            mv "$INSTALL_DIR/temp/extension" "$INSTALL_DIR/extension"
            rm -rf "$INSTALL_DIR/temp"
        else
            echo "Error: git is required. Please install git or download manually."
            exit 1
        fi
        ;;
esac

if [[ ! -d "$INSTALL_DIR/extension" ]]; then
    echo "Error: Installation failed. Extension folder not found."
    exit 1
fi

echo ""
echo "Extension files installed to: $INSTALL_DIR/extension"
echo ""
echo "To complete installation:"
echo "1. Open $BROWSER and go to: $EXTENSIONS_URL"
echo "2. Enable 'Developer mode' (top right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select: $INSTALL_DIR/extension"
echo ""

# Try to open extensions page
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ "$BROWSER" == "Chrome" ]]; then
        open -a "Google Chrome" "$EXTENSIONS_URL" 2>/dev/null
    else
        open -a "Microsoft Edge" "$EXTENSIONS_URL" 2>/dev/null
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [[ "$BROWSER" == "Chrome" ]]; then
        google-chrome "$EXTENSIONS_URL" 2>/dev/null || chromium-browser "$EXTENSIONS_URL" 2>/dev/null
    else
        microsoft-edge "$EXTENSIONS_URL" 2>/dev/null
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    if [[ "$BROWSER" == "Chrome" ]]; then
        start chrome "$EXTENSIONS_URL" 2>/dev/null
    else
        start msedge "$EXTENSIONS_URL" 2>/dev/null
    fi
fi

echo "Done!"
