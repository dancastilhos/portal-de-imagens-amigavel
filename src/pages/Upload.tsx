
import React, { useState } from 'react';
import PortalButton from '@/components/PortalButton';

const Upload = () => {
  const [code, setCode] = useState('');
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <span className="inline-block text-xs font-medium text-blue-600 tracking-wider uppercase">Codificação</span>
            <h1 className="text-3xl md:text-4xl font-medium text-gray-900">Upload de Código</h1>
            <p className="text-gray-500 max-w-2xl">Insira seu código abaixo para receber assistência com sua implementação.</p>
          </div>
          <PortalButton />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
          <textarea
            value={code}
            onChange={handleCodeChange}
            placeholder="Cole seu código aqui..."
            className="w-full h-96 p-6 text-gray-900 font-mono text-sm outline-none resize-none"
            spellCheck="false"
          />
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Enviar para análise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
