import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF980F12);
  static const Color primaryDark = Color(0xFF6B0A0C);
  static const Color primaryLight = Color(0xFFBE1519);
  static const Color primarySurface = Color(0xFFFFF0F0);

  static const Color white = Color(0xFFFFFFFF);
  static const Color offWhite = Color(0xFFF8F8F8);
  static const Color background = Color(0xFFF5F5F5);

  static const Color textDark = Color(0xFF1A1A1A);
  static const Color textMedium = Color(0xFF4A4A4A);
  static const Color textLight = Color(0xFF9E9E9E);

  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF57C00);
  static const Color error = Color(0xFF980F12);
  static const Color info = Color(0xFF1565C0);

  static const Color cardShadow = Color(0x1A000000);
  static const Color divider = Color(0xFFEEEEEE);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF980F12), Color(0xFF6B0A0C)],
  );

  static const LinearGradient headerGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF980F12), Color(0xFFBE1519)],
  );
}
