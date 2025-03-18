const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function collectProfile(profileFile) {
  const profile = await getProfile(profileFile);
  await retainOnlyAccessiblePermissionsProfile(profile);
  await updateProfileFile(profileFile, profile);
  console.log('Profile updated successfully.');
}

async function getProfile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser();
  return parser.parseStringPromise(fileContent);
}

async function retainOnlyAccessiblePermissionsProfile(profile) {
  profile.Profile.fieldPermissions = profile.Profile.fieldPermissions.filter(fieldPermission => fieldPermission.readable[0] === 'true');
  profile.Profile.objectPermissions = profile.Profile.objectPermissions.filter(objectPermission => objectPermission.allowRead[0] === 'true');
  profile.Profile.applicationVisibilities = profile.Profile.applicationVisibilities.filter(applicationVisibility => applicationVisibility.visible[0] === 'true');
  profile.Profile.classAccesses = profile.Profile.classAccesses.filter(classAccess => classAccess.enabled[0] === 'true');
  profile.Profile.flowAccesses = profile.Profile.flowAccesses.filter(flowAccess => flowAccess.enabled[0] === 'true');
  profile.Profile.pageAccesses = profile.Profile.pageAccesses.filter(pageAccess => pageAccess.enabled[0] === 'true');
  profile.Profile.recordTypeVisibilities = profile.Profile.recordTypeVisibilities.filter(recordTypeVisibility => recordTypeVisibility.visible[0] === 'true');
  profile.Profile.tabVisibilities = profile.Profile.tabVisibilities.filter(tabVisibility => tabVisibility.visibility[0] !== 'Hidden');
  profile.Profile.userPermissions = profile.Profile.userPermissions.filter(userPermission => userPermission.enabled[0] === 'true');
}

async function updateProfileFile(profileFile, originalProfile) {
  const builder = new xml2js.Builder({ headless: true });
  const xml = builder.buildObject({ Profile: originalProfile.Profile });
  fs.writeFileSync(profileFile, xml, 'utf-8');
  console.log(`Profile updated at ${profileFile}`);
}

const profileFile = process.argv[2] || path.join(__dirname, 'profileToMerge.profile');
collectProfile(profileFile).catch(console.error);
