import testMap from './test-map';
import ScatterPlot from '../../src/vis/circle';
import AreaChart from '../../src/vis/area';
import BarChart from '../../src/vis/bar';
import SplineLine from '../../src/vis/spline';
import {timeFormat} from 'd3-time-format';
// import testP4Ext from './test-p4ext';
import {select, event} from 'd3-selection';
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
      {time: 1, value: 130, value1: 34},
      {time: 2, value: 391, value1: 56},
      {time: 3, value: 230, value1: 89},
      {time: 4, value: 630, value1: 90},
      {time: 5, value: 500, value1: 87},
  ],
  vmap: {
      x: 'time',
      y: 'value',
      size: 10,
      color: 'steelblue',
      stack: ['value', 'value1'],
      opacity: 0.5
  }
}

let view = {
  container: 'body',
  width: 800,
  height: 500,
  padding: {left: 50, right: 100, top: 10, bottom: 60},
  axes: true,
  xAxis: {
    // format: timeFormat('%m-%d')
  }
}

let url = new URL(window.location.href);

if (url.searchParams.get('map') !== null) {
  testMap();
} else if (url.searchParams.get('area') !== null) {
  new AreaChart(data, view).render();
} else if (url.searchParams.get('spline') !== null) {
  let s = 24 * 3600 * 1000
  let lineChart = new SplineLine({
    json: [
      {step: new Date(Date.now() + s), value: 23, type: 'abcde'},
      {step: new Date(Date.now() + s * 2), value: 53, type: 'abcde'},
      {step: new Date(Date.now() + s * 3), value: 39, type: 'abcde'},
      {step: new Date(Date.now() + s), value: 83, type: 'bbbbbbb'},
      {step: new Date(Date.now() + s * 2), value: 33, type: 'bbbbbbb'},
      {step: new Date(Date.now() + s * 3), value: 29, type: 'bbbbbbb'},
      {step: new Date(Date.now() + s * 4), value: 29, type: 'bbbbbbb'},
      {step: new Date(Date.now() + s * 5), value: 29, type: 'bbbbbbb'},
    ],
    schema: {step: 'time', value: 'number', type: 'string'},
    vmap: {x: 'step', y: 'value', color: 'type'}, 
  }, view)
  lineChart.render()

  lineChart.cursor = lineChart.svg.main.append('g')
    .append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', lineChart.height)
    .style('stroke', '#aaa')
    .style('opacity', 0);

  lineChart.svg.on('mousemove', function() {
      let xValues = lineChart.data.json.map(d => d[lineChart.data.vmap.x])
          .filter((item, i, ar) => ar.indexOf(item) === i)
          .sort ((a, b) => a - b)

      const len = xValues.length;
      let x = event.offsetX - lineChart.padding.left 

      if (x >= 0 && x < lineChart.width) {

        let cursorValue = lineChart.scales.x.invert(x - lineChart.width / len * 0.5) 
        let actualValue = xValues[0]
        for (let i = 0; i < len; i++) {
          if (cursorValue <= xValues[i]) {
            actualValue = xValues[i]
            break;
          }
        }
        let adjustPos = lineChart.scales.x(actualValue)
        lineChart.cursor.attr('x1', adjustPos).attr('x2', adjustPos).style('opacity', 1)
      }
  })

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


