import { AsbestosAttachmentDetailModel } from './asbestos-attachment-detail.model'

export class AsbestosDetailModel {
    ASSID?: string;
    AUCCODE?: string;
    AUDCODE?: string;
    strUserId?: string;
    NextSequence?: number;
    RequestCompleted?: string;
    RequestUserId?: string;
    RequestDate?: any;
    ASASSEQUENCE?: number;
    ActionType?: string;
    CompletionDate?: any;
    Description?: string;
    AAUDREQSTATUS?: string;
    AAUDAUTHDATE?: any;
    AAUDAUTHUSERID?: string;
}

export class AsbestosAttachmentModel {
    ASSID?: string;
    AUCCODE?: string;
    AUDCODE?: string;
    ASASSEQUENCE?: number;
    AAUSEQUENCE?: number;
    AAUASEQUENCE?:number;
    AAUAATTACHMENTNAME?: string;
    AttachmentDescription?: string;
    AttachmentType?: string;
    AttachmentDateAdded?: any;
    AttachmentStatus?: string;
    AttachmentNote?: string;
    EditDetail?: AsbestosAttachmentDetailModel [];
}

