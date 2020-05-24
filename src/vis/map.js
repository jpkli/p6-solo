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
    this.scale = data.vmap.scale;
    this.gis = data.gis || world;
    this.selectedRegion = null;
    this.borders = view.borders || true;
    this.entities = data.entities || countries;
    this.translate = view.translate || [this.width / 2, this.height / 1.5];
    this.scale = view.scale || ((view.projection == 'Albers') ? 1 : (this.width) / 2 / Math.PI);
    this.exponent = view.exponent || 1/3;
    this.defaultColor = view.defaultColor || '#eee';
    this.showTip = view.showTip;
    this.setColor = view.setColor
    this.enableZoom = view.zoom || false
    this.projection = d3Geo['geo'+ (view.projection || 'Albers')].call()
      .scale(this.scale)
      .translate(this.translate)

    this.path = d3Geo.geoPath()
      .projection(this.projection);

    this.tooltip = select(this.container).append('div') 
      .attr('class', 'p3-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    this.svg.on('mousedown', () => {
        this.tooltip.style('opacity', 0);
    })

    this.zoomLevel = 1
    this.zoom = zoom()
      .scaleExtent([1, 12])
      .on('zoom', () =>  {
        this.zoomLevel = event.transform.k
        this.svg.selectAll('path')
          .attr('transform', event.transform);

        this.svg.selectAll('.map-label')
          .attr('transform', event.transform);
      
        this.svg.selectAll('.map-marker')
          .attr('transform', event.transform);
        
        this.svg.selectAll('circle')
          .attr('r', d => d._size / event.transform.k)
          .attr('transform', event.transform)
          .style("stroke-width", 1 / event.transform.k);
      });

    if (this.enableZoom) {
      this.svg.call(this.zoom)
    }

    this.colorMap = view.colorMap || d3Chromatic.interpolateBlues
    if (typeof this.colorMap === 'string' && typeof d3Chromatic[this.colorMap] === 'function') {
      this.colorMap = d3Chromatic[this.colorMap]
    }
    if(data.vmap.color && typeof this.setColor !== 'function') {
      let valueById = {};
      data.json.forEach( d => {
        let entity = this.entities.find(c => c[data.join.type || 'code'] === d[data.join.field]);
        if(entity && entity.id){
          valueById[entity.id] = typeof(d[data.vmap.color]) === 'string' && d[data.vmap.color].includes(',')
            ? Number(d[data.vmap.color].replace(/,/g, ''))
            : Number(d[data.vmap.color])
          d.pathId = entity.id
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

  resize (w, h, scale = null, translate = null) {
    super.resize(w, h);
    this.translate = translate || [this.width / 2, this.height / 1.5];
    this.scale = scale || (this.width / 2 / Math.PI);
    this.projection.scale(this.scale).translate(this.translate);

    this.svg.selectAll('path')
      .transition().duration(500)
      .attr('d', this.path);
  
    let {vmap} = this.circleProps

    this.svg.main.selectAll('.circles')
      .transition().duration(500)
      .attr("cx", d => this.projection([d[vmap.x], d[vmap.y]])[0])
      .attr("cy", d => this.projection([d[vmap.x], d[vmap.y]])[1])

  }

  setCenter (center) {
    this.projection.center(center)
    this.svg.selectAll('path').attr('d', this.path);
  }

  render() { 
    let self = this    
    let geoPaths = this.svg.main.selectAll('.geo-paths')
      .data(topojson.feature(this.gis, this.gis.objects[this.feature]).features)
      .enter()
      .append('path')
        .attr('class', 'geo-paths')
        .attr('d', this.path)
        .attr('path-name', d => {
          let entity = this.entities.find(c => d.id === c.id);
          if (entity) {
            return entity.name
          }
          if (d.properties && d.properties.name) {
            return d.properties.name
          }
        })
        .style('fill', this.setColor);
    
      if(this.borders) {
        this.svg.main.append('path')
          .attr('class', 'geo-borders')
          .datum(topojson.mesh(this.gis, this.gis.objects[this.feature], function(a, b) { return a !== b; }))
          .attr('d', this.path)
          .style('fill', 'none')
          .style('stroke', this.view.borderColor || 'white')
          .style('stroke-width', 1)
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .style('vector-effect', 'non-scaling-stroke');
      }
      if (this.showTip) {
        geoPaths.on('mouseenter', function () {
            self.tooltip.transition().duration(300).style('opacity', .9);
            let item = select(this);
            if (self.selectedRegion 
              && self.selectedRegion.attr('path-name') === item.attr('path-name')) {
                return
            }

            if (typeof self.view.hover === 'object') {
              Object.keys(self.view.hover).forEach(prop => {
                item.style(prop, self.view.hover[prop]);
              });
            }
          })
          .on('mousemove', geoPath => {
            if (!this.data.json) {
              return
            }
            let region = this.data.json.find(d => d.pathId === geoPath.id)
            if (region) {
              if (typeof this.showTip === 'function') {
                this.tooltip.html(this.showTip(region))  
              }
              this.tooltip
                .style('left', (event.offsetX) + 'px')
                .style('top', (event.offsetY) + 'px');    
            } else {
              this.tooltip.transition().duration(500).style('opacity', 0);
            }
          })
          .on('mouseout', function () {
            self.tooltip.style('opacity', 0);
            let item = select(this);
            if (self.selectedRegion 
                && self.selectedRegion.attr('path-name') === item.attr('path-name')) {
                  return
              }
            item
              .style('fill', self.setColor)
              .style('stroke', 'none')
              .style('stroke-width', 0)
          });
      }
      if (this.view.click) {
        geoPaths.on('click', function (geoPath) {
          if (self.selectedRegion !== null) {
            self.selectedRegion.style('fill', self.setColor)
          }
          self.selectedRegion = select(this);
          Object.keys(self.view.click).forEach(prop => {
            self.selectedRegion.style(prop, self.view.click[prop]);
          });
          if (typeof self.view.click.callback === 'function') {
            let regionData = self.data.json.find(d => d.pathId === geoPath.id);
            self.view.click.callback(regionData || {});
          }
        })
      }
      this.geoRegions = this.geoPaths
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
    let maxRadius = style.maxRadius || Math.min(this.width, this.height) * 0.05;
    let minRadius = style.minRadius || 5;
    let radiusValues = data.map(d => d[vmap.size])
    let radiusDomain = [
      Math.min(...radiusValues),
      Math.max(...radiusValues),
    ]
   
    let radiusScale = scalePow()
      .exponent(this.exponent)
      .domain(radiusDomain)
      .range([minRadius, maxRadius]);
 
    data.forEach(d => {
      d._size = style.size || radiusScale(d[vmap.size])
    })
    this.circleProps = {vmap, style}
    let circles = this.svg.main.selectAll("circle")
    .data(data).enter()
        .append("circle")
          .attr('class', 'circles')
          .attr("cx", d => this.projection([d[vmap.x], d[vmap.y]])[0])
          .attr("cy", d => this.projection([d[vmap.x], d[vmap.y]])[1])
          .attr("r", d => style.size || radiusScale(d[vmap.size]))
          .attr("fill", () => style.color || 'red')
          .attr("fill-opacity", () => style.opacity || 1)
          .attr("stroke", () => style.stroke || 'none')
  
    if (vmap.hover) {
      circles.on('mouseenter', function () {
          self.tooltip.style('opacity', .9)

          select(this)
            .style('stroke', vmap.hover.stroke || 'teal')
            .style('stroke-width', 3 / self.zoomLevel)
            .raise();
        })
       .on('mousemove', d => {
        if (typeof vmap.showTip === 'function') {
          this.tooltip.html(vmap.showTip(d))  
        }
        this.tooltip.style('left', (event.offsetX) + 'px')
          .style('top', (event.offsetY) + 'px');
        })      
        .on('mouseout', function () {
          self.tooltip.style('opacity', 0);
          select(this).style('stroke', style.stroke || 'black').style('stroke-width', 1 / self.zoomLevel);
        });
    }
    if (typeof vmap.click === 'function') {
      circles.on('click', d => {return vmap.click(d)})
    }
    return circles;
  }

  selectRegionByName (name, styles = {}) {
    let region = document.querySelector('.geo-paths[path-name="' + name + '"]');
    Object.keys(styles).forEach(prop => {
      region.style[prop] = styles[prop];
    });
    this.selectedRegion = select(region);
    return region;
  }

  unselectRegion() {
    if (this.selectedRegion) {
      this.selectedRegion.style('fill', this.setColor)
      this.selectedRegion = null;
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
      .attr('class', 'map-marker')
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