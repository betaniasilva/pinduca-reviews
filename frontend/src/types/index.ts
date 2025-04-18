  export interface UsuarioRelacionado {
    id: number;
    nome: string;
    email: string;
    role: 'USER' | 'ADMIN';
  }
  
  export interface GibiFromApi {
    id: number;
    titulo: string;
    ano: number;
    sinopse: string | null;
    capaUrl: string | null;
    autor: string | null;
    usuarioId: number;
    usuario: UsuarioRelacionado | null;
  }
  
  export interface GibiCardData {
    id: number;
    titulo: string;
    ano: number;
    capaUrl: string | null;
    sinopse: string | null;
    autor: string | null;
  }

  export interface ComentarioComNota {
    id: number;
    conteudo: string;
    createdAt: string | Date; 
    gibiId: number;
    usuarioId: number;
    usuario: {
      id: number;
      nome: string;
      notas: {
        avaliacao: number;
      }[];
    } | null;
  }
  