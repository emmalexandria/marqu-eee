const marqueeTemplate = document.createElement('template')
marqueeTemplate.innerHTML = `
	<div class="wrapper">
		<div class="text-wrapper">
				<slot id="slot"></slot>
		</div>

	</div>
`
interface Dimension {
	x: number,
	y: number
}

function measureNode(node: Node): Dimension {
	if (node.nodeType == Node.TEXT_NODE) {
		const range = document.createRange();
		range.selectNodeContents(node);

		const rect = range.getBoundingClientRect();

		return {
			x: rect.width,
			y: rect.height
		}
	}

	if (node instanceof Element) {
		const rect = node.getBoundingClientRect()



		return {
			x: rect.width,
			y: rect.height
		}
	}

	return {
		x: 0,
		y: 0
	}
}

type Attribute = typeof MarqueeeElement.observedAttributes[number]

export class MarqueeeElement extends HTMLElement {
	private shadow: ShadowRoot
	private direction: string;
	private duration: string;
	private behavior: string
	private loop: string;
	private center: string;

	private playing: boolean;

	private repeats: number;

	static observedAttributes = ["direction", "duration", "loop", "behavior", "center"]
	constructor() {
		super();

		this.playing = true;

		this.direction = "left";
		this.duration = "10s";
		this.center = "";
		this.loop = "-1";
		this.behavior = "scroll"
		this.repeats = 0

		this.shadow = this.attachShadow({ mode: 'open' })
		this.shadow.append(marqueeTemplate.content.cloneNode(true))
	}

	connectedCallback() {
		this.updateStyles()
	}

	attributeChangedCallback(property: Attribute, oldValue: string, newValue: string) {
		if (property === "direction") {
			this.direction = newValue;
		}
		if (property === "behavior") {
			this.behavior = newValue
		}
		if (property === "duration") {
			this.duration = newValue;
		}
		if (property === "loop") {
			this.loop = newValue;
		}
		if (property === "center") {
			this.center = newValue;
		}
	}

	updateStyles() {
		const stylesheet = new CSSStyleSheet()
		stylesheet.replaceSync(`

			:host {
				display: block;
				text-align: initial;
				overflow: hidden;
	
			}


			.wrapper {
				display: flex;
				overflow: clip;
				width: 100%;
				height: 100%;
				overflow: clip;
				margin: auto;

			}

			.text-wrapper {
				display: block;
				overflow: clip;
				width: 100%;
				transform: translateX(-100%);
				animation: ${this.getAnimationString()};
				margin: ${this.getSlotMargin()};
			}
slot {
display: inline-block;
width: 100%;
}
		`)

		this.shadow.adoptedStyleSheets = [stylesheet]

		const animationX = `
			@keyframes marquee-x {
				0% {
					transform: translateX(100%);
				}
				100% {transform: translateX(-${this.textWidth()}px);}
			}
		`

		const animationXAlt = `@keyframes marquee-x-alt {
				0% {transform: translateX(calc(100% - ${this.textWidth()}px ));}
				25% {transform: translateX(0%);}
				50% {transform: translateX(calc(100% - ${this.textWidth()}px));}
				75% {transform: translateX(0%);}
				100% {transform: translateX(calc(100% - ${this.textWidth()}px));}
		}`
		const animationY = `@keyframes marquee-y{
				0% { transform: translateY(100%); }
				100% {transform: translateY(calc(0% - ${this.textHeight()}px));}
			}
		`

		const animationYAlt = `@keyframes marquee-y-alt {
				0% {transform: translateY(0%);}
				25% {transform: translateY(calc(100% - ${this.textHeight()}px));}
				50% {transform: translateY(0%);}
				75% {transform: translateY(calc(100% - ${this.textHeight()}px));}
				100% {transform: translateY(0%);}
			}
		`

		stylesheet.insertRule(animationX)
		stylesheet.insertRule(animationXAlt)
		stylesheet.insertRule(animationY)
		stylesheet.insertRule(animationYAlt)

		this.shadow.adoptedStyleSheets = [stylesheet];
	}

	private textWidth() {
		const children = this.shadow.querySelector("slot")?.assignedNodes();
		let maxWidth = 0;
		if (children) {
			Array.from(children).forEach((c) => {
				const { x } = measureNode(c)
				if (x > maxWidth) {
					maxWidth = x
				}
			})
		}
		return maxWidth
	}

	private textHeight() {
		const children = this.shadow.querySelector("slot")?.assignedNodes()
		let maxHeight = 0;
		if (children) {
			Array.from(children).forEach((c) => {
				const { y } = measureNode(c)
				if (y > maxHeight) {
					maxHeight = y
				}
			})
		}
		return maxHeight
	}

	private getAnimationString(): string {
		let name: string = "";
		let reverse: boolean = false;
		if (this.direction === "right" || this.direction === "left") {
			name = this.behavior !== "alternate" ? "marquee-x" : "marquee-x-alt"
			reverse = this.direction === "right" ? true : false
		}

		if (this.direction === "up" || this.direction === "down") {
			name = this.behavior !== "alternate" ? "marquee-y" : "marquee-y-alt";
			reverse = this.direction === "down" ? true : false
		}

		if (this.playing) {
			return `${name} ${this.getDurationSeconds()} linear ${this.loop === "-1" ? "infinite" : this.loop} ${reverse ? "reverse" : ""}`
		} else {
			return ""
		}
	}

	private getSlotMargin() {
		if (this.center === "x") {
			return "0 auto";
		}
		if (this.center === "y") {
			return "auto 0";
		}
		return ""
	}

	private getDurationSeconds() {
		if (this.duration.endsWith('ms')) {
			return `${parseFloat(this.duration.substring(0, this.duration.length)) / 1000}s`
		}
		if (this.duration.endsWith('s')) {
			return this.duration
		}
		return `${this.duration}s`
	}

	start() {
		this.playing = true;
		this.updateStyles()
	}

	stop() {
		this.playing = false;
		this.updateStyles()
	}
}

customElements.define('marqu-eee', MarqueeeElement);
