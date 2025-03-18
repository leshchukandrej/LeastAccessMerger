const fs = require("fs");
const xml2js = require("xml2js");

async function readPermissionSet(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parser = new xml2js.Parser();
  return await parser.parseStringPromise(fileContent);
}

function comparePermissions(source, target, permissionTypes) {
  const extendedPermissions = {};

  for (const permissionType of permissionTypes) {
    if (Array.isArray(target[permissionType])) {
      extendedPermissions[permissionType] = target[permissionType].filter(targetItem => {
        const sourceItem = findMatchingSourceItem(source, target, permissionType, targetItem);

        if (!sourceItem) return true;

        for (const permKey in targetItem) {
          const sourceItemNameAttribute = getSourceItemNameAttribute(permissionType, sourceItem);

          if (permissionType === "license") {
            return true;
          }

          if (permKey === sourceItemNameAttribute) {
            continue;
          }

          if (targetItem[permKey]?.[0] === "true" && sourceItem[permKey]?.[0] === "false") {
            return true;
          }

          if (permissionType === "tabSettings" && permKey === "visibility" && targetItem[permKey]?.[0] === "Visible" && sourceItem[permKey]?.[0] !== "Visible") {
            return true;
          }
          if (permissionType === "tabSettings" && permKey === "visibility" && targetItem[permKey]?.[0] === "Available" && (!sourceItem[permKey]?.[0] || sourceItem[permKey]?.[0] === "None")) {
            return true;
          }
        }
        return false;
      });
    }
  }

  return extendedPermissions;
}

function findMatchingSourceItem(source, target, permissionType, targetItem) {
  return source[permissionType]?.find(item => {
    if (permissionType === "license") {
      return true;
    }

    const sourceItemNameAttribute = getSourceItemNameAttribute(permissionType, item);

    return sourceItemNameAttribute && item[sourceItemNameAttribute]?.[0] === targetItem[sourceItemNameAttribute]?.[0];
  });
}

getSourceItemNameAttribute = (permissionType, item) => {
  switch (permissionType) {
    case "applicationVisibilities":
      return 'application';
    case "classAccesses":
      return 'apexClass';
    case "fieldPermissions":
      return 'field';
    case "flowAccesses":
      return 'flow';
    case "objectPermissions":
      return 'object';
    case "pageAccesses":
      return 'apexPage';
    case "recordTypeVisibilities":
      return 'recordType';
    case "tabSettings":
      return 'tab';
    case "userPermissions":
      return 'name';
    default:
      return 'name';
  }
}

async function retainExtendedPermissions(sourceFile, targetFile, outputFile, permissionNames) {
  const sourcePermissions = await readPermissionSet(sourceFile);
  const targetPermissions = await readPermissionSet(targetFile);

  const extendedPermissions = comparePermissions(sourcePermissions.PermissionSet, targetPermissions.PermissionSet, permissionNames);

  const finalPermissions = {};
  for (const key of permissionNames) {
    finalPermissions[key] = [
      ...(extendedPermissions[key] || [])
    ];
  }

  const builder = new xml2js.Builder({ headless: true });
  const xml = builder.buildObject({ PermissionSet: finalPermissions });

  fs.writeFileSync(outputFile, xml, "utf-8");
  console.log(`Extended permissions written to ${outputFile}`);
}

const sourceFile = process.argv[2];
const targetFile = process.argv[3];
const outputFile = process.argv[4];
const permissionTypes = [
  "applicationVisibilities",
  "classAccesses",
  "fieldPermissions",
  "flowAccesses",
  "objectPermissions",
  "pageAccesses",
  "recordTypeVisibilities",
  "license",
  "tabSettings",
  "userPermissions"
];

retainExtendedPermissions(sourceFile, targetFile, outputFile, permissionTypes).catch(console.error);
