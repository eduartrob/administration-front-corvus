import axios from 'axios';
import { API_CONFIG } from '../config/api_config';

export const ClusteringCache = {
  maps: new Map<string, { html2d: string, html3d: string }>(),
  
  getMap(tab: string) {
    return this.maps.get(tab);
  },

  async prefetchMap(tab: string) {
    if (this.maps.has(tab)) return this.maps.get(tab);
    
    try {
      const [scatterRes, htmlRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-2d-html?filter_cluster_id=${tab}`).catch(() => ({ data: '' })),
        axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-3d?filter_cluster_id=${tab}`).catch(() => ({ data: '' }))
      ]);

      const html2d = typeof scatterRes.data === 'string' ? scatterRes.data : '';
      const html3d = typeof htmlRes.data === 'string' ? htmlRes.data : '';

      if (html2d || html3d) {
        const data = { html2d, html3d };
        this.maps.set(tab, data);
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  clear() {
    this.maps.clear();
  }
};
