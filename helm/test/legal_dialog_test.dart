import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/widgets/legal_dialog.dart';

void main() {
  testWidgets('LegalDialog renders EULA and Privacy Policy tabs', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: LegalDialog(isFirstLaunch: false),
        ),
      ),
    );

    await tester.pump();

    expect(find.text('Legal Agreements'), findsOneWidget);
    expect(find.text('EULA'), findsOneWidget);
    expect(find.text('Privacy Policy'), findsOneWidget);
    expect(find.text('CLOSE'), findsOneWidget);
  });

  testWidgets('LegalDialog in first launch renders ACCEPT ALL and DECLINE', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: LegalDialog(isFirstLaunch: true),
        ),
      ),
    );

    await tester.pump();

    expect(find.text('ACCEPT ALL'), findsOneWidget);
    expect(find.text('DECLINE'), findsOneWidget);
  });
}
