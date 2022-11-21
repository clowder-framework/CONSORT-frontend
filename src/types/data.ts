import {Dataset as DatasetModel} from "../openapi/v1";

interface DatasetId {
	id: string;
}

export type Dataset = DatasetId | DatasetModel;

export interface FileMetadata {
	id: string;
	"content-type": string;
	size:number;
	created: string | Date;
	name: string;
	status: string;
	filedescription: string;
	thumbnail:string;
	downloads:number;
	views:number;
	version: string;
}

export interface FileMetadataList{
	id: string;
	metadata: FileMetadata;
}

export interface Preview{
	"p_id": string;
	"pv_route": string;
	"pv_id": string;
	"p_path": string;
	"pv_contenttype": string;
}

export interface FilePreview{
	"file_id": string;
	previews: Preview[];
}

export interface PreviewConfiguration{
	previewType: string;
	url:string;
	fileid:string;
	previewer:string;
	fileType:string;
	resource:string | null;
}

export interface Path{
	name: string;
	id: string;
	type:string
}

export interface ExtractedMetadata{
	filename:string;
}

export interface MetadataJsonld{
	"id":string;
	"@context": (Context|string)[];
	agent:Agent;
	"attached_to": AttatchTo;
	content: any;
	"created_at": string | Date;
}

interface Context{
	database:string;
	scan:string;
}

interface Agent{
	"@type": string;
	"extractor_id": string;
	name: string
}

interface AttatchTo{
	"resource_type": string;
	url: string;
}

export interface Thumbnail{
	id: string;
	thumbnail: string;
}

export interface DatasetState{
	files: FileSummary[];
	datasets: Dataset[];
	about: {};
	status: string;
}
export interface MetadataState{
	metadataDefinitionList: MetadataDefinitionOut[],
	datasetMetadataList: Metadata[],
	fileMetadataList: Metadata[],
}
export interface FileState{
	fileSummary: FileSummary;
	extractedMetadata: ExtractedMetadata;
	metadataJsonld: MetadataJsonld[];
	previews: FilePreview[];
	fileVersions: FileVersion[];
}

export interface UserState{
	Authorization: string | null;
	loginError: boolean;
	registerSucceeded: boolean;
	errorMsg: string;
}

export interface ErrorState{
	stack: string;
	reason: string;
	loggedOut: boolean;
}

export interface FolderState{
	folders: FolderOut[];
	folderPath: String[];
}

export interface RootState {
	metadata: MetadataState;
	file:FileState;
	dataset:DatasetState;
}

