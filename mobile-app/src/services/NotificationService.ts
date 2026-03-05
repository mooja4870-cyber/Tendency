export class NotificationService {
  /**
   * 브라우저 알림 권한 요청
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * 알림 표시
   */
  static showNotification(title: string, body: string, onClick?: () => void) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico', // 실제 아이콘 경로로 변경 필요
      });

      if (onClick) {
        notification.onclick = (event) => {
          event.preventDefault();
          onClick();
          notification.close();
        };
      }
    }
  }

  /**
   * 주간 토론 알림 시뮬레이션
   */
  static scheduleDebateNotification(topicTitle: string, onNavigate: () => void) {
    // 실제 서비스에서는 FCM 등을 통해 서버에서 발송되지만,
    // 여기서는 로직 시뮬레이션을 위해 5초 뒤에 표시
    setTimeout(() => {
      this.showNotification(
        '🗳️ 이번 주 토론 주제가 도착했어요!',
        `${topicTitle}\n\n다른 성향의 사람들은 어떻게 생각할까요? 지금 투표해보세요!`,
        onNavigate
      );
    }, 5000);
  }
}
