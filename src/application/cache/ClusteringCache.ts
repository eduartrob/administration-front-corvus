import axios from 'axios';
import { API_CONFIG } from '../config/api_config';

export const ClusteringCache = {
  maps: new Map<string, { html2d: string, html3d: string }>(),
  
  getMap(tab: string, universityId?: string, careerId?: string) {
    const key = `${tab}_${universityId || ''}_${careerId || ''}`;
    return this.maps.get(key);
  },

  async prefetchMap(tab: string, universityId?: string, careerId?: string) {
    const key = `${tab}_${universityId || ''}_${careerId || ''}`;
    if (this.maps.has(key)) return this.maps.get(key);
    
    try {
      const uParam = universityId ? `&university_id=${universityId}` : '';
      const cParam = careerId ? `&career_id=${careerId}` : '';
      const [scatterRes, htmlRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-2d-html?filter_cluster_id=${tab}${uParam}${cParam}`).catch(() => ({ data: '' })),
        axios.get(`${API_CONFIG.BASE_URL}/clustering/integrator/admin/clusters-3d?filter_cluster_id=${tab}${uParam}${cParam}`).catch(() => ({ data: '' }))
      ]);

      const html2d = typeof scatterRes.data === 'string' ? scatterRes.data : '';
      const html3d = typeof htmlRes.data === 'string' ? htmlRes.data : '';

      if (html2d || html3d) {
        const data = { html2d, html3d };
        this.maps.set(key, data);
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
