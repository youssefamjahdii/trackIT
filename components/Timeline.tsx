
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Project, ProjectUpdate } from '../types';
import { COLORS } from '../constants';

interface TimelineProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
  selectedProjectId?: string;
}

const Timeline: React.FC<TimelineProps> = ({ projects, onProjectClick, selectedProjectId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeUpdate, setActiveUpdate] = useState<ProjectUpdate | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || projects.length === 0) return;

    const margin = { top: 40, right: 60, bottom: 60, left: 180 };
    const width = 900 - margin.left - margin.right;
    const height = (projects.length * 80) + margin.top + margin.bottom;

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
      .range([0, projects.length * 80])
      .padding(0.5);

    // Dependency Lines (Connectors)
    projects.forEach(project => {
      if (project.dependencies) {
        project.dependencies.forEach(depId => {
          const depProject = projects.find(p => p.id === depId);
          if (depProject) {
            const startX = x(parseDate(depProject.endDate)!);
            const startY = y(depProject.name)! + y.bandwidth() / 2;
            const endX = x(parseDate(project.startDate)!);
            const endY = y(project.name)! + y.bandwidth() / 2;

            const lineGenerator = d3.linkHorizontal()
              .x(d => d[0])
              .y(d => d[1]);

            g.append("path")
              .attr("d", lineGenerator({ source: [startX, startY], target: [endX, endY] }) as any)
              .attr("fill", "none")
              .attr("stroke", "#cbd5e1")
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5")
              .attr("opacity", 0.6);
          }
        });
      }
    });

    // Grid
    g.selectAll(".grid")
      .data(x.ticks(10))
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", projects.length * 80)
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", 1);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b '%y") as any);
    const yAxis = d3.axisLeft(y);

    g.append("g")
      .attr("transform", `translate(0,${projects.length * 80})`)
      .call(xAxis)
      .attr("class", "text-[11px] font-bold text-slate-400")
      .call(g => g.select(".domain").remove());

    g.append("g")
      .call(yAxis)
      .attr("class", "text-[11px] font-bold text-slate-700 uppercase tracking-tight")
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove());

    // Project Bars
    const bars = g.selectAll(".bar-group")
      .data(projects)
      .enter()
      .append("g")
      .attr("class", "bar-group cursor-pointer")
      .on("click", (event, d) => {
        onProjectClick?.(d.id);
      });

    bars.append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d.name)!)
      .attr("x", d => x(parseDate(d.startDate)!))
      .attr("width", d => x(parseDate(d.endDate)!) - x(parseDate(d.startDate)!))
      .attr("height", y.bandwidth())
      .attr("fill", d => d.id === selectedProjectId ? "#F57C23" : COLORS.PRIMARY)
      .attr("rx", 6)
      .attr("opacity", d => d.id === selectedProjectId ? 1 : 0.8)
      .style("transition", "all 0.3s ease");

    // Milestones
    projects.forEach(project => {
      project.updates.forEach(update => {
        const dotColor = update.status === 'DELAYED' ? COLORS.SAFRAN_RED : '#fff';
        const dotStroke = update.status === 'DELAYED' ? COLORS.SAFRAN_RED : COLORS.PRIMARY;
        const cx = x(parseDate(update.timestamp.split('T')[0])!);
        const cy = y(project.name)! + y.bandwidth() / 2;

        const milestoneGroup = g.append("g")
          .attr("transform", `translate(${cx}, ${cy})`)
          .attr("class", "milestone cursor-pointer")
          .on("click", (event) => {
            event.stopPropagation();
            setActiveUpdate(update);
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
            }
          });

        milestoneGroup.append("circle")
          .attr("r", 5)
          .attr("fill", dotColor)
          .attr("stroke", dotStroke)
          .attr("stroke-width", 2)
          .attr("class", "hover:scale-150 transition-transform");
      });
    });

  }, [projects, selectedProjectId, onProjectClick]);

  return (
    <div className="bg-white p-8 relative" ref={containerRef}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Gantt</h3>
          <h4 className="text-lg font-black text-slate-900 mt-1 italic">Roadmap Logic Map</h4>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-1 border-t-2 border-dashed border-slate-300"></div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#F57C23] rounded-sm"></div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Selected</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="w-full h-auto min-w-[800px]"></svg>
      </div>

      {activeUpdate && (
        <div 
          className="absolute z-20 animate-in fade-in zoom-in duration-200 pointer-events-auto"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y - 10}px`,
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="bg-[#002855] text-white p-4 rounded-xl shadow-2xl w-60">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#F57C23]">Update Intel</span>
              <button onClick={() => setActiveUpdate(null)} className="text-white/50 hover:text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h5 className="text-xs font-bold leading-tight mb-1">{activeUpdate.milestoneReached}</h5>
            <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-3">
              {activeUpdate.content}
            </p>
          </div>
          <div className="w-3 h-3 bg-[#002855] rotate-45 mx-auto -mt-1.5"></div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
