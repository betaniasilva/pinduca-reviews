import React from 'react';
import Image from 'next/image';
import { GibiCardData } from '../types/index';

interface CardGibiProps {
  gibi: GibiCardData;   
  onClick: () => void;
}

const CardGibi: React.FC<CardGibiProps> = ({ gibi, onClick }) => {
  const placeholderImg = '/images/placeholder-gibi.png'; 
  return (
    
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-300 w-full group" 
    >
      
      <div className="relative w-full aspect-[2/3] bg-gray-200"> 
        <Image
          src={gibi.capaUrl || placeholderImg}
          alt={`Capa do gibi ${gibi.titulo}`}
          layout="fill" 
          objectFit="cover" 
          className="transition-transform duration-300 group-hover:scale-105" 
          onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
        />
      </div>
      <div className="p-3 sm:p-4"> 
        <h2 className="text-lg font-semibold text-gray-800 truncate group-hover:text-orange-600" title={gibi.titulo}>
          {gibi.titulo}
        </h2>
        <p className="text-gray-600 text-sm">{gibi.ano}</p>
        {gibi.autor && (
          <p className="text-gray-700 dark:text-gray-600 text-xs mt-1 truncate" title={`Autor: ${gibi.autor}`}>
             Autor: {gibi.autor}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardGibi;