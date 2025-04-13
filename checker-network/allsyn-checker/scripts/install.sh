#!/bin/bash

# Check if Bash is available
if ! command -v bash &> /dev/null; then
  echo "Bash is not available. Skipping installation."
  exit 0
fi

# Function to determine the platform and set the URL
set_url() {
  local os_type=$(uname -s)
  local architecture=$(uname -m)
  case "$os_type" in
    Linux)
      if [[ "$architecture" == "x86_64" ]]; then
        URL="https://github.com/filecoin-station/zinnia/releases/latest/download/zinnia-linux-x64.tar.gz"
        ARCHIVE_NAME="zinnia-linux-x64.tar.gz"
      elif [[ "$architecture" == "aarch64" ]]; then
        URL="https://github.com/filecoin-station/zinnia/releases/latest/download/zinnia-linux-arm64.tar.gz"
        ARCHIVE_NAME="zinnia-linux-arm64.tar.gz"
      else
        echo "Unsupported architecture: $architecture"
        exit 1
      fi
      ;;
    Darwin)
      if [[ "$architecture" == "arm64" ]]; then
        URL="https://github.com/filecoin-station/zinnia/releases/latest/download/zinnia-macos-arm64.zip"
        ARCHIVE_NAME="zinnia-macos-arm64.zip"
      else
        URL="https://github.com/filecoin-station/zinnia/releases/latest/download/zinnia-macos-x64.zip"
        ARCHIVE_NAME="zinnia-macos-x64.zip"
      fi
      ;;
    MINGW* | MSYS*)
      URL="https://github.com/filecoin-station/zinnia/releases/latest/download/zinnia-windows-x64.zip"
      ARCHIVE_NAME="zinnia-windows-x64.zip"
      ;;
    *)
      echo "Unsupported OS: $os_type"
      exit 1
      ;;
  esac
}

set_url

# Download the archive
echo "Downloading the archive file..."
curl -L -o $ARCHIVE_NAME "$URL"

# Extract the archive
echo "Extracting the archive file..."
if [[ "$ARCHIVE_NAME" == *.zip ]]; then
  unzip $ARCHIVE_NAME -d ./extracted
else
  tar -xzf $ARCHIVE_NAME -C ./extracted
fi

BINARY_NAME="zinnia"  # Name of the binary

# Make the binary executable
echo "Making the binary executable..."
chmod +x ./extracted/$BINARY_NAME

# Move the binary to /usr/local/bin or appropriate directory for Windows
if [[ "$os_type" == "MINGW"* || "$os_type" == "MSYS"* ]]; then
  echo "Setting up for Windows..."

  # Create a directory in Program Files if it doesn't exist
  if [[ ! -d "/c/Program Files/zinnia" ]]; then
    mkdir "/c/Program Files/zinnia"
  fi

  # Move the binary
  mv ./extracted/$BINARY_NAME "/c/Program Files/zinnia/"

  # Optionally add "C:\Program Files\zinnia" to PATH
  echo "Binary installed successfully. You can manually add 'C:\Program Files\zinnia' to your PATH variable."
else
  echo "Moving the binary to /usr/local/bin..."
  sudo mv ./extracted/$BINARY_NAME /usr/local/bin/
  echo "Binary installed successfully. You can run it using '$BINARY_NAME' from any terminal session."
fi

# Clean up
echo "Cleaning up..."
rm -rf $ARCHIVE_NAME ./extracted
