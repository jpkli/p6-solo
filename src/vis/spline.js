import Plot from './plot';
import {line, curveBasis} from 'd3-shape';
import {scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {select, event} from 'd3-selection';
export default class Spline extends Plot {
    constructor(data, view) {
        super(data, view);
    }

    render() {
        let vmap = this.data.vmap;
        super.axes();
        let path = line()
            .curve(curveBasis)
                .x( d => this.scales.x(d[vmap.x]) )
                .y( d => this.scales.y(d[vmap.y]) );
    
        let datum = this.data.json;
        let color = vmap.color;
 
        let series =  vmap.by || vmap.color;
        if(this.data.fields.indexOf(series) !== -1) {
            let result = {}
            this.data.json.forEach(function(d){
                if(result.hasOwnProperty(d[series])) {
                    result[d[series]].push(d)
                } else {
                    result[d[series]] = [d];
                }
            })
            datum = result;
            if (typeof this.view.colorMap === 'function') {
                color = this.view.colorMap
            }
            else if (this.data.fields.indexOf(vmap.color) !== -1) {
                color = scaleOrdinal(schemeCategory10);
            }
        }

        if(Array.isArray(datum)) {
            this.svg.main.append("path")
                .datum(datum)
                .attr("d", path)
                .style("fill", 'none')
                .style("stroke", vmap.color)
                .style("stroke-width", vmap.size)
        } else if(typeof(datum) == 'object') {
            let series = Object.keys(datum);
            series.forEach((sample, di) => {
                this.svg.main.append("path")
                    .datum(datum[sample])
                    .attr("d", path)
                    .style("fill", 'none')
                    .style("stroke", color(sample))
                    .style("stroke-width", vmap.size)
            
                if (this.data.fields.indexOf(vmap.color) !== -1) {
                    let legendWidth = Math.min(15, this.padding.right/2);
                    let legendPosY = (di) * Math.min(25, this.width / series.length);
                    let legend = this.svg.main.append('g')
                        .attr('class', 'p3-vis-legend');

                    legend.append('rect')
                        .attr('x', this.width + 20)
                        .attr('y', legendPosY)
                        .attr('width', legendWidth)
                        .attr('height', 6)
                        .style('fill', color(sample))
                    
                    legend.append('text')
                        .attr('x', this.width + 25 + legendWidth)
                        .attr('y', legendPosY + 8)
                        .text(sample)
    
                    // if(di == 0){
                    //     legend.append('text')
                    //         .attr('x', this.width + legendWidth)
                    //         .attr('y', 6)
                    //         .text(vmap.color)
                    // }
                }
            })
        }

    }
}
