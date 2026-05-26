import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/common_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final String userName = 'Budi Santoso';
  final String nik = '3201234567890001';
  final String subsidyLevel = 'Subsidi R1';
  final double quotaLiter = 80.0;
  final double usedLiter = 32.5;

  @override
  Widget build(BuildContext context) {
    final remainingLiter = quotaLiter - usedLiter;
    final usedPercentage = usedLiter / quotaLiter;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            backgroundColor: AppColors.primary,
            elevation: 0,
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarIconBrightness: Brightness.light,
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: -50,
                      right: -50,
                      child: Container(
                        width: 180,
                        height: 180,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.white.withOpacity(0.06),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 70, 20, 20),
                      child: Row(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(
                              Icons.person_rounded,
                              color: AppColors.white,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Selamat Datang,',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.white.withOpacity(0.8),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  userName,
                                  style: AppTextStyles.titleLarge.copyWith(
                                    color: AppColors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    subsidyLevel,
                                    style: AppTextStyles.caption.copyWith(
                                      color: AppColors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Stack(
                            children: [
                              IconButton(
                                onPressed: () {},
                                icon: const Icon(
                                  Icons.notifications_rounded,
                                  color: AppColors.white,
                                  size: 26,
                                ),
                              ),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(
                                    color: Colors.amber,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            title: const Text('Petrochain'),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quota Card
                  QuotaCard(
                    title: 'Sisa Kuota BBM Bulan Ini',
                    amount: remainingLiter.toStringAsFixed(1),
                    unit: 'Liter',
                    percentage: 1 - usedPercentage,
                    subtitle: '${usedLiter.toStringAsFixed(1)}L terpakai dari ${quotaLiter.toStringAsFixed(0)}L',
                    icon: Icons.local_gas_station_rounded,
                  ),
                  const SizedBox(height: 20),

                  // Quick Info Cards
                  Row(
                    children: [
                      Expanded(
                        child: InfoCard(
                          label: 'Transaksi Bulan Ini',
                          value: '5x',
                          icon: Icons.receipt_long_rounded,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: InfoCard(
                          label: 'Total Terpakai',
                          value: '${usedLiter.toStringAsFixed(1)}L',
                          icon: Icons.opacity_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: InfoCard(
                          label: 'Status Subsidi',
                          value: 'Aktif',
                          icon: Icons.verified_rounded,
                          iconColor: AppColors.success,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: InfoCard(
                          label: 'Reset Kuota',
                          value: '11 Hari',
                          icon: Icons.calendar_today_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // QR Code Section
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.cardShadow,
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.qr_code_rounded,
                                color: AppColors.primary, size: 22),
                            const SizedBox(width: 10),
                            Text('QR Code Pengisian',
                                style: AppTextStyles.titleMedium),
                            const Spacer(),
                            StatusBadge.success('Aktif'),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 130,
                                height: 130,
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: AppColors.primary,
                                    width: 2,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.qr_code_2_rounded,
                                  size: 100,
                                  color: AppColors.textDark,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'NIK: ${nik.replaceRange(4, 12, '••••••••')}',
                                style: AppTextStyles.bodySmall,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Tunjukkan ke petugas SPBU',
                                style: AppTextStyles.caption,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        PrimaryButton(
                          text: 'Tampilkan QR Penuh',
                          icon: Icons.fullscreen_rounded,
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Riwayat Terbaru
                  const SectionHeader(
                    title: 'Transaksi Terbaru',
                    actionText: 'Lihat Semua',
                  ),
                  const SizedBox(height: 14),
                  ..._recentTransactions(),
                  const SizedBox(height: 24),

                  // Info Banner
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.info_rounded,
                            color: AppColors.primary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Informasi Kuota',
                                style: AppTextStyles.titleMedium.copyWith(
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Kuota BBM subsidi direset setiap tanggal 1 setiap bulannya.',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.primaryDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _recentTransactions() {
    final transactions = [
      {
        'spbu': 'SPBU 34.401.01',
        'location': 'Jl. Sudirman No.12',
        'date': '18 Mei 2026',
        'liter': '10.0',
        'status': 'Berhasil',
      },
      {
        'spbu': 'SPBU 34.402.05',
        'location': 'Jl. Gatot Subroto No.5',
        'date': '12 Mei 2026',
        'liter': '15.0',
        'status': 'Berhasil',
      },
      {
        'spbu': 'SPBU 34.403.08',
        'location': 'Jl. Ahmad Yani No.88',
        'date': '05 Mei 2026',
        'liter': '7.5',
        'status': 'Berhasil',
      },
    ];

    return transactions.map((tx) {
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.cardShadow,
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primarySurface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.local_gas_station_rounded,
                color: AppColors.primary,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tx['spbu']!, style: AppTextStyles.titleMedium),
                  const SizedBox(height: 2),
                  Text(tx['location']!, style: AppTextStyles.bodySmall),
                  const SizedBox(height: 2),
                  Text(tx['date']!, style: AppTextStyles.caption),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${tx['liter']}L',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                StatusBadge.success(tx['status']!),
              ],
            ),
          ],
        ),
      );
    }).toList();
  }
}
