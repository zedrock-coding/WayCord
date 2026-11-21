import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/views/not_found_page.dart';
import 'package:waypoint/views/service_error_page.dart';
import 'package:waypoint/widgets/app_error_boundary.dart';

void main() {
  group('NotFoundPage Widget Tests', () {
    testWidgets('renders 404 and route details', (tester) async {
      bool homeTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: NotFoundPage(
            routeName: '/unknown-test-path',
            onNavigateHome: () => homeTapped = true,
          ),
        ),
      );

      expect(find.text('404'), findsOneWidget);
      expect(find.text('Page Not Found'), findsOneWidget);
      expect(find.text('/unknown-test-path'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey('not_found_return_home_btn')));
      await tester.pumpAndSettle();

      expect(homeTapped, isTrue);
    });

    testWidgets('navigates to NotFoundPage on unknown route', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          initialRoute: '/valid-start',
          routes: {
            '/valid-start': (context) => Scaffold(
                  body: ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/non-existent-page'),
                    child: const Text('Go Unknown'),
                  ),
                ),
          },
          onUnknownRoute: (settings) => MaterialPageRoute(
            settings: settings,
            builder: (context) => NotFoundPage(routeName: settings.name),
          ),
        ),
      );

      expect(find.text('Go Unknown'), findsOneWidget);
      await tester.tap(find.text('Go Unknown'));
      await tester.pumpAndSettle();

      expect(find.text('404'), findsOneWidget);
      expect(find.text('/non-existent-page'), findsOneWidget);
    });
  });

  group('ServiceErrorPage Widget Tests', () {
    testWidgets('renders title, message, details and triggers actions', (tester) async {
      bool retryTapped = false;
      bool homeTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: ServiceErrorPage(
            title: 'Database Unavailable',
            message: 'Unable to reach the Postgres instance.',
            error: 'ConnectionTimeoutException: Port 5432 unreachable',
            onRetry: () => retryTapped = true,
            onNavigateHome: () => homeTapped = true,
          ),
        ),
      );

      expect(find.text('Database Unavailable'), findsOneWidget);
      expect(find.text('Unable to reach the Postgres instance.'), findsOneWidget);

      // Tap details expander
      expect(find.text('Show technical details'), findsOneWidget);
      await tester.tap(find.text('Show technical details'));
      await tester.pumpAndSettle();

      expect(find.textContaining('ConnectionTimeoutException'), findsOneWidget);

      // Tap retry
      await tester.tap(find.byKey(const ValueKey('service_error_retry_btn')));
      await tester.pump();
      expect(retryTapped, isTrue);

      // Tap home
      await tester.tap(find.byKey(const ValueKey('service_error_home_btn')));
      await tester.pump();
      expect(homeTapped, isTrue);
    });
  });

  group('AppErrorWidget Tests', () {
    testWidgets('renders fallback widget without crashing', (tester) async {
      bool resetTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppErrorWidget(
              onReset: () => resetTapped = true,
            ),
          ),
        ),
      );

      expect(find.text('Something went wrong'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey('error_widget_retry_btn')));
      await tester.pump();
      expect(resetTapped, isTrue);
    });
  });
}
