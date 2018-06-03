/**
 * EVIL SHIM HACKS MUAHAHAHAHA
 */

export default class Matrix extends SVGMatrix {
    constructor() {
        // The typescript language doesn't like it when you don't call super() on an inheriting object
        // However, javascript doesn't care unless you use 'this'
        // So, we swallow an 'illegal constructor call' error here to appease typescript
        // And we create our 'illegal' object
        try {
            super();
        } catch (e) {
            //
        }
        const svgNamespace = "http://www.w3.org/2000/svg";
        return document.createElementNS(svgNamespace, "g").getCTM();
    }
}
