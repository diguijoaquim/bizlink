import { getAuthToken } from "@/lib/api";

// Middleware para resolver problemas de MIME type com autenticação
export const authMiddleware = {
  // Intercepta requisições para forçar MIME types corretos
  beforeRequest: (request: Request) => {
    const token = getAuthToken();
    
    // Se há token de autenticação, adiciona headers específicos
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
      request.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      request.headers.set('Pragma', 'no-cache');
    }
    
    return request;
  },

  // Intercepta respostas para forçar MIME types corretos
  afterResponse: (response: Response) => {
    const url = response.url;
    
    // Força MIME types corretos baseado na extensão do arquivo
    if (url.includes('.js') || url.includes('.mjs')) {
      response.headers.set('Content-Type', 'application/javascript');
    } else if (url.includes('.css')) {
      response.headers.set('Content-Type', 'text/css');
    } else if (url.includes('.html')) {
      response.headers.set('Content-Type', 'text/html');
    }
    
    // Headers anti-cache para usuários autenticados
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
};

// Hook para usar o middleware
export const useAuthMiddleware = () => {
  return authMiddleware;
};
