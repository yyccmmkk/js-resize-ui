import Resize from './resize.ts';
import ReferenceLine from '../extern/reference-line.ts';

new ReferenceLine({
    item: '[data-type]',
    range: '[data-query="canvasBox"]',
    drag: true,
    zIndex: 1,//参考线层级
    lineColor: 'red',
    lineWidth: 1,
    offset: 40,//参考线头尾的延伸距离
    move: function () {

    },
    createCanvas: function (ele:any) {
        let body=document.querySelector('body');
        body&&body.appendChild(ele);
    }}).init();



let resize = new Resize({
    range: '[data-query="canvasBox"]',
    skip: 'select',
    move: function (ele:any, w:any, h:any) {
        console.log('move');
    },
    end: function (ele:any, width:any, height:any, fontSize:any, ratioW:any, ratioH:any) {
        //ele 当前操作元素，ratioW 宽度的缩放比例，ratioH 高度缩放比例
        console.log(ele,width,height,fontSize,ratioW,ratioH);


    }
}).init();

//对齐线 +拖动


