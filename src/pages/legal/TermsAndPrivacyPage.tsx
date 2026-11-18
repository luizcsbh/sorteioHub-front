import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const TermsAndPrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Termos de Uso e Política de Privacidade</h1>
        <p className="text-xs text-slate-500">
          Em conformidade estrita com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
        </p>
      </div>

      {/* Política de Privacidade e LGPD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b pb-4">
          <Lock className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">1. Política de Privacidade & Proteção de Dados</h2>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>1.1. Finalidade do Tratamento:</strong> A plataforma SorteioHub coleta nome, e-mail autenticado via Google, CPF e endereço exclusivamente para as finalidades legítimas de:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identificação inequívoca do participante para prevenção de fraudes e duplicidades;</li>
            <li>Validação de elegibilidade regulamentar para participação em sorteios privados;</li>
            <li>Comunicação oficial e viabilização da entrega física ou digital de prêmios conquistados.</li>
          </ul>

          <p>
            <strong>1.2. Armazenamento e Criptografia do CPF:</strong> O CPF é processado em duas camadas criptográficas: (a) Função HMAC-SHA256 determinística para controle de unicidade sem expor o número real; e (b) Criptografia AES-256-GCM para retenção segura. O CPF nunca é exibido de forma aberta em telas públicas, sendo sempre mascarado no formato <code>***.XXX.XXX-**</code>.
          </p>

          <p>
            <strong>1.3. Não Compartilhamento Comercial:</strong> Seus dados pessoais jamais serão comercializados ou cedidos a terceiros para fins de publicidade não solicitada.
          </p>
        </div>
      </div>

      {/* Conformidade Legal com Sorteios */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b pb-4">
          <FileText className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">2. Conformidade Legal & Regulamento</h2>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>2.1. Legislação Aplicável:</strong> A realização de sorteios e distribuição gratuita de prêmios no Brasil é regulada pela Lei Federal nº 5.768/1971, Decreto nº 70.951/1972 e portarias da Secretaria de Prêmios e Apostas (SPA) do Ministério da Fazenda.
          </p>
          <p>
            <strong>2.2. Responsabilidade do Administrador:</strong> O administrador do grupo fechado é o único e exclusivo responsável pela obtenção de eventuais autorizações legais exigíveis e pela veracidade e entrega dos prêmios prometidos.
          </p>
          <p>
            <strong>2.3. Motor Criptográfico:</strong> Os sorteios são operados por algoritmo criptográfico auditável sem viés estatístico (Fisher-Yates via geração segura de números aleatórios do sistema operacional). As evidências, timestamp e hash do conjunto de participantes são preservados de forma imutável para fins de auditoria.
          </p>
        </div>
      </div>
    </div>
  );
};
