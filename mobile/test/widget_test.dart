import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:petrochain/main.dart';

void main() {
  testWidgets('Petrochain app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const PetrochainApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
