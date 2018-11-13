/**
 * Created by zhoulongfei on 2018/9/28.
 * E-mail:36995800@163.com
 */
import {Observable, Subject, ReplaySubject, from, of, range, fromEvent, Unsubscribable} from 'rxjs';
import {map, filter, switchMap, throttleTime, find, auditTime} from 'rxjs/operators';

let _ = require('lodash');
let win: Window = window;
let doc: Document = document;

interface setting {
    [propName: string]: any;

    move(ele: Element, w: number, h: number): any

}

interface resize {
    [index: string]: any;
}

const defaultSetting: setting = {
    cache: {},
    item: '[data-type]',
    isFontResize: true,
    maxWidth: 1000,
    minWidth: 0,
    maxHeight: 100000,
    minHeight: 0,
    skip:'skip',//dataset值 跳过元素
    range: '[data-query="range"]',
    move: (ele: Element, w: number, h: number) => {
        //console.log('ele:W:H',ele,w,h)
    },
    end: (ele: Element, ratioW: number, ratioH: number) => {

    }
};
export default class Resize implements resize {
    private defaults: setting = defaultSetting;
    private options: setting;

    [index: string]: any;

    constructor(opt: setting) {
        this.options = _.defaultsDeep(opt, this.defaults, {})
    }

    init() {
        this.initStyle();
        this.bindEvent();
        return this;
    }

    bindEvent() {
        let options = this.options;
        let cache = options.cache;
        let rangeEle: Element = doc.querySelector(options.range) || doc.documentElement;
        let range: ClientRect = rangeEle.getBoundingClientRect();
        //console.log(range);
        cache.range = range;
        fromEvent(window, 'resize').subscribe(() => {
            range = rangeEle.getBoundingClientRect();
        });
        fromEvent(window, 'scroll').subscribe(() => {
            range = rangeEle.getBoundingClientRect();
        });

        //拖放事件处里
        let subscriptionMove: Unsubscribable | null;

        fromEvent([cache.ltNode, cache.rbNode, cache.lbNode, cache.rtNode, cache.lcNode, cache.rcNode, cache.ctNode, cache.cbNode], 'mousedown').subscribe((event: any) => {

            let x = event.clientX;
            let y = event.clientY;
            let resizeType: string = event.srcElement.dataset.query;
            this.refresh(cache.currentItem);
            range = rangeEle.getBoundingClientRect();
            subscriptionMove = fromEvent(doc, 'mousemove').pipe(
                auditTime(20),
                map((evt: any) => {
                    let l = evt.clientX;
                    let t = evt.clientY;
                    l = l < range.left ? range.left : l;
                    t = t < range.top ? range.top : t;
                    t = t > range.bottom ? range.bottom : t;

                    l = l > range.right ? range.right : l;

                    return {x: l - x, y: t - y, shiftKey: evt.shiftKey}
                })
            ).subscribe(distance => {
                //console.log(distance.x, distance.y);

                cache.shiftKey = distance.shiftKey;
                ///distance.y=cache.currentItemTop-distance.y+cache.currentItemHeight >range.height?-(range.height-cache.currentItemHeight -cache.currentItemTop):distance.y;
                this[resizeType](distance.x, distance.y, distance.shiftKey);
            });
            event.preventDefault();
            event.stopPropagation();
        });
        fromEvent(doc, 'mouseup').subscribe(evt => {
            if (subscriptionMove) {
                subscriptionMove.unsubscribe();
                subscriptionMove = null;
                this.refresh(cache.currentItem);
                cache.currentItem.dataset.ratio = cache.datasetSize;
                options.end.apply(this, [cache.currentItem, cache.width, cache.height, cache.size, cache.ratioW, cache.ratioH])
            }
        });

        fromEvent(doc, 'click').pipe(
            // throttleTime(300),
            filter((evt: any) => {

                let ele = evt.target;
                while (ele !== null) {
                    if (ele.dataset && ele.dataset.type) {
                        return true
                    }
                    ele = ele.parentNode;
                }

                return false
            }),
            map((event) => {
                let ele = event.target;
                while (ele !== null) {
                    if (ele.dataset.type) {
                        return ele
                    }
                    ele = ele.parentNode;
                }
                return
            })
        ).subscribe((ele: any) => {
            if (ele&&!ele.dataset[options.skip]) {
                cache.ele.parentNode&&cache.ele.parentNode.removeAttribute('data-resize');
                ele.appendChild(cache.ele);
                ele.setAttribute('data-resize','true');
                cache.currentItem = ele;
                this.refresh(ele)
            }

        });

    }

    refresh(ele: any) {
        let cache = this.options.cache;
        let rect = ele.getBoundingClientRect();
        cache.topOffset=ele.offsetHeight-ele.clientHeight;
        cache.currentItemWidth = rect.width;
        cache.currentItemHeight = rect.height;
        cache.currentItemLeft = parseInt(ele.style.left) || 0;
        cache.currentItemTop = parseInt(ele.style.top) || 0;
        cache.currentItemBottom=rect.bottom;
        //console.log(rect, ele.style.left, ele.style.top);
    }

    initStyle() {
        let options = this.options;
        let cache = options.cache;

        let styleStr = `        
            [data-query="resize"]{
                position:absolute;
                border:1px dashed #000;
                left:-1px;
                top:-1px;
                right:-1px;
                bottom:-1px;
                z-index:999
            }
            [data-query="resize"] > div{
                width:8px;
                height:8px;
                position:absolute;
                border:1px solid #000;
                background:#fff;
            }
            [data-query="resize"] > [data-query="lt"]{
                left:-5px;
                top:-5px;
                cursor:nwse-resize;
            }
            [data-query="resize"] > [data-query="lc"]{
                left:-5px;
                top:50%;
                margin-top:-5px;
                cursor:ew-resize;
            }
            [data-query="resize"] > [data-query="lb"]{
                left:-5px;
                bottom:-5px;
                cursor:nesw-resize;
            }
            [data-query="resize"] > [data-query="rt"]{
                right:-5px;
                top:-5px;
                cursor:nesw-resize;
            }
            [data-query="resize"] > [data-query="rc"]{
                right:-5px;
                top:50%;
                margin-top:-5px;
                cursor:ew-resize;
            }
            [data-query="resize"] > [data-query="rb"]{
                right:-5px;
                bottom:-5px;
                cursor:nwse-resize;
            }
            [data-query="resize"] > [data-query="ct"]{
                left:50%;
                margin-left:-5px;
                top:-5px;
                cursor:ns-resize;
            }
            [data-query="resize"] > [data-query="cb"]{
                left:50%;
                margin-left:-5px;
                bottom:-5px;
                cursor:ns-resize;
            }
        
        `;
        let styleNode: HTMLElement = doc.createElement('style');
        styleNode.innerText = styleStr;
        let textNode: Text = doc.createTextNode(styleStr);
        styleNode.appendChild(textNode);
        let bodyNode: HTMLBodyElement | null = doc.querySelector('body');
        let headNode: HTMLHeadElement | null = doc.querySelector('head');
        headNode && headNode.appendChild(styleNode);
        let eleNode = doc.createElement('div');
        eleNode.setAttribute('data-query', 'resize');
        //eleNode.innerHTML=eleStr;
        cache[`ltNode`] = this.createNode('lt', eleNode);
        cache[`lcNode`] = this.createNode('lc', eleNode);
        cache[`lbNode`] = this.createNode('lb', eleNode);
        cache[`rtNode`] = this.createNode('rt', eleNode);
        cache[`rcNode`] = this.createNode('rc', eleNode);
        cache[`rbNode`] = this.createNode('rb', eleNode);
        cache[`ctNode`] = this.createNode('ct', eleNode);
        cache[`cbNode`] = this.createNode('cb', eleNode);
        cache.ele = eleNode;
    }

    createNode(selector: string, parentNode: Node): Node {
        let node = doc.createElement('div');
        node.setAttribute('data-query', selector);
        node.draggable = false;
        parentNode.appendChild(node);
        return node
    }

    lt(x: number, y: number, shiftKey: boolean): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let t, l, w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = _.divide(x, ratio)

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
    }

    lc(x: number, y: number): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let l, w;
        l = cache.currentItemLeft + x;
        w = cache.currentItemWidth - x;
        ele.style.left = l + 'px';
        ele.style.width = w + 'px';
        this.move(cache.currentItem, w, cache.currentItemHeight, _.divide(w, cache.currentItemWidth), 1);
    }
    lb(x: number, y: number, shiftKey: boolean): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let l, w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = -_.divide(x, ratio)
        }
        l = cache.currentItemLeft + x;
        w = cache.currentItemWidth - x;
        h = cache.currentItemHeight + y;
        ele.style.left = l + 'px';
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    }

    rt(x: number, y: number, shiftKey: boolean): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let t, w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = -_.divide(x, ratio)

        }
        t = cache.currentItemTop + y;
        w = cache.currentItemWidth + x;
        h = cache.currentItemHeight - y;
        ele.style.top = t + 'px';
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    }

    rc(x: number, y: number): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let w = cache.currentItemWidth + x;
        ele.style.width = w + 'px';
        this.move(cache.currentItem, w, cache.currentItemHeight, _.divide(w, cache.currentItemWidth), 1);
    }

    rb(x: number, y: number, shiftKey: boolean): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let w, h, ratio;
        if (shiftKey) {
            ratio = _.divide(cache.currentItemWidth, cache.currentItemHeight);
            y = _.divide(x, ratio)

        }
        w = cache.currentItemWidth + x;
        h = cache.currentItemHeight + y;
        ele.style.width = w + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, w, h, _.divide(w, cache.currentItemWidth), _.divide(h, cache.currentItemHeight));
    }

    ct(x: number, y: number): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let h = cache.currentItemHeight - y;
        ele.style.top = cache.currentItemTop + y + 'px';
        ele.style.height = h + 'px';
        this.move(cache.currentItem, cache.currentItemWidth, h, 1, _.divide(h, cache.currentItemHeight));
    }

    cb(x: number, y: number): void {
        let cache = this.options.cache;
        let ele = cache.currentItem;
        let h = cache.currentItemHeight + y;
        ele.style.height = h + 'px';
        this.move(cache.currentItem, cache.currentItemWidth, h, 1, _.divide(h, cache.currentItemHeight));
    }

    move(ele: any, w: number, h: number, ratioW: number, ratioH: number): void {
        let size;
        let options = this.options;
        let cache = options.cache;
        //console.log("ratio:", ratioW, ratioH);
        if (options.isFontResize && ele.dataset && ele.dataset.ratio) {
            size = (ratioH !== 1 && ratioW !== 1) ? _.multiply(+ele.dataset.ratio, Math.min(ratioH, ratioW)) : 14;
            cache.datasetSize = size;
            size = size < 7.63636364 ? 7.63636364 : size;
            ele.style.fontSize = size + 'px';
            cache.size = size
        }
        cache.ratioW = ratioW;
        cache.ratioH = ratioH;
        cache.width = w;
        cache.height = h;
        this.options.move.apply(this, [ele, w, h, size, ratioW, ratioH])
    }
    hidePanel():void{
        let cache=this.options.cache;
        cache.ele=cache.ele.parentNode&&cache.ele.parentNode.removeChild(cache.ele)||cache.ele;
    }
}

