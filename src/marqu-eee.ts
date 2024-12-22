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

function measureNodeWidth(node: Node): number {
	if (node.nodeType == Node.TEXT_NODE) {
		const range = document.createRange();
		range.selectNodeContents(node);

		const rect = range.getBoundingClientRect();

		return rect.width;
	}

	if (node instanceof Element) {
		const rect = node.getBoundingClientRect()

		return rect.width;
	}
	return 0
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
		this.loop = "infinite";
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
				width: ${(this.direction === "up" || this.direction == "down") && this.center === "x" ? "fit-content" : "100%"};
				transform: ${this.behavior === "slide" ? "" : "translateX(-100%)"};
				animation: ${this.getAnimationString()};
				margin: ${this.getSlotMargin()};
			}
slot {
display: inline-block;
width: 100%;
}
		`)

		this.shadow.adoptedStyleSheets = [stylesheet]

		const textWidth = this.textWidth()
		const textHeight = this.textHeight()

		const animationX = `
			@keyframes marquee-x {
				0% {
					transform: translateX(100%);
				}
				100% {transform: translateX(-${textWidth}px);}
			}
		`

		const animationXSlide = `
		@keyframes marquee-x-slide {
				0% {
					transform: translateX(100%);
				}
				100% {transform: translateX(0%);}
			}		`

		const animationXAlt = `@keyframes marquee-x-alt {
				0% {transform: translateX(calc(100% - ${textWidth}px ));}
				25% {transform: translateX(0%);}
				50% {transform: translateX(calc(100% - ${textWidth}px));}
				75% {transform: translateX(0%);}
				100% {transform: translateX(calc(100% - ${textWidth}px));}
		}`
		const animationY = `@keyframes marquee-y{
				0% { transform: translateY(100%); }
				100% {transform: translateY(calc(0% - ${textHeight}px));}
			}
		`

		const animationYSlide = `
		@keyframes marquee-y-slide {
				0% {
					transform: translateY(calc(100% - ${textHeight}px));
				}
				100% {transform: translateY(calc(0% - ${textHeight}px));}
			}		
`



		const animationYAlt = `@keyframes marquee-y-alt {
				0% {transform: translateY(0%);}
				25% {transform: translateY(calc(100% - ${textHeight}px));}
				50% {transform: translateY(0%);}
				75% {transform: translateY(calc(100% - ${textHeight}px));}
				100% {transform: translateY(0%);}
			}
		`

		stylesheet.insertRule(animationX)
		stylesheet.insertRule(animationXAlt)
		stylesheet.insertRule(animationXSlide)
		stylesheet.insertRule(animationY)
		stylesheet.insertRule(animationYAlt)
		stylesheet.insertRule(animationYSlide)

		this.shadow.adoptedStyleSheets = [stylesheet];
	}

	private textWidth() {
		const children = this.shadow.querySelector("slot")?.assignedNodes();
		let maxWidth = 0;
		if (children) {
			Array.from(children).forEach((c) => {
				const x = measureNodeWidth(c)
				if (x > maxWidth) {
					maxWidth = x
				}
			})
		}
		return maxWidth
	}

	private textHeight() {
		const children = this.shadow.querySelector("slot")?.assignedNodes()
		const tempContainer = document.createElement("div")
		tempContainer.style.position = "absolute";
		tempContainer.style.visibility = "hidden";
		tempContainer.style.top = '-9999px';

		if (children) {
			Array.from(children).forEach((c, i) => {
				const clone = c.cloneNode(true)
				tempContainer.appendChild(clone)
			})
		}
		document.body.appendChild(tempContainer)
		const height = tempContainer.offsetHeight;
		document.body.removeChild(tempContainer)
		return height;
	}

	private getAnimationString(): string {
		let name: string = "";
		let reverse: boolean = false;
		if (this.direction === "right" || this.direction === "left") {
			name = "marquee-x"
			if (this.behavior === "alternate") {
				name = "marquee-x-alt";
			} else if (this.behavior === "slide") {
				name = "marquee-x-slide"
			}
			reverse = this.direction === "right" ? true : false
		}

		if (this.direction === "up" || this.direction === "down") {
			name = "marquee-y"
			if (this.behavior == "alternate") {
				name = "marquee-y-alt";
			}
			else if (this.behavior == "slide") {
				name = "marquee-y-slide"
			}
			reverse = this.direction === "down" ? true : false
		}

		if (this.playing) {
			return `${name} ${this.getDurationSeconds()} linear ${this.getAnimationLoop()} ${reverse ? "reverse" : ""}`
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

	private getAnimationLoop(): string {
		if (this.behavior !== "slide") {
			return this.loop
		} else {
			return ""
		}
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
