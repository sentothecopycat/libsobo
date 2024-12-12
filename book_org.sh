#!/bin/bash

# Create folders based on filenames (excluding extensions) for specified file types
# and move the files into their respective folders.

set -o errexit
set -o nounset
set -o pipefail

create_and_organize_files() {
    local target_dir file_types file base_name target_folder ext valid_ext

    # Directory to process
    target_dir="$1"
    shift
    # File extensions to process (e.g., "pdf epub mobi")
    file_types=("$@")

    # Ensure the target directory exists
    if [[ ! -d "$target_dir" ]]; then
        printf "Error: Directory '%s' does not exist.\n" "$target_dir" >&2
        return 1
    fi

    # Normalize extensions to lowercase for comparison
    for ext in "${file_types[@]}"; do
        valid_ext+=" ${ext,,}"
    done

    # Process each file in the target directory
    for file in "$target_dir"/*; do
        [[ -f "$file" ]] || continue  # Skip if not a file

        # Extract file extension (lowercased)
        ext="${file##*.}"
        ext="${ext,,}"

        # Skip files that don't match the specified extensions
        if [[ ! " $valid_ext " =~ " $ext " ]]; then
            continue
        fi

        # Extract base name (without extension)
        base_name=$(basename "$file" ".$ext")

        # Create target folder
        target_folder="$target_dir/$base_name"
        mkdir -p "$target_folder"

        # Move file into the target folder
        mv "$file" "$target_folder"
    done

    printf "Files have been organized in '%s'.\n" "$target_dir"
}

main() {
    # Check for at least two arguments
    if [[ $# -lt 2 ]]; then
        printf "Usage: %s <directory> <extensions...>\n" "$(basename "$0")" >&2
        return 1
    fi

    # Directory and file types
    local dir="$1"
    shift
    local extensions=("$@")

    create_and_organize_files "$dir" "${extensions[@]}"
}

main "$@"
