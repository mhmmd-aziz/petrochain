import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/common_widgets.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedFilter = 'Semua';
  final List<String> _filters = ['Semua', 'Berhasil', 'Gagal', 'Pending'];

  final List<Map<String, dynamic>> _transactions = [
    {
      'id': 'TRX-20260518-001',
      'spbu': 'SPBU 34.401.01',
      'location': 'Jl. Sudirman No.12, Jakarta Pusat',
      'date': '18 Mei 2026',
      'time': '08:32',
      'liter': 10.0,
      'fuel': 'Pertalite',
      'status': 'Berhasil',
      'price': 95000,
      'petugas': 'Hendra W.',
    },
    {
      'id': 'TRX-20260512-002',
      'spbu': 'SPBU 34.402.05',
      'location': 'Jl. Gatot Subroto No.5, Jakarta Sel.',
      'date': '12 Mei 2026',
      'time': '14:15',
      'liter': 15.0,
      'fuel': 'Solar',
      'status': 'Berhasil',
      'price': 105000,
      'petugas': 'Susi A.',
    },
    {
      'id': 'TRX-20260505-003',
      'spbu': 'SPBU 34.403.08',
      'location': 'Jl. Ahmad Yani No.88, Bekasi',
      'date': '05 Mei 2026',
      'time': '10:00',
      'liter': 7.5,
      'fuel': 'Pertalite',
      'status': 'Berhasil',
      'price': 71250,
      'petugas': 'Dian P.',
    },
    {
      'id': 'TRX-20260428-004',
      'spbu': 'SPBU 34.404.12',
      'location': 'Jl. Raya Bogor KM.45',
      'date': '28 Apr 2026',
      'time': '16:48',
      'liter': 0.0,
      'fuel': 'Pertalite',
      'status': 'Gagal',
      'price': 0,
      'petugas': '-',
    },
    {
      'id': 'TRX-20260420-005',
      'spbu': 'SPBU 34.405.03',
      'location': 'Jl. Margonda Raya No.55, Depok',
      'date': '20 Apr 2026',
      'time': '07:20',
      'liter': 20.0,
      'fuel': 'Pertalite',
      'status': 'Berhasil',
      'price': 190000,
      'petugas': 'Rudi H.',
    },
    {
      'id': 'TRX-20260415-006',
      'spbu': 'SPBU 34.406.01',
      'location': 'Jl. Ciledug Raya No.10, Tangerang',
      'date': '15 Apr 2026',
      'time': '11:05',
      'liter': 5.0,
      'fuel': 'Solar',
      'status': 'Pending',
      'price': 35000,
      'petugas': 'Wahyu S.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredTransactions {
    if (_selectedFilter == 'Semua') return _transactions;
    return _transactions.where((t) => t['status'] == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final totalLiter = _transactions
        .where((t) => t['status'] == 'Berhasil')
        .fold<double>(0, (sum, t) => sum + (t['liter'] as double));
    final totalTrx = _transactions.where((t) => t['status'] == 'Berhasil').length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Riwayat Pengisian BBM'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Summary Header
          Container(
            color: AppColors.primary,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Row(
              children: [
                Expanded(
                  child: _summaryItem(
                    label: 'Total Transaksi',
                    value: '$totalTrx kali',
                    icon: Icons.receipt_long_rounded,
                  ),
                ),
                Container(
                  width: 1,
                  height: 50,
                  color: AppColors.white.withOpacity(0.2),
                ),
                Expanded(
                  child: _summaryItem(
                    label: 'Total Liter',
                    value: '${totalLiter.toStringAsFixed(1)}L',
                    icon: Icons.opacity_rounded,
                  ),
                ),
                Container(
                  width: 1,
                  height: 50,
                  color: AppColors.white.withOpacity(0.2),
                ),
                Expanded(
                  child: _summaryItem(
                    label: 'Bulan Ini',
                    value: '32.5L',
                    icon: Icons.calendar_month_rounded,
                  ),
                ),
              ],
            ),
          ),

          // Filter chips
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedFilter = filter),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.background,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.divider,
                          ),
                        ),
                        child: Text(
                          filter,
                          style: AppTextStyles.labelMedium.copyWith(
                            color: isSelected
                                ? AppColors.white
                                : AppColors.textMedium,
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.w400,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Transaction list
          Expanded(
            child: _filteredTransactions.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.receipt_long_rounded,
                          size: 64,
                          color: AppColors.textLight,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Tidak ada transaksi',
                          style: AppTextStyles.titleMedium.copyWith(
                            color: AppColors.textLight,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _filteredTransactions.length,
                    itemBuilder: (context, index) {
                      final tx = _filteredTransactions[index];
                      return _buildTransactionCard(tx);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _summaryItem({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Column(
      children: [
        Icon(icon, color: AppColors.white.withOpacity(0.8), size: 20),
        const SizedBox(height: 6),
        Text(
          value,
          style: AppTextStyles.titleMedium.copyWith(color: AppColors.white),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: AppColors.white.withOpacity(0.7),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> tx) {
    final isSuccess = tx['status'] == 'Berhasil';
    final isFailed = tx['status'] == 'Gagal';

    return GestureDetector(
      onTap: () => _showTransactionDetail(tx),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
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
          children: [
            // Card Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSuccess
                    ? const Color(0xFFE8F5E9)
                    : isFailed
                        ? AppColors.primarySurface
                        : const Color(0xFFFFF8E1),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    isSuccess
                        ? Icons.check_circle_rounded
                        : isFailed
                            ? Icons.cancel_rounded
                            : Icons.pending_rounded,
                    color: isSuccess
                        ? AppColors.success
                        : isFailed
                            ? AppColors.error
                            : AppColors.warning,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    tx['id'],
                    style: AppTextStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMedium,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${tx['date']} • ${tx['time']}',
                    style: AppTextStyles.caption,
                  ),
                ],
              ),
            ),
            // Card Body
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.local_gas_station_rounded,
                      color: AppColors.primary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(tx['spbu'], style: AppTextStyles.titleMedium),
                        const SizedBox(height: 2),
                        Text(tx['location'], style: AppTextStyles.bodySmall),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primarySurface,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                tx['fuel'],
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        isSuccess ? '${tx['liter']}L' : '-',
                        style: AppTextStyles.headlineMedium.copyWith(
                          color: isSuccess ? AppColors.primary : AppColors.textLight,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      if (tx['status'] == 'Berhasil')
                        StatusBadge.success('Berhasil')
                      else if (tx['status'] == 'Gagal')
                        StatusBadge.error('Gagal')
                      else
                        StatusBadge.warning('Pending'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTransactionDetail(Map<String, dynamic> tx) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(28),
            topRight: Radius.circular(28),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text('Detail Transaksi', style: AppTextStyles.headlineMedium),
            const SizedBox(height: 20),
            _detailRow('ID Transaksi', tx['id']),
            _detailRow('SPBU', tx['spbu']),
            _detailRow('Lokasi', tx['location']),
            _detailRow('Tanggal', '${tx['date']} ${tx['time']} WIB'),
            _detailRow('Jenis BBM', tx['fuel']),
            _detailRow('Jumlah', '${tx['liter']} Liter'),
            _detailRow('Petugas', tx['petugas']),
            _detailRow('Status', tx['status']),
            const SizedBox(height: 20),
            PrimaryButton(
              text: 'Tutup',
              onPressed: () => Navigator.pop(context),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: AppTextStyles.bodyMedium),
          ),
          Text(': ', style: AppTextStyles.bodyMedium),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textDark,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
