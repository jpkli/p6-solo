import Plot from './plot';
import * as d3Geo from 'd3-geo';
import {select, event} from 'd3-selection';
import * as topojson from 'topojson-client';
import * as d3Chromatic from 'd3-scale-chromatic';
import {scalePow} from 'd3-scale';
import world from '../../assets/world-110m.json';
import countries from '../../assets/countries.json';
import {zoom} from 'd3-zoom';
import { transition } from 'd3-transition';

export default class Map extends Plot {
  constructor(data, view) {
    super(data, view);

    this.feature = data.feature || 'countries';
    this.circle = data.vmap.points;
    this.scale = data.vmap.scale;
    this.gis = data.gis || world;
    
    this.borders = view.borders || true;
    this.translate = view.translate || [this.width / 2, this.height / 1.6];
    this.scale = view.scale || ((view.projection == 'Albers') ? 1 : (this.width - 1) / 2 / Math.PI);
    this.exponent = view.exponent || 1/3;
    this.defaultColor = view.defaultColor || '#eee';
    this.showTip = view.showTip;
    this.projection = d3Geo['geo'+ (view.projection || 'Albers')].call()
      .scale(this.scale)
      .translate(this.translate)

    this.path = d3Geo.geoPath()
      .projection(this.projection);

    if (this.showTip) {
      this.tooltip = select(this.container).append('div') 
        .attr('class', 'p3-tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    }
    let svgMain = this.svg

    this.zoom = zoom()
      .scaleExtent([1, 12])
      .on('zoom', function () {
        svgMain.selectAll('path')
          .attr('transform', event.transform);
        
        svgMain.selectAll('circle')
          .attr('transform', event.transform);
      });

    this.svg.call(this.zoom)

    this.colorMap = view.colorMap || d3Chromatic.interpolateBlues
    if (typeof this.colorMap === 'string' && typeof d3Chromatic[this.colorMap] === 'function') {
      this.colorMap = d3Chromatic[this.colorMap]
    }
    if(data.vmap.color) {
      let valueById = {};
      data.json.forEach( d => {
        let country = countries.filter(c => c[data.join.type || 'code'] == d[data.join.field])[0] || -1;
        if(country && country.id){
          valueById[country.id] = typeof(d[data.vmap.color]) === 'string' && d[data.vmap.color].includes(',')
            ? Number(d[data.vmap.color].replace(/,/g, ''))
            : Number(d[data.vmap.color])
          d.pathId = country.id
        }
      })
      let values = Object.keys(valueById).map(k => valueById[k]).filter(d=>!Number.isNaN(d));
      let domain = [Math.min(...values), Math.max(...values)]
      if (data.zero) domain[0] = 0
      let colorScale = scalePow().exponent(this.exponent).domain(domain).range([0.1, 1]);
      this.setColor = (d) => {
        if(valueById[d.id] !== undefined) {
          return this.colorMap(colorScale(valueById[d.id]))
        } else {
          return this.defaultColor
        }
      }
      if(view.color && typeof(view.color.setter) === 'function') {
        this.setColor = (d) => {
          return this.color.setter(colorScale(valueById[d.id] || 0))
        }
      }
    }
  }

  render() { 
    let self = this    
    let geoPaths = this.svg.main.selectAll('.geo-paths')
      .data(topojson.feature(this.gis, this.gis.objects[this.feature]).features)
      .enter()
      .append('path')
        .attr('class', 'geo-paths')
        .attr('d', this.path)
        .style('fill', this.setColor);
    
      if(this.borders) {
        this.svg.main.append('path')
          .attr('class', 'geo-borders')
          .datum(topojson.mesh(this.gis, this.gis.objects[this.feature], function(a, b) { return a !== b; }))
          .attr('d', this.path)
          .style('fill', 'none')
          .style('stroke', 'white')
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .style('vector-effect', 'non-scaling-stroke');
      }
      if (this.showTip) {
        geoPaths.on('mouseenter', function () {
            self.tooltip.transition()    
            .duration(300).style('opacity', .9);
            if (typeof self.view.hover === 'object') {
                let item = select(this);
                Object.keys(self.view.hover).forEach(prop => {
                    item.style(prop, self.view.hover[prop]);
                });
            }
          })
          .on('mousemove', geoPath => {
            let region = this.data.json.find(d => d.pathId === geoPath.id)
            if (region) {
              if (typeof this.showTip === 'function') {
                this.tooltip.html(this.showTip(region))  
              }
              this.tooltip.style('left', (event.x) + 'px')
                .style('top', (event.y + 20) + 'px');    
            } else {
              this.tooltip.transition()    
              .duration(500) .style('opacity', 0);
            }
          })        
          .on('mouseout', function () {
            self.tooltip.style('opacity', 0);
            select(this).style('fill', self.setColor)
                // .style('stroke', 'white')
                // .style('stroke-width', 1);
          });
      }
      if (typeof this.view.click === 'function') {
        geoPaths.on('click', geoPath => {
          let region = this.data.json.find(d => d.pathId === geoPath.id);
          return this.view.click(region || {});
        })
      }
    return this;
  }

  addLayer({type = 'point', radius = 1.0, data, feature}) {
    if(type == 'point') {
      this.path.pointRadius(radius);
      this.svg.main.append('path')
        .datum(topojson.feature(data, data.objects[feature]))
        .attr('d', this.path);
    }
  }

  addCircles ({data, vmap = {}, style = {}}) {
    let self = this
    let maxRadius = Math.min(this.width, this.height) * 0.03;
    let radiusValues = data.map(d => d[vmap.size])
    let radiusDomain = [
      Math.min(...radiusValues),
      Math.max(...radiusValues),
    ]
    let radiusScale = scalePow().exponent(this.exponent).domain(radiusDomain).range([2, maxRadius]);
    let circles = this.svg.main.selectAll("circle")
		.data(data).enter()
		.append("circle")
          .attr("cx", d => this.projection([d[vmap.x], d[vmap.y]])[0])
          .attr("cy", d => this.projection([d[vmap.x], d[vmap.y]])[1])
          .attr("r", d => style.size || radiusScale(d[vmap.size]))
          .attr("fill", () => style.color || 'red')
          .attr("fill-opacity", () => style.opacity || 1)
          .attr("stroke", () => style.stroke || 'none')
  
    if (vmap.hover) {
      circles.on('mouseenter', function () {
          self.tooltip.style('opacity', .9)
          select(this).style('stroke', vmap.hover.stroke || 'teal').style('stroke-width', 3)
        })
       .on('mousemove', d => {
        if (typeof vmap.showTip === 'function') {
          this.tooltip.html(vmap.showTip(d))  
        }
        this.tooltip.style('left', (event.x) + 'px')
          .style('top', (event.y + 20) + 'px');
        })      
        .on('mouseout', function () {
          self.tooltip.style('opacity', 0);
          select(this).style('stroke', style.stroke || 'black').style('stroke-width', 1);
        });
    }
    if (typeof vmap.click === 'function') {
      circles.on('click', d => {return vmap.click(d)})
    }

  }

  addMarker ({
    coordinate,
    color = 'orange',
    icon = 'fa fa-map-marker',
    title
  }) {
    let location = this.projection(coordinate);
    this.svg.main.append('svg:foreignObject')
      .attr('x', location[0] - 3)
      .attr('y', location[1] - 15)
      .attr('width', 10)
      .attr('height', 20)
      .attr('color', color)
      .attr('text-anchor', 'end')
      .append('xhtml:body')
        .html('<i title="' + title + '" class="' + icon + '"></i>');
  }
}