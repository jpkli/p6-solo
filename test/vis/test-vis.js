import testMap from './test-map';
import ScatterPlot from '../../src/vis/circle';
import AreaChart from '../../src/vis/area';
import BarChart from '../../src/vis/bar';
// import testP4Ext from './test-p4ext';

let exampleList = document.getElementById('examples');
let examples = [
  'circle',
  'area',
  'map'
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
  padding: {left: 100, right: 10, top: 10, bottom: 60},
  axes: true
}

let url = new URL(window.location.href);

if (url.searchParams.get('map') !== null) {
  testMap();
} else if (url.searchParams.get('area') !== null) {
  new AreaChart(data, view).render();
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


