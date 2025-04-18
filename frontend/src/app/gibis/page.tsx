'use client';
import React, { useState, useEffect } from 'react';
import CardGibi from "@/components/CardGibi";
import InputPesquisa from "@/components/InputPesquisa";
import { useRouter } from 'next/navigation';

interface Gibi {
  id: number;
  titulo: string;
  ano: number;
  sinopse: string | null;
  capaUrl: string | null;
  autor: string | null;
}

export default function GibisPage() {
  const [gibis, setGibis] = useState<Gibi[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const router = useRouter();

  useEffect(() => {
    const buscaDados = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_URL_API;
        const apiUrl = `${baseUrl}/gibi`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Erro ao buscar gibis: ${response.status}`);
        }
        const data: Gibi[] = await response.json();
        setGibis(data);
      } catch (error) {
        console.error('Erro ao buscar gibis:', error);
      }
    };

    buscaDados();
  }, []);

  const gibisFiltrados = gibis.filter(gibi =>
    gibi.titulo.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const handleGibiClick = (id: number) => {
    router.push(`/gibi/${id}`);
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Gibis em Destaque</h1>
        <InputPesquisa setPesquisa={setPesquisa} />
        <div className="flex flex-wrap gap-4 justify-center">
          {gibisFiltrados.map(gibi => (
            <CardGibi key={gibi.id} gibi={gibi} onClick={() => handleGibiClick(gibi.id)} /> 
          ))}
        </div>
      </div>
    </>
  );
}