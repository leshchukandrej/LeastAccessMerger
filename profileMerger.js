const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const profileMap = new Map();

async function collectProfiles(profileFolder) {
    const profileFiles = getProfileFiles(profileFolder);
    for (const file of profileFiles) {
        const profile = await getProfile(path.join(profileFolder, file));
        profileMap.set(file, profile);
    }
    const minimalPermissions = await getMinimalPermissions(profileMap);
    await generatePermissionSet(minimalPermissions);
    console.log('PermissionSet generated successfully.');
}

function getProfileFiles(profileFolder) {
    return fs.readdirSync(profileFolder).filter(file => file.endsWith('.profile'));
}

async function getProfile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parser = new xml2js.Parser();
    return parser.parseStringPromise(fileContent);
}

async function getMinimalPermissions(profileMap) {
    const allFieldPermissions = new Map();
    const allObjectPermissions = new Map();
    const allApplicationVisibilities = new Map();
    const allClassAccesses = new Map();
    const allFlowAccesses = new Map();
    const allPageAccesses = new Map();
    const allRecordTypeVisibilities = new Map();
    const allTabVisibilities = new Map();
    const allUserPermissions = new Map();

    for (const profile of profileMap.values()) {
        const fieldPermissions = profile.Profile.fieldPermissions || [];
        const objectPermissions = profile.Profile.objectPermissions || [];
        const applicationVisibilities = profile.Profile.applicationVisibilities || [];
        const classAccesses = profile.Profile.classAccesses || [];
        const flowAccesses = profile.Profile.flowAccesses || [];
        const pageAccesses = profile.Profile.pageAccesses || [];
        const recordTypeVisibilities = profile.Profile.recordTypeVisibilities || [];
        const tabVisibilities = profile.Profile.tabVisibilities || [];
        const userPermissions = profile.Profile.userPermissions || [];

        for (const fieldPermission of fieldPermissions) {
            const field = fieldPermission.field[0];
            const readable = fieldPermission.readable[0] === 'true';
            const editable = fieldPermission.editable[0] === 'true';

            if (!allFieldPermissions.has(field)) {
                allFieldPermissions.set(field, { readable: true, editable: true });
            }

            const currentPermissions = allFieldPermissions.get(field);
            currentPermissions.readable = currentPermissions.readable && readable;
            currentPermissions.editable = currentPermissions.editable && editable;
        }

        for (const objectPermission of objectPermissions) {
            const object = objectPermission.object[0];
            const allowRead = objectPermission.allowRead[0] === 'true';
            const allowEdit = objectPermission.allowEdit[0] === 'true';
            const allowCreate = objectPermission.allowCreate[0] === 'true';
            const allowDelete = objectPermission.allowDelete[0] === 'true';
            const modifyAllRecords = objectPermission.modifyAllRecords[0] === 'true';
            const viewAllRecords = objectPermission.viewAllRecords[0] === 'true';

            if (!allObjectPermissions.has(object)) {
                allObjectPermissions.set(object, { allowRead: allowRead, allowEdit: allowEdit, allowCreate: allowCreate, allowDelete: allowDelete, modifyAllRecords: modifyAllRecords, viewAllRecords: viewAllRecords });
            }

            const currentPermissions = allObjectPermissions.get(object);
            currentPermissions.allowRead = currentPermissions.allowRead && allowRead;
            currentPermissions.allowEdit = currentPermissions.allowEdit && allowEdit;
            currentPermissions.allowCreate = currentPermissions.allowCreate && allowCreate;
            currentPermissions.allowDelete = currentPermissions.allowDelete && allowDelete;
            currentPermissions.modifyAllRecords = currentPermissions.modifyAllRecords && modifyAllRecords;
            currentPermissions.viewAllRecords = currentPermissions.viewAllRecords && viewAllRecords;
        }

        for (const applicationVisibility of applicationVisibilities) {
            const application = applicationVisibility.application[0];
            const visible = applicationVisibility.visible[0] === 'true';
            const defaultApp = applicationVisibility.default[0] === 'true';

            if (!allApplicationVisibilities.has(application)) {
                allApplicationVisibilities.set(application, { visible: visible, default: defaultApp });
            }

            const currentVisibility = allApplicationVisibilities.get(application);
            currentVisibility.visible = currentVisibility.visible && visible;
            currentVisibility.default = currentVisibility.default && defaultApp;
        }

        for (const classAccess of classAccesses) {
            const apexClass = classAccess.apexClass[0];
            const enabled = classAccess.enabled[0] === 'true';

            if (!allClassAccesses.has(apexClass)) {
                allClassAccesses.set(apexClass, { enabled: true });
            }

            const currentAccess = allClassAccesses.get(apexClass);
            currentAccess.enabled = currentAccess.enabled && enabled;
        }

        for (const flowAccess of flowAccesses) {
            const flow = flowAccess.flow[0];
            const enabled = flowAccess.enabled[0] === 'true';

            if (!allFlowAccesses.has(flow)) {
                allFlowAccesses.set(flow, { enabled: true });
            }

            const currentAccess = allFlowAccesses.get(flow);
            currentAccess.enabled = currentAccess.enabled && enabled;
        }

        for (const pageAccess of pageAccesses) {
            const page = pageAccess.apexPage[0];
            const enabled = pageAccess.enabled[0] === 'true';

            if (!allPageAccesses.has(page)) {
                allPageAccesses.set(page, { enabled: true });
            }

            const currentAccess = allPageAccesses.get(page);
            currentAccess.enabled = currentAccess.enabled && enabled;
        }

        for (const recordTypeVisibility of recordTypeVisibilities) {
            const recordType = recordTypeVisibility.recordType[0];
            const visible = recordTypeVisibility.visible[0] === 'true';
            const defaultRt = recordTypeVisibility.default[0] === 'true';

            if (!allRecordTypeVisibilities.has(recordType)) {
                allRecordTypeVisibilities.set(recordType, { visible: visible, default: defaultRt });
            }

            const currentVisibility = allRecordTypeVisibilities.get(recordType);
            currentVisibility.visible = currentVisibility.visible && visible;
            currentVisibility.default = currentVisibility.default && defaultRt;
        }

        for (const tabVisibility of tabVisibilities) {
            const tab = tabVisibility.tab[0];
            const visibility = tabVisibility.visibility[0];

            if (!allTabVisibilities.has(tab)) {
                allTabVisibilities.set(tab, visibility);
            } else {
                const currentVisibility = allTabVisibilities.get(tab);
                if (currentVisibility === 'DefaultOn' && visibility !== 'DefaultOn') {
                    allTabVisibilities.set(tab, visibility);
                } else if (currentVisibility === 'DefaultOff' && visibility === 'Hidden') {
                    allTabVisibilities.set(tab, visibility);
                }
            }
        }

        for (const userPermission of userPermissions) {
            const name = userPermission.name[0];
            const enabled = userPermission.enabled[0] === 'true';

            if (!allUserPermissions.has(name)) {
                allUserPermissions.set(name, { enabled: true });
            }

            const currentPermission = allUserPermissions.get(name);
            currentPermission.enabled = currentPermission.enabled && enabled;
        }
    }

    const minimalFieldPermissions = new Map();
    const minimalObjectPermissions = new Map();
    const minimalApplicationVisibilities = new Map();
    const minimalClassAccesses = new Map();
    const minimalFlowAccesses = new Map();
    const minimalPageAccesses = new Map();
    const minimalRecordTypeVisibilities = new Map();
    const minimalTabVisibilities = new Map();
    const minimalUserPermissions = new Map();

    for (const [field, permissions] of allFieldPermissions.entries()) {
        if (permissions.readable) {
            minimalFieldPermissions.set(field, permissions);
        }
    }

    for (const [object, permissions] of allObjectPermissions.entries()) {
        if (permissions.allowRead) {
            minimalObjectPermissions.set(object, permissions);
        }
    }

    for (const [application, visibility] of allApplicationVisibilities.entries()) {
        if (visibility.visible) {
            minimalApplicationVisibilities.set(application, visibility);
        }
    }

    for (const [apexClass, access] of allClassAccesses.entries()) {
        if (access.enabled) {
            minimalClassAccesses.set(apexClass, access);
        }
    }

    for (const [flow, access] of allFlowAccesses.entries()) {
        if (access.enabled) {
            minimalFlowAccesses.set(flow, access);
        }
    }

    for (const [page, access] of allPageAccesses.entries()) {
        if (access.enabled) {
            minimalPageAccesses.set(page, access);
        }
    }

    for (const [recordType, visibility] of allRecordTypeVisibilities.entries()) {
        if (visibility.visible) {
            minimalRecordTypeVisibilities.set(recordType, visibility);
        }
    }

    for (const [tab, visibility] of allTabVisibilities.entries()) {
        if (visibility !== 'Hidden') {
            minimalTabVisibilities.set(tab, visibility);
        }
    }

    for (const [name, permission] of allUserPermissions.entries()) {
        if (permission.enabled) {
            minimalUserPermissions.set(name, permission);
        }
    }

    return { minimalFieldPermissions, minimalObjectPermissions, minimalApplicationVisibilities, minimalClassAccesses, minimalFlowAccesses, minimalPageAccesses, minimalRecordTypeVisibilities, minimalTabVisibilities, minimalUserPermissions };
}

async function generatePermissionSet(minimalPermissions) {
    const builder = new xml2js.Builder({ headless: true, rootName: 'PermissionSet' });
    const permissionSet = {
        $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
        applicationVisibilities: [],
        classAccesses: [],
        fieldPermissions: [],
        flowAccesses: [],
        objectPermissions: [],
        pageAccesses: [],
        recordTypeVisibilities: [],
        tabSettings: [],
        userPermissions: []
    };

    for (const [application, visibility] of minimalPermissions.minimalApplicationVisibilities.entries()) {
        permissionSet.applicationVisibilities.push({
            application,
            visible: visibility.visible
        });
    }

    for (const [apexClass, access] of minimalPermissions.minimalClassAccesses.entries()) {
        permissionSet.classAccesses.push({
            apexClass,
            enabled: access.enabled
        });
    }

    for (const [field, permissions] of minimalPermissions.minimalFieldPermissions.entries()) {
        permissionSet.fieldPermissions.push({
            editable: permissions.editable,
            field,
            readable: permissions.readable
        });
    }

    for (const [flow, access] of minimalPermissions.minimalFlowAccesses.entries()) {
        permissionSet.flowAccesses.push({
            flow,
            enabled: access.enabled
        });
    }

    for (const [object, permissions] of minimalPermissions.minimalObjectPermissions.entries()) {
        permissionSet.objectPermissions.push({
            allowCreate: permissions.allowCreate,
            allowDelete: permissions.allowDelete,
            allowEdit: permissions.allowEdit,
            allowRead: permissions.allowRead,
            modifyAllRecords: permissions.modifyAllRecords,
            object,
            viewAllRecords: permissions.viewAllRecords
        });
    }

    for (const [page, access] of minimalPermissions.minimalPageAccesses.entries()) {
        permissionSet.pageAccesses.push({
            apexPage: page,
            enabled: access.enabled
        });
    }

    for (const [recordType, visibility] of minimalPermissions.minimalRecordTypeVisibilities.entries()) {
        permissionSet.recordTypeVisibilities.push({
            recordType,
            visible: visibility.visible
        });
    }

    for (const [tab, visibility] of minimalPermissions.minimalTabVisibilities.entries()) {
        permissionSet.tabSettings.push({
            tab,
            visibility: visibility === 'DefaultOn' ? 'Visible' : visibility === 'DefaultOff' ? 'Available' : visibility
        });
    }

    for (const [name, permission] of minimalPermissions.minimalUserPermissions.entries()) {
        permissionSet.userPermissions.push({
            enabled: permission.enabled,
            name
        });
    }

    const xml = builder.buildObject(permissionSet);
    const outputPath = path.join(__dirname, 'PermissionSet.xml');

    fs.writeFileSync(outputPath, xml, 'utf-8');
    console.log(`PermissionSet generated at ${outputPath}`);

    console.log(`Number of accessible fields: ${permissionSet.fieldPermissions.length}`);
    console.log(`Number of accessible objects: ${permissionSet.objectPermissions.length}`);
}

const profileFolder = process.argv[2] || path.join(__dirname, 'profilesToMerge');
collectProfiles(profileFolder).catch(console.error);
