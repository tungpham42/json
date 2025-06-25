declare module "json-viewer-js" {
  interface JSONViewerOptions {
    container: HTMLElement;
    theme?: "light" | "dark";
  }

  export default class JSONViewer {
    constructor(options: JSONViewerOptions);
    showJSON(json: object): void;
  }
}
