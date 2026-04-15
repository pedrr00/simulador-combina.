/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Zap,
  Flame,
  Smartphone,
  ShoppingCart,
  TrendingUp,
  ChevronRight,
  Wallet,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// --- Types ---

interface FormData {
  electricityOperator: string;
  gasOperator: string;
  gasBottleDuration: number;
  telecomOperators: string[];
  mobilePhones: number;
  telecomCost: number;
  supermarkets: string[];
  supermarketSpend: number;
  supermarketReason: string;
  fuelMonthlySpend: number;
  fuelPricePerLiter: number;
}

const INITIAL_FORM_DATA: FormData = {
  electricityOperator: '',
  gasOperator: '',
  gasBottleDuration: 1,
  telecomOperators: [],
  mobilePhones: 0,
  telecomCost: 0,
  supermarkets: [],
  supermarketSpend: 0,
  supermarketReason: '',
  fuelMonthlySpend: 0,
  fuelPricePerLiter: 1.7,
};

const OPERATORS = [
  'EDP Comercial',
  'Galp Energia',
  'Endesa',
  'Iberdrola',
  'Goldenergy',
  'Outra',
];
const GAS_OPERATORS = [
  'EDP Comercial',
  'Galp Energia',
  'Goldenergy',
  'Não tenho canalizado, utilizo botija',
  'Outra',
];
const TELECOM_OPERATORS = ['MEO', 'NOS', 'Vodafone', 'NOWO', 'DIGI'];
const SUPERMARKETS = [
  'Pingo Doce',
  'Continente',
  'Auchan',
  'Intermarché',
  'Mercadona',
];
const REASONS = [
  'Preço',
  'Proximidade',
  'Qualidade',
  'Variedade',
  'Promoções/Cartão',
];

// --- Components ---

export default function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const hasInputs = formData.telecomCost > 0 || formData.supermarketSpend > 0;

  const isFullEcosystem = useMemo(() => {
    return (
      formData.supermarkets.includes('Continente') &&
      formData.telecomOperators.includes('NOS') &&
      (formData.electricityOperator === 'Galp Energia' ||
        formData.gasOperator === 'Galp Energia')
    );
  }, [formData]);

  const results = useMemo(() => {
    // 1. Calculamos primeiro o Nível com base nos serviços de utilidades
    const hasNOS = formData.telecomOperators.includes('NOS');
    const hasElecGalp = formData.electricityOperator === 'Galp Energia';
    const hasGasGalp = formData.gasOperator === 'Galp Energia';

    const combinaLevel = (hasNOS ? 1 : 0) + (hasElecGalp ? 1 : 0) + (hasGasGalp ? 1 : 0);

    // 2. Definimos a percentagem baseada no nível
    let supermarketPercent = 0;
    if (combinaLevel === 1) supermarketPercent = 0.02;      // 2%
    else if (combinaLevel === 2) supermarketPercent = 0.05; // 5%
    else if (combinaLevel === 3) supermarketPercent = 0.10; // 10%

    // 3. Calculamos o valor do Cashback (Gasto * Percentagem)
    const cashbackSupermarket = (formData.supermarketSpend || 0) * supermarketPercent;
 
    // 4. Telecom logic (NOS Proposal)
    let newTelecomValue = 45.49;
    if (formData.mobilePhones === 1) newTelecomValue = 59.99;
    else if (formData.mobilePhones === 2) newTelecomValue = 67.99;
    else if (formData.mobilePhones === 3) newTelecomValue = 70.99;
    else if (formData.mobilePhones > 3)
      newTelecomValue = 70.99 + 5 * (formData.mobilePhones - 3);

    const telecomSavings = (formData.telecomCost || 0) - newTelecomValue;
    const discountEnergy = 10; 

    // 5. Combustível
    let fuelDiscountPerLiter = 0;
    if (combinaLevel === 1) fuelDiscountPerLiter = 0.2;
    else if (combinaLevel === 2) fuelDiscountPerLiter = 0.25;
    else if (combinaLevel === 3) fuelDiscountPerLiter = 0.3;

    const estimatedLiters =
      formData.fuelPricePerLiter > 0
        ? (formData.fuelMonthlySpend || 0) / formData.fuelPricePerLiter
        : 0;
    const fuelSavings = estimatedLiters * fuelDiscountPerLiter;

    const monthlySavings =
      cashbackSupermarket + telecomSavings + discountEnergy + fuelSavings;
    const annualLoss = monthlySavings * 12;
    const annualCardAccumulated = cashbackSupermarket * 12;

    // --- CRUCIAL: O return tem de incluir a nova variável supermarketPercent ---
    return {
      monthlySavings,
      annualLoss,
      annualCardAccumulated,
      cashbackSupermarket,
      supermarketPercent, // <--- ADICIONE ESTA LINHA AQUI
      telecomSavings,
      newTelecomValue,
      discountEnergy,
      fuelSavings,
      fuelDiscountPerLiter,
      combinaLevel
    };
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSelection = (
    field: 'telecomOperators' | 'supermarkets',
    item: string
  ) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      const next = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [field]: next };
    });
  };

  const reset = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-sans selection:bg-cyan-accent/30 p-8">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-accent/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-10 flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div className="flex items-center">
          <img
            src="https://i.postimg.cc/kgpfnjTV/penguin-power.png"
            alt="Penguin Power Logo"
            className="w-12 h-12 object-contain mr-3"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Ecosistema <span className="text-cyan-accent">Combina</span>
          </h1>
        </div>
        <div className="text-sm opacity-80 flex items-center">
          Simulador em Tempo Real
          <span className="ml-2 bg-cyan-accent/10 text-cyan-accent px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            LIVE
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Simulator Form (Aside) */}
        <aside className="lg:col-span-4 bg-card-bg backdrop-blur-xl border border-glass-border rounded-[24px] p-6 flex flex-col gap-6 shadow-2xl lg:sticky lg:top-8 w-full">
          <div className="text-sm uppercase text-cyan-accent font-bold tracking-widest flex items-center gap-2">
            <RefreshCcw size={14} className="animate-spin-slow" />
            Dados Atuais
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary">
              Operadora de Eletricidade
            </label>
            <select
              value={formData.electricityOperator}
              onChange={(e) =>
                handleInputChange('electricityOperator', e.target.value)
              }
              className="bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50 transition-all cursor-pointer"
            >
              <option value="" disabled>
                Selecione a operadora
              </option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary">
              Operadora de Gás
            </label>
            <select
              value={formData.gasOperator}
              onChange={(e) => handleInputChange('gasOperator', e.target.value)}
              className="bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50 transition-all cursor-pointer"
            >
              <option value="" disabled>
                Selecione a operadora
              </option>
              {GAS_OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            {formData.gasOperator ===
              'Não tenho canalizado, utilizo botija' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-2 mt-2"
              >
                <label className="text-[10px] text-text-secondary uppercase font-bold">
                  Duração da botija (em meses)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.gasBottleDuration || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'gasBottleDuration',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50"
                />
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary">
              Operadora Telecomunicações
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TELECOM_OPERATORS.map((op) => (
                <button
                  key={op}
                  onClick={() => toggleSelection('telecomOperators', op)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border ${
                    formData.telecomOperators.includes(op)
                      ? 'bg-cyan-accent/20 border-cyan-accent text-cyan-accent'
                      : 'bg-white/5 border-glass-border text-text-secondary hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      formData.telecomOperators.includes(op)
                        ? 'bg-cyan-accent border-cyan-accent'
                        : 'border-glass-border'
                    }`}
                  >
                    {formData.telecomOperators.includes(op) && (
                      <CheckCircle2 size={10} className="text-black" />
                    )}
                  </div>
                  {op}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] text-text-secondary uppercase font-bold">
                Telemóveis na Família
              </label>
              <div className="flex items-center gap-3 bg-white/5 border border-glass-border rounded-lg px-3 py-2">
                <Smartphone size={16} className="text-cyan-accent" />
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.mobilePhones}
                  onChange={(e) =>
                    handleInputChange(
                      'mobilePhones',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="bg-transparent border-none text-sm text-white focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="relative mt-2">
              <label className="text-[10px] text-text-secondary uppercase font-bold mb-1 block">
                Gasto Telecom Mensal (€)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.telecomCost || ''}
                onChange={(e) =>
                  handleInputChange(
                    'telecomCost',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50"
              />
              <span className="absolute right-3 bottom-2.5 text-xs text-text-secondary">
                €
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary">
              Preferência de Supermercado
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPERMARKETS.map((market) => (
                <button
                  key={market}
                  onClick={() => toggleSelection('supermarkets', market)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border ${
                    formData.supermarkets.includes(market)
                      ? 'bg-cyan-accent/20 border-cyan-accent text-cyan-accent'
                      : 'bg-white/5 border-glass-border text-text-secondary hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      formData.supermarkets.includes(market)
                        ? 'bg-cyan-accent border-cyan-accent'
                        : 'border-glass-border'
                    }`}
                  >
                    {formData.supermarkets.includes(market) && (
                      <CheckCircle2 size={10} className="text-black" />
                    )}
                  </div>
                  {market}
                </button>
              ))}
            </div>
            <div className="relative mt-2">
              <label className="text-[10px] text-text-secondary uppercase font-bold mb-1 block">
                Gasto Supermercado Mensal (€)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.supermarketSpend || ''}
                onChange={(e) =>
                  handleInputChange(
                    'supermarketSpend',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50"
              />
              <span className="absolute right-3 bottom-2.5 text-xs text-text-secondary">
                €
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-secondary">Combustível</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="text-[10px] text-text-secondary uppercase font-bold mb-1 block">
                    Gasto Mensal (€)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.fuelMonthlySpend || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'fuelMonthlySpend',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50"
                  />
                  <span className="absolute right-3 bottom-2.5 text-xs text-text-secondary">
                    €
                  </span>
                </div>
                <div className="relative">
                  <label className="text-[10px] text-text-secondary uppercase font-bold mb-1 block">
                    Preço (€/L)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="1.70"
                    value={formData.fuelPricePerLiter || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'fuelPricePerLiter',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-input-bg border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-accent/50"
                  />
                  <span className="absolute right-3 bottom-2.5 text-xs text-text-secondary">
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={reset}
            className="mt-4 w-full bg-transparent border border-glass-border text-text-secondary hover:text-white font-medium py-3 rounded-full text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} />
            Limpar Dados
          </button>
        </aside>

        {/* Dynamic Right Panel */}
        <div className="lg:col-span-8 min-h-[600px] w-full">
          <AnimatePresence mode="wait">
            {!hasInputs ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-card-bg/30 backdrop-blur-sm rounded-[32px] border border-dashed border-glass-border"
              >
                <div className="w-24 h-24 bg-cyan-accent/5 rounded-full flex items-center justify-center mb-8 border border-cyan-accent/10 relative">
                  <div className="absolute inset-0 bg-cyan-accent/20 blur-2xl rounded-full animate-pulse" />
                  <TrendingUp
                    className="text-cyan-accent relative z-10"
                    size={48}
                  />
                </div>
                <h2 className="text-4xl font-black mb-6">
                  Pronto para <span className="text-cyan-accent">Poupar?</span>
                </h2>
                <p className="text-text-secondary text-lg max-w-md leading-relaxed">
                  Insira os seus gastos mensais de{' '}
                  <span className="text-white font-bold">Telecomunicações</span>{' '}
                  e <span className="text-white font-bold">Supermercado</span>{' '}
                  para ver a magia acontecer em tempo real.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-8"
              >
                {/* Section 1: The Alert */}
                {!isFullEcosystem && (
                  <section className="bg-orange-500/5 border border-orange-500/20 rounded-[24px] p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 text-orange-500/10 group-hover:scale-110 transition-transform duration-700">
                      <TrendingUp size={160} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-orange-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Info size={16} />O que está a deixar de ganhar hoje
                      </h3>
                      <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black text-orange-400 tracking-tighter">
                          {results.annualLoss.toLocaleString('pt-PT', {
                            minimumFractionDigits: 2,
                          })}
                          €
                        </span>
                        <span className="text-orange-400/60 font-medium">
                          / ANO
                        </span>
                      </div>
                      <p className="text-orange-400/70 text-sm mt-4 max-w-lg leading-relaxed">
                        Este é o valor que está a "perder" anualmente por não
                        centralizar os seus serviços no Ecossistema Combina.
                      </p>
                    </div>
                  </section>
                )}

                {/* Section 2: The Solution */}
                <section className="bg-card-bg backdrop-blur-xl border border-glass-border rounded-[32px] p-8 shadow-2xl">
                  <h3 className="text-cyan-accent text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <CheckCircle2 size={16} />A sua Nova Realidade com o Combina
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/5 border border-glass-border rounded-[24px] p-6 hover:bg-white/10 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-cyan-accent/10 text-cyan-accent">
                          <Zap size={24} />
                        </div>
                        <span className="text-[10px] bg-cyan-accent/20 text-cyan-accent px-2 py-1 rounded font-bold">
                          MENSAL
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">
                        Poupança Mensal
                      </p>
                      <div className="text-4xl font-black text-cyan-accent group-hover:scale-105 transition-transform origin-left">
                        {results.monthlySavings.toFixed(2)}€
                      </div>
                    </div>

                    <div className="bg-white/5 border border-glass-border rounded-[24px] p-6 hover:bg-white/10 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-cyan-accent/10 text-cyan-accent">
                          <Wallet size={24} />
                        </div>
                        <span className="text-[10px] bg-cyan-accent/20 text-cyan-accent px-2 py-1 rounded font-bold">
                          ANUAL
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">
                        Acumulado no Cartão
                      </p>
                      <div className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">
                        {results.annualCardAccumulated.toFixed(2)}€
                      </div>
                    </div>
                  </div>

                  {/* Breakdown List */}
                  <div className="space-y-6 pt-6 border-t border-glass-border">
                    {/* New Telecom Proposal Card */}
                    <div className="bg-slate-800/80 border border-cyan-accent/30 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Smartphone size={80} />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-cyan-accent" />A sua Nova
                        Proposta de Telecomunicações
                      </h4>

                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-xs text-text-secondary">
                          <CheckCircle2
                            size={14}
                            className="text-cyan-accent"
                          />
                          Oferta da 1ª mensalidade
                        </li>
                        <li className="flex items-center gap-2 text-xs text-text-secondary">
                          <CheckCircle2
                            size={14}
                            className="text-cyan-accent"
                          />
                          1Gb de internet fixa
                        </li>
                        <li className="flex items-center gap-2 text-xs text-text-secondary">
                          <CheckCircle2
                            size={14}
                            className="text-cyan-accent"
                          />
                          180 canais
                        </li>
                        {formData.mobilePhones >= 1 && (
                          <li className="flex items-center gap-2 text-xs text-text-secondary">
                            <CheckCircle2
                              size={14}
                              className="text-cyan-accent"
                            />
                            Cartões com plafond ilimitado
                          </li>
                        )}
                      </ul>

                      <div className="bg-cyan-accent/5 border border-cyan-accent/10 rounded-lg p-3 mb-6">
                        <p className="text-[10px] text-cyan-accent font-bold uppercase tracking-wider">
                          Upsell Exclusivo
                        </p>
                        <p className="text-xs text-white/80">
                          +1€/mês: Inclui Sport TV durante 9 meses
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-text-secondary uppercase font-bold">
                          Por apenas:
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-cyan-accent">
                            {results.newTelecomValue.toFixed(2)}€
                          </span>
                          <span className="text-xs text-text-secondary">
                            / mês
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-red-500 text-sm italic">
                        * valores não promocionais, verifique melhores condições
                        em +vendas
                      </p>
                      <p className="text-red-500 text-sm italic">
                        para isso deve recolher seguintes dados: Código postal e
                        Nome da rua
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-accent" />
                          <span className="text-text-secondary">
                            Cashback Supermercado ({(results.supermarketPercent * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <span className="font-bold">
                          +{results.cashbackSupermarket.toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-text-secondary">
                            Diferença Telecom (Otimização)
                          </span>
                        </div>
                        <span
                          className={`font-bold ${
                            results.telecomSavings < 0 ? 'text-red-400' : ''
                          }`}
                        >
                          {results.telecomSavings > 0 ? '+' : ''}
                          {results.telecomSavings.toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-text-secondary">
                            Desconto Energia/Gás (Parceria)
                          </span>
                        </div>
                        <span className="font-bold">
                          +{results.discountEnergy.toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-text-secondary">
                            Poupança em Combustível Galp
                            <span className="text-[10px] opacity-60 ml-1">
                              (desconto de{' '}
                              {(results.fuelDiscountPerLiter * 100).toFixed(0)}{' '}
                              cênt/L)
                            </span>
                          </span>
                        </div>
                        <span className="font-bold">
                          +{results.fuelSavings.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
