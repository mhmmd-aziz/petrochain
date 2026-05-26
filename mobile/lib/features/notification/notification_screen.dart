import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': '1',
      'type': 'transaction',
      'title': 'Pengisian BBM Berhasil',
      'body': 'Pengisian 10 Liter Pertalite di SPBU 34.401.01 berhasil. Sisa kuota Anda: 47.5 Liter.',
      'time': '08:32 · Hari ini',
      'isRead': false,
      'icon': Icons.local_gas_station_rounded,
      'color': AppColors.success,
      'bgColor': Color(0xFFE8F5E9),
    },
    {
      'id': '2',
      'type': 'quota',
      'title': 'Peringatan Kuota',
      'body': 'Kuota BBM subsidi Anda tersisa 47.5 Liter. Segera rencanakan pengisian Anda.',
      'time': '08:35 · Hari ini',
      'isRead': false,
      'icon': Icons.warning_amber_rounded,
      'color': AppColors.warning,
      'bgColor': Color(0xFFFFF3E0),
    },
    {
      'id': '3',
      'type': 'transaction',
      'title': 'Pengisian BBM Berhasil',
      'body': 'Pengisian 15 Liter Solar di SPBU 34.402.05 berhasil. Sisa kuota Anda: 57.5 Liter.',
      'time': '14:15 · 12 Mei 2026',
      'isRead': true,
      'icon': Icons.local_gas_station_rounded,
      'color': AppColors.success,
      'bgColor': Color(0xFFE8F5E9),
    },
    {
      'id': '4',
      'type': 'failed',
      'title': 'Pengisian BBM Gagal',
      'body': 'Pengisian BBM di SPBU 34.404.12 gagal diproses. Silakan coba kembali atau hubungi petugas.',
      'time': '16:48 · 28 Apr 2026',
      'isRead': true,
      'icon': Icons.cancel_rounded,
      'color': AppColors.error,
      'bgColor': AppColors.primarySurface,
    },
    {
      'id': '5',
      'type': 'info',
      'title': 'Reset Kuota Bulanan',
      'body': 'Kuota BBM subsidi Anda telah direset untuk bulan Mei 2026. Kuota tersedia: 80 Liter.',
      'time': '00:01 · 01 Mei 2026',
      'isRead': true,
      'icon': Icons.refresh_rounded,
      'color': AppColors.info,
      'bgColor': Color(0xFFE3F2FD),
    },
    {
      'id': '6',
      'type': 'transaction',
      'title': 'Pengisian BBM Berhasil',
      'body': 'Pengisian 7.5 Liter Pertalite di SPBU 34.403.08 berhasil. Sisa kuota Anda: 72.5 Liter.',
      'time': '10:00 · 05 Mei 2026',
      'isRead': true,
      'icon': Icons.local_gas_station_rounded,
      'color': AppColors.success,
      'bgColor': Color(0xFFE8F5E9),
    },
    {
      'id': '7',
      'type': 'info',
      'title': 'Pembaruan Kebijakan',
      'body': 'Terdapat perubahan kebijakan subsidi BBM. Silakan baca informasi terbaru di menu Profil.',
      'time': '09:00 · 01 Apr 2026',
      'isRead': true,
      'icon': Icons.policy_rounded,
      'color': AppColors.info,
      'bgColor': Color(0xFFE3F2FD),
    },
  ];

  int get _unreadCount => _notifications.where((n) => !(n['isRead'] as bool)).length;

  void _markAllRead() {
    setState(() {
      for (var n in _notifications) {
        n['isRead'] = true;
      }
    });
  }

  void _markRead(String id) {
    setState(() {
      final notif = _notifications.firstWhere((n) => n['id'] == id);
      notif['isRead'] = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          children: [
            const Text('Notifikasi'),
            if (_unreadCount > 0)
              Text(
                '$_unreadCount belum dibaca',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.white.withOpacity(0.8),
                ),
              ),
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: Text(
                'Tandai Semua',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Stats bar
          Container(
            color: AppColors.primary,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Row(
              children: [
                _statChip(
                  icon: Icons.notifications_rounded,
                  label: 'Total',
                  value: '${_notifications.length}',
                ),
                const SizedBox(width: 12),
                _statChip(
                  icon: Icons.mark_email_unread_rounded,
                  label: 'Belum Dibaca',
                  value: '$_unreadCount',
                ),
                const SizedBox(width: 12),
                _statChip(
                  icon: Icons.local_gas_station_rounded,
                  label: 'Transaksi',
                  value: '${_notifications.where((n) => n['type'] == 'transaction').length}',
                ),
              ],
            ),
          ),

          // Notification list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final notif = _notifications[index];
                final isRead = notif['isRead'] as bool;

                return GestureDetector(
                  onTap: () => _markRead(notif['id']),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isRead ? AppColors.white : AppColors.primarySurface,
                      borderRadius: BorderRadius.circular(18),
                      border: isRead
                          ? null
                          : Border.all(
                              color: AppColors.primary.withOpacity(0.2),
                            ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.cardShadow,
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            color: notif['bgColor'] as Color,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            notif['icon'] as IconData,
                            color: notif['color'] as Color,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      notif['title'],
                                      style: AppTextStyles.titleMedium.copyWith(
                                        color: isRead
                                            ? AppColors.textDark
                                            : AppColors.primary,
                                      ),
                                    ),
                                  ),
                                  if (!isRead)
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: AppColors.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                notif['body'],
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textMedium,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(
                                    Icons.access_time_rounded,
                                    size: 12,
                                    color: AppColors.textLight,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    notif['time'],
                                    style: AppTextStyles.caption,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _statChip({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.white, size: 16),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: AppColors.white,
                    ),
                  ),
                  Text(
                    label,
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.white.withOpacity(0.75),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
