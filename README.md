# Least Access Merger

This repository contains a set of scripts designed to facilitate the migration from Salesforce profiles to permission sets. By utilizing these scripts, you can streamline the process of consolidating and managing user permissions within your Salesforce environment.

## Purpose

The primary purpose of this repository is to provide tools that help in the migration from profiles to permission sets, ensuring that permissions are managed efficiently and accurately.

### profileMerger

The `profileMerger` script is used to collect the minimum access required from multiple profiles and generate a global permission set. Additionally, it can be used to convert a specific profile into a permission set, ensuring that only the essential permissions are retained.

### maxPermissionRetainer

The `maxPermissionRetainer` script is needed to extend access by adding specific permissions to a permission set. It ensures that any additional required permissions are included, providing the necessary access for users.

By using these scripts in combination, you can effectively manage and migrate user permissions from profiles to permission sets in a streamlined manner.

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

# Profile Merger

## Description

The script performs the following steps:

1. **Collect Profiles**: Reads all profile XML files from the specified folder.
2. **Parse Profiles**: Parses each profile XML file and extracts permissions.
3. **Merge Permissions**: Combines permissions from all profiles, ensuring minimal permissions are retained.
4. **Generate PermissionSet**: Creates a minimum access PermissionSet XML file based on the merged permissions.

## Usage

You can run the script by passing the folder path containing the profile XML files as a command-line argument. If no argument is provided, it defaults to `profilesToMerge` in the current directory.

### Command-Line Usage

```sh
node profileMerger.js /path/to/your/folder
```

# Profile cleanup

The script performs the following steps:

1. **Collect Profile**: Reads the Salesforce profile XML file.
2. **Retain Only Accessible Permissions**: Filters the profile to keep only the permissions that are accessible.
3. **Update Profile File**: Writes the updated profile back to the file.

## Usage

You can run the script by passing the path to the profile XML file as a command-line argument. If no argument is provided, it defaults to profileToMerge.profile in the current directory.

### Command-Line Usage

```sh
node profileCleanup.js /path/to/your/profileToMerge.profile-meta.xml
```

# Max Permission Retainer

The script performs the following steps:

1. **Read PermissionSet Files**: Reads the content of the source and target PermissionSet XML files.
2. **Compare Permissions**: Compares permissions between the source and target PermissionSet files to identify extended permissions in the target file.
3. **Generate Extended Permissions**: Creates a new PermissionSet XML file containing only the extended permissions found in the target file.

## Usage

You can run the script by passing the source PermissionSet file, the target PermissionSet file, and the output file path as command-line arguments.

### Command-Line Usage

```sh
node maxPermissionsRetainer.js /path/to/sourcePermissionSet.xml /path/to/targetPermissionSet.xml /path/to/outputPermissionSet.xml
```

## Dependencies

- `xml2js`: A Node.js module to parse XML.

## License

This project is licensed under the MIT License.
