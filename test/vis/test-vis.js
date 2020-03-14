import testMap from './test-map';
import ScatterPlot from '../../src/vis/circle';
import AreaChart from '../../src/vis/area';
import BarChart from '../../src/vis/bar';
import SplineLine from '../../src/vis/spline';
import {timeFormat} from 'd3-time-format';
// import testP4Ext from './test-p4ext';

let exampleList = document.getElementById('examples');
let examples = [
  'circle',
  'area',
  'map',
  'spline'
]

for (let example of examples) {
  exampleList.innerHTML += '<a href="?' + example + '">' + example + '</a><br />';
}

let data = {
  json: [
      {time: 1, value: 130},
      {time: 2, value: 391},
      {time: 3, value: 230},
      {time: 4, value: 630},
      {time: 5, value: 500},
  ],
  vmap: {
      x: 'time',
      y: 'value',
      size: 10,
      color: 'steelblue'
  }
}

let view = {
  container: 'body',
  width: 800,
  height: 500,
  padding: {left: 50, right: 100, top: 10, bottom: 60},
  axes: true,
  xAxis: {
    format: timeFormat('%m-%d')
  }
}

let url = new URL(window.location.href);

if (url.searchParams.get('map') !== null) {
  testMap();
} else if (url.searchParams.get('area') !== null) {
  new AreaChart(data, view).render();
} else if (url.searchParams.get('spline') !== null) {
  let s = 24 * 3600 * 1000
  new SplineLine({
    json: [
      {step: new Date(Date.now() + s), value: 23, type: 'abcde'},
      {step: new Date(Date.now() + s * 2), value: 53, type: 'abcde'},
      {step: new Date(Date.now() + s * 3), value: 39, type: 'abcde'},
      {step: new Date(Date.now() + s), value: 83, type: 'bbbbbbb'},
      {step: new Date(Date.now() + s * 2), value: 33, type: 'bbbbbbb'},
      {step: new Date(Date.now() + s * 23), value: 29, type: 'bbbbbbb'},
    ],
    schema: {step: 'time', value: 'number', type: 'string'},
    vmap: {x: 'step', y: 'value', color: 'type'}, 
  }, view).render();
} else if (url.searchParams.get('bar') !== null) {
  let barChart = new BarChart(data, view);
  barChart.update([{time: 1, value: 230},
    {time: 2, value: 191},
    {time: 3, value: 220},
    {time: 4, value: 230},
    {time: 5, value: 300}], 'red')
    
    barChart.update([{time: 1, value: 230},
      {time: 2, value: 191},
      {time: 3, value: 220},
      {time: 4, value: 230},
      {time: 5, value: 200}], 'red')
// } else if (url.searchParams.get('ext') !== null) {
//   testP4Ext();
} else {
  new ScatterPlot(data, view).render();
}


