import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class LegalDialog extends StatelessWidget {
  final bool isFirstLaunch;

  const LegalDialog({super.key, this.isFirstLaunch = false});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: Container(
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: colorScheme.outlineVariant.withValues(alpha: 0.5)),
        ),
        child: DefaultTabController(
          length: 2,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                child: Row(
                  children: [
                    Icon(Icons.gavel_rounded, color: colorScheme.primary),
                    const SizedBox(width: 12),
                    Text(
                      'Legal Agreements',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              TabBar(
                labelColor: colorScheme.primary,
                unselectedLabelColor: colorScheme.onSurface.withValues(alpha: 0.6),
                indicatorColor: colorScheme.primary,
                indicatorWeight: 3,
                dividerColor: Colors.transparent,
                tabs: const [
                  Tab(text: 'EULA'),
                  Tab(text: 'Privacy Policy'),
                ],
              ),
              const Divider(height: 1),
              Expanded(
                child: TabBarView(
                  children: [
                    _MarkdownView(assetPath: 'assets/EULA.md'),
                    _MarkdownView(assetPath: 'assets/Privacy_policy.md'),
                  ],
                ),
              ),
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: isFirstLaunch ? _buildOnboardingActions(context, colorScheme) : _buildCloseAction(context, colorScheme),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOnboardingActions(BuildContext context, ColorScheme colorScheme) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => Navigator.pop(context, false),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('DECLINE'),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(50),
              backgroundColor: colorScheme.primary,
              foregroundColor: colorScheme.onPrimary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('ACCEPT ALL'),
          ),
        ),
      ],
    );
  }

  Widget _buildCloseAction(BuildContext context, ColorScheme colorScheme) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () => Navigator.pop(context),
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(50),
          backgroundColor: colorScheme.primary,
          foregroundColor: colorScheme.onPrimary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: const Text('CLOSE'),
      ),
    );
  }
}

class _MarkdownView extends StatelessWidget {
  final String assetPath;

  const _MarkdownView({required this.assetPath});

  Future<String> _loadFormattedDocument() async {
    final raw = await rootBundle.loadString(assetPath);
    try {
      final configJson = await rootBundle.loadString('assets/config/organization.json');
      final Map<String, dynamic> config = jsonDecode(configJson) as Map<String, dynamic>;
      var text = raw;
      config.forEach((key, val) {
        if (val != null) {
          text = text.replaceAll('{{$key}}', val.toString());
        }
      });
      final orgName = config['organization_name']?.toString();
      if (orgName != null && orgName.isNotEmpty && orgName != '[INSERT_LEGAL_ENTITY_NAME_HERE]') {
        text = text.replaceAll('[INSERT_LEGAL_ENTITY_NAME_HERE]', orgName);
      }
      return text;
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: _loadFormattedDocument(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error loading document: ${snapshot.error}'));
        }
        return Markdown(
          data: snapshot.data ?? 'No content found.',
          padding: const EdgeInsets.all(24),
          styleSheet: MarkdownStyleSheet(
            p: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.8)),
            h1: const TextStyle(fontWeight: FontWeight.bold),
            h2: const TextStyle(fontWeight: FontWeight.bold),
          ),
        );
      },
    );
  }
}
