// src/app/gibi/[id]/editar/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { GibiFromApi } from '@/types'; // Tipo completo do gibi vindo da API


interface EditFormData {
  titulo: string;
  ano: string;
  sinopse: string;
  capaUrl: string;
  autor: string;
}

export default function EditarGibiPage() {
  const params = useParams();
  const router = useRouter();
  // Obter estado completo do useAuth, incluindo role do user
  const { isLoggedIn, user, token, isLoading: isLoadingAuth } = useAuth();

  const id = params?.id as string | undefined;

  const [formData, setFormData] = useState<EditFormData | null>(null);
  const [isLoadingGibi, setIsLoadingGibi] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Erro para exibir no form

  // Efeito para buscar dados e verificar permissão
  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError("ID do gibi inválido."); setIsLoadingGibi(false); return;
    }
    if (isLoadingAuth) { return; } // Espera auth carregar
    if (!isLoggedIn) {
      toast.error("Faça login para editar."); router.replace(`/gibi/${id}`); return;
    }

    const fetchGibiData = async () => {
      setIsLoadingGibi(true); setError(null);
      const apiUrl = `http://localhost:3001/gibi/${id}`;
      console.log('EditarGibiPage: Buscando dados de:', apiUrl);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ erro: `Gibi não encontrado ou erro: ${response.status}` }));
          throw new Error(errorData?.erro || `Erro HTTP: ${response.status}`);
        }
        const data: GibiFromApi = await response.json();

        // --- AUTORIZAÇÃO ATUALIZADA (Dono OU Admin) ---
        const isOwner = user?.id === data.usuarioId;
        // Compara com a string 'ADMIN'. Garanta que user.role existe e tem o valor correto!
        const isAdmin = user?.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
          console.log(`Permissão negada: User ${user?.id} (Role: ${user?.role}) tentando editar gibi ${data.id} do user ${data.usuarioId}`);
          throw new Error("Você não tem permissão para editar este gibi.");
        }
        // --- FIM AUTORIZAÇÃO ---

        console.log(`Permissão concedida: User ${user?.id} (Role: ${user?.role}) editando gibi ${data.id}`);
        setFormData({
          titulo: data.titulo,
          ano: String(data.ano),
          sinopse: data.sinopse || '',
          capaUrl: data.capaUrl || '',
          autor: data.autor || '',
        });
      } catch (err: unknown) { // Tratamento com unknown
        console.error("Erro ao buscar dados para edição:", err);
        let errorMsg = "Erro ao carregar dados do gibi.";
        if (err instanceof Error) { errorMsg = err.message; } // Usa instanceof Error
        setError(errorMsg);
        toast.error(errorMsg);
        setFormData(null);
      } finally {
        setIsLoadingGibi(false);
      }
    };

    // Chama a busca (isLoggedIn já foi verificado)
    fetchGibiData();

  }, [id, isLoggedIn, user, isLoadingAuth, router]); // Dependências corretas

  // Handler de mudança (OK)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  // Handler de submit (com catch ajustado)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !isLoggedIn || !token || !id || isSubmitting) return;

    setIsSubmitting(true);
    setError(null); // Limpa erro anterior do formulário

    // Validação básica (OK)
    const anoNum = Number(formData.ano);
    if (isNaN(anoNum) || anoNum < 1900 || anoNum > new Date().getFullYear() + 5) {
        setError('Ano inválido.'); toast.error('Ano inválido.'); setIsSubmitting(false); return;
    }
    if (!formData.titulo.trim() || formData.titulo.length < 3) {
        setError('Título inválido.'); toast.error('Título inválido.'); setIsSubmitting(false); return;
    }

    const apiUrl = `http://localhost:3001/gibi/${id}`;
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ // Envia dados do form
          titulo: formData.titulo,
          ano: anoNum,
          sinopse: formData.sinopse || null,
          capaUrl: formData.capaUrl || null,
          autor: formData.autor || null,
        }),
      });
      const responseData = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseData?.erro || `Erro ao atualizar: ${response.status}`);
      }
      toast.success('Gibi atualizado com sucesso!');
      router.push(`/gibi/${id}`); // Volta para detalhes

    } catch (error: unknown) { // Tratamento com unknown
      console.error("Erro ao atualizar gibi:", error);
      let errorMessage = "Erro desconhecido ao atualizar.";
      if (error instanceof Error) { errorMessage = error.message; } // Usa instanceof
      setError(errorMessage); // Mostra erro perto do formulário
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderização ---
  // Simplificar retornos de loading/erro
  if (isLoadingAuth || isLoadingGibi) {
    return <div className="container mx-auto p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>;
  }
  // Se deu erro OU formData não foi carregado (inclui erro de permissão)
  if (error || !formData) {
    return <div className="container mx-auto p-8 text-center text-red-600">Erro: {error || "Não foi possível carregar os dados para edição."}</div>;
  }

  // Formulário
  return (
<div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-600">
        Editar Gibi
      </h1>

      {/* Container do formulário com fundo, sombra, padding */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 sm:p-8">
        <form onSubmit={handleUpdate} className="space-y-5"> {/* Espaço entre campos */}

          {/* Exibição de Erro de Submissão */}
          {error && ( // Exibe erro de submit (diferente do erro de load)
            <p className="text-red-600 text-sm text-center bg-red-100 dark:bg-red-900/30 p-3 rounded border border-red-300 dark:border-red-600">
              {error}
            </p>
          )}

          {/* Campo Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              id="titulo"
              required
              minLength={3}
              value={formData.titulo}
              onChange={handleChange}
              disabled={isSubmitting}
              // Estilo padrão para inputs
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo Ano */}
          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ano de Publicação
            </label>
            <input
              type="number"
              name="ano"
              id="ano"
              required
              value={formData.ano}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              min="1900"
              max={new Date().getFullYear() + 5}
            />
          </div>

          {/* Campo Autor */}
          <div>
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Autor <span className="text-xs text-gray-500 dark:text-gray-400">(Opcional)</span>
            </label>
            <input
              type="text"
              name="autor"
              id="autor"
              value={formData.autor}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo URL da Capa */}
          <div>
            <label htmlFor="capaUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL da Capa <span className="text-xs text-gray-500 dark:text-gray-400">(Opcional)</span>
            </label>
            <input
              type="url"
              name="capaUrl"
              id="capaUrl"
              value={formData.capaUrl}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="https://exemplo.com/capa.jpg"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo Sinopse */}
          <div>
            <label htmlFor="sinopse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sinopse <span className="text-xs text-gray-500 dark:text-gray-400">(Opcional)</span>
            </label>
            <textarea
              name="sinopse"
              id="sinopse"
              rows={5}
              value={formData.sinopse}
              onChange={handleChange}
              disabled={isSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            ></textarea>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
             {/* Botão Cancelar */}
             <button
               type="button"
               onClick={() => router.back()} // Volta para a página anterior
               disabled={isSubmitting}
               // Estilo botão secundário
               className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
              Cancelar
             </button>
             {/* Botão Salvar */}
             <button
               type="submit"
               disabled={isSubmitting}
               // Estilo botão primário (laranja)
               className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
              {isSubmitting && ( // Spinner quando estiver salvando
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              )}
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}