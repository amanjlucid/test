export class Group {
    groupId?: number;
    groupCode?: string;
    groupName?: string;
    groupDescription?: string;
    showNoCharGroup?: boolean
    showNoElement?: boolean
    includeAllCharGroup?: boolean
    includeAllElements?: boolean
    includeAllPortalTabs?: boolean
    workOrderLevel?: boolean
    propertySecuritySet?: boolean
    charGroupSecuritySet?: boolean
    elementSecuritySet?: boolean
    functionSecuritySet?: boolean
    attributeGroupSecuritySet?: boolean
    status?: boolean;
    createdBy?: string;
    createdDate?: string;
    changedBy?: string;
    changedDate?: string;
    loggedInUserId?: string;
    canDelete?: boolean; 
    canEditWorkOrderOnly?:boolean; 
}