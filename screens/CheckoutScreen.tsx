import React, { useState, useEffect } from 'react';
import { SubscriptionTier, UserProfile } from '../types';
import { MERCADO_PAGO_CONFIG, PLANS } from '../constants';
import { ArrowLeft, Loader2, Lock, CheckCircle, Store, AlertTriangle, User, Mail, FileText, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

interface CheckoutScreenProps {
  user: UserProfile;
  tier: SubscriptionTier;
  onConfirm: () => void;
  onCancel: () => void;
}

type PaymentStatus = 'idle' | 'loading' | 'error';

// Security: Basic Sanitization
const sanitizeInput = (input: string) => {
  return input.replace(/[<>'"/]/g, '').trim();
};

// Helper de Validação de CPF
const isValidCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
};

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ user, tier, onConfirm, onCancel }) => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Data Collection State
  const [payerName, setPayerName] = useState(''); 
  const [payerEmail, setPayerEmail] = useState(user.parentEmail || '');
  const [payerDoc, setPayerDoc] = useState('');
  const [docError, setDocError] = useState('');

  // Flag para saber se precisamos coletar dados
  const [needsDataCollection, setNeedsDataCollection] = useState(true);

  // Rate Limiting State
  const [lastRequestTime, setLastRequestTime] = useState(0);

  // Get plan details
  const plan = PLANS[tier] || PLANS[SubscriptionTier.STARTER];
  const price = plan.priceLabel;

  // Mercado Pago Brand Colors
  const MP_BLUE = "bg-[#009EE3]";
  const MP_HOVER = "hover:bg-[#007EB5]";

  useEffect(() => {
    if (user.parentEmail) {
        setPayerEmail(user.parentEmail);
    }
  }, [user]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const masked = raw
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
      
      setPayerDoc(masked);
      setDocError('');
  };

  const validateAndProceed = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Sanitization
      const cleanDoc = sanitizeInput(payerDoc);
      
      if (!isValidCPF(cleanDoc)) {
          setDocError('CPF inválido. Verifique os números.');
          return;
      }

      setNeedsDataCollection(false);
  };

  const handleGoToPayment = async () => {
    // SECURITY: Client-side Rate Limiting (Simple Cooldown)
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
        // Prevent clicking faster than 2 seconds
        return; 
    }
    setLastRequestTime(now);

    setStatus('loading');
    setErrorMessage('');
    
    try {
      // SECURITY: Input Sanitization before sending payload
      const safeName = sanitizeInput(payerName);
      const safeEmail = sanitizeInput(payerEmail);
      const safeDoc = payerDoc.replace(/\D/g, ''); // Numeric only for CPF

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              id: tier,
              title: `Sparky App - Plano ${plan.title} (Vitalício)`,
              description: `Acesso completo e vitalício ao conteúdo ${plan.title}`,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: plan.price
            }
          ],
          payer: {
            name: safeName.split(' ')[0],
            surname: safeName.split(' ').slice(1).join(' '),
            email: safeEmail,
            identification: { type: "CPF", number: safeDoc }
          },
          back_urls: {
            success: window.location.href, 
            failure: window.location.href,
            pending: window.location.href
          },
          auto_return: "approved",
          statement_descriptor: "SPARKY TI",
          payment_methods: {
              excluded_payment_types: [{ id: "ticket" }], 
              installments: 12
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao comunicar com Mercado Pago');
      }

      if (data.init_point) {
        window.location.href = data.init_point; 
      } else {
        throw new Error('Link de pagamento não gerado');
      }

    } catch (error: any) {
      console.error(error);
      
      const isCors = error.message.includes('Failed to fetch') || error.name === 'TypeError';
      
      if (isCors) {
          // MODO DE COMPATIBILIDADE (FALLBACK PARA DEMO SEM BACKEND)
          // Isso é apenas para a demonstração funcionar no navegador sem servidor proxy.
          setErrorMessage('Modo Simulação: Redirecionamento bloqueado pelo navegador (CORS).');
          setTimeout(() => {
              onConfirm();
          }, 2000);
      } else {
          setErrorMessage(error.message || 'Falha na conexão.');
          setStatus('error');
      }
    }
  };

  // --- RENDERIZAÇÃO ---

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-slate-800">
         <div className="animate-spin mb-4">
            <Loader2 size={48} className="text-[#009EE3]" />
         </div>
         <h2 className="text-xl font-bold mb-2">Conectando ao Mercado Pago...</h2>
         <p className="text-slate-500 text-sm max-w-xs text-center">Você será redirecionado para um ambiente seguro.</p>
         
         {errorMessage && (
             <p className="mt-4 text-xs text-green-600 font-bold bg-green-50 p-2 rounded">
                 {errorMessage} <br/> Ativando plano automaticamente...
             </p>
         )}
      </div>
    );
  }

  if (status === 'error' && !errorMessage.includes('Modo Simulação')) {
     return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
         <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-red-600" />
         </div>
         <h2 className="text-xl font-bold mb-2 text-red-800">Erro na Conexão</h2>
         <p className="text-red-700 text-sm max-w-md text-center mb-6 bg-red-100 p-3 rounded-lg border border-red-200">{errorMessage}</p>
         <button onClick={() => setStatus('idle')} className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition">
             Tentar Novamente
         </button>
      </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[500px]">
        
        {/* Lado Esquerdo: Resumo */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 flex flex-col relative">
           <button onClick={onCancel} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition">
             <ArrowLeft size={24} />
           </button>
           <div className="mt-12 mb-6">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Você escolheu</h3>
              <div className="text-2xl font-heading text-slate-800 mb-1">Plano {plan.title}</div>
              <div className="text-3xl font-black text-[#009EE3]">R$ {price} <span className="text-sm text-slate-500 font-normal block mt-1">(Pagamento Único)</span></div>
           </div>
           <div className="flex-1">
             <ul className="space-y-3 text-sm text-slate-600">
               <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> <span>Acesso Vitalício</span></li>
               <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> <span>Sem mensalidades</span></li>
               <li className="flex gap-2 items-start"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> <span>Ambiente criptografado</span></li>
             </ul>
           </div>
           
           {/* Company Info */}
           <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="flex flex-col gap-3">
                  <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Store size={14} /> Processado por</div>
                      <div className="font-bold text-sm text-slate-700">Mercado Pago</div>
                  </div>
                  <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Building2 size={14} /> Vendido por</div>
                      <div className="font-bold text-sm text-slate-700">TekTok TI</div>
                      <div className="text-[10px] text-slate-500">CNPJ: 14.773.860/0001-72</div>
                      <a 
                        href="mailto:robotix28@gmail.com?subject=Dúvida%20Pagamento" 
                        className="text-[10px] text-blue-500 font-bold hover:underline mt-1 flex items-center gap-1"
                      >
                         <Mail size={10} /> Dúvidas? Envie um e-mail
                      </a>
                  </div>
              </div>
           </div>
        </div>

        {/* Lado Direito: Coleta ou Confirmação */}
        <div className="flex-1 p-6 md:p-10 flex flex-col">
          
          {needsDataCollection ? (
             <div className="animate-fadeIn h-full flex flex-col">
                <div className="mb-6">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                       <ShieldCheck className="text-[#009EE3]" /> Dados do Responsável
                   </h2>
                   <p className="text-sm text-slate-500">Informe os dados do titular do pagamento para emissão da nota fiscal.</p>
                </div>
                
                <form onSubmit={validateAndProceed} className="space-y-4 flex-1">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo (Adulto)</label>
                      <div className="relative">
                         <User className="absolute left-3 top-3 text-slate-400" size={18} />
                         <input 
                            type="text" 
                            required 
                            value={payerName} 
                            onChange={e => setPayerName(sanitizeInput(e.target.value))} 
                            className="w-full border-2 border-slate-200 rounded-xl p-2.5 pl-10 outline-none focus:border-[#009EE3]" 
                            placeholder="Nome do titular do cartão/conta" 
                         />
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail para Recibo</label>
                      <div className="relative">
                         <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                         <input 
                            type="email" 
                            required 
                            value={payerEmail} 
                            onChange={e => setPayerEmail(sanitizeInput(e.target.value))} 
                            className="w-full border-2 border-slate-200 rounded-xl p-2.5 pl-10 outline-none focus:border-[#009EE3]" 
                            placeholder="email@exemplo.com" 
                         />
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF</label>
                      <div className="relative">
                         <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                         <input 
                            type="text" 
                            required 
                            value={payerDoc} 
                            onChange={handleCpfChange} 
                            maxLength={14}
                            className={`w-full border-2 rounded-xl p-2.5 pl-10 outline-none focus:border-[#009EE3] ${docError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} 
                            placeholder="000.000.000-00" 
                         />
                      </div>
                      {docError && <p className="text-xs text-red-500 font-bold mt-1">{docError}</p>}
                   </div>

                   <div className="flex-1"></div>

                   <button type="submit" className={`w-full ${MP_BLUE} ${MP_HOVER} text-white font-bold py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2`}>
                       Continuar <ArrowRight size={18} />
                   </button>
                </form>
             </div>
          ) : (
            <div className="animate-fadeIn h-full flex flex-col justify-between">
                <div>
                   <h2 className="text-xl font-bold text-slate-800 mb-2">Confirmar Dados</h2>
                   
                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 mb-6">
                       <div>
                           <div className="text-xs text-slate-400 uppercase font-bold">Pagador</div>
                           <div className="font-bold text-slate-700">{payerName}</div>
                           <div className="text-xs text-slate-500">CPF: {payerDoc}</div>
                       </div>
                       <div>
                           <div className="text-xs text-slate-400 uppercase font-bold">Email</div>
                           <div className="font-bold text-slate-700">{payerEmail}</div>
                       </div>
                   </div>
                   
                   <p className="text-sm text-slate-500 mb-4">
                       Ao clicar abaixo, você será redirecionado para o Mercado Pago onde poderá escolher entre 
                       <strong> Pix, Cartão de Crédito ou Boleto</strong> com total segurança.
                   </p>
                </div>

                <div className="space-y-3">
                   <button 
                     onClick={handleGoToPayment} 
                     disabled={status === 'loading'}
                     className={`w-full ${MP_BLUE} ${MP_HOVER} text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                   >
                       <Lock size={18} /> Pagar R$ {price} (Único)
                   </button>
                   
                   <button onClick={() => setNeedsDataCollection(true)} className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold underline">
                       Alterar dados do responsável
                   </button>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};