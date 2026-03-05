import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MessageCircle, QrCode, Link2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DeepLinkService } from '../services/DeepLinkService';

interface InviteScreenProps {
  onBack: () => void;
}

export const InviteScreen: React.FC<InviteScreenProps> = ({ onBack }) => {
  const { state } = useApp();
  const [toast, setToast] = useState('');
  const [showQR, setShowQR] = useState(false);

  const getInviteLink = () => {
    if (!state.result) return window.location.origin;
    return DeepLinkService.generateInviteLink(state.result);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // 카카오톡 초대: Web Share API 사용 (모바일에서 카카오톡 포함 공유 메뉴 표시)
  const handleKakaoShare = async () => {
    const link = getInviteLink();
    const text = `🤝 관점/성향 궁합 테스트!\n\n나와 관점/성향이 얼마나 비슷한지 확인해보세요!\n\n👉 ${link}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: '관점/성향 궁합 테스트',
          text,
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('📋 공유 메시지가 클립보드에 복사되었습니다!');
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(text);
          showToast('📋 공유 메시지가 클립보드에 복사되었습니다!');
        } catch {
          showToast('공유에 실패했습니다');
        }
      }
    }
  };

  // QR 코드 생성: 구글 차트 API로 QR 이미지 표시
  const handleQRCode = () => {
    setShowQR(true);
  };

  // 링크 복사
  const handleCopyLink = async () => {
    const link = getInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      showToast('🔗 초대 링크가 클립보드에 복사되었습니다!');
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getInviteLink())}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-full bg-[#FAFAFA] pb-20"
    >
      <div className="max-w-md mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-6xl font-bold">관계 궁합</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 text-center py-10">
          <div className="text-7xl mb-4">🤝</div>
          <h3 className="text-5xl font-bold mb-2">친구 초대하기</h3>
          <p className="text-2xl text-black/40 mb-8">친구와 관점/성향 궁합을 확인해보세요!</p>

          <div className="space-y-5">
            <div className="space-y-2">
              <button
                onClick={handleKakaoShare}
                className="w-full bg-[#FEE500] text-[#3C1E1E] h-14 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <MessageCircle className="w-5 h-5 fill-current" /> 카카오톡 초대
              </button>
              <p className="text-[17px] text-black/40 leading-relaxed px-2">
                카카오톡 공유 SDK를 통해 초대 링크/메시지를 친구에게 전송합니다. 친구가 링크를 클릭 → 테스트 완료 → 두 사람의 결과를 비교합니다.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleQRCode}
                className="w-full bg-white border border-black/10 h-14 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <QrCode className="w-5 h-5" /> QR 코드 생성
              </button>
              <p className="text-[17px] text-black/40 leading-relaxed px-2">
                고유 초대 링크가 담긴 QR 코드를 화면에 표시합니다. 친구가 QR 코드를 스캔해 테스트에 참여할 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full bg-white border border-black/10 h-14 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Link2 className="w-5 h-5" /> 링크 복사
              </button>
              <p className="text-[17px] text-black/40 leading-relaxed px-2">
                고유 초대 URL을 클립보드에 복사합니다. 어떤 메신저로든 직접 공유할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/5 rounded-2xl">
          <h4 className="text-[15px] font-black uppercase text-black/30 mb-2">어떻게 작동하나요?</h4>
          <p className="text-xl text-black/60 leading-relaxed">
            친구가 링크를 통해 테스트를 완료하면, 두 사람의 성향 차이를 분석하여 대화 가이드와 궁합 리포트를 제공합니다.
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-4xl font-bold">QR 코드</h3>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-black/10 inline-block mb-4">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <p className="text-2xl text-black/50 mb-4">
                친구가 이 QR 코드를 스캔하면<br />테스트에 참여할 수 있습니다
              </p>

              <button
                onClick={async () => {
                  await handleCopyLink();
                  setShowQR(false);
                }}
                className="w-full bg-black text-white h-12 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                링크 복사 후 닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-xl z-[60]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
