# Profile Merger Script

This script merges Salesforce profile XML files and generates a minimal PermissionSet XML file based on the combined permissions.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository or download the script files.
2. Navigate to the project directory.
3. Install the required dependencies:

```sh
npm install
```

## Usage

You can run the script by passing the folder path containing the profile XML files as a command-line argument. If no argument is provided, it defaults to `profilesToMerge` in the current directory.

### Command-Line Usage

```sh
node profileMerger.js /path/to/your/folder
```

### Example

```sh
node profileMerger.js ./profilesToMerge
```

## Script Details

The script performs the following steps:

1. **Collect Profiles**: Reads all profile XML files from the specified folder.
2. **Parse Profiles**: Parses each profile XML file and extracts permissions.
3. **Merge Permissions**: Combines permissions from all profiles, ensuring minimal permissions are retained.
4. **Generate PermissionSet**: Creates a minimal PermissionSet XML file based on the merged permissions.

## Output

The generated PermissionSet XML file is saved as `PermissionSet.xml` in the project directory.

## Dependencies

- `xml2js`: A Node.js module to parse XML.

## License

This project is licensed under the MIT License.
