
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Project } from '../types';
import { COLORS } from '../constants';

interface TimelineProps {
  projects: Project[];
}

const Timeline: React.FC<TimelineProps> = ({ projects }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || projects.length === 0) return;

    const margin = { top: 40, right: 40, bottom: 60, left: 180 };
    const width = 900 - margin.left - margin.right;
    const height = (projects.length * 70) + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height}`)
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
      .range([0, projects.length * 70])
      .padding(0.4);

    // Grid
    g.selectAll(".grid")
      .data(x.ticks(10))
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", projects.length * 70)
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", 1);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b '%y") as any);
    const yAxis = d3.axisLeft(y);

    g.append("g")
      .attr("transform", `translate(0,${projects.length * 70})`)
      .call(xAxis)
      .attr("class", "text-[11px] font-bold text-slate-400")
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#e2e8f0"));

    g.append("g")
      .call(yAxis)
      .attr("class", "text-[11px] font-bold text-slate-700 uppercase tracking-tight")
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove());

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
      .attr("fill", COLORS.PRIMARY)
      .attr("rx", 10)
      .attr("opacity", 0.85);

    // Milestones
    projects.forEach(project => {
      project.updates.forEach(update => {
        const dotColor = update.status === 'DELAYED' ? COLORS.SAFRAN_RED : '#fff';
        const dotStroke = update.status === 'DELAYED' ? COLORS.SAFRAN_RED : COLORS.PRIMARY;
        
        const milestoneGroup = g.append("g")
          .attr("transform", `translate(${x(parseDate(update.timestamp.split('T')[0])!)}, ${y(project.name)! + y.bandwidth() / 2})`);

        milestoneGroup.append("circle")
          .attr("r", 6)
          .attr("fill", dotColor)
          .attr("stroke", dotStroke)
          .attr("stroke-width", 3)
          .attr("class", "cursor-help transition-transform hover:scale-125")
          .append("title")
          .text(`${update.milestoneReached} (${update.status})`);
      });
    });

  }, [projects]);

  return (
    <div className="bg-white p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Roadmap Visualization</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-Functional Timeline</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#002855] rounded-[3px]"></div>
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Duration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#002855]"></div>
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Milestone</span>
          </div>
        </div>
      </div>
      <div className="overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>
    </div>
  );
};

export default Timeline;
