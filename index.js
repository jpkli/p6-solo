import pipeline   from './src/pipeline';
import allocate   from './src/allocate';
import arrays     from './src/ops/arrays';
import aggregate  from './src/ops/aggregate';
import derive     from './src/ops/derive';
import match      from './src/ops/match';
import join       from './src/join';
import stats      from './src/stats';
import embed      from './src/embed';
import toArray    from './src/toarray';
import vector     from './src/vector';

import Plot         from './src/vis/plot';
import AreaChart    from './src/vis/area';
import Spline       from './src/vis/spline';
import ScatterPlot  from './src/vis/circle';
import BarChart     from './src/vis/bar';
import ColumnChart  from './src/vis/column';
import GeoMap       from './src/vis/map';

export default {
    pipeline,
    allocate,
    arrays,
    aggregate,
    derive,
    match,
    join,
    stats,
    embed,
    toArray,
    vector,
};

export const vis = {
    Plot,
    ScatterPlot,
    BarChart,
    AreaChart,
    Spline,
    GeoMap
}
