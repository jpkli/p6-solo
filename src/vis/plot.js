import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {select} from 'd3-selection';
import {interpolateHcl} from 'd3-interpolate';
import {axisLeft, axisBottom} from 'd3-axis';

let Data = {
    json: [],
    domains: {},
    vmap: {}
}

let View = {
    container: null,
    svg: null,
    height: 300,
    width: 400,
    axes: true
}

export default class Plot {
    constructor(data = Data, view = View) {
        this.data = data;
        this.view = view;
        this.container = view.container;
        this.padding = view.padding || {top: 0, bottom: 0, left: 0, right: 0};
        this.height = view.height;
        this.width = view.width;
        this.svg = {};
        this.domains = data.domains || {};

        if(!view.svg || view.svg === null) {
            if(view.container !== null) {
                this.svg = this.createSvg();
            }
            this.height -= this.padding.top + this.padding.bottom;
            this.width -= this.padding.left + this.padding.right;
            this.svg.main = this.svg.append('g')
                .attr("transform", `translate(${this.padding.left}, ${this.padding.top})`);
    
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
        if(fields === null && this.data.json) {
            this.data.fields = Object.keys(this.data.json[0]);
            fields = Object.keys(this.data.json[0]);
        }
        
        for (let channel of Object.keys(channels)) {
            if(channel in vmap && fields.indexOf(vmap[channel]) !== -1) {
                let domain; 
                if(!this.domains.hasOwnProperty(vmap[channel])) {
                    let value = this.data.json.map(d=>d[vmap[channel]]);
                    let min = Math.min(...value) || 0;
                    let max = Math.max(...value) || 0;
                   
                    if(max === min) {
                        max += 1e-6;
                    }
                    domain = [min, max];
                    this.domains[vmap[channel]] = domain;
                } else {
                    domain = this.domains[vmap[channel]] || [0, 1];
                }
                let range = channels[channel];
                if( (this.data.schema && this.data.schema[vmap[channel] === 'string'])) {
                    scales[channel] = scaleOrdinal().domain(domain).rangeRoundBands([0, this.width], .05);
                } else {
                    scales[channel] = scaleLinear().domain(domain).range(range);
                }
                if(channel == 'color') {
                    scales[channel].interpolate(interpolateHcl)
                }
            } else {
                scales[channel] = () => vmap[channel]
            }
        }

        return scales;
    }

    axes() {
        if(!this.view.hideAxes) {
            this.xAxis = this.svg.main.append('g')
                .attr("transform", `translate(0, ${this.height})`)
                .call(axisBottom(this.scales.x).tickSizeOuter(0))
            
            this.yAxis = this.svg.main.append('g')
                .call(axisLeft(this.scales.y).ticks(this.height/20));

            if(this.view.gridlines && this.view.gridlines.y) {
                this.yGridlines = this.yAxis.append('g')
                .style('opacity', 0.3)
                .call(axisLeft(this.scales.y).ticks(this.height/30).tickSize(-this.width))
                .selectAll('text').remove();
            }

            this.AxisLabels = this.svg.main.append('g')

            this.AxisLabels.append("text")
              .attr("x", this.width / 2)
              .attr("y", this.height + this.padding.bottom / 2 )
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text(this.data.vmap.x);
        
            this.AxisLabels.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -this.padding.left / 1.25 )
              .attr("x", -this.height / 2 - this.padding.top )
              .attr("dy", "1em")
              .text(this.data.vmap.y);
        }
    }

    render() {
        this.axes();
    }
}