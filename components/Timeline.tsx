
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Project } from '../types';

interface TimelineProps {
  projects: Project[];
}

const Timeline: React.FC<TimelineProps> = ({ projects }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || projects.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = (projects.length * 60) + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    
    const minDate = d3.min(projects, d => parseDate(d.startDate)) || new Date();
    const maxDate = d3.max(projects, d => parseDate(d.endDate)) || new Date();

    const x = d3.scaleTime()
      .domain([d3.timeMonth.offset(minDate, -1), d3.timeMonth.offset(maxDate, 1)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(projects.map(d => d.name))
      .range([0, projects.length * 60])
      .padding(0.4);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${projects.length * 60})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %Y") as any))
      .attr("class", "text-slate-400");

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("class", "text-sm font-medium text-slate-700");

    // Project Bars
    g.selectAll(".bar")
      .data(projects)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d.name)!)
      .attr("x", d => x(parseDate(d.startDate)!))
      .attr("width", d => x(parseDate(d.endDate)!) - x(parseDate(d.startDate)!))
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", "#FF9900")
      .attr("opacity", 0.8)
      .on("mouseover", function() { d3.select(this).attr("opacity", 1); })
      .on("mouseout", function() { d3.select(this).attr("opacity", 0.8); });

    // Milestones
    projects.forEach(project => {
      project.updates.forEach(update => {
        g.append("circle")
          .attr("cx", x(parseDate(update.timestamp.split('T')[0])!))
          .attr("cy", y(project.name)! + y.bandwidth() / 2)
          .attr("r", 4)
          .attr("fill", "#232F3E")
          .append("title")
          .text(update.milestoneReached);
      });
    });

  }, [projects]);

  return (
    <div className="overflow-x-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Execution Roadmap</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Timeline;
