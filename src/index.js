const SVG_NS = "http://www.w3.org/2000/svg";
const RADIUS = 25;
const HEIGHT = 80;
const WIDTH = 100;

class Node {
    constructor(char) {
        this.char = char;
        this.nextNodesByChar = new Map();
        this.suffixLink = null;
        this.endSuffixLinks = [];
        this.wordEndings = []
    }

    addNextNode(node, isLink = false) {
        this.nextNodesByChar.set(node.char, node);
    }

    getNextNodeByChar(char) {
        return this.nextNodesByChar.get(char);
    }

    addEndOfWord(word) {
        this.wordEndings.push(word)
    }

    calcLayout() {
        let childWidth = 0;
        let childHeight = 0;
        this.childWidths = [];
        this.nextNodesByChar.forEach(next => {
            let nodeBounds = next.calcLayout();
            this.childWidths.push(nodeBounds.width);
            childWidth += nodeBounds.width;
            childHeight = Math.max(childHeight, nodeBounds.height);
        });

        if (childHeight) {
            childHeight += HEIGHT / 2
        }

        this.leftOffset = (Math.max(WIDTH, childWidth) - WIDTH) / 2;

        return {height: childHeight + HEIGHT, width: Math.max(WIDTH, childWidth)}
    }

    calcPosition({left, top} = {left: 0, top: 0}) {
        this.posX = left + this.leftOffset + WIDTH / 2;
        this.posY = top + HEIGHT / 2;
        let i = 0;
        let childLeft = left;
        this.nextNodesByChar.forEach(next => {
            next.calcPosition({left: childLeft, top: this.posY + HEIGHT});
            childLeft += this.childWidths[i];
            i++;
        });
    }

    renderTo(svg) {
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute('cx', this.posX);
        circle.setAttribute('cy', this.posY);
        circle.setAttribute('r', RADIUS);
        circle.setAttribute('style', `fill: ${this.wordEndings.length === 0 ? 'white' : 'lightgrey'}; stroke: blue; stroke-width: 3px;`);

        let text = document.createElementNS(SVG_NS, "text");
        text.setAttribute('x', this.posX + 1);
        text.setAttribute('y', this.posY + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'central');
        text.setAttribute('style', 'fill: red; font-family: Arial, sans-serif; font-size: 25px');
        text.innerHTML = this.char;

        this.nextNodesByChar.forEach(next => {
            let line = new Line(this.posX, this.posY, next.posX, next.posY, 'stroke:rgb(0,0,0);stroke-width:2');
            line.shorten(RADIUS);
            line.renderTo(svg);
            next.renderTo(svg);
        });

        if (this.suffixLink) {
            let line = new Line(this.posX, this.posY, this.suffixLink.posX, this.suffixLink.posY, 'stroke:rgb(0,0,255);stroke-width:2', -5);
            line.shorten(RADIUS);
            line.renderTo(svg)
        }

        this.endSuffixLinks.forEach(next => {
            let line = new Line(this.posX, this.posY, next.posX, next.posY, 'stroke:rgb(0,255,0);stroke-width:2', -10);
            line.shorten(RADIUS);
            line.renderTo(svg)
        });

        svg.appendChild(circle);
        svg.appendChild(text);
    }
}

class Line {
    constructor(x1, y1, x2, y2, style, shift = null) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.style = style;
        this.length = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1));
        this.shift = shift;
    }

    renderTo(svg) {
        const xBase = (this.x1 - this.x2) / this.length;
        const yBase = (this.y1 - this.y2) / this.length;

        let angle = Math.acos(xBase);
        if (yBase < 0) {
            angle = Math.PI - angle
        }

        const normalX = Math.cos(angle + Math.PI / 2);
        const normalY = Math.sin(angle + Math.PI / 2);

        if (this.shift) {
            this.x1 += this.shift * normalX;
            this.y1 += this.shift * normalY;
            this.x2 += this.shift * normalX;
            this.y2 += this.shift * normalY;
        }

        let baseArrowX = this.x2 + xBase * 10;
        let baseArrowY = this.y2 + yBase * 10;

        let leftArrowX = baseArrowX + normalX * 5;
        let leftArrowY = baseArrowY + normalY * 5;

        let rightArrowX = baseArrowX + normalX * -5;
        let rightArrowY = baseArrowY + normalY * -5;

        let line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', this.x1);
        line.setAttribute('y1', this.y1);
        line.setAttribute('x2', this.x2);
        line.setAttribute('y2', this.y2);
        line.setAttribute('style', this.style);
        svg.appendChild(line);

        let arrowLeftLine = document.createElementNS(SVG_NS, 'line');
        arrowLeftLine.setAttribute('x1', leftArrowX);
        arrowLeftLine.setAttribute('y1', leftArrowY);
        arrowLeftLine.setAttribute('x2', this.x2);
        arrowLeftLine.setAttribute('y2', this.y2);
        arrowLeftLine.setAttribute('style', this.style);

        svg.appendChild(arrowLeftLine);

        let arrowRightLine = document.createElementNS(SVG_NS, 'line');
        arrowRightLine.setAttribute('x1', rightArrowX);
        arrowRightLine.setAttribute('y1', rightArrowY);
        arrowRightLine.setAttribute('x2', this.x2);
        arrowRightLine.setAttribute('y2', this.y2);
        arrowRightLine.setAttribute('style', this.style);

        svg.appendChild(arrowRightLine);
    }

    shorten(length) {
        const newLength = this.length - length;
        this.y2 = this.y1 + ((this.y2 - this.y1) / this.length) * newLength;
        this.x2 = this.x1 + ((this.x2 - this.x1) / this.length) * newLength;

        this.length = newLength;
    }
}

class Graph {
    constructor() {
        this.root = new Node(null);
        this.nodes = [];
    }

    addWordToNode(node, word, pos = 0) {
        if (pos === word.length) {
            node.addEndOfWord(word);
            return;
        }
        let char = word[pos];
        let next = node.getNextNodeByChar(char);
        if (!next) {
            next = new Node(char);
            next.depth = pos;
            this.nodes.push(next);
            node.addNextNode(next);
        }
        this.addWordToNode(next, word, pos + 1)
    }

    findSuffixLink(node, upper = this.root) {
        for (let [nextChar, next] of upper.nextNodesByChar) {
            if (nextChar === node.char) {
                if (next === node) {
                    node.suffixLink = upper;
                } else {
                    node.nextNodesByChar.forEach((next2) => {
                        this.findSuffixLink(next2, next)
                    });
                    if (!node.suffixLink || next.depth > node.suffixLink.depth) {
                        node.suffixLink = next;
                    }

                    if (next.wordEndings.length > 0) {
                        node.endSuffixLinks.push(next);
                    }
                }
            }
        }

        node.nextNodesByChar.forEach((next) => {
            this.findSuffixLink(next)
        })
    }

    addWord(word) {
        this.addWordToNode(this.root, word);
    }

    finish() {
        this.root.nextNodesByChar.forEach((next) => {
            this.findSuffixLink(next)
        })
    }

    createSVG() {
        let {width, height} = this.root.calcLayout();

        let svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('height', height);
        svg.setAttribute('width', width);

        this.root.calcPosition();
        this.root.renderTo(svg);
        return svg;
    }
}


const words = [
    "a",
    "ab",
    "bab",
    "bc",
    "bca",
    "c",
    "caa"
];

const wordsElement = document.getElementById("words");

function renderWordListItem(word) {
    const wordElement = document.createElement("div");
    const wordDeleteElement = document.createElement("a");
    wordDeleteElement.innerText = "X";
    wordDeleteElement.addEventListener("click", () => {
        words.splice(words.lastIndexOf(word), 1);
        wordsElement.removeChild(wordElement);
        renderGraph();
    }, {once: true});
    const wordInputElement = document.createElement("input");
    wordInputElement.value = word;
    wordElement.appendChild(wordInputElement);
    wordElement.appendChild(wordDeleteElement);
    wordsElement.appendChild(wordElement);
}

function renderWordList() {
    words.forEach(word => {
        renderWordListItem(word)
    });
}

renderWordList();

const newWordInputElement = document.getElementById("newWordInput");
document.getElementById("newWordSubmit").addEventListener("click", (e) => {
    e.preventDefault();
    let newWord = newWordInputElement.value;
    words.push(newWord);
    renderWordListItem(newWord);
    newWordInputElement.value = "";
    renderGraph();
    return false;
}, false);

let graphElement = document.getElementById("graph");

function renderGraph() {
    const graph = new Graph();
    words.forEach(word => {
        graph.addWord(word);
    });
    graph.finish();

    graphElement.innerHTML = "";
    graphElement.appendChild(graph.createSVG());
}

renderGraph();
