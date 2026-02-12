export interface ProjectDic {
  _id: string;
  ProjectName: string;
  createddatetime: string;
  baseLanguage: string;
  isPreview: string;
  isMasterScreenSet: boolean;
  isPublish: string;
  projectid: string;
  Title: string;
  version: string;
  ReleaseVersion: string;
  ReleaseRevision: string;
  devicetype: string;
  Type: string;
  owner: string;
  availableScreens: ScreenDic[];
  checked_date: string;
  RemoteTableDefs: TableDic[];
  TableDefs: TableDic[];
  databases: any[];
  AndroidIcon: string;
  AppIcon: string;
  AppIconTablet: string;
  BaseURL: string;
  DeviceDefs: Record<string, Record<string, any[]>>;
  Document: any[];
  LocationDefs: any[];
  OSversions: any[];
  OpeningImage: string;
  OpeningImageTablet: string;
  StoreImage: string;
  StoreImageTablet: string;
  apptitledic: any[];
  bgms: any[];
  colorTheme: Record<string, any>;
  customActions: { helper: any[] };
  defaultPageStyle: Record<string, any>;
  gadgets: any[];
  images: any[];
  isGoogleMapKeySet: boolean;
  l10ns: any[];
  pictures: any[];
  pnEvents: Record<string, any>;
  projectbuilder: string;
  published: boolean;
  releaseversion: string;
  showtemplatepopup: boolean;
  soundeffects: any[];
  supportdevice: Record<string, Record<string, any>>;
  supportstyle: { Portrait: boolean; LandscapeRight: boolean };
  urlSchemes: any[];
  videos: any[];
  viewtype: string;
  voiceRecognizable: boolean;
  voices: any[];
  dataBaseHistory: any[];
  isTestRelease: string;
  lastpublished: string;
  projectname: string;
  AndroidPNapiKey: string;
  projectNumber: string;
  pushNotification: number;
  others: { resourceid: string; filename: string }[];
  released_version: string;
  googleMapKeyDevelopment: string;
  googleMapKeyProduction: string;
  generatedDocsPages: GeneratedDocsDic[];
  appDocumentTemplate: any[];
  appEmailTemplate: any[];
  appTemplate: any[];
  productionGeneratedDocsPages: GeneratedDocsDic[];
  appEvents: Record<string, any>;
  CustomUrlAvailable: string;
  CustomUrlIP: string;
  CustomUrlType: string;
  webapptitle: string;
  appVariables: any[];
  addedAppVariables: any[];
  removedAppVariables: any[];
  ProjectRole: string;
  Contributors: ContributorDic[];
  ssoEnable: boolean;
  logAppLaunch: boolean;
  logAppLaunchTime: number;
  isGASet: boolean;
  setAlertStyle: boolean;
  alertStyleDic: AlertStyleDic;
  AppStyle: {
    PageStyle: any[];
    UIpartStyle: any[];
    rememberMe: boolean;
  };
  priorityTabs: string[];
}


export interface ScreenDic {   
  screenName: string;
  SplashIcon: string[];
  width: number;
  height: number;
  AppIcon: string;
  orientation: string;
  Platform: string;
  embed: boolean;
}

export interface TableDic {
	servicename:string;
	tablename:string;
	watch_table:string;
	script:string;
	createddatetime:string;
	watch_trigger:string;
	procedurename:string;
	watch_procedure:string;
	procedure:false;
	updateddatetime:string;
	view:false;
	description:string;
	host:string;
	dbname:string;
	tableid:string;
	csvfilename:string;
	trigger:boolean;
	triggername:string;
	fields:string[];
	fieldsWithBlank:string[];
	fieldswithBracket:string[];
}

export interface ContributorDic {
  contributorName: string;
  contributorProjectid: string;
  description: string;
  mainProjectid: string;
  owner: string;
  selectTabPages: any[];
}

export interface AlertStyleDic {
  backgroundColor: string;
  headerTextColor: string;
  headerFontSize: number;
  messageTextColor: string;
  messageFontSize: number;
  okbtnTextColor: string;
  okbtnBGColor: string;
  cancelTextColor: string;
  cancelBGColor: string;
}

export interface GeneratedDocsDic {
  projectid: string;
  pagename: string;
  lang: string;
  pdf: boolean;
  screen_index: string;
}