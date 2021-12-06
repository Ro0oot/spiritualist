// https://observablehq.com/@tianbreznik/spiritualist_yall@750
import define1 from "./e93997d5089d7165@2303.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`
# Spiritualist exploration v2 
`
)});
  main.variable(observer("map")).define("map", ["d3","DOM","width","color","projection","getQuadtree","graticule","lineWidth","land","magnitudeRadius","twitterUsers"], function(d3,DOM,width,color,projection,getQuadtree,graticule,lineWidth,land,magnitudeRadius,twitterUsers)
{
  var w = 200;
  var h = 50;
  var margin_left = 80;
  var margin_histo = 20;
  let container = d3.select(DOM.element("div"));
  let context = this ? this.getContext("2d") : DOM.context2d(width, width);
  container.append(() => context.canvas);
  const canvas = context.canvas;
  canvas.style.backgroundColor = 'black'
  color.opacity = 0.4;
  let toolTip = container.append("div").attr("id","tooltip");
  //let circle = container.append("div").attr("id","circle");
  let height = context.canvas.height;
  let originalScale = height / 2.1;
  let scale = originalScale;
  let previousScaleFactor = 1;
  //let rotation;
  let sphere = {type: 'Sphere'};
  let path = d3.geoPath(projection, context);
  let tooltipQuadtree = getQuadtree();
  let tooltipPositions = [];
  let sentences_fin = [];
  let tooltipPositionsIndex = {};
  let tooltipPositionsSentences = {};
  let tooltipPositionsGeo = {};
  let tooltipPositionsYear = {};

  var year_colors = {
    y_1869: "#35055a",
    y_1870: "#3f0556",
    y_1871: "#580556",
    y_1872: "#54057e",
    y_1873: "#5305b8",
    y_1874: "#740556",
    y_1875: "#a82bef",
    y_1876: "#862bef",
    y_1877: "#bc96ef",
    y_1878: "#c581ee",
    y_1879: "#c581ee"
};
  //let twitterUserFeatures = twitterUsers.features;
  //let {x,y} = globe_rotation
  /**
   * After each zoom/pan projection recalculation, force the svg(really canvas) paths to update
   */
  function drawWorld() {
    //console.log(year_colors["y_1873"])
    context.clearRect(0, 0, width, height);
    context.beginPath(), path(graticule), context.lineWidth = .4; context.strokeStyle = "#ccc", context.stroke();
    
    context.lineWidth = lineWidth;
    context.strokeStyle = "white"
    context.shadowBlur = 5;
    context.shadowColor = "violet"
    context.beginPath(), path(land), context.fillStyle = 'transparent', context.fill(); context.strokeStyle = "#fff"; 
    context.lineWidth = 0.5;  
    context.stroke();

    context.lineWidth = 3.5;
    context.fillStyle = "transparent";
    context.shadowBlur = 5;
    context.shadowColor = "violet"
    context.shadowOffsetX = 2
    context.shadowOffsetY = 2
    context.beginPath(), path(sphere), context.strokeStyle = "white", context.stroke();
    
    //set up the points
    path.pointRadius(magnitudeRadius);
    
    twitterUsers.forEach(d => {
      var year_key = "y_" + d.properties.Year.toString()
      context.beginPath(), context.shadowBlur = 10; context.shadowColor = year_colors[year_key]; context.fillStyle = year_colors[year_key]; path(d); context.fill()
    });
    path.pointRadius(null);

    
    //reset the tooltip caches
    tooltipPositions = []; tooltipPositionsIndex = {}; tooltipPositionsSentences = {}; tooltipPositionsGeo = {}; tooltipQuadtree = getQuadtree(); 
    
    //update tooltip caches
    for(let i=0, len=twitterUsers.length; i<len; i++){
      let mid_arr = twitterUsers[i].properties.city_context;
      mid_arr = mid_arr.sort((a, b) => b.length - a.length);
      let pixelCoords = projection(twitterUsers[i].geometry.coordinates);
      tooltipPositions.push(pixelCoords);
      tooltipPositionsSentences[pixelCoords.join(",")] = mid_arr;
      tooltipPositionsGeo[pixelCoords.join(",")] = twitterUsers[i].geometry.coordinates;
      tooltipPositionsIndex[pixelCoords.join(",")] = twitterUsers[i].properties.City;
      tooltipPositionsYear[pixelCoords.join(",")] = twitterUsers[i].properties.Year;
    }
  
    //update the quadtree
    tooltipQuadtree.addAll(tooltipPositions);
    
    //hide the tooltip if the map is being zoomed/panned
    d3.select('#tooltip').style('opacity', 0);
    //d3.select('#circle').style('opacity', 0);
  } 
  
  /**
   * Every time the globe is zoomed or panned, recalculate the correct projection parameters
   * and then request that the map data be redrawn/updated
   */
  d3.geoZoom()
    .projection(projection)
    .northUp(true)
    .onMove(drawWorld)
    (d3.select(context.canvas).node());

  //initiate the first globe draw
  drawWorld();

  //bind the tooltips
  d3.select(context.canvas).on("mousemove click",function(){
    d3.select('h2').style('color', 'pink');
    let mouse = d3.mouse(this);
    let closest = tooltipQuadtree.find(mouse[0], mouse[1], 10);
    var toolTip = d3.select('#tooltip')
    //var circle = d3.select('#circle')

    //tooltipPositionsSentences = tooltipPositionsSentences.sort((a, b) => b.length - a.length);
    
    if(closest){
      var list_length = tooltipPositionsSentences[closest.join(",")].length
      if(list_length == 7)
      {
        sentences_fin = tooltipPositionsSentences[closest.join(",")].slice(2, list_length)
      }
      else if(list_length == 6){
        sentences_fin = tooltipPositionsSentences[closest.join(",")].slice(1, list_length)
      }
      else if(list_length == 0){
        sentences_fin = tooltipPositionsSentences[closest.join(",")]
      }      
      else{
        sentences_fin = tooltipPositionsSentences[closest.join(",")].slice(0, list_length)
      }
      var color_pick = year_colors["y_" + tooltipPositionsYear[closest.join(",")].toString()]

      //"@"+ list_length + ', ' + sentences_fin
      toolTip.style('opacity', 0.8)
        .style('background', 'transparent')
        .style('position', 'absolute')
        .style('color', 'white')
        .style('pointer-events', 'none')
        .style('border-color', 'white')
			  .style('top', 15 + 'px')
			  .style('left', 15 + 'px')
				.html(()=>{
          let innerTableContent = '<h2 style="color:white;display:inlinet">' + tooltipPositionsIndex[closest.join(",")] + '</h2>'
          innerTableContent += '<h3 style="color:' + color_pick + '";display:inline;font-family: "IBM Plex Mono", monospace;>' + tooltipPositionsYear[closest.join(",")] + '</h3>'
          innerTableContent += '<ul style="list-style-type:none;">'
          sentences_fin.forEach(element => {
            innerTableContent += '<li style="border-bottom:1px solid white">' + element + '</li>'
          });
          innerTableContent += "</ul>"
          return innerTableContent
        });
    } else {
      d3.select('#tooltip')
				.style('opacity', 0)
        .style('cursor', 'default')
        .style('pointer-events', 'none')
        .html('');
    }
  });
  
    return container.node();
}
);
  main.variable(observer("mini_chart")).define("mini_chart", ["d3","twitterUsers","legend_circle"], function(d3,twitterUsers,legend_circle)
{
  var w = 200;
  var h = 50;
  var margin_left = 80;
  var margin_histo = 20;
  const svg = d3.create("svg").attr("viewBox", [0, 0, 2*w+margin_left+margin_histo, h])
  const defs = svg.append("defs");
  
  var nodes = twitterUsers;

  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "black");

  
  //// Circle Legende
  svg.append("g").attr('transform','translate(400,10) scale(0.5)').attr("color", "white").call(legend_circle);


  var data = [{"color":"#35055a","value":1869},{"color":"#3f0556","value":1870},{"color":"#580556","value":1871},{"color":"#54057e","value":1872},{"color":"#5305b8","value":1873},{"color":"#740556","value":1874},{"color":"#a82bef","value":1875},{"color":"#862bef","value":1876},{"color":"#bc96ef","value":1877},{"color":"#c581ee","value":1878},{"color":"#c581ee","value":1879}];
    var extent = d3.extent(data, d => d.value);
    
    var padding = 15;
    var width = 320;
    var innerWidth = width - (padding * 2);
    var barHeight = 10;
    var height = 28;

    var xScale = d3.scaleLinear()
        .range([0, innerWidth])
        .domain(extent);

    var xTicks = data.map(d => d.value);

    var xAxis = d3.axisBottom(xScale)
        .tickSize(barHeight)
        .tickFormat(x => x)
        .tickValues(xTicks);

    var g = svg.append("g").attr("transform", "translate(" + padding  + ", 20)");
    var linearGradient = defs.append("linearGradient").attr("id", "myGradient");
    linearGradient.selectAll("stop")
      .data(data)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color);

    g.append("rect")
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .style("fill", "url(#myGradient)");

    g.append("g")
        .call(xAxis)
        .selectAll("text")
        .style("fill", "white")
        .style("font-family", "IBM Plex Mono");
  
    return svg.node();
}
);
  main.variable(observer("axisScale")).define("axisScale", ["d3","colorScale","margin","width"], function(d3,colorScale,margin,width){return(
d3.scaleLinear()
    .domain(colorScale.domain())
    .range([margin.left, width - margin.right])
)});
  main.variable(observer("style")).define("style", ["html"], function(html){return(
html`
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap">
<style>
  @font-face {
    font-family: Messapia-Bold;
    src: url("Messapia-Bold.otf") format("opentype");
  }

  @font-face {
    font-family: Messapia-Regular;
    src: url("Messapia-Regular.otf") format("opentype");
  }

  li {
    font-family: "IBM Plex Mono", monospace;
        /* font-size: 48px; */
  }

  h2 {
    font-family: "Messapia-Regular";
  }
</style>
`
)});
  main.variable(observer("colorScale")).define("colorScale", ["d3"], function(d3){return(
d3.scaleSequential(d3.interpolatePiYG).domain([0, 42])
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 20, right: 40, bottom: 30, left: 40}
)});
  main.variable(observer("viewof spinSpeed")).define("viewof spinSpeed", ["slider"], function(slider){return(
slider({min: 0, max: 3, value: 0.4})
)});
  main.variable(observer("spinSpeed")).define("spinSpeed", ["Generators", "viewof spinSpeed"], (G, _) => G.input(_));
  main.variable(observer("legend_circle")).define("legend_circle", ["legendCircle","d3","twitterUsers"], function(legendCircle,d3,twitterUsers){return(
legendCircle()
    .tickValues([5, 30, 100]) 
    .tickFormat((d, i) => i >= 1 ? d3.format("~s")(d) + " mentions" : d + " mentions")
    .scale(
      d3.scaleSqrt()
        .domain([0, d3.max(twitterUsers, d => d3.max([10^6, + parseInt(d.properties.Counts)]))])
        .range([5, 30])
    )
    .tickSize(10)
)});
  main.variable(observer("viewof lineWidth")).define("viewof lineWidth", ["slider"], function(slider){return(
slider({min: 0.01, max: 5, value: 0.35})
)});
  main.variable(observer("lineWidth")).define("lineWidth", ["Generators", "viewof lineWidth"], (G, _) => G.input(_));
  main.variable(observer("viewof quakeSize")).define("viewof quakeSize", ["slider"], function(slider){return(
slider({min: 1, max: 20, value: 10})
)});
  main.variable(observer("quakeSize")).define("quakeSize", ["Generators", "viewof quakeSize"], (G, _) => G.input(_));
  main.define("initial globe_rotation", function(){return(
{x: 180, y:0}
)});
  main.variable(observer("mutable globe_rotation")).define("mutable globe_rotation", ["Mutable", "initial globe_rotation"], (M, _) => new M(_));
  main.variable(observer("globe_rotation")).define("globe_rotation", ["mutable globe_rotation"], _ => _.generator);
  main.define("initial mouse", function(){return(
{x: 0, y: 0}
)});
  main.variable(observer("mutable mouse")).define("mutable mouse", ["Mutable", "initial mouse"], (M, _) => new M(_));
  main.variable(observer("mouse")).define("mouse", ["mutable mouse"], _ => _.generator);
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Appendix
This follows the Observable convention of putting the script imports, data and global objects at the bottom of the notebook, so that the top of the notebook can be focused on the output and more interesting aspects of the code. 
`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3-fetch@1", "d3-geo@1", "d3-quadtree@1", "d3@5", 'd3-geo-zoom')
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("world")).define("world", ["d3"], function(d3){return(
d3.json("https://unpkg.com/world-atlas@1/world/110m.json")
)});
  main.variable(observer("land")).define("land", ["topojson","world"], function(topojson,world){return(
topojson.feature(world, world.objects.countries)
)});
  main.variable(observer("graticule")).define("graticule", ["d3"], function(d3){return(
d3.geoGraticule10()
)});
  main.variable(observer("longitude")).define("longitude", function(){return(
50
)});
  main.variable(observer("projection")).define("projection", ["d3","longitude","width"], function(d3,longitude,width){return(
d3.geoOrthographic()
    .rotate([longitude, -20])
    .translate([width / 2, width / 2])
    .fitExtent([[300, 300], [width-300, width-300]], {type: "Sphere"})
    .precision(0.1)
)});
  main.variable(observer("quakeCircles")).define("quakeCircles", ["d3","twitterUsers","magnitudeRadius"], function(d3,twitterUsers,magnitudeRadius)
{
  const circle = d3.geoCircle();
  return twitterUsers.map(quake => {
    //console.log(quake)
    return circle.center(quake.geometry.coordinates).radius(magnitudeRadius(quake) / 5).precision(25)();    
  });
}
);
  main.variable(observer("magnitudeRadius")).define("magnitudeRadius", ["d3","quakeSize"], function(d3,quakeSize)
{
  const scale = d3.scaleSqrt().domain([0, 100]).range([2.5, quakeSize]);
  return function(quake) {
    //console.log(quake)
    console.log(scale(quake.properties.Counts * 5));
    return scale(quake.properties.Counts * 5);
  }
}
);
  main.define("initial isRotate", function(){return(
false
)});
  main.variable(observer("mutable isRotate")).define("mutable isRotate", ["Mutable", "initial isRotate"], (M, _) => new M(_));
  main.variable(observer("isRotate")).define("isRotate", ["mutable isRotate"], _ => _.generator);
  main.define("initial mouse_movement", function(){return(
false
)});
  main.variable(observer("mutable mouse_movement")).define("mutable mouse_movement", ["Mutable", "initial mouse_movement"], (M, _) => new M(_));
  main.variable(observer("mouse_movement")).define("mouse_movement", ["mutable mouse_movement"], _ => _.generator);
  main.variable(observer("onMoveStoped")).define("onMoveStoped", ["mutable isRotate","mutable mouse_movement"], function($0,$1){return(
function onMoveStoped() {
  $0.value = false
  $1.value = false
}
)});
  main.variable(observer("onMoveStarted")).define("onMoveStarted", ["mutable isRotate","mutable mouse_movement","mutable mouse"], function($0,$1,$2){return(
function onMoveStarted(e){
   $0.value = true
   $1.value = true
    $2.value = {
      x: e.offsetX,
      y: e.offsetY
    }
}
)});
  main.variable(observer("getQuadtree")).define("getQuadtree", ["d3","width"], function(d3,width){return(
function getQuadtree(){ return d3.quadtree().extent([[0, 0],[width, width]]); }
)});
  main.variable(observer("twitterUsers")).define("twitterUsers", async function(){return(
(await fetch("https://raw.githubusercontent.com/Ro0oot/spiritualist/main/all_data_with_year.geojson")).json()
)});
  main.variable(observer("twitterUsersBla")).define("twitterUsersBla", function(){return(
{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"screenName":"jpablovallejog"},"geometry":{"type":"Point","coordinates":[-75.57457,6.2459]}},{"type":"Feature","properties":{"screenName":"LindaHecht"},"geometry":{"type":"Point","coordinates":[-122.41964,37.77713]}},{"type":"Feature","properties":{"screenName":"MoravecLabs"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"SouthernSurvey"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"KoyO_JakaNeEs"},"geometry":{"type":"Point","coordinates":[36.8238,-1.28352]}},{"type":"Feature","properties":{"screenName":"RustProofLabs"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"simeone_john"},"geometry":{"type":"Point","coordinates":[-71.53661,43.20725]}},{"type":"Feature","properties":{"screenName":"zombodb"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"iKenSpatial"},"geometry":{"type":"Point","coordinates":[153.02334,-27.46844]}},{"type":"Feature","properties":{"screenName":"SeraSoleil"},"geometry":{"type":"Point","coordinates":[-106.64905,35.08423]}},{"type":"Feature","properties":{"screenName":"rburhum"},"geometry":{"type":"Point","coordinates":[-122.41964,37.77713]}},{"type":"Feature","properties":{"screenName":"cjsmith_87"},"geometry":{"type":"Point","coordinates":[151.20691,-33.8696]}},{"type":"Feature","properties":{"screenName":"presaamalahuige"},"geometry":{"type":"Point","coordinates":[-15.43973,28.13026]}},{"type":"Feature","properties":{"screenName":"KarlChastko"},"geometry":{"type":"Point","coordinates":[-79.64535,43.58691]}},{"type":"Feature","properties":{"screenName":"hollytorpey"},"geometry":{"type":"Point","coordinates":[-118.1924,33.76673]}},{"type":"Feature","properties":{"screenName":"sbmalev"},"geometry":{"type":"Point","coordinates":[-112.0758,33.44826]}},{"type":"Feature","properties":{"screenName":"JB_Spatial"},"geometry":{"type":"Point","coordinates":[146.68386,-36.36189]}},{"type":"Feature","properties":{"screenName":"tswetnam"},"geometry":{"type":"Point","coordinates":[-110.96976,32.22155]}},{"type":"Feature","properties":{"screenName":"jamesmfee"},"geometry":{"type":"Point","coordinates":[-111.93724,33.42551]}},{"type":"Feature","properties":{"screenName":"capooti"},"geometry":{"type":"Point","coordinates":[-71.10602,42.3668]}},{"type":"Feature","properties":{"screenName":"MaddieCaraway"},"geometry":{"type":"Point","coordinates":[-77.43365,37.5407]}},{"type":"Feature","properties":{"screenName":"prasadsampat"},"geometry":{"type":"Point","coordinates":[72.83486,18.94017]}},{"type":"Feature","properties":{"screenName":"grace_c_liu"},"geometry":{"type":"Point","coordinates":[-121.49085,38.57944]}},{"type":"Feature","properties":{"screenName":"mapplus"},"geometry":{"type":"Point","coordinates":[126.99989,37.55886]}},{"type":"Feature","properties":{"screenName":"rov66"},"geometry":{"type":"Point","coordinates":[-58.37344,-34.6085]}},{"type":"Feature","properties":{"screenName":"SecureFisheries"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"ddkaiser"},"geometry":{"type":"Point","coordinates":[-117.18183,34.04929]}},{"type":"Feature","properties":{"screenName":"MichaelTafel"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"carlosgis"},"geometry":{"type":"Point","coordinates":[-86.24079,12.1172]}},{"type":"Feature","properties":{"screenName":"jehb"},"geometry":{"type":"Point","coordinates":[-80.9953,35.48704]}},{"type":"Feature","properties":{"screenName":"EcoAndrewTRC"},"geometry":{"type":"Point","coordinates":[-122.27307,37.80508]}},{"type":"Feature","properties":{"screenName":"archisholm"},"geometry":{"type":"Point","coordinates":[-118.49227,34.01158]}},{"type":"Feature","properties":{"screenName":"PetersonGIS"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"pmbatty"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"engelsjk"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"joepburkinshaw"},"geometry":{"type":"Point","coordinates":[-123.15505,49.69854]}},{"type":"Feature","properties":{"screenName":"SeanMiller_Wx"},"geometry":{"type":"Point","coordinates":[-117.16171,32.71568]}},{"type":"Feature","properties":{"screenName":"APestereva"},"geometry":{"type":"Point","coordinates":[-92.44556,42.52834]}},{"type":"Feature","properties":{"screenName":"scisco7"},"geometry":{"type":"Point","coordinates":[-122.32945,47.60358]}},{"type":"Feature","properties":{"screenName":"emartinnn"},"geometry":{"type":"Point","coordinates":[4.35609,50.84439]}},{"type":"Feature","properties":{"screenName":"AvidDabbler"},"geometry":{"type":"Point","coordinates":[-90.19956,38.62775]}},{"type":"Feature","properties":{"screenName":"SJKrueg"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"AnaLeticiaGIS"},"geometry":{"type":"Point","coordinates":[-118.24532,34.05349]}},{"type":"Feature","properties":{"screenName":"heredev"},"geometry":{"type":"Point","coordinates":[13.37691,52.51605]}},{"type":"Feature","properties":{"screenName":"GuidoS"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"_arw_"},"geometry":{"type":"Point","coordinates":[-121.95509,37.35579]}},{"type":"Feature","properties":{"screenName":"Steven_Ramage"},"geometry":{"type":"Point","coordinates":[6.14275,46.20834]}},{"type":"Feature","properties":{"screenName":"AmandaDoyle212"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"akadouri"},"geometry":{"type":"Point","coordinates":[-122.32945,47.60358]}},{"type":"Feature","properties":{"screenName":"kwsSanDiego"},"geometry":{"type":"Point","coordinates":[-117.16171,32.71568]}},{"type":"Feature","properties":{"screenName":"saikofish"},"geometry":{"type":"Point","coordinates":[-73.99036,40.69246]}},{"type":"Feature","properties":{"screenName":"PatDWilson"},"geometry":{"type":"Point","coordinates":[-82.45927,27.94653]}},{"type":"Feature","properties":{"screenName":"Media_Plow"},"geometry":{"type":"Point","coordinates":[-2.32965,36.87688]}},{"type":"Feature","properties":{"screenName":"Daniel_A_Solow"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"GeoLocarta"},"geometry":{"type":"Point","coordinates":[153.02334,-27.46844]}},{"type":"Feature","properties":{"screenName":"eddie_pickle"},"geometry":{"type":"Point","coordinates":[-77.30888,38.84179]}},{"type":"Feature","properties":{"screenName":"mapmakerdavid"},"geometry":{"type":"Point","coordinates":[174.77696,-41.28948]}},{"type":"Feature","properties":{"screenName":"bentuttle1"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"juliansimioni"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"ccgeographer"},"geometry":{"type":"Point","coordinates":[-77.03196,38.89037]}},{"type":"Feature","properties":{"screenName":"Geovation"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"jonni_walker"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"jodygarnett"},"geometry":{"type":"Point","coordinates":[-123.36445,48.42855]}},{"type":"Feature","properties":{"screenName":"berdez"},"geometry":{"type":"Point","coordinates":[-77.19373,39.14036]}},{"type":"Feature","properties":{"screenName":"featherart"},"geometry":{"type":"Point","coordinates":[-121.88542,37.33866]}},{"type":"Feature","properties":{"screenName":"mpmckenna8"},"geometry":{"type":"Point","coordinates":[-122.41964,37.77713]}},{"type":"Feature","properties":{"screenName":"morganherlocker"},"geometry":{"type":"Point","coordinates":[-122.27307,37.80508]}},{"type":"Feature","properties":{"screenName":"geosmiles"},"geometry":{"type":"Point","coordinates":[-0.55865,51.32221]}},{"type":"Feature","properties":{"screenName":"roh_rohh"},"geometry":{"type":"Point","coordinates":[5.37131,43.29337]}},{"type":"Feature","properties":{"screenName":"tom_auer"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"_KristenLeach"},"geometry":{"type":"Point","coordinates":[-121.88542,37.33866]}},{"type":"Feature","properties":{"screenName":"ElisaMillerOut"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"steven4320555"},"geometry":{"type":"Point","coordinates":[-1.22409,52.76895]}},{"type":"Feature","properties":{"screenName":"setophaga"},"geometry":{"type":"Point","coordinates":[-92.09985,46.78797]}},{"type":"Feature","properties":{"screenName":"jessehattabaugh"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"FelipeSMBarros"},"geometry":{"type":"Point","coordinates":[-55.89295,-27.3661]}},{"type":"Feature","properties":{"screenName":"DanBell__"},"geometry":{"type":"Point","coordinates":[1.03963,52.40975]}},{"type":"Feature","properties":{"screenName":"yalcinomer"},"geometry":{"type":"Point","coordinates":[28.98772,41.06071]}},{"type":"Feature","properties":{"screenName":"nikkor"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"foss4gna"},"geometry":{"type":"Point","coordinates":[-117.25255,32.77752]}},{"type":"Feature","properties":{"screenName":"Detroit_Geo"},"geometry":{"type":"Point","coordinates":[-92.17784,38.57751]}},{"type":"Feature","properties":{"screenName":"MapsRus"},"geometry":{"type":"Point","coordinates":[-122.84965,49.19165]}},{"type":"Feature","properties":{"screenName":"JimKreft"},"geometry":{"type":"Point","coordinates":[-89.38644,43.07313]}},{"type":"Feature","properties":{"screenName":"grantpezeshki"},"geometry":{"type":"Point","coordinates":[-73.99036,40.69246]}},{"type":"Feature","properties":{"screenName":"JoeIngeno"},"geometry":{"type":"Point","coordinates":[-84.28065,30.43977]}},{"type":"Feature","properties":{"screenName":"GiulianoFurgol"},"geometry":{"type":"Point","coordinates":[-118.79258,34.15346]}},{"type":"Feature","properties":{"screenName":"katiepatrick"},"geometry":{"type":"Point","coordinates":[-122.41964,37.77713]}},{"type":"Feature","properties":{"screenName":"jer_hanks"},"geometry":{"type":"Point","coordinates":[-111.88822,40.76031]}},{"type":"Feature","properties":{"screenName":"KSundeen"},"geometry":{"type":"Point","coordinates":[-92.09985,46.78797]}},{"type":"Feature","properties":{"screenName":"Carlillo"},"geometry":{"type":"Point","coordinates":[-3.69367,40.43884]}},{"type":"Feature","properties":{"screenName":"maralmart"},"geometry":{"type":"Point","coordinates":[-46.32806,-23.96127]}},{"type":"Feature","properties":{"screenName":"fullstackpanic"},"geometry":{"type":"Point","coordinates":[121.56355,25.03737]}},{"type":"Feature","properties":{"screenName":"KylerJohnson26"},"geometry":{"type":"Point","coordinates":[-84.39111,33.74832]}},{"type":"Feature","properties":{"screenName":"elylucas"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"ragres2011"},"geometry":{"type":"Point","coordinates":[9.98766,48.39717]}},{"type":"Feature","properties":{"screenName":"emile_hay"},"geometry":{"type":"Point","coordinates":[28.04007,-26.20491]}},{"type":"Feature","properties":{"screenName":"AhmedAbdulla"},"geometry":{"type":"Point","coordinates":[47.97142,29.37321]}},{"type":"Feature","properties":{"screenName":"crossphd"},"geometry":{"type":"Point","coordinates":[-118.24532,34.05349]}},{"type":"Feature","properties":{"screenName":"i_ameztoy"},"geometry":{"type":"Point","coordinates":[8.61252,45.81453]}},{"type":"Feature","properties":{"screenName":"puchalskidamian"},"geometry":{"type":"Point","coordinates":[21.01038,52.2356]}},{"type":"Feature","properties":{"screenName":"ThClemen"},"geometry":{"type":"Point","coordinates":[9.99183,53.55375]}},{"type":"Feature","properties":{"screenName":"AllanWalkerIT"},"geometry":{"type":"Point","coordinates":[-121.49085,38.57944]}},{"type":"Feature","properties":{"screenName":"mcculloughrt"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"AustenAngell"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"timurmeyster"},"geometry":{"type":"Point","coordinates":[-122.41964,37.77713]}},{"type":"Feature","properties":{"screenName":"Mengistiekindu"},"geometry":{"type":"Point","coordinates":[13.37691,52.51605]}},{"type":"Feature","properties":{"screenName":"tmartinNYC"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"kompheakmomz"},"geometry":{"type":"Point","coordinates":[104.87901,11.55251]}},{"type":"Feature","properties":{"screenName":"geoderek"},"geometry":{"type":"Point","coordinates":[-63.30392,44.7382]}},{"type":"Feature","properties":{"screenName":"troyaqgis"},"geometry":{"type":"Point","coordinates":[19.93243,50.06045]}},{"type":"Feature","properties":{"screenName":"Julien_Lau"},"geometry":{"type":"Point","coordinates":[1.44864,43.60579]}},{"type":"Feature","properties":{"screenName":"andy_ict2u"},"geometry":{"type":"Point","coordinates":[-122.84965,49.19165]}},{"type":"Feature","properties":{"screenName":"mponeill"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"g_fiske"},"geometry":{"type":"Point","coordinates":[-70.66744,41.5277]}},{"type":"Feature","properties":{"screenName":"d_kerkow"},"geometry":{"type":"Point","coordinates":[13.37691,52.51605]}},{"type":"Feature","properties":{"screenName":"LocalEyesBV"},"geometry":{"type":"Point","coordinates":[4.90788,52.36994]}},{"type":"Feature","properties":{"screenName":"jarnaldich"},"geometry":{"type":"Point","coordinates":[2.17001,41.38804]}},{"type":"Feature","properties":{"screenName":"kemby_geo"},"geometry":{"type":"Point","coordinates":[-72.57627,44.2603]}},{"type":"Feature","properties":{"screenName":"pakastin"},"geometry":{"type":"Point","coordinates":[24.93266,60.17116]}},{"type":"Feature","properties":{"screenName":"undertheraedar"},"geometry":{"type":"Point","coordinates":[-1.46455,53.38311]}},{"type":"Feature","properties":{"screenName":"ChrispinCharles"},"geometry":{"type":"Point","coordinates":[39.26765,-6.78322]}},{"type":"Feature","properties":{"screenName":"julie19950905"},"geometry":{"type":"Point","coordinates":[119.54391,32.42726]}},{"type":"Feature","properties":{"screenName":"ajjumbas"},"geometry":{"type":"Point","coordinates":[-123.36445,48.42855]}},{"type":"Feature","properties":{"screenName":"brymcbride"},"geometry":{"type":"Point","coordinates":[-73.8857,42.81902]}},{"type":"Feature","properties":{"screenName":"Mappingist"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"PhoenixDev82"},"geometry":{"type":"Point","coordinates":[-0.18868,51.90561]}},{"type":"Feature","properties":{"screenName":"HSchernthanner"},"geometry":{"type":"Point","coordinates":[13.04784,52.39962]}},{"type":"Feature","properties":{"screenName":"ericgrysko"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"reginaobe"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"philshapiro"},"geometry":{"type":"Point","coordinates":[-77.03196,38.89037]}},{"type":"Feature","properties":{"screenName":"tchaddad"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"qiqing1220"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"foszterface"},"geometry":{"type":"Point","coordinates":[-76.49014,38.97679]}},{"type":"Feature","properties":{"screenName":"jomendezdev"},"geometry":{"type":"Point","coordinates":[-80.19773,25.77481]}},{"type":"Feature","properties":{"screenName":"SCGIS"},"geometry":{"type":"Point","coordinates":[-121.89648,36.59821]}},{"type":"Feature","properties":{"screenName":"JoshdelaRosa1"},"geometry":{"type":"Point","coordinates":[-73.82999,40.714]}},{"type":"Feature","properties":{"screenName":"raychal8"},"geometry":{"type":"Point","coordinates":[34.99707,-15.78714]}},{"type":"Feature","properties":{"screenName":"Muswellhilbilly"},"geometry":{"type":"Point","coordinates":[-103.35104,20.68758]}},{"type":"Feature","properties":{"screenName":"marsh"},"geometry":{"type":"Point","coordinates":[-71.09845,42.38675]}},{"type":"Feature","properties":{"screenName":"CartoView"},"geometry":{"type":"Point","coordinates":[31.2486,30.04993]}},{"type":"Feature","properties":{"screenName":"gwais"},"geometry":{"type":"Point","coordinates":[-87.63245,41.88425]}},{"type":"Feature","properties":{"screenName":"enthought"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"timmcgrath"},"geometry":{"type":"Point","coordinates":[-122.13158,47.67858]}},{"type":"Feature","properties":{"screenName":"billdollins"},"geometry":{"type":"Point","coordinates":[-76.69414,38.37439]}},{"type":"Feature","properties":{"screenName":"pg_xocolatl"},"geometry":{"type":"Point","coordinates":[2.34141,48.85718]}},{"type":"Feature","properties":{"screenName":"_davidtolosa"},"geometry":{"type":"Point","coordinates":[-62.73224,-35.97378]}},{"type":"Feature","properties":{"screenName":"BuildSoil"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"44_Below"},"geometry":{"type":"Point","coordinates":[151.11586,-33.86285]}},{"type":"Feature","properties":{"screenName":"dukestep"},"geometry":{"type":"Point","coordinates":[-73.55469,45.51241]}},{"type":"Feature","properties":{"screenName":"crossjam"},"geometry":{"type":"Point","coordinates":[-77.03196,38.89037]}},{"type":"Feature","properties":{"screenName":"mdsumner"},"geometry":{"type":"Point","coordinates":[147.33163,-42.88164]}},{"type":"Feature","properties":{"screenName":"annekatrien_d"},"geometry":{"type":"Point","coordinates":[4.35609,50.84439]}},{"type":"Feature","properties":{"screenName":"dtseiler"},"geometry":{"type":"Point","coordinates":[-87.66172,44.10788]}},{"type":"Feature","properties":{"screenName":"hmert"},"geometry":{"type":"Point","coordinates":[28.98772,41.06071]}},{"type":"Feature","properties":{"screenName":"tristan_"},"geometry":{"type":"Point","coordinates":[151.28724,-33.79471]}},{"type":"Feature","properties":{"screenName":"Adrien_nayrat"},"geometry":{"type":"Point","coordinates":[-0.37686,39.46895]}},{"type":"Feature","properties":{"screenName":"misterpalomar"},"geometry":{"type":"Point","coordinates":[11.87172,45.40944]}},{"type":"Feature","properties":{"screenName":"PhilipWhere"},"geometry":{"type":"Point","coordinates":[102.61985,17.94743]}},{"type":"Feature","properties":{"screenName":"Yakus"},"geometry":{"type":"Point","coordinates":[-3.92911,50.38729]}},{"type":"Feature","properties":{"screenName":"kcruickshanks1"},"geometry":{"type":"Point","coordinates":[24.29043,-26.87612]}},{"type":"Feature","properties":{"screenName":"Alex_Recruits"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"root676"},"geometry":{"type":"Point","coordinates":[16.36843,48.20263]}},{"type":"Feature","properties":{"screenName":"andytower_rus"},"geometry":{"type":"Point","coordinates":[30.30605,59.93318]}},{"type":"Feature","properties":{"screenName":"danrenner"},"geometry":{"type":"Point","coordinates":[-100.35001,44.36905]}},{"type":"Feature","properties":{"screenName":"govertschoof"},"geometry":{"type":"Point","coordinates":[6.57357,53.21716]}},{"type":"Feature","properties":{"screenName":"stephenlead"},"geometry":{"type":"Point","coordinates":[151.20691,-33.8696]}},{"type":"Feature","properties":{"screenName":"NorthRiverGeo"},"geometry":{"type":"Point","coordinates":[-73.6044,41.41368]}},{"type":"Feature","properties":{"screenName":"gstaubli"},"geometry":{"type":"Point","coordinates":[-76.70087,45.34633]}},{"type":"Feature","properties":{"screenName":"DevEarley"},"geometry":{"type":"Point","coordinates":[-80.0627,26.52891]}},{"type":"Feature","properties":{"screenName":"xarmatzis"},"geometry":{"type":"Point","coordinates":[23.7364,37.97614]}},{"type":"Feature","properties":{"screenName":"CanadianGIS"},"geometry":{"type":"Point","coordinates":[-75.69116,45.42179]}},{"type":"Feature","properties":{"screenName":"andyfleming"},"geometry":{"type":"Point","coordinates":[-117.16171,32.71568]}},{"type":"Feature","properties":{"screenName":"EdKrassen"},"geometry":{"type":"Point","coordinates":[-81.86793,26.64085]}},{"type":"Feature","properties":{"screenName":"Kartogishenko"},"geometry":{"type":"Point","coordinates":[13.70616,55.6316]}},{"type":"Feature","properties":{"screenName":"Geoffmuse"},"geometry":{"type":"Point","coordinates":[149.12656,-35.30655]}},{"type":"Feature","properties":{"screenName":"geo_njgs"},"geometry":{"type":"Point","coordinates":[-8.68107,40.17778]}},{"type":"Feature","properties":{"screenName":"MateoNeira"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"_walkermatt"},"geometry":{"type":"Point","coordinates":[-2.22223,52.19107]}},{"type":"Feature","properties":{"screenName":"FlxKu"},"geometry":{"type":"Point","coordinates":[13.37691,52.51605]}},{"type":"Feature","properties":{"screenName":"jeremy_morley"},"geometry":{"type":"Point","coordinates":[-1.13452,52.96195]}},{"type":"Feature","properties":{"screenName":"UUDreams"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"drcrescencio"},"geometry":{"type":"Point","coordinates":[-43.17501,-22.91216]}},{"type":"Feature","properties":{"screenName":"nickrsan"},"geometry":{"type":"Point","coordinates":[-121.49085,38.57944]}},{"type":"Feature","properties":{"screenName":"daranzolin"},"geometry":{"type":"Point","coordinates":[-121.49085,38.57944]}},{"type":"Feature","properties":{"screenName":"mabecker89"},"geometry":{"type":"Point","coordinates":[-113.49037,53.54624]}},{"type":"Feature","properties":{"screenName":"laura_mugeha"},"geometry":{"type":"Point","coordinates":[36.8238,-1.28352]}},{"type":"Feature","properties":{"screenName":"styfle"},"geometry":{"type":"Point","coordinates":[-76.78087,17.93876]}},{"type":"Feature","properties":{"screenName":"JianghaoWang"},"geometry":{"type":"Point","coordinates":[116.38766,39.90657]}},{"type":"Feature","properties":{"screenName":"B_Anbar"},"geometry":{"type":"Point","coordinates":[32.85393,39.92109]}},{"type":"Feature","properties":{"screenName":"ThomasG77"},"geometry":{"type":"Point","coordinates":[-1.55306,47.21812]}},{"type":"Feature","properties":{"screenName":"shaaf99"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"rahuldave"},"geometry":{"type":"Point","coordinates":[153.35453,-28.07623]}},{"type":"Feature","properties":{"screenName":"tcollen"},"geometry":{"type":"Point","coordinates":[-93.09648,44.94339]}},{"type":"Feature","properties":{"screenName":"rjhale"},"geometry":{"type":"Point","coordinates":[-85.30947,35.04672]}},{"type":"Feature","properties":{"screenName":"HennessyAB"},"geometry":{"type":"Point","coordinates":[-103.39335,20.72163]}},{"type":"Feature","properties":{"screenName":"guzilop"},"geometry":{"type":"Point","coordinates":[-56.16293,-34.87417]}},{"type":"Feature","properties":{"screenName":"Brian_Bancroft"},"geometry":{"type":"Point","coordinates":[-79.58589,43.55143]}},{"type":"Feature","properties":{"screenName":"pcrickard"},"geometry":{"type":"Point","coordinates":[-106.64905,35.08423]}},{"type":"Feature","properties":{"screenName":"s3t0m"},"geometry":{"type":"Point","coordinates":[-122.44164,47.25514]}},{"type":"Feature","properties":{"screenName":"eaj"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"dogvile"},"geometry":{"type":"Point","coordinates":[-86.98262,34.81185]}},{"type":"Feature","properties":{"screenName":"balijepalli"},"geometry":{"type":"Point","coordinates":[73.85302,18.50422]}},{"type":"Feature","properties":{"screenName":"johnjreiser"},"geometry":{"type":"Point","coordinates":[-75.11104,39.70747]}},{"type":"Feature","properties":{"screenName":"AubreyRhea"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"cunningham_sw"},"geometry":{"type":"Point","coordinates":[4.36535,52.00878]}},{"type":"Feature","properties":{"screenName":"therriaultphd"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"atanas"},"geometry":{"type":"Point","coordinates":[-74.7594,40.21788]}},{"type":"Feature","properties":{"screenName":"jasonmcvay"},"geometry":{"type":"Point","coordinates":[-122.15414,37.46039]}},{"type":"Feature","properties":{"screenName":"rahulpathak"},"geometry":{"type":"Point","coordinates":[-122.32945,47.60358]}},{"type":"Feature","properties":{"screenName":"Geospex"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"erikfriesen"},"geometry":{"type":"Point","coordinates":[-96.7954,32.77816]}},{"type":"Feature","properties":{"screenName":"Iron_Hayden"},"geometry":{"type":"Point","coordinates":[-79.99734,40.43851]}},{"type":"Feature","properties":{"screenName":"tjukanov"},"geometry":{"type":"Point","coordinates":[24.93266,60.17116]}},{"type":"Feature","properties":{"screenName":"howardbutler"},"geometry":{"type":"Point","coordinates":[-91.52654,41.65783]}},{"type":"Feature","properties":{"screenName":"tomfitzwater"},"geometry":{"type":"Point","coordinates":[-77.03196,38.89037]}},{"type":"Feature","properties":{"screenName":"brandynfriedly"},"geometry":{"type":"Point","coordinates":[-93.26494,44.97902]}},{"type":"Feature","properties":{"screenName":"DanJFord"},"geometry":{"type":"Point","coordinates":[-75.16218,39.95223]}},{"type":"Feature","properties":{"screenName":"Gared_nc"},"geometry":{"type":"Point","coordinates":[-107.39446,24.80774]}},{"type":"Feature","properties":{"screenName":"ajwrtly"},"geometry":{"type":"Point","coordinates":[-89.38644,43.07313]}},{"type":"Feature","properties":{"screenName":"battistella_l"},"geometry":{"type":"Point","coordinates":[8.61252,45.81453]}},{"type":"Feature","properties":{"screenName":"TinaACormier"},"geometry":{"type":"Point","coordinates":[-70.25668,43.65915]}},{"type":"Feature","properties":{"screenName":"NixOdieny"},"geometry":{"type":"Point","coordinates":[36.8238,-1.28352]}},{"type":"Feature","properties":{"screenName":"JvlioNovoa"},"geometry":{"type":"Point","coordinates":[-123.36445,48.42855]}},{"type":"Feature","properties":{"screenName":"tabinfl"},"geometry":{"type":"Point","coordinates":[-84.28065,30.43977]}},{"type":"Feature","properties":{"screenName":"josepheconway"},"geometry":{"type":"Point","coordinates":[-117.16171,32.71568]}},{"type":"Feature","properties":{"screenName":"TheSteve0"},"geometry":{"type":"Point","coordinates":[-122.03099,36.97425]}},{"type":"Feature","properties":{"screenName":"jessebishop"},"geometry":{"type":"Point","coordinates":[-69.96744,43.91403]}},{"type":"Feature","properties":{"screenName":"Brideau"},"geometry":{"type":"Point","coordinates":[-79.38545,43.6487]}},{"type":"Feature","properties":{"screenName":"frankbroniewski"},"geometry":{"type":"Point","coordinates":[6.9985,49.23174]}},{"type":"Feature","properties":{"screenName":"j_masselink"},"geometry":{"type":"Point","coordinates":[-122.32945,47.60358]}},{"type":"Feature","properties":{"screenName":"sven_s8"},"geometry":{"type":"Point","coordinates":[6.63629,49.75735]}},{"type":"Feature","properties":{"screenName":"rukku"},"geometry":{"type":"Point","coordinates":[121.05151,14.64766]}},{"type":"Feature","properties":{"screenName":"Banderkat"},"geometry":{"type":"Point","coordinates":[-75.16218,39.95223]}},{"type":"Feature","properties":{"screenName":"dangelo_guille"},"geometry":{"type":"Point","coordinates":[-56.16293,-34.87417]}},{"type":"Feature","properties":{"screenName":"flippinGeo"},"geometry":{"type":"Point","coordinates":[-76.59642,39.29086]}},{"type":"Feature","properties":{"screenName":"kspatial"},"geometry":{"type":"Point","coordinates":[-104.99202,39.74001]}},{"type":"Feature","properties":{"screenName":"nattyman512"},"geometry":{"type":"Point","coordinates":[-97.33558,37.68698]}},{"type":"Feature","properties":{"screenName":"JackPhan"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"abhishekrungta"},"geometry":{"type":"Point","coordinates":[77.21722,28.63095]}},{"type":"Feature","properties":{"screenName":"ag_grid"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"AJChadha"},"geometry":{"type":"Point","coordinates":[-0.0074,51.48858]}},{"type":"Feature","properties":{"screenName":"braigns"},"geometry":{"type":"Point","coordinates":[28.04007,-26.20491]}},{"type":"Feature","properties":{"screenName":"th3brink"},"geometry":{"type":"Point","coordinates":[-113.5833,37.10977]}},{"type":"Feature","properties":{"screenName":"RobTiffany"},"geometry":{"type":"Point","coordinates":[-122.32945,47.60358]}},{"type":"Feature","properties":{"screenName":"bdarfler"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"RespectYourself"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"ericmarcus"},"geometry":{"type":"Point","coordinates":[0.11162,52.20993]}},{"type":"Feature","properties":{"screenName":"MHugi"},"geometry":{"type":"Point","coordinates":[0.08485,51.95695]}},{"type":"Feature","properties":{"screenName":"vasilisgiannak"},"geometry":{"type":"Point","coordinates":[25.87524,40.84532]}},{"type":"Feature","properties":{"screenName":"MicheleTobias"},"geometry":{"type":"Point","coordinates":[-121.74458,38.5467]}},{"type":"Feature","properties":{"screenName":"tomchadwin"},"geometry":{"type":"Point","coordinates":[-76.79589,40.88815]}},{"type":"Feature","properties":{"screenName":"PKG_SE"},"geometry":{"type":"Point","coordinates":[78.04889,30.30952]}},{"type":"Feature","properties":{"screenName":"natedogreimer"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"jaredowenbeck"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"MikeTreglia"},"geometry":{"type":"Point","coordinates":[-74.07528,40.64243]}},{"type":"Feature","properties":{"screenName":"MichelleACady"},"geometry":{"type":"Point","coordinates":[-76.26215,42.1027]}},{"type":"Feature","properties":{"screenName":"jabiinfante"},"geometry":{"type":"Point","coordinates":[-2.9453,43.2689]}},{"type":"Feature","properties":{"screenName":"ryanfujiwara"},"geometry":{"type":"Point","coordinates":[-90.19956,38.62775]}},{"type":"Feature","properties":{"screenName":"stevenrepka"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}},{"type":"Feature","properties":{"screenName":"geomenke"},"geometry":{"type":"Point","coordinates":[-106.64905,35.08423]}},{"type":"Feature","properties":{"screenName":"BenNadel"},"geometry":{"type":"Point","coordinates":[-73.86787,41.03918]}},{"type":"Feature","properties":{"screenName":"scottpdawson"},"geometry":{"type":"Point","coordinates":[-76.66467,42.54209]}},{"type":"Feature","properties":{"screenName":"brytlytdb"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"CesareMontresor"},"geometry":{"type":"Point","coordinates":[10.99171,45.43832]}},{"type":"Feature","properties":{"screenName":"bellasi"},"geometry":{"type":"Point","coordinates":[-69.89139,18.47185]}},{"type":"Feature","properties":{"screenName":"droxburgh"},"geometry":{"type":"Point","coordinates":[-114.06301,51.04533]}},{"type":"Feature","properties":{"screenName":"zdulli"},"geometry":{"type":"Point","coordinates":[-77.03196,38.89037]}},{"type":"Feature","properties":{"screenName":"endriraco"},"geometry":{"type":"Point","coordinates":[19.82517,41.32232]}},{"type":"Feature","properties":{"screenName":"Alegion"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"MrDataScience"},"geometry":{"type":"Point","coordinates":[-74.54816,40.70615]}},{"type":"Feature","properties":{"screenName":"ntweetor"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"Geomatching"},"geometry":{"type":"Point","coordinates":[5.71224,52.84411]}},{"type":"Feature","properties":{"screenName":"GeoXite"},"geometry":{"type":"Point","coordinates":[-70.65002,-33.43722]}},{"type":"Feature","properties":{"screenName":"eveyeti"},"geometry":{"type":"Point","coordinates":[-70.65002,-33.43722]}},{"type":"Feature","properties":{"screenName":"ghelobytes"},"geometry":{"type":"Point","coordinates":[-122.74463,53.91242]}},{"type":"Feature","properties":{"screenName":"mmacros"},"geometry":{"type":"Point","coordinates":[-58.37344,-34.6085]}},{"type":"Feature","properties":{"screenName":"Afrikanadese"},"geometry":{"type":"Point","coordinates":[-79.38545,43.6487]}},{"type":"Feature","properties":{"screenName":"Wes_Port"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"loki_president"},"geometry":{"type":"Point","coordinates":[-122.41964,37.77713]}},{"type":"Feature","properties":{"screenName":"carlesnunez"},"geometry":{"type":"Point","coordinates":[2.17001,41.38804]}},{"type":"Feature","properties":{"screenName":"jumpalottahigh"},"geometry":{"type":"Point","coordinates":[24.93266,60.17116]}},{"type":"Feature","properties":{"screenName":"SteveKitakis"},"geometry":{"type":"Point","coordinates":[-83.048,42.33168]}},{"type":"Feature","properties":{"screenName":"XebiaFr"},"geometry":{"type":"Point","coordinates":[2.34141,48.85718]}},{"type":"Feature","properties":{"screenName":"ryantsonnenberg"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"JazGreer"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"NYCworklife"},"geometry":{"type":"Point","coordinates":[-73.97291,40.7588]}},{"type":"Feature","properties":{"screenName":"Kevin_ODonovan"},"geometry":{"type":"Point","coordinates":[5.48128,43.89164]}},{"type":"Feature","properties":{"screenName":"FuriKuri"},"geometry":{"type":"Point","coordinates":[6.95517,50.94168]}},{"type":"Feature","properties":{"screenName":"JS_Codetrick"},"geometry":{"type":"Point","coordinates":[-77.03196,38.89037]}},{"type":"Feature","properties":{"screenName":"krestiadegeorge"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"colleenmclinn"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"Wingtra"},"geometry":{"type":"Point","coordinates":[8.53956,47.37708]}},{"type":"Feature","properties":{"screenName":"arnicas"},"geometry":{"type":"Point","coordinates":[4.82886,45.75943]}},{"type":"Feature","properties":{"screenName":"AmyOh89"},"geometry":{"type":"Point","coordinates":[-97.74299,30.26759]}},{"type":"Feature","properties":{"screenName":"mapdx"},"geometry":{"type":"Point","coordinates":[-122.67563,45.5118]}},{"type":"Feature","properties":{"screenName":"leonmo"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"simongerman600"},"geometry":{"type":"Point","coordinates":[144.96716,-37.81749]}},{"type":"Feature","properties":{"screenName":"MammothMapping"},"geometry":{"type":"Point","coordinates":[149.12656,-35.30655]}},{"type":"Feature","properties":{"screenName":"stevedesmond_ca"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"oeon"},"geometry":{"type":"Point","coordinates":[-120.66275,35.28579]}},{"type":"Feature","properties":{"screenName":"kukkaide"},"geometry":{"type":"Point","coordinates":[12.56756,55.67567]}},{"type":"Feature","properties":{"screenName":"botherchou"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"engingem"},"geometry":{"type":"Point","coordinates":[32.85393,39.92109]}},{"type":"Feature","properties":{"screenName":"alperdincer"},"geometry":{"type":"Point","coordinates":[32.85393,39.92109]}},{"type":"Feature","properties":{"screenName":"ivanhigueram"},"geometry":{"type":"Point","coordinates":[-87.63245,41.88425]}},{"type":"Feature","properties":{"screenName":"jacquiswartz"},"geometry":{"type":"Point","coordinates":[-118.24532,34.05349]}},{"type":"Feature","properties":{"screenName":"kgjenkins"},"geometry":{"type":"Point","coordinates":[-76.34443,42.51297]}},{"type":"Feature","properties":{"screenName":"ramiroaznar"},"geometry":{"type":"Point","coordinates":[13.37691,52.51605]}},{"type":"Feature","properties":{"screenName":"lucatero_diana"},"geometry":{"type":"Point","coordinates":[12.56756,55.67567]}},{"type":"Feature","properties":{"screenName":"fgcarto"},"geometry":{"type":"Point","coordinates":[-73.87301,45.681]}},{"type":"Feature","properties":{"screenName":"mapserving"},"geometry":{"type":"Point","coordinates":[-63.57655,44.64549]}},{"type":"Feature","properties":{"screenName":"geo_will"},"geometry":{"type":"Point","coordinates":[-123.09466,49.2712]}},{"type":"Feature","properties":{"screenName":"jgcasta"},"geometry":{"type":"Point","coordinates":[-3.79576,40.28344]}},{"type":"Feature","properties":{"screenName":"lossyrob"},"geometry":{"type":"Point","coordinates":[4.68592,45.77296]}},{"type":"Feature","properties":{"screenName":"charley_glynn"},"geometry":{"type":"Point","coordinates":[-1.4071,50.90997]}},{"type":"Feature","properties":{"screenName":"ajggeoger"},"geometry":{"type":"Point","coordinates":[-1.25951,51.7563]}},{"type":"Feature","properties":{"screenName":"goldrydigital"},"geometry":{"type":"Point","coordinates":[-0.12721,51.50643]}},{"type":"Feature","properties":{"screenName":"aborruso"},"geometry":{"type":"Point","coordinates":[13.36112,38.12207]}},{"type":"Feature","properties":{"screenName":"SanttuVP"},"geometry":{"type":"Point","coordinates":[24.93266,60.17116]}},{"type":"Feature","properties":{"screenName":"nyholt"},"geometry":{"type":"Point","coordinates":[5.29824,51.69089]}},{"type":"Feature","properties":{"screenName":"webslingerm"},"geometry":{"type":"Point","coordinates":[-84.19381,39.7592]}},{"type":"Feature","properties":{"screenName":"FirstDraftGIS"},"geometry":{"type":"Point","coordinates":[-102.4102,34.23295]}},{"type":"Feature","properties":{"screenName":"chris_whong"},"geometry":{"type":"Point","coordinates":[-73.99036,40.69246]}},{"type":"Feature","properties":{"screenName":"Lea_LSF"},"geometry":{"type":"Point","coordinates":[-76.34443,42.51297]}},{"type":"Feature","properties":{"screenName":"SocialInBoston"},"geometry":{"type":"Point","coordinates":[-71.05675,42.35866]}},{"type":"Feature","properties":{"screenName":"SocialInPhoenix"},"geometry":{"type":"Point","coordinates":[-111.92544,33.65097]}},{"type":"Feature","properties":{"screenName":"m11ka"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"annakelles"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"CodeBob"},"geometry":{"type":"Point","coordinates":[-74.12998,41.33109]}},{"type":"Feature","properties":{"screenName":"rahflower"},"geometry":{"type":"Point","coordinates":[-76.49547,42.44052]}},{"type":"Feature","properties":{"screenName":"HeidiBardy"},"geometry":{"type":"Point","coordinates":[-76.30022,42.39303]}},{"type":"Feature","properties":{"screenName":"denison88"},"geometry":{"type":"Point","coordinates":[-73.99036,40.69246]}},{"type":"Feature","properties":{"screenName":"simonstl"},"geometry":{"type":"Point","coordinates":[-76.43727,42.45537]}},{"type":"Feature","properties":{"screenName":"GlimmerGlobe"},"geometry":{"type":"Point","coordinates":[-74.92469,42.70058]}},{"type":"Feature","properties":{"screenName":"urlifenoregrets"},"geometry":{"type":"Point","coordinates":[153.42857,-28.00196]}},{"type":"Feature","properties":{"screenName":"usejquery"},"geometry":{"type":"Point","coordinates":[-2.97163,51.78604]}},{"type":"Feature","properties":{"screenName":"thehollandmill"},"geometry":{"type":"Point","coordinates":[-78.87847,42.88544]}},{"type":"Feature","properties":{"screenName":"johnnyskywalker"},"geometry":{"type":"Point","coordinates":[-74.00714,40.71455]}}]}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`
<style>
	.hiddenCanvas{
			display: none;
		}

		div#tooltip {
			position: absolute;        
			display: inline-block;
			padding: 10px;
			font-family: 'Open Sans' sans-serif;
			color: #000;
			background-color: #fff;
			border: 1px solid #999;
			border-radius: 2px;
		    pointer-events: none;
			opacity: 0;
			z-index: 1;
		}
</style>
`
)});
  main.variable(observer("legendCircle")).define("legendCircle", function(){return(
function(context){
  let scale,
      tickValues,
      tickFormat = d => d,
      tickSize = 5;
  
  function legend(context){
    let g = context.select("g");
    if (!g._groups[0][0]){
      g = context.append("g");
    }
    g.attr("transform", `translate(${[1, 1]})`);
    
    const ticks = tickValues || scale.ticks();
    
    const max = ticks[ticks.length - 1];
    
    g.selectAll("circle")
        .data(ticks.slice().reverse())
      .enter().append("circle")
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("cx", scale(max))
        .attr("cy", scale)
        .attr("r", scale);
    
    g.selectAll("line")
        .data(ticks)
      .enter().append("line")
        .attr("stroke", "currentColor")
        .attr("stroke-dasharray", "4, 2")
        .attr("x1", scale(max))
        .attr("x2", tickSize + scale(max) * 2)
        .attr("y1", d => scale(d) * 2)
        .attr("y2", d => scale(d) * 2);
    
    g.selectAll("text")
        .data(ticks)
      .enter().append("text")
        .attr("font-family", "'IBM Plex Mono', sans-serif")
        .attr("font-size", 11)
        .attr("fill", "white")
        .attr("dx", 3)
        .attr("dy", 4)
        .attr("x", tickSize + scale(max) * 2)
        .attr("y", d => scale(d) * 2)
        .text(tickFormat);
  }
  
  legend.tickSize = function(_){
    return arguments.length ? (tickSize = +_, legend) : tickSize;
  }
  
  legend.scale = function(_){
    return arguments.length ? (scale = _, legend) : scale;
  }

  legend.tickFormat = function(_){
    return arguments.length ? (tickFormat = _, legend) : tickFormat;
  }
  
  legend.tickValues = function(_){
    return arguments.length ? (tickValues = _, legend) : tickValues;
  }
  
  return legend;
}
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.import("color", child1);
  return main;
}
