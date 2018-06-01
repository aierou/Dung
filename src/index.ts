import Game from "./engine/Game";
import InputController from "./engine/InputController";
import World from "./engine/world/World"; // I don't know if this should be created from the index object.

let game: Game;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
const inputController: InputController = InputController.Instance;


window.onload = function() {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = enhanceContext(canvas.getContext("2d"));
    window.onresize = onresize;

    inputController.init(canvas, ctx);
    game = new Game(ctx);

    (window as any).game = game;

    onresize();
    game.init();
};

const onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
    if (game) { game.resize(canvas.width, canvas.height); }
};


// in theory, SVGMatrix will be used by the Canvas API in the future;
// in practice, we can borrow an SVG matrix today!
const createMatrix = function() {
    const svgNamespace = "http://www.w3.org/2000/svg";
    return document.createElementNS(svgNamespace, "g").getCTM();
};

  // `enhanceContext` takes a 2d canvas context and wraps its matrix-changing
  // functions so that `context._matrix` should always correspond to its
  // current transformation matrix.
  // Call `enhanceContext` on a freshly-fetched 2d canvas context for best
  // results.
const enhanceContext = function(context) {
    const m = createMatrix();
    context._matrix = m;
    context._scale = 1;

    // the stack of saved matrices
    context._savedMatrices = [m];

    const super_ = context.__proto__;
    context.__proto__ = ({

        // helper for manually forcing the canvas transformation matrix to
        // match the stored matrix.
        _setMatrix() {
            // tslint:disable-next-line:no-shadowed-variable
            const m = this._matrix;
            super_.setTransform.call(this, m.a, m.b, m.c, m.d, m.e, m.f);
        },

        save() {
            this._savedMatrices.push(this._matrix);
            super_.save.call(this);
        },

        // if the stack of matrices we're managing doesn't have a saved matrix,
        // we won't even call the context's original `restore` method.
        restore() {
            if (this._savedMatrices.length === 0) {
                return;
            }
            super_.restore.call(this);
            this._matrix = this._savedMatrices.pop();
            this._setMatrix();
        },

        scale(x, y) {
            this._matrix = this._matrix.scaleNonUniform(x, y);
            super_.scale.call(this, x, y);
        },

        getTransform() {
            return this._matrix;
        },

        rotate(theta) {
            // canvas `rotate` uses radians, SVGMatrix uses degrees.
            this._matrix = this._matrix.rotate(theta * 180 / Math.PI);
            super_.rotate.call(this, theta);
        },

        translate(x, y) {
            this._matrix = this._matrix.translate(x, y);
            super_.translate.call(this, x, y);
        },

        transform(a, b, c, d, e, f) {
            const rhs = createMatrix();
            // 2x2 scale-skew matrix
            rhs.a = a; rhs.b = b;
            rhs.c = c; rhs.d = d;

            // translation vector
            rhs.e = e; rhs.f = f;
            this._matrix = this._matrix.multiply(rhs);
            super_.transform.call(this, a, b, c, d, e, f);
        },

        // warning: `resetTransform` is not implemented in at least some browsers
        // and this is _not_ a shim.
        resetTransform() {
            this._matrix = createMatrix();
            this._setMatrix();
            // super_.resetTransform.call(this); // Pretty sure this isn't implemented in Android
        },

        __proto__: super_,
    });

    return context;
  };
