import abstractView from "./abstractView.js";

export default class extends abstractView {
    constructor() {
        super();
        this.setTitle("Add note");
      
    }

    async getHtml() {
      return `<p>addnote</p>`;
  }
}

