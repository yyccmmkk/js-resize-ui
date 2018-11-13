"use strict";
exports.__esModule = true;
/**
 * Created by zhoulongfei on 2018/9/28.
 * E-mail:36995800@163.com
 */
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var _ = require('lodash');
var win = window;
var doc = document;
var defaultSetting = {
    cache: {},
    item: '[data-type]',
    isFontResize: true,
    maxWidth: 1000,
    minWidth: 0,
    maxHeight: 100000,
    minHeight: 0,
    skip: 'skip',
    range: '[data-query="range"]',
    move: function (ele, w, h) {
        //console.log('ele:W:H',ele,w,h)
    },
    end: function (ele, ratioW, ratioH) {
    }
};
var Resize = /** @class */ (function () {
    function Resize(opt) {
        this.defaults = defaultSetting;
        this.options = _.defaultsDeep(opt, this.defaults, {});
    }
    Resize.prototype.init = function () {
        this.initStyle();
        this.bindEvent();
        return this;
    };
    Resize.prototype.bindEvent = function () {
        var _this = this;
        var options = this.options;
        var cache = options.cache;
        var rangeEle = doc.querySelector(options.range) || doc.documentElement;
        var range = rangeEle.getBoundingClientRect();
        //console.log(range);
        cache.range = range;
        rxjs_1.fromEvent(window, 'resize').subscribe(function () {
            range = rangeEle.getBoundingClientRect();
        });
        rxjs_1.fromEvent(window, 'scroll').subscribe(function () {
            range = rangeEle.getBoundingClientRect();
        });
        //拖放事件处里
        var subscriptionMove;
        rxjs_1.fromEvent([cache.ltNode, cache.rbNode, cache.lbNode, cache.rtNode, cache.lcNode, cache.rcNode, cache.ctNode, cache.cbNode], 'mousedown').subscribe(function (event) {
            var x = event.clientX;
            var y = event.clientY;
            var resizeType = event.srcElement.dataset.query;
            _this.refresh(cache.currentItem);
            range = rangeEle.getBoundingClientRect();
            subscriptionMove = rxjs_1.fromEvent(doc, 'mousemove').pipe(operators_1.auditTime(20), operators_1.map(function (evt) {
                var l = evt.clientX;
                var t = evt.clientY;
                l = l < range.left ? range.left : l;
                t = t < range.top ? range.top : t;
                t = t > range.bottom ? range.bottom : t;
                l = l > range.right ? range.right : l;
                return { x: l - x, y: t - y, shiftKey: evt.shiftKey };
            })).subscribe(function (distance) {
                //console.log(distance.x, distance.y);
                cache.shiftKey = distance.shiftKey;
                ///distance.y=cache.currentItemTop-distance.y+cache.currentItemHeight >range.height?-(range.height-cache.currentItemHeight -cache.currentItemTop):distance.y;
                _this[resizeType](distance.x, distance.y, distance.shiftKey);
            });
            event.preventDefault();
            event.stopPropagation();
        });
        rxjs_1.fromEvent(doc, 'mouseup').subscribe(function (evt) {
            if (subscriptionMove) {
                subscriptionMove.unsubscribe();
                subscriptionMove = null;
                _this.refresh(cache.currentItem);
                cache.currentItem.dataset.ratio = cache.datasetSize;
                options.end.apply(_this, [cache.currentItem, cache.width, cache.height, cache.size, cache.ratioW, cache.ratioH]);
            }
        });
        rxjs_1.fromEvent(doc, 'click').pipe(
        // throttleTime(300),
        operators_1.filter(function (evt) {
            var ele = evt.target;
            while (ele !== null) {
                if (ele.dataset && ele.dataset.type) {
                    return true;
                }
                ele = ele.parentNode;
            }
            return false;
        }), operators_1.map(function (event) {
            var ele = event.target;
            while (ele !== null) {
                if (ele.dataset.type) {
                    return ele;
                }
                ele = ele.parentNode;
            }
            return;
        })).subscribe(function (ele) {
            if (ele && !ele.dataset[options.skip]) {
                cache.ele.parentNode && cache.ele.parentNode.removeAttribute('data-resize');
                ele.appendChild(cache.ele);
                ele.setAttribute('data-resize', 'true');
                cache.currentItem = ele;
                _this.refresh(ele);
            }
        });
    };
    Resize.prototype.refresh = function (ele) {
        var cache = this.options.cache;
        var rect = ele.getBoundingClientRect();
        cache.topOffset = ele.offsetHeight - ele.clientHeight;
        cache.currentItemWidth = rect.width;
        cache.currentItemHeight = rect.height;
        cache.currentItemLeft = parseInt(ele.style.left) || 0;
        cache.currentItemTop = parseInt(ele.style.top) || 0;
        cache.currentItemBottom = rect.bottom;
        //console.log(rect, ele.style.left, ele.style.top);
    };
    Resize.prototype.initStyle = function () {
        var options = this.options;
        var cache = options.cache;
        var styleStr = "        \n            [data-query=\"resize\"]{\n                position:absolute;\n                border:1px dashed #000;\n                left:-1px;\n                top:-1px;\n                right:-1px;\n                bottom:-1px;\n                z-index:999\n            }\n            [data-query=\"resize\"] > div{\n                width:8px;\n                height:8px;\n                position:absolute;\n                border:1px solid #000;\n                background:#fff;\n            }\n            [data-query=\"resize\"] > [data-query=\"lt\"]{\n                left:-5px;\n                top:-5px;\n                cursor:nwse-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"lc\"]{\n                left:-5px;\n                top:50%;\n                margin-top:-5px;\n                cursor:ew-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"lb\"]{\n                left:-5px;\n                bottom:-5px;\n                cursor:nesw-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"rt\"]{\n                right:-5px;\n                top:-5px;\n                cursor:nesw-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"rc\"]{\n                right:-5px;\n                top:50%;\n                margin-top:-5px;\n                cursor:ew-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"rb\"]{\n                right:-5px;\n                bottom:-5px;\n                cursor:nwse-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"ct\"]{\n                left:50%;\n                margin-left:-5px;\n                top:-5px;\n                cursor:ns-resize;\n            }\n            [data-query=\"resize\"] > [data-query=\"cb\"]{\n                left:50%;\n                margin-left:-5px;\n                bottom:-5px;\n                cursor:ns-resize;\n            }\n        \n        ";
        var styleNode = doc.createElement('style');
        styleNode.innerText = styleStr;
        var textNode = doc.createTextNode(styleStr);
        styleNode.appendChild(textNode);
        var bodyNode = doc.querySelector('body');
        var headNode = doc.querySelector('head');
        headNode && headNode.appendChild(styleNode);
        var eleNode = doc.createElement('div');
        eleNode.setAttribute('data-query', 'resize');
        //eleNode.innerHTML=eleStr;
        cache["ltNode"] = this.createNode('lt', eleNode);
        cache["lcNode"] = this.createNode('lc', eleNode);
        cache["lbNode"] = this.createNode('lb', eleNode);
        cache["rtNode"] = this.createNode('rt', eleNode);
        cache["rcNode"] = this.createNode('rc', eleNode);
        cache["rbNode"] = this.createNode('rb', eleNode);
        cache["ctNode"] = this.createNode('ct', eleNode);
        cache["cbNode"] = this.createNode('cb', eleNode);
        cache.ele = eleNode;
    };
    Resize.prototype.createNode = function (selector, parentNode) {
        var node = doc.createElement('div');
        node.setAttribute('data-query', selector);
        node.draggable = false;
        parentNode.appendChild(node);
        return node;
    };
    Resize.prototype.lt = function (x, y, shiftKey) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var t, l, w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = _.divide(x, ratio);
        }
        t = cache.currentItemTop + y;
        l = cache.currentItemLeft + x;
        w = cache.currentItemWidth - x;
        h = cache.currentItemHeight - y;
        ele.style.left = l + 'px';
        ele.style.top = t + 'px';
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    };
    Resize.prototype.lc = function (x, y) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var l, w;
        l = cache.currentItemLeft + x;
        w = cache.currentItemWidth - x;
        ele.style.left = l + 'px';
        ele.style.width = w + 'px';
        this.move(cache.currentItem, w, cache.currentItemHeight, _.divide(w, cache.currentItemWidth), 1);
    };
    Resize.prototype.lb = function (x, y, shiftKey) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var l, w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = -_.divide(x, ratio);
        }
        l = cache.currentItemLeft + x;
        w = cache.currentItemWidth - x;
        h = cache.currentItemHeight + y;
        ele.style.left = l + 'px';
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    };
    Resize.prototype.rt = function (x, y, shiftKey) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var t, w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = -_.divide(x, ratio);
        }
        t = cache.currentItemTop + y;
        w = cache.currentItemWidth + x;
        h = cache.currentItemHeight - y;
        ele.style.top = t + 'px';
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    };
    Resize.prototype.rc = function (x, y) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var w = cache.currentItemWidth + x;
        ele.style.width = w + 'px';
        this.move(cache.currentItem, w, cache.currentItemHeight, _.divide(w, cache.currentItemWidth), 1);
    };
    Resize.prototype.rb = function (x, y, shiftKey) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = _.divide(x, ratio);
        }
        w = cache.currentItemWidth + x;
        h = cache.currentItemHeight + y;
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    };
    Resize.prototype.ct = function (x, y) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var h = cache.currentItemHeight - y;
        ele.style.top = cache.currentItemTop + y + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, cache.currentItemWidth, h, 1, _.divide(h, cache.currentItemHeight));
    };
    Resize.prototype.cb = function (x, y) {
        var cache = this.options.cache;
        var ele = cache.currentItem;
        var h = cache.currentItemHeight + y;
        ele.style.height = h + 'px';
        this.move(cache.currentItem, cache.currentItemWidth, h, 1, _.divide(h, cache.currentItemHeight));
    };
    Resize.prototype.move = function (ele, w, h, ratioW, ratioH) {
        var size;
        var options = this.options;
        var cache = options.cache;
        //console.log("ratio:", ratioW, ratioH);
        if (options.isFontResize && ele.dataset && ele.dataset.ratio) {
            size = (ratioH !== 1 && ratioW !== 1) ? _.multiply(+ele.dataset.ratio, Math.min(ratioH, ratioW)) : 14;
            cache.datasetSize = size;
            size = size < 7.63636364 ? 7.63636364 : size;
            ele.style.fontSize = size + 'px';
            cache.size = size;
        }
        cache.ratioW = ratioW;
        cache.ratioH = ratioH;
        cache.width = w;
        cache.height = h;
        this.options.move.apply(this, [ele, w, h, size, ratioW, ratioH]);
    };
    Resize.prototype.hidePanel = function () {
        var cache = this.options.cache;
        cache.ele = cache.ele.parentNode && cache.ele.parentNode.removeChild(cache.ele) || cache.ele;
    };
    return Resize;
}());
exports["default"] = Resize;
