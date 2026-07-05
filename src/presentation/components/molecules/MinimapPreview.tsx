import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface MinimapCluster {
  id: number;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface MinimapPreviewProps {
  clusters: MinimapCluster[];
  targetClusterId?: number | null;
}

const createStarPath = (cx: number, cy: number, outerRadius: number, innerRadius: number, numPoints = 5) => {
  let path = '';
  const angle = Math.PI / numPoints;
  for (let i = 0; i < 2 * numPoints; i++) {
    const r = (i % 2 === 0) ? outerRadius : innerRadius;
    const currAngle = i * angle - Math.PI / 2;
    const x = cx + Math.cos(currAngle) * r;
    const y = cy + Math.sin(currAngle) * r;
    path += (i === 0 ? 'M' : 'L') + `${x},${y} `;
  }
  return path + 'Z';
};

export const MinimapPreview: React.FC<MinimapPreviewProps> = ({ clusters, targetClusterId }) => {
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (clusters.length === 0) return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    clusters.forEach(c => {
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    });
    const padX = Math.max((maxX - minX) * 0.25, 2);
    const padY = Math.max((maxY - minY) * 0.25, 2);
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }, [clusters]);

  const targetCluster = targetClusterId != null ? clusters.find(c => c.id === targetClusterId) : null;
  const width = maxX - minX;
  const height = maxY - minY;
  const dotRadius = Math.max(width * 0.015, 0.15);

  // Generate grid lines
  const gridLines = [];
  const xStep = width / 6;
  const yStep = height / 6;
  for (let i = 1; i < 6; i++) {
    gridLines.push(<line key={`vx-${i}`} x1={minX + i * xStep} y1={minY} x2={minX + i * xStep} y2={maxY} stroke="#f0f0f0" strokeWidth={width * 0.002} />);
    gridLines.push(<line key={`hy-${i}`} x1={minX} y1={minY + i * yStep} x2={maxX} y2={minY + i * yStep} stroke="#f0f0f0" strokeWidth={height * 0.002} />);
  }

  return (
    <div className="w-80 h-56 bg-white rounded-xl p-3 border border-outline-variant/30 relative overflow-hidden shadow-2xl flex flex-col z-50">
      <div className="text-xs text-slate-700 font-semibold mb-2 text-center truncate px-2">
        {targetCluster ? `Clúster: ${targetCluster.name}` : (clusters.length > 0 ? 'Clúster no guardado' : 'Cargando mapa...')}
      </div>
      <div className="flex-1 relative w-full h-full bg-slate-50/50 rounded-lg border border-outline-variant/20">
        <svg 
          viewBox={`${minX} ${minY} ${width} ${height}`} 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {gridLines}

          {/* Ovals mimicking the Isolation Forest backgrounds */}
          <ellipse cx={(minX + maxX)/2} cy={(minY + maxY)/2} rx={width * 0.4} ry={height * 0.3} fill="#fef3c7" opacity="0.4" />
          <ellipse cx={(minX + maxX)/2} cy={(minY + maxY)/2} rx={width * 0.25} ry={height * 0.15} fill="#fde68a" opacity="0.4" />

          {clusters.map(c => {
            const isTarget = c.id === targetClusterId;
            // Draw regular clusters as small dots
            return (
              <circle
                key={c.id}
                cx={c.x}
                cy={c.y}
                r={dotRadius * 1.5}
                fill="#f59e0b"
                opacity={isTarget ? 0.2 : 0.8}
                stroke="white"
                strokeWidth={dotRadius * 0.3}
              />
            );
          })}

          {/* Target Cluster shown as a prominent red star */}
          {targetCluster && (
            <motion.path
              d={createStarPath(targetCluster.x, targetCluster.y, dotRadius * 4.5, dotRadius * 2.2)}
              fill="#ef4444"
              stroke="white"
              strokeWidth={dotRadius * 0.5}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            />
          )}
        </svg>
        
        {/* Y-axis label */}
        <div className="absolute top-1/2 -left-[6px] transform -translate-y-1/2 -rotate-90 text-[8px] font-medium text-slate-400 tracking-wider">
          UMAP Dim 2
        </div>

        {/* Legend */}
        <div className="absolute top-1 right-1 bg-white/90 border border-slate-200 rounded p-1 shadow-sm text-[9px] flex flex-col gap-1 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></div>
            <span className="text-slate-600 font-medium">Clústeres</span>
          </div>
          {targetCluster && (
            <div className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 10 10" className="overflow-visible">
                <path d={createStarPath(5, 5, 5, 2.5)} fill="#ef4444" stroke="white" strokeWidth="1" />
              </svg>
              <span className="text-slate-700 font-bold truncate max-w-[80px]" title={targetCluster.name}>
                {targetCluster.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
