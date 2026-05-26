import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/common_widgets.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Profile Header
          SliverAppBar(
            expandedHeight: 260,
            floating: false,
            pinned: true,
            backgroundColor: AppColors.primary,
            title: const Text('Profil Saya'),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_rounded),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: -60,
                      right: -60,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.white.withOpacity(0.06),
                        ),
                      ),
                    ),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 60),
                          Stack(
                            children: [
                              Container(
                                width: 90,
                                height: 90,
                                decoration: BoxDecoration(
                                  color: AppColors.white.withOpacity(0.2),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppColors.white.withOpacity(0.5),
                                    width: 2.5,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.person_rounded,
                                  size: 50,
                                  color: AppColors.white,
                                ),
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    color: AppColors.white,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: AppColors.primary,
                                      width: 2,
                                    ),
                                  ),
                                  child: const Icon(
                                    Icons.camera_alt_rounded,
                                    size: 14,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Budi Santoso',
                            style: AppTextStyles.headlineMedium.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'NIK: 3201••••••••0001',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.white.withOpacity(0.8),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _subsidyBadge('Subsidi R1'),
                              const SizedBox(width: 8),
                              _subsidyBadge('Aktif ✓'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Subsidy Level Card
                  _subsidyLevelCard(),
                  const SizedBox(height: 20),

                  // Personal Info
                  Text('Informasi Pribadi', style: AppTextStyles.titleLarge),
                  const SizedBox(height: 12),
                  _profileInfoCard([
                    _ProfileItem(
                      icon: Icons.badge_rounded,
                      label: 'NIK',
                      value: '3201234567890001',
                    ),
                    _ProfileItem(
                      icon: Icons.person_rounded,
                      label: 'Nama Lengkap',
                      value: 'Budi Santoso',
                    ),
                    _ProfileItem(
                      icon: Icons.cake_rounded,
                      label: 'Tanggal Lahir',
                      value: '15 Maret 1985',
                    ),
                    _ProfileItem(
                      icon: Icons.phone_rounded,
                      label: 'No. Telepon',
                      value: '+62 812-3456-7890',
                    ),
                    _ProfileItem(
                      icon: Icons.home_rounded,
                      label: 'Alamat',
                      value: 'Jl. Kebon Jeruk No.10, RT 05/RW 02, Bekasi',
                    ),
                    _ProfileItem(
                      icon: Icons.location_city_rounded,
                      label: 'Kelurahan',
                      value: 'Kel. Bekasi Jaya, Kec. Bekasi Timur',
                    ),
                  ]),
                  const SizedBox(height: 20),

                  // Vehicle Info
                  Text('Data Kendaraan', style: AppTextStyles.titleLarge),
                  const SizedBox(height: 12),
                  _profileInfoCard([
                    _ProfileItem(
                      icon: Icons.directions_car_rounded,
                      label: 'Kendaraan',
                      value: 'Motor - Honda Beat 2020',
                    ),
                    _ProfileItem(
                      icon: Icons.confirmation_number_rounded,
                      label: 'Nomor Polisi',
                      value: 'B 1234 XYZ',
                    ),
                    _ProfileItem(
                      icon: Icons.local_gas_station_rounded,
                      label: 'BBM Subsidi',
                      value: 'Pertalite & Solar',
                    ),
                  ]),
                  const SizedBox(height: 20),

                  // Settings
                  Text('Pengaturan', style: AppTextStyles.titleLarge),
                  const SizedBox(height: 12),
                  _settingsCard([
                    _SettingItem(
                      icon: Icons.notifications_rounded,
                      label: 'Notifikasi',
                      trailing: Switch(
                        value: true,
                        onChanged: (_) {},
                        activeColor: AppColors.primary,
                      ),
                    ),
                    _SettingItem(
                      icon: Icons.fingerprint_rounded,
                      label: 'Keamanan Biometrik',
                      trailing: Switch(
                        value: false,
                        onChanged: (_) {},
                        activeColor: AppColors.primary,
                      ),
                    ),
                    _SettingItem(
                      icon: Icons.language_rounded,
                      label: 'Bahasa',
                      subtitle: 'Bahasa Indonesia',
                      trailing: const Icon(Icons.chevron_right_rounded,
                          color: AppColors.textLight),
                      onTap: () {},
                    ),
                    _SettingItem(
                      icon: Icons.help_rounded,
                      label: 'Bantuan',
                      trailing: const Icon(Icons.chevron_right_rounded,
                          color: AppColors.textLight),
                      onTap: () {},
                    ),
                    _SettingItem(
                      icon: Icons.info_rounded,
                      label: 'Tentang Aplikasi',
                      subtitle: 'v1.0.0',
                      trailing: const Icon(Icons.chevron_right_rounded,
                          color: AppColors.textLight),
                      onTap: () {},
                    ),
                  ]),
                  const SizedBox(height: 24),

                  // Logout Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _showLogoutDialog(context),
                      icon: const Icon(Icons.logout_rounded,
                          color: AppColors.primary),
                      label: const Text('Keluar dari Akun'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(
                            color: AppColors.primary, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        textStyle: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _subsidyBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.white.withOpacity(0.4)),
      ),
      child: Text(
        text,
        style: AppTextStyles.caption.copyWith(
          color: AppColors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _subsidyLevelCard() {
    return Container(
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primarySurface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.stars_rounded,
                    color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Level Subsidi', style: AppTextStyles.bodyMedium),
                    Text(
                      'Rumah Tangga Kelas 1 (R1)',
                      style: AppTextStyles.titleMedium,
                    ),
                  ],
                ),
              ),
              StatusBadge.success('Aktif'),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.divider),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _subsidyInfoItem(
                  label: 'Kuota Bulanan',
                  value: '80 Liter',
                  icon: Icons.local_gas_station_rounded,
                ),
              ),
              Container(width: 1, height: 40, color: AppColors.divider),
              Expanded(
                child: _subsidyInfoItem(
                  label: 'Sisa Kuota',
                  value: '47.5 L',
                  icon: Icons.opacity_rounded,
                ),
              ),
              Container(width: 1, height: 40, color: AppColors.divider),
              Expanded(
                child: _subsidyInfoItem(
                  label: 'Berlaku',
                  value: 'Mei 2026',
                  icon: Icons.calendar_today_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Progress bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Penggunaan Kuota',
                      style: AppTextStyles.bodySmall),
                  Text(
                    '32.5 / 80 Liter',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: 32.5 / 80,
                  backgroundColor: AppColors.primarySurface,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  minHeight: 10,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _subsidyInfoItem({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 18),
        const SizedBox(height: 6),
        Text(
          value,
          style: AppTextStyles.titleMedium.copyWith(fontSize: 13),
        ),
        Text(label, style: AppTextStyles.caption, textAlign: TextAlign.center),
      ],
    );
  }

  Widget _profileInfoCard(List<_ProfileItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primarySurface,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(item.icon,
                          color: AppColors.primary, size: 18),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.label,
                              style: AppTextStyles.caption),
                          const SizedBox(height: 2),
                          Text(
                            item.value,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textDark,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              if (index < items.length - 1)
                const Divider(
                  height: 1,
                  indent: 56,
                  color: AppColors.divider,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _settingsCard(List<_SettingItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return Column(
            children: [
              InkWell(
                onTap: item.onTap,
                borderRadius: BorderRadius.circular(18),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 14),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primarySurface,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(item.icon,
                            color: AppColors.primary, size: 18),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.label,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textDark,
                                  fontWeight: FontWeight.w500,
                                )),
                            if (item.subtitle != null)
                              Text(item.subtitle!,
                                  style: AppTextStyles.caption),
                          ],
                        ),
                      ),
                      item.trailing ?? const SizedBox(),
                    ],
                  ),
                ),
              ),
              if (index < items.length - 1)
                const Divider(
                  height: 1,
                  indent: 56,
                  color: AppColors.divider,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Keluar dari Akun'),
        content: const Text(
            'Apakah Anda yakin ingin keluar dari akun Petrochain?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/login');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
  }
}

class _ProfileItem {
  final IconData icon;
  final String label;
  final String value;

  _ProfileItem({
    required this.icon,
    required this.label,
    required this.value,
  });
}

class _SettingItem {
  final IconData icon;
  final String label;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  _SettingItem({
    required this.icon,
    required this.label,
    this.subtitle,
    this.trailing,
    this.onTap,
  });
}
