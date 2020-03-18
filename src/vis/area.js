import Plot from './plot';
import {area, curveBasis, stack} from 'd3-shape';
import {schemeCategory10} from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import { transition } from 'd3-transition';

export default class AreaChart extends Plot {
   
    constructor(data, view) {
        super(data, view);
    }

    render() {
        let vmap = this.data.vmap;
        

        if (Array.isArray(vmap.stack)) {
            console.log(this.data.json)
            const series = stack().keys(vmap.stack)(this.data.json);
            let color;
            if (typeof this.view.colorMap === 'function') {
                color = this.view.colorMap;
            }
            else {
                color = scaleOrdinal(schemeCategory10);
            }
            let values = []
            series.forEach(s => {values = values.concat(s)})
            this.scales.y.domain([0, Math.max(...values.map(d => d[1]))])
            let scales = this.scales
            let shape = area()
            .curve(curveBasis)
                .x(d => scales.x(d.data[vmap.x]))
                .y0(d => scales.y(d[0]))
                .y1(d => scales.y(d[1]));
        
            this.areas = this.svg.main
                .selectAll('path')
                .data(series, d => {if (d) return (d.key)})
                .enter()
                .append('path')
                    .attr("d", d =>  shape(d))
                    .style("fill", d => color(d.key))
                    .style("fill-opacity", vmap.opacity)
                    .style("stroke-width", 0)

            series.forEach((sample, di) => {
                let legendWidth = Math.min(15, this.padding.right/2);
                let legendPosY = (di) * Math.min(25, this.width / series.length);
                let legend = this.svg.main.append('g')
                    .attr('class', 'p3-vis-legend');

                legend.append('rect')
                    .attr('x', this.width + 20)
                    .attr('y', legendPosY)
                    .attr('width', legendWidth)
                    .attr('height', 6)
                    .style('fill', color(sample.key))
                
                legend.append('text')
                    .attr('x', this.width + 25 + legendWidth)
                    .attr('y', legendPosY + 8)
                    .text(sample.key)
            })

        } else {
            let shape = area()
                .curve(curveBasis)
                .x(d => this.scales.x(d[vmap.x]))
                .y0(this.height)
                .y1(d => this.scales.y(d[vmap.y]));

            this.svg.main.append("path")
                .datum(this.data.json)
                .attr("d", shape)
                .style("fill", vmap.color)
                .style("fill-opacity", vmap.opacity)
                .style("stroke-width", 0)
        }

        super.axes();

    }
}