import abstractView from "./abstractView.js";

export default class extends abstractView {
    constructor() {
        super();
        this.setTitle("Login");
    }

    async getHtml() {
        
        return `<p>login</p>`;
    }
}