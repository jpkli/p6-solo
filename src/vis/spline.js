import Plot from './plot';
import {line, curveBasis} from 'd3-shape';
import {scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';

export default class Spline extends Plot {
    constructor(data, view) {
        super(data, view);
        this.render();
    }

    render() {
        let vmap = this.data.vmap;
        super.axes();
        let path = line()
            .curve(curveBasis)
            .x( d => this.scales.x(d[vmap.x]) )
            .y( d => this.scales.y(d[vmap.y]) );
    

        let datum = this.data.json;
        let color = () => vmap.color;
       
        let series =  vmap.by || vmap.color;
        if(this.data.fields.indexOf(series) !== -1) {
            let result = {}
            this.data.json.forEach(function(d){
                if(result.hasOwnProperty(d[series])) {
                    result[d[series]].push(d)
                } else {
                    result[d[series]] = [];
                }
            })
            datum = result;
            if(this.data.fields.indexOf(vmap.color) !== -1) {
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
            series .forEach((sample, di) => {
                this.svg.main.append("path")
                .datum(datum[sample])
                .attr("d", path)
                .style("fill", 'none')
                .style("stroke", color(sample))
                .style("stroke-width", vmap.size)
            
                if (this.data.fields.indexOf(vmap.color) !== -1) {
                    let legendWidth = Math.min(15, this.padding.right/2);
                    let legendPosY = (di + 1) * Math.min(30, this.width / series.length);
                    this.svg.main.append('rect')
                        .attr('x', this.width + 10)
                        .attr('y', legendPosY)
                        .attr('width', legendWidth)
                        .attr('height', 6)
                        .style('fill', color(sample))
                    
                    this.svg.main.append('text')
                        .attr('x', this.width + 15 + legendWidth)
                        .attr('y', legendPosY + 6)
                        .text(sample)
    
                    if(di == 0){
                        this.svg.main.append('text')
                            .attr('x', this.width + 10 + legendWidth/2)
                            .attr('y', 6)
                            .text(vmap.color)
                    }
                }
            })


        }

    }
}
