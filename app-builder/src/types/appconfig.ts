export interface AppConfig {
  hostname: string;
  port: string;
  version: string;
  apiURL: string;
}

export interface AppCredentials {
  userid: string;
  projectid: string;
  sessionid: string;
  locale?: string;
}

export interface PageConfig {
  children: any[];
  description: string;
  targetClass: string;
  imagePath: string;
  visible: string;
  include?: string;
}

export interface UIConfig {
  children: any[];
  targetClass: string;
  mockup: string;
  imagePath: string;
  description: string;
  visible: string;
  visibleInTableView?: string;
  helpLink_EN?: string;
  helpLink_JP?: string;
}

export interface uiList {
  name: string;
  text: string;
  include: string;
  items: uiListItem[];
}

export interface uiListItem {
  name: string;
  text: string;
  imagePath: string;
  visible: string;
  description: string;
}      

export interface ActionConfig {
  children: any[];
  category: string;
  method: string;
  targetClass: string;
  type: string;
  helpLink_EN?: string;
  helpLink_JP?: string;
}