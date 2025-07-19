import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeGraph, KnowledgeGraphNode } from '../types';
import { GeneIcon, ProteinIcon, CompoundIcon, PathwayIcon, DiseaseIcon } from './icons';

interface KnowledgeGraphViewProps {
    graph: KnowledgeGraph;
}

const NODE_RADIUS = 30;
const FONT_SIZE = 10;

// Physics Constants - Tuned for better separation and faster settling
const REPULSION_STRENGTH = 12000;
const ATTRACTION_STRENGTH = 0.02;
const IDEAL_LENGTH_DEFAULT = 160;
const IDEAL_LENGTH_TOPIC = 250;
const DAMPING = 0.88; // Lower is more damping
const CENTER_GRAVITY = 0.015;
const SIMULATION_STOP_THRESHOLD = 0.01;

const NodeIcon: React.FC<{ type: KnowledgeGraphNode['type']; className?: string }> = ({ type, className="h-5 w-5" }) => {
    switch(type) {
        case 'Gene': return <GeneIcon className={className} />;
        case 'Protein': return <ProteinIcon className={className} />;
        case 'Compound': return <CompoundIcon className={className} />;
        case 'Pathway': return <PathwayIcon className={className} />;
        case 'Disease': return <DiseaseIcon className={className} />;
        case 'Topic': return <div className="text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.5 7a.5.5 0 00-1 0v6a.5.5 0 001 0V7zM11.5 7a.5.5 0 00-1 0v6a.5.5 0 001 0V7z" clipRule="evenodd" />
            </svg>
        </div>;
        default: return null;
    }
};

const getNodeColor = (type: KnowledgeGraphNode['type']) => {
    const colors = {
        Gene: { fill: 'rgba(16, 185, 129, 0.1)', stroke: '#10B981', text: '#D1FAE5' },
        Protein: { fill: 'rgba(59, 130, 246, 0.1)', stroke: '#3B82F6', text: '#DBEAFE' },
        Compound: { fill: 'rgba(245, 158, 11, 0.1)', stroke: '#F59E0B', text: '#FEF3C7' },
        Pathway: { fill: 'rgba(139, 92, 246, 0.1)', stroke: '#8B5CF6', text: '#E9D5FF' },
        Disease: { fill: 'rgba(239, 68, 68, 0.1)', stroke: '#EF4444', text: '#FEE2E2' },
        Topic: { fill: 'rgba(234, 179, 8, 0.2)', stroke: '#EAB308', text: '#FEF9C3' },
        Process: { fill: 'rgba(107, 114, 128, 0.1)', stroke: '#6B7280', text: '#E5E7EB' },
    };
    return colors[type] || colors['Process'];
}

const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ graph }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>({});
    const velocities = useRef<{ [id: string]: { x: number; y: number } }>({});
    const draggedNodeId = useRef<string | null>(null);
    const animationFrameId = useRef<number | undefined>(undefined);

    const simulationLoop = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.parentElement?.clientWidth || 500;
        const height = svgRef.current.parentElement?.clientHeight || 500;

        // Use a ref-like object to hold the latest positions to avoid stale closures in the loop
        const positionRef = React.createRef<{ [id: string]: { x: number; y: number } }>();
        positionRef.current = { ...positions };
        
        // Initialize positions for new nodes that aren't already positioned
        graph.nodes.forEach(node => {
            if (!positionRef.current![node.id]) {
                positionRef.current![node.id] = {
                    x: width / 2 + (Math.random() - 0.5) * 100,
                    y: height / 2 + (Math.random() - 0.5) * 100,
                };
            }
            if (!velocities.current[node.id]) {
                velocities.current[node.id] = { x: 0, y: 0 };
            }
        });
        setPositions(positionRef.current);


        simulationLoop.current = () => {
            if (!positionRef.current) return;
            const currentPositions = { ...positionRef.current };
            const forces: { [id: string]: { x: number; y: number } } = {};
            let totalKineticEnergy = 0;

            graph.nodes.forEach(node => {
                forces[node.id] = { x: 0, y: 0 };
            });

            // Repulsion force
            for (let i = 0; i < graph.nodes.length; i++) {
                for (let j = i + 1; j < graph.nodes.length; j++) {
                    const node1 = graph.nodes[i];
                    const node2 = graph.nodes[j];
                    const pos1 = currentPositions[node1.id];
                    const pos2 = currentPositions[node2.id];
                    if (!pos1 || !pos2) continue;

                    const dx = pos1.x - pos2.x;
                    const dy = pos1.y - pos2.y;
                    const distanceSquared = dx * dx + dy * dy;
                    if (distanceSquared === 0) continue;
                    
                    const distance = Math.sqrt(distanceSquared);
                    const force = REPULSION_STRENGTH / distanceSquared;

                    forces[node1.id].x += (dx / distance) * force;
                    forces[node1.id].y += (dy / distance) * force;
                    forces[node2.id].x -= (dx / distance) * force;
                    forces[node2.id].y -= (dy / distance) * force;
                }
            }

            // Attraction force (spring)
            graph.edges.forEach(edge => {
                const sourceNode = graph.nodes.find(n => n.id === edge.source);
                const targetNode = graph.nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return;
                
                const sourcePos = currentPositions[edge.source];
                const targetPos = currentPositions[edge.target];
                if(!sourcePos || !targetPos) return;

                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const idealLength = (sourceNode.type === 'Topic' || targetNode.type === 'Topic') ? IDEAL_LENGTH_TOPIC : IDEAL_LENGTH_DEFAULT;
                const displacement = distance - idealLength;
                const force = ATTRACTION_STRENGTH * displacement;

                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                forces[edge.source].x += fx;
                forces[edge.source].y += fy;
                forces[edge.target].x -= fx;
                forces[edge.target].y -= fy;
            });

            // Gravity towards center
            graph.nodes.forEach(node => {
                const pos = currentPositions[node.id];
                 if (!pos) return;
                const dx = width / 2 - pos.x;
                const dy = height / 2 - pos.y;
                forces[node.id].x += dx * CENTER_GRAVITY;
                forces[node.id].y += dy * CENTER_GRAVITY;
            });
            
            // Update velocities and positions
            const nextPositions = { ...currentPositions };
            graph.nodes.forEach(node => {
                if (draggedNodeId.current === node.id) return;
                if (!velocities.current[node.id] || !nextPositions[node.id]) return;

                const vel = velocities.current[node.id];
                vel.x = (vel.x + forces[node.id].x) * DAMPING;
                vel.y = (vel.y + forces[node.id].y) * DAMPING;
                
                totalKineticEnergy += vel.x * vel.x + vel.y * vel.y;

                nextPositions[node.id].x += vel.x;
                nextPositions[node.id].y += vel.y;
            });
            
            positionRef.current = nextPositions;
            setPositions(nextPositions);

            // Stop simulation if it has settled
            if (totalKineticEnergy < SIMULATION_STOP_THRESHOLD && !draggedNodeId.current) {
                animationFrameId.current = undefined;
            } else {
                animationFrameId.current = requestAnimationFrame(simulationLoop.current!);
            }
        };
        
        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(simulationLoop.current!);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = undefined;
            }
        };
    }, [graph]);

    const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
        draggedNodeId.current = nodeId;
        velocities.current[nodeId] = { x: 0, y: 0 };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedNodeId.current || !svgRef.current) return;
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(CTM.inverse());
        
        setPositions(prev => ({
            ...prev,
            [draggedNodeId.current!]: { x: svgP.x, y: svgP.y }
        }));
    };

    const handleMouseUp = () => {
        if (draggedNodeId.current && !animationFrameId.current) {
            // Kickstart the simulation again if it was stopped
            animationFrameId.current = requestAnimationFrame(simulationLoop.current!);
        }
        draggedNodeId.current = null;
    };

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-grab active:cursor-grabbing"
        >
            <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
                    markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7280" />
                </marker>
            </defs>
            <g className="edges">
                {graph.edges.map((edge, i) => {
                    const sourcePos = positions[edge.source];
                    const targetPos = positions[edge.target];
                    if (!sourcePos || !targetPos) return null;
                    
                    // Offset to end at the edge of the circle
                    const dx = targetPos.x - sourcePos.x;
                    const dy = targetPos.y - sourcePos.y;
                    const distance = Math.sqrt(dx*dx + dy*dy) || 1;
                    const targetX = targetPos.x - (dx / distance) * NODE_RADIUS;
                    const targetY = targetPos.y - (dy / distance) * NODE_RADIUS;
                    
                    return <line key={`${edge.source}-${edge.target}-${i}`} x1={sourcePos.x} y1={sourcePos.y} x2={targetX} y2={targetY} stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrowhead)" />;
                })}
            </g>
            <g className="nodes">
                {graph.nodes.map(node => {
                    const pos = positions[node.id];
                    if (!pos) return null;
                    const color = getNodeColor(node.type);
                    return (
                        <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} onMouseDown={(e) => handleMouseDown(e, node.id)} className="node-group">
                            <circle r={NODE_RADIUS} fill={color.fill} stroke={color.stroke} strokeWidth="2" />
                            <foreignObject x={-NODE_RADIUS} y={-NODE_RADIUS} width={NODE_RADIUS*2} height={NODE_RADIUS*2} className="pointer-events-none">
                                <div className="flex flex-col items-center justify-center h-full text-center p-1">
                                    <NodeIcon type={node.type} className="h-5 w-5 mb-0.5" />
                                    <span style={{color: color.text, fontSize: FONT_SIZE}} className="font-bold leading-tight break-words">{node.label}</span>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};

export default KnowledgeGraphView;