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
    const padX = Math.max((maxX - minX) * 0.15, 1);
    const padY = Math.max((maxY - minY) * 0.15, 1);
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }, [clusters]);

  const targetCluster = targetClusterId != null ? clusters.find(c => c.id === targetClusterId) : null;
  const dotRadius = Math.max((maxX - minX) * 0.04, 0.5);

  return (
    <div className="w-64 h-48 bg-slate-900 rounded-lg p-2 border border-slate-700 relative overflow-hidden shadow-2xl flex flex-col z-50">
      <div className="text-[11px] text-slate-300 font-semibold mb-1 text-center truncate px-2">
        {targetCluster ? `Clúster: ${targetCluster.name}` : (clusters.length > 0 ? 'Clúster no guardado' : 'Cargando mapa...')}
      </div>
      <div className="flex-1 relative w-full h-full">
        <svg 
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {clusters.map(c => {
            const r = Math.max((c.size / 10) + dotRadius, dotRadius * 0.5);
            const isTarget = c.id === targetClusterId;
            return (
              <circle
                key={c.id}
                cx={c.x}
                cy={c.y}
                r={isTarget ? r * 1.2 : r}
                fill={c.color}
                opacity={isTarget ? 0.9 : 0.3}
                stroke={isTarget ? 'white' : 'transparent'}
                strokeWidth={isTarget ? 1.5 : 0}
              />
            );
          })}

          {targetCluster && (
            <motion.circle
              cx={targetCluster.x}
              cy={targetCluster.y}
              r={dotRadius}
              fill="#ef4444"
              initial={{ opacity: 0, scale: 5, y: -dotRadius * 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />
          )}

          {targetCluster && (
            <motion.circle
              cx={targetCluster.x}
              cy={targetCluster.y}
              r={dotRadius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth={dotRadius * 0.25}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </svg>
      </div>
    </div>
  );
};
