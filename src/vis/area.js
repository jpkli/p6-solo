import Plot from './plot';
import {area, curveBasis, stack} from 'd3-shape';
import {schemeCategory10} from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import { transition } from 'd3-transition';

export default class AreaChart extends Plot {
   
    constructor(data, view) {
        super(data, view);
    }

    resize (w, h) {
        super.resize(w, h)
        this.areas
            .transition().duration(500)
            .attr('d', this.area)
        if (this.legend) {
            this.svg.main.selectAll('.p3-vis-legend').remove()
            this.createLegend()
        }

    }

    createLegend () {

        this.legend = this.svg.main.append('g').attr('class', 'p3-vis-legend');


        this.series.forEach((sample, di) => {
            let legendWidth = Math.min(15, this.padding.right/2);
            let legendPosY = (di) * Math.min(25, this.width / this.series.length);

            this.legend.append('rect')
                .attr('x', this.width + 20)
                .attr('y', legendPosY)
                .attr('width', legendWidth)
                .attr('height', 6)
                .style('fill', this.color(sample.key))
            
            this.legend.append('text')
                .attr('x', this.width + 25 + legendWidth)
                .attr('y', legendPosY + 8)
                .text(sample.key)
        })
    }

    render() {
        let vmap = this.data.vmap;
        
        if (Array.isArray(vmap.stack)) {
            this.series = stack().keys(vmap.stack)(this.data.json);
        
            if (typeof this.view.colorMap === 'function') {
                this.color = this.view.colorMap;
            }
            else {
                this.color = scaleOrdinal(schemeCategory10);
            }
            let values = []
            this.series.forEach(s => {values = values.concat(s)})
            this.domains[vmap.y] = [0, Math.max(...values.map(d => d[1]))]
            this.scales.y.domain(this.domains[vmap.y])
            this.area = area()
                .curve(curveBasis)
                    .x(d => this.scales.x(d.data[vmap.x]))
                    .y0(d => this.scales.y(d[0]))
                    .y1(d => this.scales.y(d[1]));
        
            this.areas = this.svg.main
                .selectAll('path')
                .data(this.series, d => {if (d) return (d.key)})
                .enter()
                .append('path')
                    .attr("d", this.area)
                    .style("fill", d => this.color(d.key))
                    .style("fill-opacity", vmap.opacity)
                    .style("stroke-width", 0)

            this.createLegend()

        } else {
            this.area = area()
                .curve(curveBasis)
                .x(d => this.scales.x(d[vmap.x]))
                .y0(this.height)
                .y1(d => this.scales.y(d[vmap.y]));

            this.areas = this.svg.main.append("path")
                .datum(this.data.json)
                .attr("d", this.area)
                .style("fill", vmap.color)
                .style("fill-opacity", vmap.opacity)
                .style("stroke-width", 0)
        }

        super.axes();
        return this

    }
}