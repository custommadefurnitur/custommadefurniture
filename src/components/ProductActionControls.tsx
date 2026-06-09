// components/ProductActionControls.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProductItem } from '@/app/(Website)/products/page';

interface Props {
  product: ProductItem;
  whatsappNumber: string;
  phoneNumber: string;
}

type ModalStep = 'CLOSED' | 'CHOOSE_METHOD' | 'PHONE_CONFIRM' | 'PHONE_PREPARE';

export default function ProductActionControls({ product, whatsappNumber, phoneNumber }: Props) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('CLOSED');
  
  // Track individual checkbox states for the preparation step
  const [checklist, setChecklist] = useState({
    dimensions: false,
    upholstery: false,
    timeline: false,
  });

  // Reset checklist states whenever the modal opens or step changes
  const changeStep = (step: ModalStep) => {
    setCurrentStep(step);
    if (step !== 'PHONE_PREPARE') {
      setChecklist({ dimensions: false, upholstery: false, timeline: false });
    }
  };

  // Determine if all checklist items are ticked off
  const isReadyToCall = checklist.dimensions && checklist.upholstery && checklist.timeline;

  const handleWhatsAppRedirect = () => {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // FIX: Access the first element [0] of the gallery array instead of reading the array directly
  const primaryImage = product.gallery && product.gallery.length > 0 
    ? product.gallery[0].url 
    : '';

  const specFields = product.furnitureSpecs 
    ? Object.keys(product.furnitureSpecs)
        .map((key) => `${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: [___]`)
        .join('\n')
    : '';

  // RESTRUCTURE: Ensure the webpage URL is the absolute first thing in the string
  const rawMessage = `${pageUrl}

Hello! I am highly interested in this item:

📌 *Product Details:*
* Title: ${product.title}
${primaryImage ? `* Image Asset: ${primaryImage}` : ''}

🛠 *Custom Layout Adjustments (Fill out your custom choices below):*
${specFields}

💡 _Don't worry about filling datas we will close the process only we closed the deal on the phone call😊_`;

  const cleanPhone = String(whatsappNumber || '').replace(/[+\s-]/g, '');
  const encodedText = encodeURIComponent(rawMessage);
  
  window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  changeStep('CLOSED');
};


  const cleanPhoneCallTarget = String(phoneNumber || '').replace(/[\s-]/g, '');

  const toggleCheckItem = (item: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="mt-8 pt-6 border-t border-[#D4BEA9] flex flex-col sm:flex-row gap-4">
<button 
        onClick={() => changeStep("CHOOSE_METHOD")}
        className="flex-1 bg-[#700635] text-[#F3E5D8] hover:bg-[#4C1A17] text-center font-bold tracking-wide py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]"
        aria-label="Open contact options for product customization"
      >
        I Want like this
      </button>
      <Link 
        href="/products" 
        className="sm:w-1/3 bg-transparent border border-[#700635] text-[#700635] hover:bg-[#700635]/10 text-center font-bold tracking-wide py-4 px-6 rounded-xl transition-all flex items-center justify-center"
        aria-label="Back to product grid"
      >
        Back to Grid
      </Link>

      {/* POPUP CONTAINER MODAL */}
      {currentStep !== 'CLOSED' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F3E5D8] border border-[#D4BEA9] text-[#4C1A17] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => changeStep('CLOSED')}
              className="absolute top-4 right-4 text-xl font-bold opacity-60 hover:opacity-100"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* STEP 1: CHOOSE CONTACT UTILITY */}
            {currentStep === 'CHOOSE_METHOD' && (
              <>
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold text-[#4C1A17] mb-2">How would you like to proceed?</h3>
                  <p className="text-sm opacity-80">Select a communication method to process details for *${product.title}*</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleWhatsAppRedirect}
                    className="w-full bg-[#700635] hover:bg-[#700635]/90 text-white font-bold py-3 px-4 rounded-xl transition-all"
                    aria-label="Chat on WhatsApp"
                  >
                    💬 Chat on WhatsApp
                  </button>
                  <button 
                    onClick={() => changeStep("PHONE_CONFIRM")}
                    className="w-full bg-[#4C1A17] hover:bg-[#4C1A17]/90 text-white font-bold py-3 px-4 rounded-xl transition-all"
                    aria-label="Make a Phone Call"
                  >
                    📞 Make a Phone Call
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: PHONE ENGAGEMENT CONFIRMATION */}
            {currentStep === 'PHONE_CONFIRM' && (
              <>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-serif font-bold text-[#4C1A17]">Ready to speak with the Owner?</h3>
                  <p className="text-sm opacity-80">Connecting directly allows us to confirm exact specifications and design pricing efficiently.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => changeStep("PHONE_PREPARE")}
                    className="flex-1 bg-[#700635] text-white font-bold py-3 px-4 rounded-xl transition-all"
                    aria-label="Yes, I am ready to speak with the owner"
                  >
                    Yes, I am ready
                  </button>
                  <button 
                    onClick={() => changeStep("CHOOSE_METHOD")}
                    className="flex-1 bg-transparent border border-[#4C1A17] font-semibold py-3 px-4 rounded-xl text-[#4C1A17] transition-all"
                    aria-label="Go back to choose method"
                  >
                    Go Back
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: PRE-CALL PREPARATION CHECKLIST ITEMS WITH INTERACTIVE CHECKBOXES */}
            {currentStep === 'PHONE_PREPARE' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-[#700635]">Preparation Checklist</h3>
                  <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Please confirm and check all items before calling:</p>
                </div>

                <div className="space-y-3 border-y border-[#D4BEA9] py-4">
                  {/* ITEM 1 */}
                  <label 
                    className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#D4BEA9]/20 transition-all select-none"
                  >
                    <input 
                      type="checkbox"
                      checked={checklist.dimensions}
                      onChange={() => toggleCheckItem('dimensions')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border-2 transition-all ${
                      checklist.dimensions ? 'bg-[#700635] border-[#700635] text-white' : 'border-[#4C1A17]/40'
                    }`}>
                      {checklist.dimensions && <span className="text-xs font-bold" aria-label='checked'>✓</span>}
                    </div>
                    <span className={`text-sm font-medium ${checklist.dimensions ? 'line-through opacity-60' : ''}`}>
                      I have mapped my room dimension limits (Length × Width).
                    </span>
                  </label>

                  {/* ITEM 2 */}
                  <label 
                    className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#D4BEA9]/20 transition-all select-none"
                  >
                    <input 
                      type="checkbox"
                      checked={checklist.upholstery}
                      onChange={() => toggleCheckItem('upholstery')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border-2 transition-all ${
                      checklist.upholstery ? 'bg-[#700635] border-[#700635] text-white' : 'border-[#4C1A17]/40'
                    }`}>
                      {checklist.upholstery && <span className="text-xs font-bold" aria-label='checked'>✓</span>}
                    </div>
                    <span className={`text-sm font-medium ${checklist.upholstery ? 'line-through opacity-60' : ''}`}>
                      I know my preferred upholstery textile type or custom leather tone styles.
                    </span>
                  </label>

                  {/* ITEM 3 */}
                  <label 
                    className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#D4BEA9]/20 transition-all select-none"
                  >
                    <input 
                      type="checkbox"
                      checked={checklist.timeline}
                      onChange={() => toggleCheckItem('timeline')}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border-2 transition-all ${
                      checklist.timeline ? 'bg-[#700635] border-[#700635] text-white' : 'border-[#4C1A17]/40'
                    }`}>
                      {checklist.timeline && <span className="text-xs font-bold" aria-label='checked'>✓</span>}
                    </div>
                    <span className={`text-sm font-medium ${checklist.timeline ? 'line-through opacity-60' : ''}`}>
                      I have decided on my ideal home delivery timeline window requirements.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-3 pt-2">
  <a 
    href={isReadyToCall ? `tel:${cleanPhoneCallTarget}` : undefined}
    onClick={(e) => {
      if (!isReadyToCall) {
        e.preventDefault();
      } else {
        changeStep('CLOSED');
      }
    }}
    className={`text-center font-bold py-3.5 px-4 rounded-xl block shadow transition-all duration-300 ${
      isReadyToCall 
        ? 'bg-[#4C1A17] hover:bg-[#700635] text-white cursor-pointer active:scale-[0.99] aria-label="Call owner now"' 
        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed border border-neutral-400 opacity-60 aria-label="Check all items to unlock call"'
    }`}
    aria-label={isReadyToCall ? "Call owner now" : "Check all items to unlock call"}
  >
    {isReadyToCall ? '🚀 Call Owner Now' : '🔒 Check all items to unlock call'}
  </a>
  
  <button
    type="button"
    onClick={() => changeStep('PHONE_CONFIRM')}
    aria-label="Go back to phone confirmation step"
    className="w-full bg-transparent border border-[#D4BEA9] font-medium py-2.5 px-4 rounded-xl text-[#4C1A17]/80 hover:bg-[#D4BEA9]/20 transition-all"
    >
    Back
            </button>
        </div>
                </>)}
          </div>
        </div>
        )}
    </div>
  );
}