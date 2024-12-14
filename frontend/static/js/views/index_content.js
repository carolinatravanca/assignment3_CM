import abstractView from "./abstractView.js";

export default class extends abstractView {
    constructor() {
        super();
        this.setTitle("homepage");
    }

    async getHtml() {
        
        return `<p>homepage</p>`;
    }
}