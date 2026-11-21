import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/core/ui/rem.dart';

void main() {
  group('Rem Unit Tests', () {
    testWidgets('Rem calculates exact 1.0 scale with base 16.0 pixels', (tester) async {
      late BuildContext capturedContext;

      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.0)),
            child: Builder(
              builder: (context) {
                capturedContext = context;
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(capturedContext.remScale, equals(1.0));
      expect(capturedContext.rem(1.0), equals(16.0));
      expect(capturedContext.rem(0.5), equals(8.0));
      expect(capturedContext.rem(2.0), equals(32.0));
      expect(capturedContext.sp(24.0), equals(24.0));
    });

    testWidgets('Rem scales proportionally when font scale increases', (tester) async {
      late BuildContext capturedContext;

      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.25)),
            child: Builder(
              builder: (context) {
                capturedContext = context;
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(capturedContext.remScale, equals(1.25));
      expect(capturedContext.rem(1.0), equals(20.0));
      expect(capturedContext.rem(0.5), equals(10.0));
      expect(capturedContext.sp(12.0), equals(15.0));

      final insets = capturedContext.remInsets.symmetric(horizontal: 1.0, vertical: 0.5);
      expect(insets.left, equals(20.0));
      expect(insets.right, equals(20.0));
      expect(insets.top, equals(10.0));
      expect(insets.bottom, equals(10.0));
    });

    testWidgets('Rem clamps extreme font scales within safety bounds', (tester) async {
      late BuildContext capturedContext;

      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(2.5)),
            child: Builder(
              builder: (context) {
                capturedContext = context;
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      // Should be clamped to maxRemScale (1.35)
      expect(capturedContext.remScale, equals(Rem.maxRemScale));
      expect(capturedContext.rem(1.0), equals(16.0 * Rem.maxRemScale));
    });
  });
}
