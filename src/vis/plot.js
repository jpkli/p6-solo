import {scaleLinear, scaleOrdinal, scaleTime, scalePow, scaleLog} from 'd3-scale';
import {select} from 'd3-selection';
import {interpolateHcl} from 'd3-interpolate';
import {axisLeft, axisBottom} from 'd3-axis';
import { transition } from 'd3-transition';

const DATA = {
  json: [],
  domains: {},
  vmap: {}
}

const VIEW = {
  container: null,
  svg: null,
  height: 300,
  width: 400,
  axes: true
}

export default class Plot {
  constructor(data = DATA, view = VIEW) {
    this.data = data;
    this.view = view;
    this.container = view.container;
    this.padding = view.padding || {top: 0, bottom: 0, left: 0, right: 0};
    this.height = view.height;
    this.width = view.width;
    this.svg = {};
    this.scale = data.scale || {}
    this.domains = data.domains || {};
    if (typeof this.data.schema === 'object') {
      this.data.fields = Object.keys(this.data.schema)
    }
    if(!view.svg || view.svg === null) {
      if(view.container !== null) {
        this.svg = this.createSvg();
      }
      this.height -= this.padding.top + this.padding.bottom;
      this.width -= this.padding.left + this.padding.right;
      this.svg.main = this.svg.append('g')
        .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`);
    } else {
      this.svg.main = select(view.svg);
    }
    
    if(this.data.json) {
      this.scales = this.getScales();
    }
  }

  createSvg() {
    let svg = select(this.container)
      .append('svg')
        .attr('width', this.width)
        .attr('height', this.height);
    return svg;
  }

  channels() {
    return {
      x: [0, this.width],
      y: [this.height, 0],
      color: ['steelblue', 'red'],
      opacity: [0, 1],
      size: [2, 20],
      width: [0, this.width],
      height: [0, this.height]
    }
  }

  getScales() {
    let scales = {};
    let channels = this.channels();
    let vmap = this.data.vmap;

    let fields = this.data.fields || null;
    let exponent = 1.0;
    let logScale = false;
    if(fields === null && this.data.json) {
      this.data.fields = Object.keys(this.data.json[0]);
      fields = Object.keys(this.data.json[0]);
    }
    for (let channel of Object.keys(channels)) {
      let attr = (Array.isArray(vmap[channel])) ? vmap[channel][0] : vmap[channel]
      if (typeof attr === 'object') {
        if (Array.isArray(attr.columns)) {
          attr = attr.columns[0];
        }
        if (Number.isFinite(attr.exponent)) {
          exponent = attr.exponent
        }
        if (attr.logScale) {
          logScale = true
        }
        if (attr.field) {
          attr = attr.field
        }
        vmap[channel] = attr
      }
      if(channel in vmap) {
        let domain; 
        if(!this.domains.hasOwnProperty(attr)) {
          let value = this.data.json.map(d=>d[attr]);
          let min = Math.min(...value) || 0;
          let max = Math.max(...value) || 0;
          
          if (min === 0 && max === 0) {
            domain = value.filter((item, i, ar) => ar.indexOf(item) === i);
          } else {
            if(max === min) {
              max += 1e-6;
            }
            domain = [min, max];
          }
          this.domains[attr] = domain;
        } else {
          domain = this.domains[attr] || [0, 1];
        }
        let range = channels[channel];

        if (this.data.schema && this.data.schema[attr] === 'time') {
          domain = domain.map(d => new Date(d));
          if (domain.length > 2) {
            domain.sort((a, b) => a.getTime() - b.getTime())
            domain = [domain[0], domain[domain.length -1]]
          }
          this.domains[attr] = domain
          scales[channel] = scaleTime().domain(domain).range(range);
        } else if(logScale) {
          scales[channel] = scaleLog().domain(domain).range(range);
        } else if(exponent !== 1.0) {
          scales[channel] = scalePow().exponent(exponent).domain(domain).range(range);
        } else if( (this.data.schema && this.data.schema[attr === 'string']) || domain.length > 2) {
          scales[channel] = scaleOrdinal().domain(domain).range(range);
        } else {
          scales[channel] = scaleLinear().domain(domain).range(range);
          if(channel == 'color') {
            scales[channel].interpolate(interpolateHcl);
          }
        }
      } else {
        scales[channel] = () => attr;
      }
    }

    return scales;
  }

  axes() {
    if(!this.view.hideAxes) {
      this.xAxis = axisBottom(this.scales.x).tickSizeOuter(0);
      if (this.view.xAxis) {
        if (typeof this.view.xAxis.format === 'function') {
          this.xAxis.tickFormat(this.view.xAxis.format);
        }
        if (this.view.xAxis.ticks) {
          this.xAxis.ticks(this.view.xAxis.ticks);
        }
      }
      this.xAxisSvg = this.svg.main.append('g')
        .attr('class', 'p3-axis p3-axis-x')
        .attr('transform', `translate(0, ${this.height})`)
        .call(this.xAxis);
      
      if (this.scales.y) {
        this.yAxis = axisLeft(this.scales.y).ticks(this.height / 30);
        this.yAxisSvg = this.svg.main.append('g')
          .attr('class', 'p3-axis p3-axis-y')
          .call(this.yAxis);
      }

      if(this.view.gridlines && this.view.gridlines.y) {
        this.yGridlines = this.yAxisSvg.append('g')
          .attr('class', 'p3-vis-gridLines')
          .style('opacity', 0.15)
          .call(axisLeft(this.scales.y).ticks(this.height/30).tickSize(-this.width))
          .selectAll('text').remove();
      }
      this.axeLabels()
    }
  }

  axeLabels () {

    this.AxisLabels = this.svg.main.append('g')
    this.AxisLabels.append('text')
      .attr('class', 'p3-axis-x-label')
      .attr('x', this.width / 2)
      .attr('y', this.height + this.padding.bottom / 2 )
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(this.data.vmap.x);
  
    this.AxisLabels.append('text')
      .attr('class', 'p3-axis-y-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -this.padding.left / 1.25 )
      .attr('x', -this.height / 2 )
      .attr('dy', '1em')
      .text(this.data.vmap.y);
  }

  render () {
    this.axes();
  }

  resize (width, height) {
    this.svg.attr('width', width).attr('height', height);

    this.height = height - this.padding.top - this.padding.bottom;
    this.width = width - this.padding.left - this.padding.right;

    this.scales = this.getScales();
    if (this.xAxis) {
      this.xAxis.scale(this.scales.x);
      this.xAxisSvg.transition().duration(500)
        .attr('transform', `translate(0, ${this.height})`)
        .call(this.xAxis)
    }

    if (this.yAxis) {
      this.yAxis.scale(this.scales.y).ticks(this.height / 30);
      this.yAxisSvg
        .transition().duration(500)
        .call(this.yAxis);
    }

    if (this.AxisLabels) {
        this.AxisLabels.remove()
        this.axeLabels()
    }

  }
}