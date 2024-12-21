class Marqueee extends HTMLElement {
	private shadow: ShadowRoot
	private direction: string;

	static observedAttributes = ["direction"]
	constructor() {
		super();

		this.direction = "right";

		const template = document.createElement('template');
		this.shadow = this.attachShadow({ mode: 'open' })
	}

	connectedCallback() {
		this.shadow.innerHTML = `<h1>${this.direction}</h1>`
	}

	attributeChangedCallback(property: string, oldValue: string, newValue: string) {
		if (property === "direction") {
			this.direction = newValue
		}
	}
}

customElements.define('marqu-eee', Marqueee);
