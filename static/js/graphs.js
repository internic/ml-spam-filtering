import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { interpolateRdYlBu, interpolateRdYlGn, interpolateYlOrRd } from "https://cdn.jsdelivr.net/npm/d3-scale-chromatic@3/+esm";

import { interpolateRgbBasis } from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Define our custom GnYlRd color scheme
const customGnYlRdColors = ['#00FF00', '#FFFF00', '#FF0000']; // Green to Yellow to Red
const interpolateGnYlRd = interpolateRgbBasis(customGnYlRdColors);

// Define a mapping from your 'color_scheme' property values to D3 color interpolators
const colorInterpolators = {
  'interpolateRdYlBu': interpolateRdYlBu,
  'interpolateRdYlGn': interpolateRdYlGn,
  'interpolateYlOrRd': interpolateYlOrRd,
  'interpolateGnYlRd': interpolateGnYlRd,
  // Add more mappings as needed
};




  function GaugeChart() {
  
    var pi = Math.PI,
        rad = pi/180,
        deg = 180/pi;
    
    var properties = {
      
      width: 700,
      height: 500,
      margin: 90,
      
      rotation: 0,
      thickness: 0.15,
      arc: 1,
      ticks: 5, 
      
      color_scheme: "interpolateRdYlGn",
      color_step: 150,
      tick_color: "#FFFFFF",
      needle_color: "#000000"
      
    };
    
    var needlePercent = 0,
        center = {},
        radii = {},
        angles = {},
        ticks = {},
        gradient = [],
        scales = {};
    
    var setCenter = (function initCenter () {
      
      center.x = properties.width / 2,
      center.y = properties.height - properties.margin;
      
      return initCenter;
      
    })();
    
    var setRadii = (function initRadii () {
      
      var base = properties.height - (2 * properties.margin);
      
      radii.base = base, 
      radii.cap = base / 15,
      radii.inner = base * (1 - properties.thickness),
      radii.outer_tick = base + 5,
      radii.tick_label = base + 15;
        
      return initRadii;
      
    })();
      
    var setAngles = (function initAngles () {
      
      var arc_complement = 1 - properties.arc;
      
      angles.arc_complement = arc_complement,
      angles.start_angle = (-pi/2) + (pi * arc_complement / 2) + (properties.rotation * rad),
      angles.end_angle = (pi/2) - (pi * arc_complement / 2) + (properties.rotation * rad);
      
      return initAngles;
      
    })();
    
    var setTicks = (function initTicks () {
    
      var sub_arc = (angles.end_angle - angles.start_angle) / (properties.ticks - 1), 
          tick_pct = 100 / (properties.ticks - 1);
  
      ticks = d3.range(properties.ticks).map(function(d) {
        var sub_angle = angles.start_angle + (sub_arc * d);
        return {
          label: (tick_pct * d).toFixed(0) + '%',
          angle: sub_angle,
          coordinates: [[sub_angle, radii.inner],
                        [sub_angle, radii.outer_tick]]
        }
      });
      
      return initTicks;
      
    })();
    

    var setGradient = (function initGradient () {
        // Access the appropriate D3 interpolator using the color scheme mapping
        var c = colorInterpolators[properties.color_scheme] || d3.interpolateViridis; // Default to interpolateViridis if not found
        
        var samples = properties.color_step,
            total_arc = angles.end_angle - angles.start_angle,
            sub_arc = total_arc / samples;
        
        gradient = d3.range(samples).map(function(d) {
          var sub_color = d / (samples - 1),
              sub_start_angle = angles.start_angle + (sub_arc * d),
              sub_end_angle = sub_start_angle + sub_arc;
          return {
            fill: c(sub_color),
            start: sub_start_angle,
            end: sub_end_angle
          }
        });
        
        return initGradient;
      })();


    
    var setScales = (function initScales () {
          
      scales.lineRadial = d3.lineRadial();
      
      scales.subArcScale = d3.arc()
        .innerRadius(radii.inner + 1)
        .outerRadius(radii.base)
        .startAngle(d => d.start)
        .endAngle(d => d.end);
  
      scales.needleScale = d3.scaleLinear()
        .domain([0, 1])
        .range([angles.start_angle, angles.end_angle]);
  
      return initScales;
      
    })();
    
    
    function updateValues () {
      
      setCenter();
      setRadii();
      setAngles();
      setTicks();
      setGradient();
      setScales();
      
    }
  
    var GaugeChart = {};
    
    GaugeChart.setProperties = function(params) {
      
      Object.keys(params).map(function(d) {
        if (d in properties)
          properties[d] = params[d];
        else 
          throw new Error('One or more parameters not accepted.');
      });  updateValues(); 
      
    }
    
    GaugeChart.getProperties = function () {
      return properties; 
    }
    
    GaugeChart.debug = function () {
      return { needlePercent, properties, center, radii, angles, ticks, gradient, svg };
    }
    
    GaugeChart.setPercentage = function (pct) {
      needlePercent = pct;
    }
    
    GaugeChart.draw = function () {
      
      var svg = d3.create("svg")
        .attr("viewBox", [0, 0, properties.width, properties.height])
  
      var gauge = svg.append("g")
        .attr("transform", `translate(${center.x}, ${center.y})`)
        .attr("class", "gauge-container");
  
      gauge.append("g")
        .attr("class", "gauge-arc")
        .selectAll("path")
        .data(gradient)
        .enter()
        .append("path")
          .attr("d", scales.subArcScale)
          .attr("fill", d => d.fill)
          .attr("stroke-width", 0.5)
          .attr("stroke", d => d.fill);
      
  
      gauge.append("g")
        .attr("class", "gauge-ticks")
        .selectAll("path")
        .data(ticks)
        .enter()
        .append("g")
          .attr("class", "tick")
          .append("path")
            .attr("d", d => scales.lineRadial(d.coordinates))
            .attr("stroke", properties.tick_color)
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("fill", "none");
  
      gauge.select("g.gauge-ticks")
        .selectAll("text")
        .data(ticks)
        .enter()
        .append("g")
          .attr("class", "tick-label")
          .append("text")
            .attr("transform", d =>
              `translate(${radii.tick_label * Math.sin(d.angle)},
                         ${-radii.tick_label * Math.cos(d.angle)})
                rotate(${d.angle * deg - pi})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", "0.67em")
            .text(d => d.label);
      
      gauge.append("g")
        .attr("class", "needle")
        .selectAll("path")
        .data([needlePercent])
        .enter()
        .append("path")
          .attr("d", d => scales.lineRadial([[0,0], [scales.needleScale(d), radii.outer_tick]]))
          .attr("stroke", properties.needle_color)
          .attr("stroke-width", 6)
          .attr("stroke-linecap", "round");
      
      gauge.select("g.needle")
        .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", radii.cap)
          .attr("stroke", properties.needle_color)
          .attr("stroke-width", 6)
          .style("fill", "white");
  
  
      return svg;
      
    }
    
    return GaugeChart;
    
  };


  function autoHeight(el) {
    var box = el.getBBox();
    return { y: box.y, h: box.height }
  }



// Function to render and append the gauge chart to the specified container
// function renderGaugeChart() {
//     // Create the gauge chart
//     let chart = GaugeChart();
//     let percentage = 0.00; // Example percentage. Should be updated to a real value from backend when the graph is live
  
//     // Set properties (customize as needed)
//     chart.setProperties({ 
//       rotation: 0,
//       thickness: 0.25,
//       arc: 1.15,
//       ticks: 11,
//       color_scheme: "interpolateYlOrRd",
//       color_step: 150,
//       tick_color: "#FFF",
//       needle_color: "#BB345B"
//     });
  
//     // Set the percentage
//     chart.setPercentage(percentage);
  
//     // Draw the chart and get the SVG node
//     let svg = chart.draw().node();
  
//     // Select the container where the chart will be displayed
//     let container = document.querySelector('.gauge-container');
  
//     // Append the SVG to the container
//     container.appendChild(svg);
//   }
  
//   // Call the function to render the chart when the document is ready
//   document.addEventListener('DOMContentLoaded', renderGaugeChart);


function renderGaugeChart(percentage = 0.00) {
    // Assuming GaugeChart is defined and set up in this file or imported
    let chart = GaugeChart();
  
    // Set properties as previously defined
    chart.setProperties({
        rotation: 0,
        thickness: 0.25,
        arc: 1.15,
        ticks: 11,
        color_scheme: "interpolateYlOrRd",
        color_step: 150,
        tick_color: "#FFF",
        needle_color: "#BB345B"
      });
  
    chart.setPercentage(percentage);
  
    let container = document.querySelector('.gauge-container');
    container.innerHTML = ''; // Clear existing chart
    container.appendChild(chart.draw().node());
}

// Make renderGaugeChart globally accessible
window.renderGaugeChart = renderGaugeChart;

// Optionally, render the initial gauge chart with 0% on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    renderGaugeChart(0.00);
});
