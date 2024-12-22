# 🚀 ✨ marqu-eee
**A web component for the 20th century**

> The blazingly slow 🚙, zero-dependency 🌱, concerningly large (1.5kB) ↔️ web component you need for your newest web project

--- 

This project implements the `<marqu-eee>` web component as a replacement for the `<marquee>` tag. This one will never be deprecated!
Some features such as `width`, `height`, `vspace`, and `hspace` have been removed for simplicity. 

## Usage

`npm install marqu-eee-wc`

```html
<script type="module">
  import "marqu-eee-wc"
</script>

<marqu-eee>Hello</marqu-eee>
```

There's also an IIFE build, but I can't figure out what `unpkg` expects for package names with dashes. Go figure that out yourself.
It's like a fun little adventure for you.

## Options

|Option|Values|Description|
|------|------|-----------|
|direction|"up", "down", "left", "right" |Determines the direction the content will scroll in|
|behavior|"alternate", "scroll", "slide" (WIP) | Alternate bounces, scroll scrolls, and slide slides and then stops|
|center| "x", "y" | Centers the content of the element on the given axis |
|duration| seconds, ms, or a number | Determines the duration of the animation |
|loop|number or "infinite" | Number of times the animation should loop |

## Contributing

I would not recommend contributing to this project. It is a nightmare. Building a web component
without a framework is perhaps one of the worst pains a web developer can experience, and that's without all the other jank
in this project. HTML and CSS are written in raw JS template strings. Element height is calculated by creating an invisible div. 
Things aren't good.



```


