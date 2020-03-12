import Plot from './plot';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as d3Chromatic from 'd3-scale-chromatic';
import {scalePow} from 'd3-scale';
import world from "../../assets/world-110m.json";
import countries from '../../assets/countries.json';
export default class Map extends Plot {
    constructor(data, view) {
        super(data, view);

        this.feature = data.feature || 'countries';
        this.circle = data.vmap.points;
        this.scale = data.vmap.scale;
        this.gis = data.gis || world;
        
        this.borders = view.borders || true;
        this.translate = view.translate || [this.width / 2, this.height / 1.5];
        this.scale = view.scale || ((view.projection == 'Albers') ? 1 : 150);
        this.exponent = view.exponent || 1/3;
        this.defaultColor = view.defaultColor || '#eee';
        this.projection = d3['geo'+ (view.projection || 'Albers')].call()
            .scale(this.scale)
            .translate(this.translate);

        this.path = d3.geoPath()
            .projection(this.projection);

        this.colorMap = view.colorMap || d3Chromatic.interpolateBlues
        if (typeof this.colorMap === 'string' && d3Chromatic.hasOwnProperty(this.colorMap)) {
            this.colorMap = d3Chromatic[this.colorMap]
        }
        if(data.vmap.color) {
            let valueById = {};
            data.json.forEach( d => {
                let country = countries.filter(c => c[data.join.type || 'code']== d[data.join.field])[0] || -1;
                if(country && country.id){
                    valueById[country.id] = typeof(d[data.vmap.color]) === 'string' && d[data.vmap.color].includes(',')
                      ? Number(d[data.vmap.color].replace(/,/g, ''))
                      : Number(d[data.vmap.color])
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
        this.svg.main.selectAll(".geo-paths")
            .data(topojson.feature(this.gis, this.gis.objects[this.feature]).features)
            .enter()
            .append('path')
                .attr('class', 'geo-paths')
                .attr("d", this.path)
                .attr("stroke", "white")
                .attr("fill", this.setColor);
            
        if(this.borders) {
            this.svg.main.append("path")
            .attr('class', 'geo-borders')
            .datum(topojson.mesh(this.gis, this.gis.objects[this.feature], function(a, b) { return a !== b; }))
            .attr("d", this.path)
            .attr("fill", "none")
            .attr("stroke", "white");
        }

        return this;
    }

    addLayer({type = 'point', radius = 1.0, data, feature}) {
        if(type == 'point') {
            this.path.pointRadius(radius);
            this.svg.main.append("path")
                .datum(topojson.feature(data, data.objects[feature]))
                .attr("d", this.path);
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
        .attr("x", location[0] - 3)
        .attr("y", location[1] - 15)
        .attr('width', 10)
        .attr('height', 20)
        .attr('color', color)
        .attr('text-anchor', 'end')
        .append("xhtml:body")
        .html('<i title="'+ title + '" class="' + icon + '"></i>');
    }
}